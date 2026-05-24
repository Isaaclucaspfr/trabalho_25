import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  dbUrl: process.env.DATABASE_URL,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'access_secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  paymentGatewayProvider: process.env.PAYMENT_GATEWAY_PROVIDER || 'mock',
  paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || 'eventhub_webhook_secret',
  supportAlertEmail: process.env.SUPPORT_ALERT_EMAIL || 'suporte@eventhub.com.br'
};
