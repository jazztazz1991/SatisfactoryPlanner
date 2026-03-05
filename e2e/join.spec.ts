/**
 * Tests for the share / join plan flow (authenticated).
 *
 * The join API is mocked so tests don't depend on a second user or real plan data.
 */
import { test, expect } from "@playwright/test";

test("visiting a share join link while logged out redirects to sign-in", async ({ page }) => {
  // Use unauthenticated context for this test
  await page.context().clearCookies();
  await page.goto("/plans/join/fake-token-123");
  await expect(page).toHaveURL(/sign-in/);
});

test("join page shows loading state then redirects on success", async ({ page }) => {
  const mockPlanId = "00000000-0000-0000-0000-000000000001";

  // Mock the POST join endpoint
  await page.route("**/api/plans/join/test-token-abc", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ planId: mockPlanId, id: "collab-1", role: "viewer" }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock the plan page load so we don't need a real plan
  await page.route(`**/api/plans/${mockPlanId}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: mockPlanId,
        name: "Shared Plan",
        viewMode: "graph",
        targets: [],
      }),
    });
  });

  await page.goto("/plans/join/test-token-abc");
  // Should redirect to the plan after joining
  await expect(page).toHaveURL(new RegExp(`/plans/${mockPlanId}`), { timeout: 10000 });
});

test("join page shows error for invalid token", async ({ page }) => {
  // Mock the POST join endpoint to return an error
  await page.route("**/api/plans/join/bad-token", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "Invalid or expired share link" }),
      });
    } else {
      await route.continue();
    }
  });

  await page.goto("/plans/join/bad-token");
  await expect(page.getByText("Invalid or expired share link")).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("button", { name: /go to dashboard/i })).toBeVisible();
});

test("GET /api/plans/join/:token redirects to frontend join page", async ({ page }) => {
  const response = await page.request.get("/api/plans/join/some-token", {
    maxRedirects: 0,
  });
  // Should be a redirect (302/307/308)
  expect([301, 302, 307, 308]).toContain(response.status());
  const location = response.headers()["location"];
  expect(location).toContain("/plans/join/some-token");
});
