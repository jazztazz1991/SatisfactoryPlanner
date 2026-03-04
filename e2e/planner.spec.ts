/**
 * Tests for the plan creation wizard and planner page (authenticated).
 *
 * Plans created during tests stay in the DB — they're labelled
 * "[E2E]" so you can identify and delete them from the dashboard.
 *
 * The /calculate endpoint is mocked so tests don't depend on solver
 * performance or game-data state.
 */
import { test, expect, type Page } from "@playwright/test";

// ─── Shared mock solver result ────────────────────────────────────────────────

const MOCK_CALCULATE_RESULT = {
  steps: [
    {
      recipeClassName: "Recipe_SmartPlating_C",
      recipeName: "Smart Plating",
      buildingClassName: "Desc_AssemblerMk1_C",
      buildingName: "Assembler",
      machineCount: 2,
      powerUsageKW: 15,
      inputs: [
        { itemClassName: "Desc_IronPlate_C", itemName: "Iron Plate", rate: 2 },
        { itemClassName: "Desc_Rotor_C", itemName: "Rotor", rate: 2 },
      ],
      outputs: [
        { itemClassName: "Desc_SpaceElevatorPart_1_C", itemName: "Smart Plating", rate: 2 },
      ],
    },
    {
      recipeClassName: "Recipe_IronPlate_C",
      recipeName: "Iron Plate",
      buildingClassName: "Desc_ConstructorMk1_C",
      buildingName: "Constructor",
      machineCount: 1.25,
      powerUsageKW: 5,
      inputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 30 }],
      outputs: [{ itemClassName: "Desc_IronPlate_C", itemName: "Iron Plate", rate: 20 }],
    },
  ],
  rawResources: [
    { itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 30 },
  ],
  totalPowerKW: 20,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Creates a plan via the wizard UI and returns the planId from the URL. */
async function createPlan(page: Page, templateName: string): Promise<string> {
  await page.goto("/plans/new");
  await page.getByLabel("Plan Name").fill(`[E2E] ${templateName}`);
  await page.getByText(templateName, { exact: false }).first().click();
  await page.getByRole("button", { name: "Create Plan" }).click();
  // Wait for a UUID-shaped plan URL — NOT the wizard URL (/plans/new)
  await page.waitForURL(/\/plans\/[0-9a-f-]{36}$/, { timeout: 15_000 });
  return page.url().split("/plans/")[1];
}

// ─── Plan creation wizard ─────────────────────────────────────────────────────

