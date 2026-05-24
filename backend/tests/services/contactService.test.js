import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, notificationMock } = vi.hoisted(() => ({
  prismaMock: {
    supportMessage: { create: vi.fn() }
  },
  notificationMock: {
    notifySupportTeam: vi.fn(),
    sendAutoReply: vi.fn()
  }
}));

vi.mock('../../src/config/prisma.js', () => ({ prisma: prismaMock }));
vi.mock('../../src/services/notificationService.js', () => ({ notificationService: notificationMock }));

const { contactService } = await import('../../src/services/contactService.js');

describe('contactService.createMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should persist support message and return success payload', async () => {
    prismaMock.supportMessage.create.mockResolvedValue({
      id: 'msg-1',
      status: 'NEW',
      name: 'Ana',
      email: 'ana@email.com',
      subject: 'Duvida',
      message: 'Tenho uma duvida sobre o ingresso'
    });
    notificationMock.notifySupportTeam.mockResolvedValue({ sent: true });
    notificationMock.sendAutoReply.mockResolvedValue({ sent: true });

    const result = await contactService.createMessage(
      {
        name: 'Ana',
        email: 'ana@email.com',
        subject: 'Duvida',
        message: 'Tenho uma duvida sobre o ingresso'
      },
      'user-1'
    );

    expect(prismaMock.supportMessage.create).toHaveBeenCalledTimes(1);
    expect(notificationMock.notifySupportTeam).toHaveBeenCalledTimes(1);
    expect(notificationMock.sendAutoReply).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      id: 'msg-1',
      status: 'NEW',
      message: 'Mensagem recebida com sucesso. Nossa equipe retornara em breve.'
    });
  });

  it('should still return success when notification providers fail', async () => {
    prismaMock.supportMessage.create.mockResolvedValue({
      id: 'msg-2',
      status: 'NEW',
      name: 'Bruno',
      email: 'bruno@email.com',
      subject: 'Parceria',
      message: 'Gostaria de propor parceria'
    });
    notificationMock.notifySupportTeam.mockRejectedValue(new Error('mail down'));
    notificationMock.sendAutoReply.mockRejectedValue(new Error('mail down'));

    const result = await contactService.createMessage({
      name: 'Bruno',
      email: 'bruno@email.com',
      subject: 'Parceria',
      message: 'Gostaria de propor parceria'
    });

    expect(result.id).toBe('msg-2');
    expect(result.status).toBe('NEW');
  });
});

