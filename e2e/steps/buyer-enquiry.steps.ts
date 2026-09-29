import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();
const catalogueSlug = "premium-corporate-essentials";
const catalogueTitle = "Premium corporate essentials";

type EnquiryJourney = {
  buyerName: string;
  productName: string;
  quantity: number;
  reference: string;
};

const journeyByPage = new WeakMap<Page, EnquiryJourney>();

function journeyFor(page: Page): EnquiryJourney {
  const journey = journeyByPage.get(page);
  if (!journey) throw new Error("The buyer enquiry journey data is missing.");
  return journey;
}

function formatQuantity(quantity: number): string {
  return new Intl.NumberFormat("en-IN").format(quantity);
}

Given("a buyer opens the published catalogue", async ({ page }) => {
  const response = await page.goto(`/catalogue/${catalogueSlug}`);

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: catalogueTitle }),
  ).toBeVisible();
});

Given("the buyer browses the available products", async ({ page }) => {
  await expect(
    page.locator(`a[href^="/catalogue/${catalogueSlug}/product/"]`).first(),
  ).toBeVisible();
});

When("the buyer submits an enquiry for a product", async ({ page }) => {
  const productLink = page.locator(
    `a[href^="/catalogue/${catalogueSlug}/product/"]`,
  ).first();
  const productHeading = productLink.getByRole("heading", { level: 3 });
  await expect(productHeading).toBeVisible();
  const productName = (await productHeading.innerText()).replace(/\s+/g, " ").trim();
  await productLink.click();

  await expect(page).toHaveURL(
    new RegExp(`/catalogue/${catalogueSlug}/product/[^/?]+$`),
  );
  await expect(
    page.getByRole("heading", { level: 1, name: productName }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Contact Us" }).click();
  const enquiryDialog = page.getByRole("dialog");
  await expect(enquiryDialog).toBeVisible();

  const buyerName = `E2E Buyer ${Date.now()}`;
  const quantityInput = page.getByRole("textbox", { name: "Quantity in units" });
  const quantityValue = (await quantityInput.inputValue()).replaceAll(",", "");
  const quantity = Number(quantityValue);

  expect(quantity).toBeGreaterThan(0);
  await page.getByLabel("Your name *").fill(buyerName);
  await page.getByLabel("WhatsApp number *").fill("5551234567");
  await page.getByRole("button", { name: "Send enquiry" }).click();

  await expect(page.getByRole("heading", { name: "Enquiry sent" })).toBeVisible();
  const reference = (await page.getByText(/^ENQ-\d+$/).innerText()).trim();

  journeyByPage.set(page, { buyerName, productName, quantity, reference });
});

Then("the buyer sees the enquiry confirmation", async ({ page }) => {
  const journey = journeyFor(page);

  await expect(page.getByText(journey.reference, { exact: true })).toBeVisible();
  await expect(
    page.getByRole("dialog").getByText(journey.productName, { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("dialog")
      .getByText(`${formatQuantity(journey.quantity)} units`, { exact: false }),
  ).toBeVisible();
});

Then(
  "the admin sees the enquiry in Leads with the requested product and quantity",
  async ({ page }) => {
    const journey = journeyFor(page);

    await page.goto("/admin/leads");
    await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
    await page.getByLabel("Email").fill(
      process.env.E2E_ADMIN_EMAIL ?? "admin@catalogue.test",
    );
    await page.getByLabel("Password").fill(
      process.env.E2E_ADMIN_PASSWORD ?? "Admin#2026",
    );
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/admin(?:\?.*)?$/);
    await page.goto("/admin/leads");
    await expect(page.getByRole("heading", { name: "Leads" })).toBeVisible();
    await page.getByPlaceholder("Search buyer, reference or contact").fill(journey.buyerName);

    const leadRow = page.getByRole("row").filter({ hasText: journey.buyerName });
    await expect(leadRow).toBeVisible();
    await expect(leadRow).toContainText(journey.reference);
    await expect(leadRow).toContainText(catalogueTitle);
    await expect(leadRow).toContainText("1 product");
    await expect(leadRow).toContainText(`${formatQuantity(journey.quantity)} units`);
    await expect(leadRow).toContainText("New");

    await leadRow.getByRole("link", { name: `View ${journey.reference}` }).click();
    await expect(page.getByRole("heading", { name: journey.reference })).toBeVisible();
    await expect(page.getByText(journey.productName, { exact: false })).toBeVisible();
    await expect(
      page.getByText(`${formatQuantity(journey.quantity)} units`, { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(journey.buyerName, { exact: true })).toBeVisible();
  },
);