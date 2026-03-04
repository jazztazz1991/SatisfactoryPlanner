/**
 * Runs once before all tests.
 * Creates a test user (if not already present) and signs in,
 * then saves the browser's cookie/session state so authenticated
 * tests can reuse it without going through sign-in again.
 */
import { test as setup, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const AUTH_FILE = path.join(__dirname, ".auth/user.json");
const TEST_EMAIL = "playwright@test.local";
const TEST_PASSWORD = "Playwright123!";

setup("authenticate", async ({ page }) => {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  // Create the test account (safe to call if it already exists — returns 409)
  await fetch("http://localhost:3000/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });

  // Sign in through the real UI so NextAuth writes its JWT cookie
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL("**/dashboard", { timeout: 15_000 });
  await expect(page.getByRole("link", { name: /new plan/i })).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});
