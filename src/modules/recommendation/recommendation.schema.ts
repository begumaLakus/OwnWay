import { z } from "zod";

// Arama işlemi için doğrulama
export const searchSchema = z.object({
  q: z.string().min(2, "Arama terimi en az 2 karakter olmalıdır").max(50),
});

// İleride kullanıcı test sonuçlarını manuel gönderirse buraya ekleme yapabiliriz
// export const recommendationInputSchema = z.object({ ... });