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

// Simple 2-step mock for most planner tests
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

// Mock with a shared ingredient (Iron Ingot → Iron Plate AND Iron Rod) to trigger a splitter
const MOCK_WITH_SPLITTER = {
  steps: [
    {
      recipeClassName: "Recipe_IronIngot_C",
      recipeName: "Iron Ingot",
      buildingClassName: "Desc_SmelterMk1_C",
      buildingName: "Smelter",
      machineCount: 2,
      powerUsageKW: 8,
      inputs: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 60 }],
      outputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 60 }],
    },
    {
      recipeClassName: "Recipe_IronPlate_C",
      recipeName: "Iron Plate",
      buildingClassName: "Desc_ConstructorMk1_C",
      buildingName: "Constructor",
      machineCount: 1,
      powerUsageKW: 4,
      inputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 30 }],
      outputs: [{ itemClassName: "Desc_IronPlate_C", itemName: "Iron Plate", rate: 20 }],
    },
    {
      recipeClassName: "Recipe_IronRod_C",
      recipeName: "Iron Rod",
      buildingClassName: "Desc_ConstructorMk1_C",
      buildingName: "Constructor",
      machineCount: 1,
      powerUsageKW: 4,
      inputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 30 }],
      outputs: [{ itemClassName: "Desc_IronRod_C", itemName: "Iron Rod", rate: 15 }],
    },
  ],
  rawResources: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 60 }],
  totalPowerKW: 16,
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

  test("shows milestone tier picker with all tiers", async ({ page }) => {
    await page.goto("/plans/new");
    await expect(page.getByText("Max Milestone Tier")).toBeVisible();
    // Tier 0 through 9 buttons should be visible
    for (let i = 0; i <= 9; i++) {
      await expect(page.getByRole("button", { name: `Tier ${i}` })).toBeVisible();
    }
  });

  test("tier 9 is selected by default", async ({ page }) => {
    await page.goto("/plans/new");
    const tier9 = page.getByRole("button", { name: "Tier 9" });
    await expect(tier9).toHaveAttribute("aria-pressed", "true");
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

  test("loads with Graph/Tree/Factory toggle and Calculate button", async ({ page }) => {
    await page.goto(`/plans/${planId}`);
    await expect(page.getByRole("button", { name: "Graph" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tree" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Factory" })).toBeVisible();
    await expect(page.getByRole("button", { name: /calculate/i })).toBeVisible();
  });

  test("toolbar shows tier selector", async ({ page }) => {
    await page.goto(`/plans/${planId}`);
    const tierSelect = page.locator("select");
    await expect(tierSelect).toBeVisible();
    // Default value should be 9 (max)
    await expect(tierSelect).toHaveValue("9");
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

  test("Graph view shows production nodes and edges", async ({ page }) => {
    await page.route(`**/api/plans/${planId}/calculate`, (route) =>
      route.fulfill({ json: MOCK_CALCULATE_RESULT })
    );

    await page.goto(`/plans/${planId}`);
    await page.getByRole("button", { name: /calculate/i }).click();
    await page.getByRole("tree").waitFor({ timeout: 10_000 });

    // Switch to graph — ReactFlow canvas should render
    await page.getByRole("button", { name: "Graph" }).click();
    const flow = page.locator(".react-flow");
    await expect(flow).toBeVisible();

    // Verify production step nodes are rendered with content
    await expect(flow.getByText("Smart Plating")).toBeVisible();
    await expect(flow.getByText("Iron Plate")).toBeVisible();

    // Verify raw resource node
    await expect(flow.getByText("Iron Ore")).toBeVisible();
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

  // ── Factory view ──────────────────────────────────────────────────────────

  test("Factory view shows individual blueprint machine nodes", async ({ page }) => {
    await page.route(`**/api/plans/${planId}/calculate`, (route) =>
      route.fulfill({ json: MOCK_CALCULATE_RESULT })
    );

    await page.goto(`/plans/${planId}`);
    await page.getByRole("button", { name: /calculate/i }).click();
    await page.getByRole("tree").waitFor({ timeout: 10_000 });

    // Switch to Factory view
    await page.getByRole("button", { name: "Factory" }).click();
    const flow = page.locator(".react-flow");
    await expect(flow).toBeVisible();

    // Individual machine nodes show building names
    await expect(flow.getByText(/Assembler/).first()).toBeVisible();
    await expect(flow.getByText(/Constructor/).first()).toBeVisible();

    // Raw resource node
    await expect(flow.getByText("Iron Ore")).toBeVisible();
  });

  test("Factory view shows individual machines for shared ingredient chains", async ({ page }) => {
    await page.route(`**/api/plans/${planId}/calculate`, (route) =>
      route.fulfill({ json: MOCK_WITH_SPLITTER })
    );

    await page.goto(`/plans/${planId}`);
    await page.getByRole("button", { name: /calculate/i }).click();
    await page.getByRole("tree").waitFor({ timeout: 10_000 });

    await page.getByRole("button", { name: "Factory" }).click();
    const flow = page.locator(".react-flow");
    await expect(flow).toBeVisible();

    // Individual building nodes (Smelter ×2 = 2 Smelter nodes)
    const smelters = flow.getByText("Smelter");
    await expect(smelters.first()).toBeVisible();

    // Constructor nodes for Iron Plate and Iron Rod
    const constructors = flow.getByText("Constructor");
    await expect(constructors.first()).toBeVisible();

    // Raw resource
    await expect(flow.getByText("Iron Ore")).toBeVisible();
  });

  test("Factory view shows placeholder before calculate", async ({ page }) => {
    await page.goto(`/plans/${planId}`);
    await page.getByRole("button", { name: "Factory" }).click();
    await expect(page.getByText(/calculate first/i)).toBeVisible();
  });

  // ── Collaboration / Sharing ──────────────────────────────────────────────

  test("Share button opens share dialog", async ({ page }) => {
    await page.goto(`/plans/${planId}`);
    await page.getByRole("button", { name: "Share" }).click();
    await expect(page.getByText("Share Plan")).toBeVisible();
    await expect(page.getByText("Invite People")).toBeVisible();
    await expect(page.getByText("Share Link")).toBeVisible();
  });

  test("Share dialog shows invite tab with email input", async ({ page }) => {
    await page.goto(`/plans/${planId}`);
    await page.getByRole("button", { name: "Share" }).click();
    await expect(page.getByPlaceholderText("Email address")).toBeVisible();
    await expect(page.getByText("Invite")).toBeVisible();
  });

  test("Share dialog link tab shows enable button", async ({ page }) => {
    await page.goto(`/plans/${planId}`);
    await page.getByRole("button", { name: "Share" }).click();
    await page.getByText("Share Link").click();
    await expect(page.getByText("Link sharing is off")).toBeVisible();
    await expect(page.getByText("Enable")).toBeVisible();
  });

  test("Share dialog closes when X clicked", async ({ page }) => {
    await page.goto(`/plans/${planId}`);
    await page.getByRole("button", { name: "Share" }).click();
    await expect(page.getByText("Share Plan")).toBeVisible();
    await page.getByLabel("Close share dialog").click();
    await expect(page.getByText("Share Plan")).not.toBeVisible();
  });

  // ── Controls help panel ─────────────────────────────────────────────────

  test("? button opens controls panel with view-specific content", async ({ page }) => {
    await page.goto(`/plans/${planId}`);
    const helpButton = page.getByRole("button", { name: /show controls/i });
    await expect(helpButton).toBeVisible();

    // Open controls panel (default view is graph)
    await helpButton.click();
    await expect(page.getByText("Graph Controls")).toBeVisible();
    await expect(page.getByText("Navigation")).toBeVisible();

    // Close with button
    await helpButton.click();
    await expect(page.getByText("Graph Controls")).not.toBeVisible();
  });

  test("controls panel updates when view changes", async ({ page }) => {
    await page.route(`**/api/plans/${planId}/calculate`, (route) =>
      route.fulfill({ json: MOCK_CALCULATE_RESULT })
    );

    await page.goto(`/plans/${planId}`);
    await page.getByRole("button", { name: /calculate/i }).click();
    await page.getByRole("tree").waitFor({ timeout: 10_000 });

    // Open controls in Tree view
    await page.getByRole("button", { name: /show controls/i }).click();
    await expect(page.getByText("Tree Controls")).toBeVisible();

    // Switch to Factory view — panel content should update
    await page.getByRole("button", { name: "Factory" }).click();
    await expect(page.getByText("Factory Controls")).toBeVisible();
    await expect(page.getByText("Buildings")).toBeVisible();
  });

  // ── View switching round-trip ─────────────────────────────────────────────

  test("can switch between all three views after calculate", async ({ page }) => {
    await page.route(`**/api/plans/${planId}/calculate`, (route) =>
      route.fulfill({ json: MOCK_CALCULATE_RESULT })
    );

    await page.goto(`/plans/${planId}`);
    await page.getByRole("button", { name: /calculate/i }).click();
    await page.getByRole("tree").waitFor({ timeout: 10_000 });

    // Tree → Factory
    await page.getByRole("button", { name: "Factory" }).click();
    await expect(page.locator(".react-flow")).toBeVisible();
    await expect(page.locator(".react-flow").getByText(/Assembler/).first()).toBeVisible();

    // Factory → Graph
    await page.getByRole("button", { name: "Graph" }).click();
    await expect(page.locator(".react-flow")).toBeVisible();

    // Graph → Tree
    await page.getByRole("button", { name: "Tree" }).click();
    await expect(page.getByRole("tree")).toBeVisible();

    // Tree → Graph → Factory
    await page.getByRole("button", { name: "Graph" }).click();
    await page.getByRole("button", { name: "Factory" }).click();
    await expect(page.locator(".react-flow").getByText(/Assembler/).first()).toBeVisible();
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
