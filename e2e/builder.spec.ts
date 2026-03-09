/**
 * E2E tests for the freeform factory builder.
 */
import { test, expect, type Page } from "@playwright/test";

async function createPlan(page: Page): Promise<string> {
  await page.goto("/plans/new");
  await page.getByLabel("Plan Name").fill("[E2E] Builder Test");
  await page.getByText("Blank plan", { exact: false }).first().click();
  await page.getByRole("button", { name: "Create Plan" }).click();
  await page.waitForURL(/\/plans\/[0-9a-f-]{36}$/, { timeout: 15_000 });
  return page.url().split("/plans/")[1];
}

async function switchToBuilder(page: Page) {
  await page.getByRole("button", { name: "Builder" }).click();
  // Wait for the toolbar to appear
  await expect(page.getByLabel("Add Smelter")).toBeVisible({ timeout: 5_000 });
}

test.describe("freeform factory builder", () => {
  test("Builder tab renders with toolbar", async ({ page }) => {
    await createPlan(page);
    await switchToBuilder(page);

    // Toolbar should show building buttons
    await expect(page.getByLabel("Add Smelter")).toBeVisible();
    await expect(page.getByLabel("Add Constructor")).toBeVisible();
    await expect(page.getByLabel("Add Assembler")).toBeVisible();
    await expect(page.getByLabel("Add Resource")).toBeVisible();
  });

  test("adding a machine node from toolbar", async ({ page }) => {
    await createPlan(page);
    await switchToBuilder(page);

    // Click to add a smelter
    await page.getByLabel("Add Smelter").click();

    // A node should appear on the canvas with "Smelter" text
    await expect(page.locator(".react-flow__node").first()).toBeVisible({ timeout: 3_000 });
    await expect(page.getByText("Smelter").first()).toBeVisible();

    // It should show the "assign" prompt since no recipe is set
    await expect(page.locator(".react-flow__node").getByText("Double-click to assign")).toBeVisible({ timeout: 5_000 });
  });

  test("assigning a recipe via double-click", async ({ page }) => {
    await createPlan(page);
    await switchToBuilder(page);

    // Add a smelter
    await page.getByLabel("Add Smelter").click();
    const node = page.locator(".react-flow__node").first();
    await expect(node).toBeVisible({ timeout: 5_000 });

    // Double-click the node to open recipe dialog
    await node.dblclick();

    // Recipe assign dialog should appear
    await expect(page.getByRole("dialog", { name: "Assign Recipe" })).toBeVisible({ timeout: 5_000 });

    // Click "Iron Ingot" to assign (uses real recipe data from the server)
    const dialog = page.getByRole("dialog", { name: "Assign Recipe" });
    await dialog.getByRole("option", { name: "Iron Ingot" }).click();

    // Dialog should close and node should now show recipe name
    await expect(page.getByRole("dialog", { name: "Assign Recipe" })).not.toBeVisible();
    await expect(page.getByText("Iron Ingot").first()).toBeVisible();

    // The "assign" prompt should be gone
    await expect(page.locator(".react-flow__node").getByText("Double-click to assign")).not.toBeVisible();
  });
});