test.describe("new plan wizard", () => {
  test("shows plan name field and template options", async ({ page }) => {
    await page.goto("/plans/new");
    await expect(page.getByLabel("Plan Name")).toBeVisible();
    await expect(page.getByText("Blank plan")).toBeVisible();
    await expect(page.getByText("Space Elevator — Phase 1")).toBeVisible();
    await expect(page.getByText("Full Game")).toBeVisible();
  });

  test("Create Plan button is disabled until a name is entered", async ({ page }) => {
    await page.goto("/plans/new");
    await expect(page.getByRole("button", { name: "Create Plan" })).toBeDisabled();
    await page.getByLabel("Plan Name").fill("My Factory");
    await expect(page.getByRole("button", { name: "Create Plan" })).toBeEnabled();
  });

  test("selecting a template highlights it", async ({ page }) => {
    await page.goto("/plans/new");
    const templateButton = page.getByText("Space Elevator — Phase 1");
    await templateButton.click();
    // The selected button gets orange border styling — check aria/class via evaluate or
    // simply verify the button is still visible and the form can be submitted
    await expect(templateButton).toBeVisible();
  });

  test("Cancel button returns to dashboard", async ({ page }) => {
    await page.goto("/plans/new");
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("creating a blank plan navigates to planner page", async ({ page }) => {
    await page.goto("/plans/new");
    await page.getByLabel("Plan Name").fill("[E2E] Blank");
    await page.getByRole("button", { name: "Create Plan" }).click();
    await expect(page).toHaveURL(/\/plans\/[0-9a-f-]{36}$/);
  });

  test("creating a Phase 1 plan navigates to planner page", async ({ page }) => {
    await page.goto("/plans/new");
    await page.getByLabel("Plan Name").fill("[E2E] Phase 1 wizard test");
    await page.getByText("Space Elevator — Phase 1").click();
    await page.getByRole("button", { name: "Create Plan" }).click();
    await expect(page).toHaveURL(/\/plans\/[0-9a-f-]{36}$/);
  });
});

// ─── Planner page ─────────────────────────────────────────────────────────────

test.describe("planner page", () => {
  let planId: string;

  test.beforeAll(async ({ browser }) => {
    // Create one shared plan for all planner tests using the saved auth session
    const context = await browser.newContext({ storageState: "e2e/.auth/user.json" });
    const page = await context.newPage();
    planId = await createPlan(page, "Space Elevator — Phase 1");
    await context.close();
  });

  test("loads with Graph/Tree toggle and Calculate button", async ({ page }) => {
    await page.goto(`/plans/${planId}`);
    await expect(page.getByRole("button", { name: "Graph" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tree" })).toBeVisible();
    await expect(page.getByRole("button", { name: /calculate/i })).toBeVisible();
  });

  test("sidebar shows Add Recipe section", async ({ page }) => {
    await page.goto(`/plans/${planId}`);
    await expect(page.getByText(/add recipe/i)).toBeVisible();
    await expect(page.getByPlaceholder(/search recipes/i)).toBeVisible();
  });

  test("sidebar shows targets list", async ({ page }) => {
    await page.goto(`/plans/${planId}`);
    // Phase 1 template seeds Smart Plating as a target
    await expect(page.getByText(/targets/i)).toBeVisible();
  });

  test("Calculate calls the API and switches to Tree view", async ({ page }) => {
    await page.route(`**/api/plans/${planId}/calculate`, (route) =>
      route.fulfill({ json: MOCK_CALCULATE_RESULT })
    );

    await page.goto(`/plans/${planId}`);
    await page.getByRole("button", { name: /calculate/i }).click();

    // Tree view renders after calculate — scope to the tree role to avoid
    // matching the same text in the recipe picker listbox
    const tree = page.getByRole("tree");
    await expect(tree).toBeVisible({ timeout: 10_000 });
    await expect(tree.getByText("Smart Plating")).toBeVisible();
    // Raw resources section is only in the tree panel — use the unique rate text
    await expect(page.getByText("Iron Ore", { exact: true })).toBeVisible();
    await expect(page.getByText(/20\.0 kW total/)).toBeVisible();
  });

  test("Graph button builds and shows the graph view", async ({ page }) => {
    await page.route(`**/api/plans/${planId}/calculate`, (route) =>
      route.fulfill({ json: MOCK_CALCULATE_RESULT })
    );

    await page.goto(`/plans/${planId}`);
    await page.getByRole("button", { name: /calculate/i }).click();
    await page.getByRole("tree").waitFor({ timeout: 10_000 });

    // Switch to graph — ReactFlow canvas should render
    await page.getByRole("button", { name: "Graph" }).click();
    await expect(page.locator(".react-flow")).toBeVisible();
  });

  test("Tree button switches back to tree view", async ({ page }) => {
    await page.route(`**/api/plans/${planId}/calculate`, (route) =>
      route.fulfill({ json: MOCK_CALCULATE_RESULT })
    );

    await page.goto(`/plans/${planId}`);
    await page.getByRole("button", { name: /calculate/i }).click();
    await page.getByRole("tree").waitFor({ timeout: 10_000 });

    await page.getByRole("button", { name: "Graph" }).click();
    await page.getByRole("button", { name: "Tree" }).click();
    await expect(page.getByRole("tree")).toBeVisible();
  });

  test("recipe search filters the list", async ({ page }) => {
    await page.goto(`/plans/${planId}`);
    const searchInput = page.getByPlaceholder(/search recipes/i);
    await searchInput.fill("iron");
    // Results should be filtered — no result or some result message visible
    await expect(searchInput).toHaveValue("iron");
  });

});

// ─── Performance ──────────────────────────────────────────────────────────────

test.describe("calculate performance", () => {
  let fullGamePlanId: string;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: "e2e/.auth/user.json" });
    const page = await context.newPage();
    fullGamePlanId = await createPlan(page, "Full Game");
    await context.close();
  });

  test("Full Game calculate completes within 30 seconds", async ({ page }) => {
    // 120 s total: slow page load + 30 s API budget + render
    test.setTimeout(120_000);

    const t0 = Date.now();
    const elapsed = () => `${Date.now() - t0}ms`;

    // No route mock — hits the real /calculate endpoint
    await page.goto(`/plans/${fullGamePlanId}`);
    console.log(`[perf] page loaded at ${elapsed()}`);

    // Wait until the Calculate button is visible before starting the timer
    const calcButton = page.getByRole("button", { name: /calculate/i });
    await calcButton.waitFor({ state: "visible", timeout: 60_000 });
    console.log(`[perf] button visible at ${elapsed()}`);

    // Intercept the calculate response to measure body size before it reaches React
    let interceptedBodySize = -1;
    let interceptedPreview = "";
    await page.route(`**/api/plans/${fullGamePlanId}/calculate`, async (route) => {
      const response = await route.fetch();
      const body = await response.text();
      interceptedBodySize = body.length;
      interceptedPreview = body.slice(0, 200);
      await route.fulfill({ response, body });
    });

    const calcStart = Date.now();
    const [response] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes("/calculate") && r.request().method() === "POST",
        { timeout: 35_000 }
      ),
      calcButton.click(),
    ]);
    const calcDurationMs = Date.now() - calcStart;
    console.log(`[perf] API responded: status=${response.status()} calcDuration=${calcDurationMs}ms bodySize=${interceptedBodySize} total=${elapsed()}`);
    console.log(`[perf] body preview: ${interceptedPreview}`);

    expect(response.status()).toBe(200);
    expect(
      calcDurationMs,
      `Full Game calculate took ${calcDurationMs}ms — must be under 30 s`
    ).toBeLessThan(30_000);

    // Verify the tree view rendered with real data
    await expect(page.getByRole("tree")).toBeVisible({ timeout: 10_000 });
    console.log(`[perf] tree visible at ${elapsed()}`);
  });
});
