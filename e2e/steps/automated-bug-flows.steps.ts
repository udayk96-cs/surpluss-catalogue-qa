import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { After, Given, When, Then } = createBdd();

type BugFlowData = { catalogueName?: string };
const bugFlowDataByPage = new WeakMap<Page, BugFlowData>();

function bugFlowData(page: Page): BugFlowData {
  let data = bugFlowDataByPage.get(page);
  if (!data) {
    data = {};
    bugFlowDataByPage.set(page, data);
  }
  return data;
}

async function signIn(page: Page, role: "admin" | "staff") {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
  await page.getByLabel("Email").fill(
    role === "admin"
      ? process.env.E2E_ADMIN_EMAIL ?? "admin@catalogue.test"
      : process.env.E2E_STAFF_EMAIL ?? "staff@catalogue.test",
  );
  await page.getByLabel("Password").fill(
    role === "admin"
      ? process.env.E2E_ADMIN_PASSWORD ?? "Admin#2026"
      : process.env.E2E_STAFF_PASSWORD ?? "Staff#2026",
  );
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin(?:\?.*)?$/);
}

Given('the {string} user is signed in', async ({ page }, role: string) => {
  if (role !== "admin" && role !== "staff") {
    throw new Error(`Unsupported test user role: ${role}`);
  }
  await signIn(page, role);
});

When(
  "the admin publishes a catalogue with a future validity date",
  async ({ page }) => {
    const catalogueName = `E2E Future Validity ${Date.now()}`;
    const slug = catalogueName.toLowerCase().replaceAll(" ", "-");
    bugFlowData(page).catalogueName = catalogueName;

    await page.goto("/admin/catalogues");
    await page.getByRole("button", { name: "New catalogue" }).click();
    await expect(page.getByRole("heading", { name: "New catalogue" })).toBeVisible();
    await page.getByLabel("Name *").fill(catalogueName);
    await page.getByLabel("Link *").fill(slug);

    const futureDate = await page.evaluate(() => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return {
        day: date.toLocaleDateString(),
        crossesMonth: date.getMonth() !== new Date().getMonth(),
      };
    });
    await page.getByRole("button", { name: "No expiry" }).click();
    const calendar = page.locator('[data-slot="calendar"]');
    await expect(calendar).toBeVisible();
    if (futureDate.crossesMonth) {
      await page.getByRole("button", { name: /next month/i }).click();
    }
    await calendar.locator(`[data-day="${futureDate.day}"]`).click();
    await page.getByRole("checkbox", { name: /Put it live right away/ }).check();
    await page.getByRole("button", { name: "Proceed" }).click();

    const productSearch = page.getByPlaceholder("Search by name, SKU or brand");
    await productSearch.fill("Atlas cabin trolley");
    await page.getByRole("button", { name: /Atlas cabin trolley/ }).click();
    await page.getByRole("button", { name: "Create and go live" }).click();
    await expect(page).toHaveURL(/\/admin\/catalogues\/[0-9a-f-]+$/i);
  },
);

Then("the catalogue status is Live on the dashboard", async ({ page }) => {
  const catalogueName = bugFlowData(page).catalogueName;
  if (!catalogueName) throw new Error("The test catalogue name was not recorded.");

  await page.goto("/admin/catalogues");
  const catalogueRow = page.getByRole("row").filter({ hasText: catalogueName });
  await expect(catalogueRow).toBeVisible();
  await expect(catalogueRow.getByText("Live", { exact: true })).toBeVisible();
});

When("the staff user opens the actions for a product", async ({ page }) => {
  await page.goto("/admin/products");
  await expect(page.getByRole("heading", { name: "Product library" })).toBeVisible();

  const firstProductRow = page.getByRole("row").nth(1);
  await firstProductRow.getByRole("button", { name: /^Actions for / }).click();
});

Then("the staff user does not see a Delete option", async ({ page }) => {
  await expect(
    page.getByRole("menuitem", { name: "Delete", exact: true }),
  ).toHaveCount(0);
});

When("the staff user opens the new catalogue form", async ({ page }) => {
  await page.goto("/admin/catalogues");
  await page.getByRole("button", { name: "New catalogue" }).click();
  await expect(page.getByRole("heading", { name: "New catalogue" })).toBeVisible();
});

Then(
  "the staff user does not see an option to publish the catalogue",
  async ({ page }) => {
    await expect(
      page.getByRole("checkbox", { name: /Put it live right away/ }),
    ).toHaveCount(0);
  },
);

After(async ({ page }) => {
  const catalogueName = bugFlowDataByPage.get(page)?.catalogueName;
  if (!catalogueName) return;

  await page.goto("/admin/catalogues");
  const catalogueRow = page.getByRole("row").filter({ hasText: catalogueName });
  if (!(await catalogueRow.count())) return;

  await catalogueRow.getByRole("button", { name: "More options" }).click();
  await page.getByRole("menuitem", { name: "Delete", exact: true }).click();
  const confirmation = page.getByRole("dialog");
  await confirmation.getByRole("button", { name: "Delete catalogue" }).click();
  await expect(catalogueRow).toHaveCount(0);
});