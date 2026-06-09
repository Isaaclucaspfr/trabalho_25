import { TicketStatus } from '@prisma/client';
import { prisma } from '../config/cliente-banco-dados.js';
import { ticketRepository } from '../repositories/repositorio-ingresso.js';
import { AppError } from '../utils/erro-aplicacao.js';
import { paymentService } from './servico-pagamento.js';

const code = () => `TKT-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

export const ticketService = {
  /**
   * Cria uma reserva somente quando a soma de ingressos ativos cabe no evento.
   * A consulta e a criacao compartilham a mesma transacao.
   */
  async reserve(userId, eventId, quantity) {
    return prisma.$transaction(async (tx) => {
      const event = await tx.event.findFirst({ where: { id: eventId, deletedAt: null } });
      if (!event) throw new AppError('Evento nao encontrado', 404);

      const sold = await tx.ticket.aggregate({
        where: { eventId, status: { in: [TicketStatus.PENDING, TicketStatus.RESERVED, TicketStatus.PAID] } },
        _sum: { quantity: true }
      });
      const occupied = sold._sum.quantity || 0;
      if (occupied + quantity > event.capacity) throw new AppError('Sem disponibilidade suficiente', 409);

      return tx.ticket.create({
        data: {
          code: code(),
          userId,
          eventId,
          quantity,
          totalValue: Number(event.price) * quantity,
          status: TicketStatus.RESERVED
        }
      });
    });
  },

  async checkout(userId, payload) {
    return paymentService.processCheckout(userId, payload);
  },

  async pay(userId, ticketId) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket || ticket.userId !== userId) throw new AppError('Ingresso nao encontrado', 404);
    if (ticket.status === TicketStatus.CANCELED) throw new AppError('Ingresso cancelado', 409);

    const updatedTicket = await ticketRepository.update(ticketId, { status: TicketStatus.PAID });
    if (updatedTicket.paymentId) {
      await prisma.payment.updateMany({
        where: { id: updatedTicket.paymentId, status: { not: 'PAID' } },
        data: { status: 'PAID', failureReason: null }
      });
    }
    return updatedTicket;
  },

  async cancel(userId, ticketId) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket || ticket.userId !== userId) throw new AppError('Ingresso nao encontrado', 404);
    return ticketRepository.update(ticketId, { status: TicketStatus.CANCELED });
  },

  my: (userId) => ticketRepository.myTickets(userId)
};
