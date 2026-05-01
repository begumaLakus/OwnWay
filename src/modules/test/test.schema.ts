import { z } from "zod";

export const SubmitTestSchema = z.object({
  // Şeyma sana bu isimlerle göndermeli:
  culture_w: z.number().min(0).max(100),
  nature_w: z.number().min(0).max(100),
  social_w: z.number().min(0).max(100),
  modern_w: z.number().min(0).max(100),
});

export type SubmitTestInput = z.infer<typeof SubmitTestSchema>;