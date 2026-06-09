import { prisma } from '../config/cliente-banco-dados.js';
import { notificationService } from './servico-notificacao.js';

export const contactService = {
  async createMessage(data, userId) {
    const message = await prisma.supportMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        userId: userId || null
      }
    });

    await Promise.allSettled([notificationService.notifySupportTeam(message), notificationService.sendAutoReply(message)]);

    return {
      id: message.id,
      status: message.status,
      message: 'Mensagem recebida com sucesso. Nossa equipe retornara em breve.'
    };
  }
};

