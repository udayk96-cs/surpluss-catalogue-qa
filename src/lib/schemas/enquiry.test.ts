import { describe, expect, it } from "vitest";
import { enquirySchema } from "./enquiry";

const validEnquiry = {
  catalogueId: "00000000-0000-4000-8000-000000000001",
  name: "Test Buyer",
  phone: "9876543210",
  items: [
    {
      productId: "00000000-0000-4000-8000-000000000002",
      quantity: 10,
    },
  ],
};

describe("enquirySchema", () => {
  it("accepts an enquiry with a valid phone and product quantity", () => {
    expect(enquirySchema.safeParse(validEnquiry).success).toBe(true);
  });

  it("rejects an enquiry without a phone number or email", () => {
    const enquiryWithoutPhone = { ...validEnquiry, phone: undefined };

    expect(enquirySchema.safeParse(enquiryWithoutPhone).success).toBe(false);
  });

  it("rejects a zero product quantity", () => {
    const enquiryWithZeroQuantity = {
      ...validEnquiry,
      items: [{ ...validEnquiry.items[0], quantity: 0 }],
    };

    expect(enquirySchema.safeParse(enquiryWithZeroQuantity).success).toBe(false);
  });
});