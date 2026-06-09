import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    artist: { findMany: vi.fn() }
  }
}));

vi.mock('../../src/config/cliente-banco-dados.js', () => ({ prisma: prismaMock }));

const { artistService } = await import('../../src/services/servico-artista.js');

describe('artistService.trending', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T00:00:00.000Z'));
  });

  it('should return artists sorted by score and include only future published festivals', async () => {
    prismaMock.artist.findMany.mockResolvedValue([
      {
        id: 'artist-1',
        name: 'Artist One',
        musicGenre: 'Pop',
        image: null,
        events: [
          {
            event: {
              id: 'festival-future',
              title: 'Festival Futuro',
              category: 'Festival',
              status: 'PUBLISHED',
              deletedAt: null,
              eventDate: new Date('2026-08-10T00:00:00.000Z'),
              time: '20:00',
              tickets: [
                { quantity: 100, status: 'PAID', createdAt: new Date('2026-05-10T00:00:00.000Z') },
                { quantity: 50, status: 'PAID', createdAt: new Date('2026-04-10T00:00:00.000Z') }
              ],
              _count: { favorites: 10, views: 100 }
            }
          },
          {
            event: {
              id: 'show-future',
              title: 'Show Futuro',
              category: 'Show',
              status: 'PUBLISHED',
              deletedAt: null,
              eventDate: new Date('2026-08-15T00:00:00.000Z'),
              time: '22:00',
              tickets: [{ quantity: 20, status: 'PAID', createdAt: new Date('2026-05-15T00:00:00.000Z') }],
              _count: { favorites: 5, views: 80 }
            }
          }
        ]
      },
      {
        id: 'artist-2',
        name: 'Artist Two',
        musicGenre: 'Rock',
        image: null,
        events: [
          {
            event: {
              id: 'festival-past',
              title: 'Festival Passado',
              category: 'Festival',
              status: 'PUBLISHED',
              deletedAt: null,
              eventDate: new Date('2026-01-10T00:00:00.000Z'),
              time: '18:00',
              tickets: [{ quantity: 5, status: 'PAID', createdAt: new Date('2026-01-01T00:00:00.000Z') }],
              _count: { favorites: 1, views: 10 }
            }
          }
        ]
      }
    ]);

    const result = await artistService.trending();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('artist-1');
    expect(result[0].listeners).toMatch(/[MKB]$/);
    expect(result[0].festivals).toEqual([
      {
        eventId: 'festival-future',
        title: 'Festival Futuro',
        eventDate: new Date('2026-08-10T00:00:00.000Z'),
        time: '20:00'
      }
    ]);
    expect(result[1].festivals).toEqual([]);
  });
});

