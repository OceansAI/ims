// Main schemas
export const verifyOtpSchema = z.object({
  token: z.string(),
  email: z.string(),
});