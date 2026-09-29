import { z } from "zod";

export const enquirySchema = z
  .object({
    catalogueId: z.string().uuid(),
    name: z.string().trim().min(2).max(100),
    company: z.string().trim().max(120).optional(),
    countryCode: z.string().regex(/^\+\d{1,4}$/).default("+91"),
    phone: z.string().regex(/^\d{6,10}$/).optional().or(z.literal("")),
    email: z.string().email().optional().or(z.literal("")),
    location: z.string().trim().max(120).optional(),
    message: z.string().trim().max(1000).optional(),
    referralPerson: z.string().trim().max(100).optional(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          quantity: z.number().int().positive(),
        }),
      )
      .min(1)
      .max(100),
  })
  .refine((data) => Boolean(data.phone) || Boolean(data.email), {
    message: "Add a WhatsApp number or an email address.",
  });