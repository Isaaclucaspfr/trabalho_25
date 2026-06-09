import { env } from '../config/configuracao-ambiente.js';

const maskCard = (cardDetails) => {
  if (!cardDetails) return null;
  const digits = (cardDetails.cardNumber || '').replace(/\D/g, '');
  const last4 = digits.slice(-4);
  return {
    cardName: cardDetails.cardName || '',
    brand: cardDetails.brand || 'unknown',
    last4: last4 || '0000',
    expiry: cardDetails.expiry || ''
  };
};

const simulateMockGateway = async ({ amount, paymentMethodId, cardDetails }) => {
  const cardNumber = (cardDetails?.cardNumber || '').replace(/\s/g, '');
  const forcedPending = cardNumber.endsWith('1111');
  const forcedFailure = cardNumber.endsWith('0000');
  const status = forcedFailure ? 'failed' : forcedPending ? 'pending' : 'approved';

  return {
    provider: 'mock',
    gatewayPaymentId: `mock_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    status,
    amount,
    reason: forcedFailure ? 'Pagamento recusado pela operadora (simulado)' : null,
    metadata: {
      paymentMethodId: paymentMethodId || null,
      card: maskCard(cardDetails)
    }
  };
};

export const paymentGatewayService = {
  async processPayment(payload) {
    switch (env.paymentGatewayProvider.toLowerCase()) {
      case 'mock':
      default:
        return simulateMockGateway(payload);
    }
  }
};

