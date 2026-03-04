/**
 * Tests for authentication flows.
 * These run WITHOUT a stored session so we can test the unauthenticated state.
 */
import { test, expect } from "@playwright/test";

// Clear the saved session — these tests verify unauthenticated behaviour
test.use({ storageState: { cookies: [], origins: [] } });

test("landing page has sign-in and create account links", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /create account/i })).toBeVisible();
});

test("visiting /dashboard while logged out redirects to /sign-in", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/sign-in/);
});

test("visiting /plans/any-id while logged out redirects to /sign-in", async ({ page }) => {
  await page.goto("/plans/00000000-0000-0000-0000-000000000000");
  await expect(page).toHaveURL(/sign-in/);
});

test("sign-in page renders email, password fields and submit button", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("button", { name: /github/i })).toBeVisible();
});

test("sign-in shows error on wrong credentials", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("nobody@example.com");
  await page.getByLabel("Password").fill("wrongpassword");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  // Still on sign-in page
  await expect(page).toHaveURL(/sign-in/);
});

test("sign-up page renders correctly", async ({ page }) => {
  await page.goto("/sign-up");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByRole("button", { name: /sign up|create/i })).toBeVisible();
});

test("sign-up page has link back to sign-in", async ({ page }) => {
  await page.goto("/sign-up");
  await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
});
