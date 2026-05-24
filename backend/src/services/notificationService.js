import { env } from '../config/env.js';

export const notificationService = {
  async notifySupportTeam(message) {
    const payload = {
      to: env.supportAlertEmail,
      subject: `[EventHub][Contato] ${message.subject}`,
      body: `Mensagem recebida de ${message.name} <${message.email}>: ${message.message}`
    };

    // Placeholder para integrar AWS SES/SendGrid/Mailgun sem quebrar o fluxo atual.
    console.log('Support notification (mock):', payload);
    return { sent: true, provider: 'mock' };
  },

  async sendAutoReply(message) {
    const payload = {
      to: message.email,
      subject: 'Recebemos sua mensagem - EventHub',
      body: `Oi ${message.name}, recebemos sua mensagem sobre "${message.subject}" e retornaremos em breve.`
    };

    console.log('Auto-reply (mock):', payload);
    return { sent: true, provider: 'mock' };
  }
};

