import { prisma } from '../config/prisma.js';
import { eventRepository } from '../repositories/eventRepository.js';

export const eventService = {
  async list(query) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const skip = (page - 1) * limit;
    const where = {
      deletedAt: null,
      title: query.search ? { contains: query.search, mode: 'insensitive' } : undefined,
      category: query.category || undefined,
      status: query.status || undefined,
      highlighted: query.highlighted ? query.highlighted === 'true' : undefined
    };
    const orderBy = query.sortBy ? { [query.sortBy]: query.sortOrder === 'asc' ? 'asc' : 'desc' } : { createdAt: 'desc' };
    const [data, total] = await Promise.all([
      prisma.event.findMany({ where, skip, take: limit, orderBy, include: { location: true, _count: { select: { tickets: true, favorites: true, views: true } } } }),
      prisma.event.count({ where })
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  async findById(id, userId) {
    const event = await eventRepository.findById(id);
    if (event) await prisma.eventView.create({ data: { eventId: id, userId } });
    return event;
  },

  async create(data) {
    const { artistIds = [], ...eventData } = data;
    return eventRepository.create({
      ...eventData,
      eventDate: new Date(data.eventDate),
      artists: artistIds.length ? { create: artistIds.map((artistId) => ({ artistId })) } : undefined
    });
  },

  async update(id, data) {
    const { artistIds, ...eventData } = data;

    return eventRepository.update(id, {
      ...eventData,
      eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
      artists:
        artistIds !== undefined
          ? {
              deleteMany: {},
              create: artistIds.map((artistId) => ({ artistId }))
            }
          : undefined
    });
  },
  delete: (id) => eventRepository.softDelete(id),

  async ranking() {
    const events = await prisma.event.findMany({ where: { deletedAt: null }, include: { _count: { select: { tickets: true, favorites: true, views: true } }, tickets: true } });

    return events
      .map((event) => {
        const sold = event.tickets.filter((t) => t.status === 'PAID').reduce((acc, t) => acc + t.quantity, 0);
        const favorites = event._count.favorites;
        const views = event._count.views;
        const engagement = views > 0 ? (favorites + sold) / views : 0;
        const popularityScore = sold * 0.5 + favorites * 0.3 + views * 0.1 + engagement * 100 * 0.1;
        return { eventId: event.id, title: event.title, sold, favorites, views, engagementRate: Number(engagement.toFixed(2)), popularityScore: Number(popularityScore.toFixed(2)) };
      })
      .sort((a, b) => b.popularityScore - a.popularityScore);
  }
};
