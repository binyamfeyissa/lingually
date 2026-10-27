import { test, expect } from "@playwright/test";

test.describe("Lingually Workbench E2E Workflows", () => {
  test("loads the application and displays the welcome document", async ({ page }) => {
    await page.goto("/");
    // Document title should be present
    const titleInput = page.locator('input[placeholder="Untitled Document..."]');
    await expect(titleInput).toBeVisible();

    // Word count bar should be visible at bottom
    await expect(page.locator("text=Saved locally").or(page.locator("text=words"))).toBeVisible();
  });

  test("allows creating and editing a document", async ({ page }) => {
    await page.goto("/");

    // Click new document button
    const newDocButton = page.locator('button:has-text("New Document")');
    if (await newDocButton.isVisible()) {
      await newDocButton.click();
      const titleInput = page.locator('input[placeholder="Untitled Document..."]');
      await titleInput.fill("My End-to-End Test Document");
      await expect(titleInput).toHaveValue("My End-to-End Test Document");
    }
  });

  test("opens Analysis drawer and displays local metrics", async ({ page }) => {
    await page.goto("/");

    // Click Analysis button in word count bar
    const analysisBtn = page.locator('button[title="Open Writing Analysis & Readability"]');
    await analysisBtn.click();

    // Verify modal appears
    await expect(page.locator("text=Writing Analysis & Readability")).toBeVisible();
    await expect(page.locator("text=Deterministic metrics calculated locally")).toBeVisible();

    // Close modal
    await page.keyboard.press("Escape");
    await expect(page.locator("text=Writing Analysis & Readability")).not.toBeVisible();
  });

  test("navigates to Settings and verifies BYOK interface", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.locator("text=Bring Your Own Key (BYOK)")).toBeVisible();
    await expect(page.locator("text=OpenAI")).toBeVisible();
    await expect(page.locator("text=Google Gemini")).toBeVisible();
    await expect(page.locator("text=Anthropic Claude")).toBeVisible();
    await expect(page.locator("text=Groq")).toBeVisible();
    await expect(page.locator("text=Ollama (Local)")).toBeVisible();
  });

  test("navigates to Privacy & Architecture page", async ({ page }) => {
    await page.goto("/privacy");

    await expect(page.locator("text=Privacy, Security & BYOK Architecture")).toBeVisible();
    await expect(page.locator("text=Local-First Document Storage")).toBeVisible();
    await expect(page.locator("text=Zero Background Telemetry")).toBeVisible();
  });
});
