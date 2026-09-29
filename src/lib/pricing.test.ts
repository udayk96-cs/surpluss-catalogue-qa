import { describe, expect, it } from "vitest";
import { discountPercent } from "./pricing";

describe("discountPercent", () => {
  it.each([
    { product: "Product A", mrp: 1000, offerPrice: 800, expectedDiscount: 20 },
    { product: "Product B", mrp: 2500, offerPrice: 1500, expectedDiscount: 40 },
  ])("calculates the discount for $product", ({ mrp, offerPrice, expectedDiscount }) => {
    expect(
      discountPercent({ priceOnRequest: false, mrp, offerPrice }),
    ).toBe(expectedDiscount);
  });
});
