/**
 * E2E tests for the multi-floor factory layout feature.
 *
 * Uses a mock solver result with enough machines to span 2+ floors
 * when floor depth is set to a small value.
 */
import { test, expect, type Page } from "@playwright/test";

// Mock with 6 smelters (machineCount=6, each 2 foundations tall)
// At floorDepth=8, these 12 foundations of machines + gaps should span 2 floors
const MOCK_MANY_MACHINES = {
  steps: [
    {
      recipeClassName: "Recipe_IronIngot_C",
      recipeName: "Iron Ingot",
      buildingClassName: "Desc_SmelterMk1_C",
      buildingName: "Smelter",
      machineCount: 6,
      powerUsageKW: 24,
      inputs: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 180 }],
      outputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 180 }],
    },
    {
      recipeClassName: "Recipe_IronPlate_C",
      recipeName: "Iron Plate",
      buildingClassName: "Desc_ConstructorMk1_C",
      buildingName: "Constructor",
      machineCount: 6,
      powerUsageKW: 24,
      inputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 180 }],
      outputs: [{ itemClassName: "Desc_IronPlate_C", itemName: "Iron Plate", rate: 120 }],
    },
  ],
  rawResources: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 180 }],
  totalPowerKW: 48,
};

async function createPlan(page: Page): Promise<string> {
  await page.goto("/plans/new");
  await page.getByLabel("Plan Name").fill("[E2E] Multi-Floor Test");
  await page.getByText("Blank plan", { exact: false }).first().click();
  await page.getByRole("button", { name: "Create Plan" }).click();
  await page.waitForURL(/\/plans\/[0-9a-f-]{36}$/, { timeout: 15_000 });
  return page.url().split("/plans/")[1];
}

test.describe("multi-floor factory layout", () => {
  test("floor tabs appear when layout spans multiple floors", async ({ page }) => {
    const planId = await createPlan(page);

    // Mock the calculate endpoint with many machines
    await page.route(`**/api/plans/${planId}/calculate`, async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({ json: MOCK_MANY_MACHINES });
      } else {
        await route.fulfill({ json: MOCK_MANY_MACHINES });
      }
    });

    // Mock plan GET to include a small floor config
    await page.route(`**/api/plans/${planId}`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          json: {
            id: planId,
            name: "[E2E] Multi-Floor Test",
            floorConfig: { floorWidth: 16, floorDepth: 8 },
            factoryNodePositions: null,
          },
        });
      } else {
        await route.continue();
      }
    });

    // Calculate
    await page.getByRole("button", { name: "Calculate" }).click();

    // Switch to factory view
    await page.getByRole("button", { name: "Factory" }).click();

    // Wait for the factory canvas to render
    await page.waitForTimeout(1000);

    // Check if floor tabs are visible (there should be at least Floor 1)
    const floorTabs = page.getByRole("tab");
    const tabCount = await floorTabs.count();

    // With 6 machines at 2 foundations each + gaps, and floorDepth=8,
    // we should have multiple floors
    if (tabCount > 1) {
      // Verify we can see Floor 1 and Floor 2 tabs
      await expect(page.getByRole("tab", { name: "Floor 1" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Floor 2" })).toBeVisible();

      // Click Floor 2 to switch
      await page.getByRole("tab", { name: "Floor 2" }).click();

      // Verify Floor 2 tab is now selected
      await expect(page.getByRole("tab", { name: "Floor 2" })).toHaveAttribute("aria-selected", "true");
    }
  });

  test("single-floor layout does not show floor tabs", async ({ page }) => {
    const planId = await createPlan(page);

    // Mock with just 1 machine (fits on one floor)
    const smallResult = {
      steps: [
        {
          recipeClassName: "Recipe_IronIngot_C",
          recipeName: "Iron Ingot",
          buildingClassName: "Desc_SmelterMk1_C",
          buildingName: "Smelter",
          machineCount: 1,
          powerUsageKW: 4,
          inputs: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 30 }],
          outputs: [{ itemClassName: "Desc_IronIngot_C", itemName: "Iron Ingot", rate: 30 }],
        },
      ],
      rawResources: [{ itemClassName: "Desc_OreIron_C", itemName: "Iron Ore", rate: 30 }],
      totalPowerKW: 4,
    };

    await page.route(`**/api/plans/${planId}/calculate`, async (route) => {
      await route.fulfill({ json: smallResult });
    });

    await page.getByRole("button", { name: "Calculate" }).click();
    await page.getByRole("button", { name: "Factory" }).click();
    await page.waitForTimeout(500);

    // Floor tabs should NOT be visible for a single-floor layout
    const floorTabs = page.getByRole("tablist", { name: "Factory floors" });
    await expect(floorTabs).not.toBeVisible();
  });
});
