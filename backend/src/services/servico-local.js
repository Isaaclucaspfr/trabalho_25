import { locationRepository } from '../repositories/repositorio-local.js';

export const locationService = {
  list: () => locationRepository.list(),
  byId: (id) => locationRepository.findById(id),
  create: (data) => locationRepository.create(data),
  update: (id, data) => locationRepository.update(id, data),
  delete: (id) => locationRepository.softDelete(id)
};
