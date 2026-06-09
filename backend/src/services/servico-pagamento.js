import { PaymentStatus, TicketStatus } from '@prisma/client';
import { prisma } from '../config/cliente-banco-dados.js';
import { env } from '../config/configuracao-ambiente.js';
import { AppError } from '../utils/erro-aplicacao.js';
import { paymentGatewayService } from './servico-gateway-pagamento.js';

const ticketCode = () => `TKT-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

const checkoutStatusesForCapacity = [TicketStatus.RESERVED, TicketStatus.PAID, TicketStatus.PENDING];

const mapGatewayToPaymentStatus = (status) => {
  if (status === 'approved' || status === 'paid') return PaymentStatus.PAID;
  if (status === 'failed' || status === 'rejected') return PaymentStatus.FAILED;
  if (status === 'canceled' || status === 'cancelled') return PaymentStatus.CANCELED;
  return PaymentStatus.PENDING;
};

const paymentToTicketStatus = (status) => {
  if (status === PaymentStatus.PAID) return TicketStatus.PAID;
  if (status === PaymentStatus.FAILED || status === PaymentStatus.CANCELED) return TicketStatus.CANCELED;
  return TicketStatus.PENDING;
};

export const paymentService = {
  /**
   * Reserva capacidade, cria o pagamento e sincroniza o resultado do gateway.
   *
   * A chamada externa fica fora da primeira transacao para nao manter uma
   * transacao do banco aberta enquanto o gateway responde.
   */
  async processCheckout(userId, payload) {
    const { eventId, quantity, paymentMethodId, cardDetails } = payload;

    const draft = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findFirst({ where: { id: eventId, deletedAt: null } });
      if (!event) throw new AppError('Evento nao encontrado', 404);
      if (event.status === 'CANCELED') throw new AppError('Evento cancelado', 409);
      if (event.status === 'DRAFT') throw new AppError('Evento ainda nao publicado', 409);

      const sold = await tx.ticket.aggregate({
        where: { eventId, status: { in: checkoutStatusesForCapacity } },
        _sum: { quantity: true }
      });

      const occupied = sold._sum.quantity || 0;
      if (occupied + quantity > event.capacity) throw new AppError('Sem disponibilidade suficiente', 409);

      const totalValue = Number(event.price) * quantity;

      const payment = await tx.payment.create({
        data: {
          gateway: env.paymentGatewayProvider,
          amount: totalValue,
          currency: 'BRL',
          status: PaymentStatus.PENDING,
          rawRequest: {
            paymentMethodId: paymentMethodId || null,
            cardName: cardDetails?.cardName || null,
            cardLast4: cardDetails?.cardNumber ? cardDetails.cardNumber.replace(/\D/g, '').slice(-4) : null
          },
          userId,
          eventId
        }
      });

      const ticket = await tx.ticket.create({
        data: {
          code: ticketCode(),
          quantity,
          totalValue,
          status: TicketStatus.PENDING,
          userId,
          eventId,
          paymentId: payment.id
        }
      });

      return { payment, ticket, event };
    });

    // Neste ponto o banco ja possui IDs internos para reconciliacao posterior.
    const gatewayResult = await paymentGatewayService.processPayment({
      amount: Number(draft.payment.amount),
      paymentMethodId,
      cardDetails
    });

    const finalPaymentStatus = mapGatewayToPaymentStatus(gatewayResult.status);
    const finalTicketStatus = paymentToTicketStatus(finalPaymentStatus);

    const [payment, ticket] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: draft.payment.id },
        data: {
          status: finalPaymentStatus,
          gatewayPaymentId: gatewayResult.gatewayPaymentId,
          failureReason: gatewayResult.reason || null,
          rawResponse: gatewayResult
        }
      }),
      prisma.ticket.update({
        where: { id: draft.ticket.id },
        data: { status: finalTicketStatus }
      })
    ]);

    return {
      success: finalPaymentStatus === PaymentStatus.PAID,
      paymentId: payment.id,
      gatewayPaymentId: payment.gatewayPaymentId,
      paymentStatus: payment.status,
      ticketId: ticket.id,
      ticketStatus: ticket.status,
      eventId: draft.event.id,
      quantity: ticket.quantity,
      totalValue: Number(ticket.totalValue),
      message:
        finalPaymentStatus === PaymentStatus.PAID
          ? 'Pagamento aprovado e ingresso confirmado.'
          : finalPaymentStatus === PaymentStatus.PENDING
            ? 'Pagamento recebido e aguardando confirmacao do gateway.'
            : payment.failureReason || 'Pagamento nao aprovado.'
    };
  },

  async processLegacy(userId, payload) {
    return this.processCheckout(userId, payload);
  },

  /**
   * Recebe uma atualizacao assincrona do gateway e replica o estado para os
   * ingressos vinculados ao pagamento.
   */
  async handleWebhook(headers, payload) {
    const providedSecret = headers['x-webhook-secret'] || headers['X-Webhook-Secret'];
    if (env.paymentWebhookSecret && providedSecret !== env.paymentWebhookSecret) {
      throw new AppError('Webhook nao autorizado', 401);
    }

    const payment = await prisma.payment.findFirst({
      where: { gatewayPaymentId: payload.gatewayPaymentId },
      include: { tickets: true }
    });

    if (!payment) throw new AppError('Pagamento nao encontrado para o webhook', 404);

    const mappedStatus = mapGatewayToPaymentStatus(payload.status);
    const mappedTicketStatus = paymentToTicketStatus(mappedStatus);

    const updated = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: mappedStatus,
          failureReason: payload.reason || null,
          webhookPayload: payload
        }
      });

      await tx.ticket.updateMany({
        where: { paymentId: payment.id },
        data: { status: mappedTicketStatus }
      });

      return updatedPayment;
    });

    return {
      ok: true,
      paymentId: updated.id,
      gatewayPaymentId: updated.gatewayPaymentId,
      paymentStatus: updated.status,
      ticketStatus: mappedTicketStatus
    };
  }
};

