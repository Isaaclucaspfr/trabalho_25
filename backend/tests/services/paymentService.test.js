import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../../src/utils/appError.js';

const { prismaMock, txMock, gatewayMock } = vi.hoisted(() => {
  const tx = {
    event: { findFirst: vi.fn() },
    ticket: { aggregate: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
    payment: { create: vi.fn(), update: vi.fn() }
  };

  const prisma = {
    $transaction: vi.fn(),
    payment: { update: vi.fn(), findFirst: vi.fn() },
    ticket: { update: vi.fn() }
  };

  const gateway = { processPayment: vi.fn() };
  return { prismaMock: prisma, txMock: tx, gatewayMock: gateway };
});

vi.mock('../../src/config/prisma.js', () => ({ prisma: prismaMock }));
vi.mock('../../src/services/paymentGatewayService.js', () => ({ paymentGatewayService: gatewayMock }));

const { paymentService } = await import('../../src/services/paymentService.js');

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (arg) => {
      if (typeof arg === 'function') return arg(txMock);
      return Promise.all(arg);
    });
  });

  it('processCheckout should approve payment and ticket when gateway returns approved', async () => {
    txMock.event.findFirst.mockResolvedValue({ id: 'event-1', status: 'PUBLISHED', capacity: 100, price: 120 });
    txMock.ticket.aggregate.mockResolvedValue({ _sum: { quantity: 20 } });
    txMock.payment.create.mockResolvedValue({ id: 'pay-1', amount: 240 });
    txMock.ticket.create.mockResolvedValue({ id: 'ticket-1', quantity: 2, status: 'PENDING' });

    gatewayMock.processPayment.mockResolvedValue({
      status: 'approved',
      gatewayPaymentId: 'gw-1',
      reason: null
    });

    prismaMock.payment.update.mockResolvedValue({
      id: 'pay-1',
      gatewayPaymentId: 'gw-1',
      status: 'PAID'
    });
    prismaMock.ticket.update.mockResolvedValue({
      id: 'ticket-1',
      quantity: 2,
      status: 'PAID',
      totalValue: 240
    });

    const result = await paymentService.processCheckout('user-1', {
      eventId: 'event-1',
      quantity: 2,
      cardDetails: {
        cardName: 'Teste',
        cardNumber: '4111111111111111',
        expiry: '12/30',
        cvv: '123'
      }
    });

    expect(result.success).toBe(true);
    expect(result.paymentStatus).toBe('PAID');
    expect(result.ticketStatus).toBe('PAID');
    expect(result.message).toContain('Pagamento aprovado');
    expect(gatewayMock.processPayment).toHaveBeenCalledTimes(1);
  });

  it('processCheckout should reject when event has no capacity', async () => {
    txMock.event.findFirst.mockResolvedValue({ id: 'event-1', status: 'PUBLISHED', capacity: 10, price: 100 });
    txMock.ticket.aggregate.mockResolvedValue({ _sum: { quantity: 9 } });

    await expect(
      paymentService.processCheckout('user-1', {
        eventId: 'event-1',
        quantity: 2,
        paymentMethodId: 'pm_123'
      })
    ).rejects.toThrow('Sem disponibilidade suficiente');

    expect(gatewayMock.processPayment).not.toHaveBeenCalled();
  });

  it('handleWebhook should throw unauthorized without valid secret', async () => {
    await expect(
      paymentService.handleWebhook({ 'x-webhook-secret': 'invalid' }, { gatewayPaymentId: 'gw-1', status: 'paid' })
    ).rejects.toBeInstanceOf(AppError);
  });
});

