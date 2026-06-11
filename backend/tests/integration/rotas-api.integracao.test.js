import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { ticketServiceMock, artistServiceMock, contactServiceMock, jwtMock } = vi.hoisted(() => ({
  ticketServiceMock: {
    reserve: vi.fn(),
    checkout: vi.fn(),
    pay: vi.fn(),
    cancel: vi.fn(),
    my: vi.fn()
  },
  artistServiceMock: {
    list: vi.fn(),
    trending: vi.fn(),
    byId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  contactServiceMock: {
    createMessage: vi.fn()
  },
  jwtMock: {
    verifyAccessToken: vi.fn()
  }
}));

vi.mock('../../src/services/servico-ingresso.js', () => ({ ticketService: ticketServiceMock }));
vi.mock('../../src/services/servico-artista.js', () => ({ artistService: artistServiceMock }));
vi.mock('../../src/services/servico-contato.js', () => ({ contactService: contactServiceMock }));
vi.mock('../../src/config/cliente-banco-dados.js', () => ({ prisma: {} }));
vi.mock('../../src/utils/gerenciador-token.js', () => ({
  verifyAccessToken: jwtMock.verifyAccessToken,
  verifyRefreshToken: vi.fn(),
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn()
}));

const { app } = await import('../../src/aplicacao-http.js');

describe('API integration with supertest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    jwtMock.verifyAccessToken.mockReturnValue({ sub: 'user-supertest' });
  });

  it('GET /api/artists/trending should return trending artists payload', async () => {
    artistServiceMock.trending.mockResolvedValue([
      {
        id: 'artist-1',
        name: 'Artist 1',
        genre: 'Pop',
        listeners: '10M',
        change: '+5%',
        image: 'https://example.com/artist-1.jpg',
        festivals: [{ eventId: 'event-1', title: 'Festival 1', eventDate: new Date('2026-10-10T00:00:00.000Z'), time: '20:00' }]
      }
    ]);

    const response = await request(app).get('/api/artists/trending');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe('artist-1');
    expect(response.body[0].festivals[0].eventId).toBe('event-1');
    expect(artistServiceMock.trending).toHaveBeenCalledTimes(1);
  });

  it('POST /api/contact should validate and persist support message', async () => {
    contactServiceMock.createMessage.mockResolvedValue({
      id: 'msg-1',
      status: 'NEW',
      message: 'Mensagem recebida com sucesso. Nossa equipe retornara em breve.'
    });

    const payload = {
      name: 'Maria Silva',
      email: 'maria@eventhub.com',
      subject: 'Duvida sobre compra',
      message: 'Gostaria de saber como alterar a quantidade do ingresso apos compra.'
    };

    const response = await request(app).post('/api/contact').send(payload);

    expect(response.status).toBe(201);
    expect(response.body.id).toBe('msg-1');
    expect(contactServiceMock.createMessage).toHaveBeenCalledWith(payload, undefined);
  });

  it('POST /api/tickets/checkout should require authentication', async () => {
    const response = await request(app).post('/api/tickets/checkout').send({
      eventId: 'event-1',
      quantity: 2,
      paymentMethodId: 'pm_123'
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token ausente');
    expect(ticketServiceMock.checkout).not.toHaveBeenCalled();
  });

  it('POST /api/tickets/checkout should validate payload after auth', async () => {
    const response = await request(app)
      .post('/api/tickets/checkout')
      .set('Authorization', 'Bearer valid-token')
      .send({
        eventId: 'event-1',
        quantity: 2
      });

    expect(response.status).toBe(422);
    expect(response.body.message).toContain('Informe paymentMethodId ou cardDetails');
    expect(ticketServiceMock.checkout).not.toHaveBeenCalled();
  });

  it('POST /api/tickets/checkout should call checkout service and return 201', async () => {
    const payload = {
      eventId: 'event-2',
      quantity: 3,
      cardDetails: {
        cardName: 'Joao Teste',
        cardNumber: '4111111111111111',
        expiry: '12/30',
        cvv: '123'
      }
    };

    ticketServiceMock.checkout.mockResolvedValue({
      success: true,
      paymentStatus: 'PAID',
      ticketStatus: 'PAID',
      message: 'Pagamento aprovado e ingresso confirmado.'
    });

    const response = await request(app).post('/api/tickets/checkout').set('Authorization', 'Bearer valid-token').send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(ticketServiceMock.checkout).toHaveBeenCalledWith('user-supertest', payload);
    expect(jwtMock.verifyAccessToken).toHaveBeenCalledTimes(1);
  });
});

