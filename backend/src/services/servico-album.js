import { prisma } from '../config/cliente-banco-dados.js';

const compactNumber = (value) => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace('.0', '')}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1).replace('.0', '')}K`;
  return `${value}`;
};

export const albumService = {
  async trending() {
    const albums = await prisma.album.findMany({
      where: { deletedAt: null },
      include: { artist: true },
      orderBy: [{ streams: 'desc' }, { updatedAt: 'desc' }],
      take: 12
    });

    return albums.map((album) => ({
      id: album.id,
      title: album.title,
      artist: album.artist.name,
      streams: compactNumber(Number(album.streams)),
      cover: album.cover || `https://picsum.photos/seed/album-${album.id}/400/400`
    }));
  }
};

