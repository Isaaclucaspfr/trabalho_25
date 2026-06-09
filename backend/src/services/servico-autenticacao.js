import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { userRepository } from '../repositories/repositorio-usuario.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/gerenciador-token.js';
import { AppError } from '../utils/erro-aplicacao.js';

export const authService = {
  async register(data) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new AppError('Email ja cadastrado', 409);
    const password = await bcrypt.hash(data.password, 10);
    const user = await userRepository.create({ ...data, password });
    return { id: user.id, name: user.name, email: user.email };
  },

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError('Credenciais invalidas', 401);
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new AppError('Credenciais invalidas', 401);

    const payload = { sub: user.id, role: user.role, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await userRepository.update(user.id, { refreshToken });
    return { accessToken, refreshToken, user: { id: user.id, name: user.name, role: user.role, email: user.email, avatar: user.avatar } };
  },

  async refresh(refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    const user = await userRepository.findById(payload.sub);
    if (!user || user.refreshToken !== refreshToken) throw new AppError('Refresh token invalido', 401);
    const newPayload = { sub: user.id, role: user.role, email: user.email };
    return { accessToken: signAccessToken(newPayload), refreshToken: signRefreshToken(newPayload) };
  },

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) return { message: 'Se o email existir, voce recebera instrucoes' };
    const token = crypto.randomBytes(24).toString('hex');
    await userRepository.update(user.id, { resetToken: token, resetTokenExp: new Date(Date.now() + 3600000) });
    return { message: 'Token de recuperacao gerado (simulado)', resetToken: token };
  }
};
