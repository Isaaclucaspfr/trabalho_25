import { z } from 'zod';

export const checkoutSchema = z
  .object({
    eventId: z.string().min(1),
    quantity: z.number().int().positive(),
    paymentMethodId: z.string().optional(),
    cardDetails: z
      .object({
        cardName: z.string().min(2),
        cardNumber: z.string().min(12),
        expiry: z.string().min(4),
        cvv: z.string().min(3).max(4),
        brand: z.string().optional()
      })
      .optional()
  })
  .refine((value) => Boolean(value.paymentMethodId || value.cardDetails), {
    message: 'Informe paymentMethodId ou cardDetails para processar o pagamento'
  });

export const paymentWebhookSchema = z.object({
  gatewayPaymentId: z.string().min(1),
  status: z.string().min(1),
  reason: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

