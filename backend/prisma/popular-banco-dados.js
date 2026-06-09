import { PrismaClient, UserRole, EventStatus, TicketStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('123456', 10);

  await prisma.eventView.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.supportMessage.deleteMany();
  await prisma.eventArtist.deleteMany();
  await prisma.event.deleteMany();
  await prisma.album.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany({
    where: { email: { in: ['admin@eventhub.com', 'user@eventhub.com', 'ana@eventhub.com', 'bruno@eventhub.com', 'carla@eventhub.com', 'diego@eventhub.com'] } }
  });

  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Admin EventHub', email: 'admin@eventhub.com', password, role: UserRole.ADMIN } }),
    prisma.user.create({ data: { name: 'Usuario Teste', email: 'user@eventhub.com', password, role: UserRole.USER } }),
    prisma.user.create({ data: { name: 'Ana Souza', email: 'ana@eventhub.com', password, role: UserRole.USER } }),
    prisma.user.create({ data: { name: 'Bruno Lima', email: 'bruno@eventhub.com', password, role: UserRole.USER } }),
    prisma.user.create({ data: { name: 'Carla Mendes', email: 'carla@eventhub.com', password, role: UserRole.USER } }),
    prisma.user.create({ data: { name: 'Diego Rocha', email: 'diego@eventhub.com', password, role: UserRole.USER } })
  ]);

  const [admin, user, ana, bruno, carla, diego] = users;
  const buyerIds = [user.id, ana.id, bruno.id, carla.id, diego.id, admin.id];

  const randomDateInPastDays = (maxDaysAgo) => {
    const daysAgo = Math.floor(Math.random() * maxDaysAgo);
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d;
  };

  const locations = await Promise.all([
    prisma.location.create({
      data: {
        name: 'Allianz Parque',
        address: 'Rua Palestra Italia, 200',
        city: 'Sao Paulo',
        state: 'SP',
        zipCode: '05005-030',
        maxCapacity: 43713,
        description: 'Estadio para shows de grande porte e eventos esportivos'
      }
    }),
    prisma.location.create({
      data: {
        name: 'Vibra Sao Paulo',
        address: 'Av. das Nacoes Unidas, 17955',
        city: 'Sao Paulo',
        state: 'SP',
        zipCode: '04795-100',
        maxCapacity: 7000,
        description: 'Casa de shows fechada para turnes nacionais e internacionais'
      }
    }),
    prisma.location.create({
      data: {
        name: 'Jeunesse Arena',
        address: 'Av. Embaixador Abelardo Bueno, 3401',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '22775-040',
        maxCapacity: 18000,
        description: 'Arena coberta para grandes espetaculos e festivais'
      }
    }),
    prisma.location.create({
      data: {
        name: 'Mineirao Esplanada',
        address: 'Av. Antonio Abrahmao Caram, 1001',
        city: 'Belo Horizonte',
        state: 'MG',
        zipCode: '31275-000',
        maxCapacity: 62000,
        description: 'Espaco aberto para festivais de musica e gastronomia'
      }
    })
  ]);

  const artists = await Promise.all([
    prisma.artist.create({ data: { name: 'Alok', biography: 'DJ e produtor brasileiro de musica eletronica', musicGenre: 'Eletronica', socialLinks: { instagram: '@alok' } } }),
    prisma.artist.create({ data: { name: 'Anitta', biography: 'Cantora pop brasileira com carreira internacional', musicGenre: 'Pop', socialLinks: { instagram: '@anitta' } } }),
    prisma.artist.create({ data: { name: 'Jorge e Mateus', biography: 'Dupla sertaneja de grande sucesso nacional', musicGenre: 'Sertanejo', socialLinks: { instagram: '@jorgeemateus' } } }),
    prisma.artist.create({ data: { name: 'Ludmilla', biography: 'Cantora de pop e funk brasileira', musicGenre: 'Pop/Funk', socialLinks: { instagram: '@ludmilla' } } }),
    prisma.artist.create({ data: { name: 'Iza', biography: 'Cantora brasileira de pop e R&B', musicGenre: 'Pop/R&B', socialLinks: { instagram: '@iza' } } }),
    prisma.artist.create({ data: { name: 'Gilsons', biography: 'Grupo brasileiro de MPB contemporanea', musicGenre: 'MPB', socialLinks: { instagram: '@gilsons' } } }),
    prisma.artist.create({ data: { name: 'BaianaSystem', biography: 'Grupo baiano de afro-rock e musica eletronica', musicGenre: 'Afro-Rock', socialLinks: { instagram: '@baianasystem' } } }),
    prisma.artist.create({ data: { name: 'Vintage Culture', biography: 'DJ brasileiro de house music', musicGenre: 'House', socialLinks: { instagram: '@vintageculture' } } })
  ]);

  await Promise.all([
    prisma.album.create({ data: { title: 'Ocean Drive Sessions', artistId: artists[0].id, streams: 1280000000n, cover: 'https://images.unsplash.com/photo-1461784180009-21121b2f204c?w=400&q=80' } }),
    prisma.album.create({ data: { title: 'Versions of Pop', artistId: artists[1].id, streams: 2340000000n, cover: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&q=80' } }),
    prisma.album.create({ data: { title: 'Ao Vivo no Brasil', artistId: artists[2].id, streams: 870000000n, cover: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&q=80' } }),
    prisma.album.create({ data: { title: 'Numanice Live', artistId: artists[3].id, streams: 1540000000n, cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80' } }),
    prisma.album.create({ data: { title: 'Dona de Mim', artistId: artists[4].id, streams: 960000000n, cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80' } }),
    prisma.album.create({ data: { title: 'Pra Gente Acordar', artistId: artists[5].id, streams: 520000000n, cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80' } }),
    prisma.album.create({ data: { title: 'O Futuro Nao Demora', artistId: artists[6].id, streams: 630000000n, cover: 'https://images.unsplash.com/photo-1458560871784-56d23406c091?w=400&q=80' } }),
    prisma.album.create({ data: { title: 'Promised Land', artistId: artists[7].id, streams: 1010000000n, cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80' } })
  ]);

  const eventBlueprints = [
    {
      title: 'Festival Brasilidades 2026',
      description: 'Line-up com pop, MPB e eletronica em dois palcos simultaneos.',
      eventDate: '2026-09-21T00:00:00.000Z',
      time: '16:00',
      category: 'Festival',
      capacity: 38000,
      status: EventStatus.PUBLISHED,
      price: 420,
      highlighted: true,
      locationId: locations[0].id,
      artistIndexes: [1, 4, 6],
      soldLots: [600, 540, 420, 360, 300, 220, 150],
      pendingLots: [110, 95, 80],
      reservedLots: [130, 70, 40],
      canceledLots: [24, 14],
      views: 2600,
      anonymousViews: 220
    },
    {
      title: 'Noite Eletronica SP',
      description: 'Set estendido com house, techno melodic e audiovisual imersivo.',
      eventDate: '2026-08-15T00:00:00.000Z',
      time: '22:30',
      category: 'Show',
      capacity: 6800,
      status: EventStatus.PUBLISHED,
      price: 290,
      highlighted: true,
      locationId: locations[1].id,
      artistIndexes: [0, 7],
      soldLots: [320, 280, 210, 190, 160],
      pendingLots: [70, 60, 40],
      reservedLots: [90, 60],
      canceledLots: [18],
      views: 1450,
      anonymousViews: 110
    },
    {
      title: 'Sertanejo Prime Rio',
      description: 'Turne especial com repertorio completo e convidados surpresa.',
      eventDate: '2026-10-10T00:00:00.000Z',
      time: '21:00',
      category: 'Show',
      capacity: 17500,
      status: EventStatus.PUBLISHED,
      price: 250,
      highlighted: false,
      locationId: locations[2].id,
      artistIndexes: [2],
      soldLots: [540, 480, 360, 290],
      pendingLots: [120, 90],
      reservedLots: [130, 100],
      canceledLots: [30, 20],
      views: 1800,
      anonymousViews: 180
    },
    {
      title: 'Sunset BH Sessions',
      description: 'Festival ao ar livre com foco em musica brasileira e experiencias gastronomicas.',
      eventDate: '2026-11-02T00:00:00.000Z',
      time: '15:00',
      category: 'Festival',
      capacity: 22000,
      status: EventStatus.PUBLISHED,
      price: 180,
      highlighted: false,
      locationId: locations[3].id,
      artistIndexes: [5, 6],
      soldLots: [400, 340, 260, 190],
      pendingLots: [140, 80],
      reservedLots: [180, 120, 70],
      canceledLots: [24],
      views: 1340,
      anonymousViews: 140
    },
    {
      title: 'Pop Experience Arena',
      description: 'Show pop com estrutura 360, efeitos especiais e participacoes especiais.',
      eventDate: '2026-12-05T00:00:00.000Z',
      time: '20:00',
      category: 'Show',
      capacity: 30000,
      status: EventStatus.PUBLISHED,
      price: 360,
      highlighted: true,
      locationId: locations[0].id,
      artistIndexes: [1, 3, 4],
      soldLots: [500, 420, 390, 300, 210],
      pendingLots: [160, 140, 90],
      reservedLots: [180, 120],
      canceledLots: [34],
      views: 2250,
      anonymousViews: 190
    }
  ];

  for (const blueprint of eventBlueprints) {
    const event = await prisma.event.create({
      data: {
        title: blueprint.title,
        description: blueprint.description,
        eventDate: new Date(blueprint.eventDate),
        time: blueprint.time,
        category: blueprint.category,
        capacity: blueprint.capacity,
        status: blueprint.status,
        price: blueprint.price,
        highlighted: blueprint.highlighted,
        locationId: blueprint.locationId,
        artists: { create: blueprint.artistIndexes.map((artistIndex) => ({ artistId: artists[artistIndex].id })) }
      }
    });

    await prisma.favorite.createMany({
      data: buyerIds.slice(0, 5).map((userId) => ({ userId, eventId: event.id }))
    });

    let codeCounter = 1;

    const createTicketWithOptionalPayment = async (quantity, status) => {
      const purchaserId = buyerIds[(codeCounter - 1) % buyerIds.length];
      const createdAt = randomDateInPastDays(90);
      const totalValue = blueprint.price * quantity;

      if (status === TicketStatus.RESERVED) {
        await prisma.ticket.create({
          data: {
            code: `TKT-${event.id.slice(-6).toUpperCase()}-${String(codeCounter).padStart(4, '0')}`,
            quantity,
            totalValue,
            status,
            userId: purchaserId,
            eventId: event.id,
            createdAt
          }
        });
        codeCounter += 1;
        return;
      }

      const paymentStatus =
        status === TicketStatus.PAID
          ? PaymentStatus.PAID
          : status === TicketStatus.PENDING
            ? PaymentStatus.PENDING
            : PaymentStatus.CANCELED;

      const payment = await prisma.payment.create({
        data: {
          gateway: 'mock',
          gatewayPaymentId: `mock_${event.id.slice(-6)}_${String(codeCounter).padStart(4, '0')}`,
          amount: totalValue,
          currency: 'BRL',
          status: paymentStatus,
          failureReason: status === TicketStatus.CANCELED ? 'Pagamento cancelado na simulacao de seed' : null,
          rawRequest: { seed: true, eventId: event.id, quantity },
          rawResponse: { approved: status === TicketStatus.PAID, simulated: true },
          userId: purchaserId,
          eventId: event.id,
          createdAt
        }
      });

      await prisma.ticket.create({
        data: {
          code: `TKT-${event.id.slice(-6).toUpperCase()}-${String(codeCounter).padStart(4, '0')}`,
          quantity,
          totalValue,
          status,
          userId: purchaserId,
          eventId: event.id,
          paymentId: payment.id,
          createdAt
        }
      });
      codeCounter += 1;
    };

    const pushTickets = async (quantities, status) => {
      for (const quantity of quantities) {
        await createTicketWithOptionalPayment(quantity, status);
      }
    };

    await pushTickets(blueprint.soldLots, TicketStatus.PAID);
    await pushTickets(blueprint.pendingLots, TicketStatus.PENDING);
    await pushTickets(blueprint.reservedLots, TicketStatus.RESERVED);
    await pushTickets(blueprint.canceledLots, TicketStatus.CANCELED);

    const loggedViews = Array.from({ length: blueprint.views }, (_, idx) => ({
      eventId: event.id,
      userId: buyerIds[idx % buyerIds.length]
    }));
    const anonymousViews = Array.from({ length: blueprint.anonymousViews }, () => ({ eventId: event.id, userId: null }));

    await prisma.eventView.createMany({ data: [...loggedViews, ...anonymousViews] });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
