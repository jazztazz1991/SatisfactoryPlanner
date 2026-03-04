/**
 * Tests for the dashboard page (authenticated).
 */
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL("/dashboard");
});

test("dashboard shows New Plan button", async ({ page }) => {
  await expect(page.getByRole("link", { name: /new plan/i })).toBeVisible();
});

test("clicking New Plan navigates to the plan creation wizard", async ({ page }) => {
  await page.getByRole("link", { name: /new plan/i }).click();
  await expect(page).toHaveURL(/plans\/new/);
});

test("dashboard page title is visible", async ({ page }) => {
  await expect(page.getByRole("heading", { name: /dashboard|plans/i })).toBeVisible();
});
