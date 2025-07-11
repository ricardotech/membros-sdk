# membros-sdk

Official Node.js SDK for Membros - Brazilian payment processing made simple.

[![npm version](https://badge.fury.io/js/%40membros%2Fnode-sdk.svg)](https://badge.fury.io/js/%40membros%2Fnode-sdk)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🇧🇷 **Brazilian-First**: Built-in CPF/CNPJ validation and formatting
- 💳 **PIX Support**: Native PIX payment creation and QR code generation
- 🔒 **Type Safe**: Full TypeScript support with comprehensive type definitions
- 🚀 **Promise-Based**: Modern async/await API
- 🔄 **Auto-Retry**: Automatic retry logic for failed requests
- 📱 **Multi-Payment**: Support for PIX, credit cards, and boleto
- 🛡️ **Error Handling**: Descriptive error classes with proper status codes

## Installation

```bash
npm install membros-sdk
# or
yarn add membros-sdk
```

## Quick Start

```typescript
import Membros from 'membros-sdk';

// Initialize the client
const membros = new Membros('sk_test_...', {
  projectId: 'your-project-id'
});

// Create a PIX payment
const order = await membros.orders.createPix({
  customer: {
    name: 'João Silva',
    email: 'joao@example.com',
    document: '123.456.789-00'
  },
  items: [{
    description: 'Personal Training Session',
    amount: 15000, // R$ 150.00 in cents
    quantity: 1
  }],
  expires_in: 3600 // 1 hour
});

console.log(order.pix_qr_code); // QR code for payment
```

## Configuration

```typescript
const membros = new Membros('sk_test_...', {
  projectId: 'your-project-id',        // Required
  apiUrl: 'https://api.membros.com',   // Optional (defaults to production)
  timeout: 30000,                      // Optional (30 seconds)
  maxRetries: 3,                       // Optional (3 retries)
  version: 'v1',                       // Optional (API version)
  userAgent: 'my-app/1.0.0'           // Optional (custom user agent)
});
```

## API Reference

### Customers

#### Create Customer

```typescript
const customer = await membros.customers.create({
  name: 'João Silva',
  email: 'joao@example.com',
  document: '123.456.789-00',
  phones: {
    mobile_phone: {
      country_code: '55',
      area_code: '11',
      number: '999999999'
    }
  },
  address: {
    street: 'Rua das Flores',
    number: '123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01234-567'
  }
});
```

#### Retrieve Customer

```typescript
const customer = await membros.customers.retrieve('customer_id');
```

#### Update Customer

```typescript
const customer = await membros.customers.update('customer_id', {
  name: 'João Santos Silva',
  email: 'joao.santos@example.com'
});
```

#### List Customers

```typescript
const customers = await membros.customers.list({
  limit: 10,
  offset: 0,
  email: 'joao@example.com'
});
```

### Orders

#### Create PIX Order

```typescript
const order = await membros.orders.createPix({
  customer: {
    name: 'João Silva',
    email: 'joao@example.com',
    document: '123.456.789-00'
  },
  items: [{
    description: 'Personal Training Session',
    amount: 15000, // R$ 150.00 in cents
    quantity: 1
  }],
  expires_in: 3600 // 1 hour
});
```

#### Create Credit Card Order

```typescript
const order = await membros.orders.createCreditCard({
  customer: 'customer_id', // or customer object
  items: [{
    description: 'Monthly Subscription',
    amount: 9900, // R$ 99.00 in cents
    quantity: 1
  }],
  card_token: 'card_token_from_frontend',
  installments: 1
});
```

#### Create Boleto Order

```typescript
const order = await membros.orders.createBoleto({
  customer: {
    name: 'João Silva',
    email: 'joao@example.com',
    document: '123.456.789-00'
  },
  items: [{
    description: 'Product Purchase',
    amount: 25000, // R$ 250.00 in cents
    quantity: 1
  }],
  expires_in: 259200 // 3 days
});
```

#### Retrieve Order

```typescript
const order = await membros.orders.retrieve('order_id');
```

#### List Orders

```typescript
const orders = await membros.orders.list({
  limit: 10,
  customer_id: 'customer_id',
  status: 'paid'
});
```

#### Cancel Order

```typescript
const order = await membros.orders.cancel('order_id', 'Customer requested cancellation');
```

#### Refund Order

```typescript
const refund = await membros.orders.refund('order_id', {
  amount: 5000, // Partial refund of R$ 50.00
  reason: 'Partial service not delivered'
});
```

#### Get PIX QR Code

```typescript
const pixData = await membros.orders.getPixQrCode('order_id');
console.log(pixData.qr_code); // QR code string
console.log(pixData.qr_code_url); // URL to QR code image
```

#### Get Boleto

```typescript
const boletoData = await membros.orders.getBoleto('order_id');
console.log(boletoData.boleto_url); // PDF URL
console.log(boletoData.barcode); // Barcode number
```

## Error Handling

The SDK provides comprehensive error handling with specific error types:

```typescript
import { 
  MembrosError,
  MembrosAPIError,
  MembrosAuthenticationError,
  MembrosValidationError,
  MembrosNetworkError,
  MembrosRateLimitError
} from '@membros/node-sdk';

try {
  const order = await membros.orders.createPix({
    // ... order data
  });
} catch (error) {
  if (error instanceof MembrosAuthenticationError) {
    console.log('Authentication failed:', error.message);
  } else if (error instanceof MembrosValidationError) {
    console.log('Validation error:', error.message);
    console.log('Details:', error.details);
  } else if (error instanceof MembrosRateLimitError) {
    console.log('Rate limit exceeded, retry after:', error.statusCode);
  } else {
    console.log('Unexpected error:', error.message);
  }
}
```

## Brazilian Document Validation

The SDK includes built-in Brazilian document validation:

```typescript
import { validateCPF, validateCNPJ, formatDocument } from '@membros/node-sdk';

// Validate CPF
const isValidCPF = validateCPF('123.456.789-00'); // true/false

// Validate CNPJ
const isValidCNPJ = validateCNPJ('12.345.678/0001-00'); // true/false

// Format document
const formatted = formatDocument('12345678900'); // '123.456.789-00'
```

## Webhook Handling

Handle webhook events from Membros:

```typescript
import express from 'express';
import crypto from 'crypto';

const app = express();

app.post('/webhooks/membros', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-membros-signature'];
  const payload = req.body;
  
  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.MEMBROS_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(400).send('Invalid signature');
  }
  
  const event = JSON.parse(payload);
  
  switch (event.type) {
    case 'charge.paid':
      console.log('Payment successful:', event.data);
      break;
    case 'charge.payment_failed':
      console.log('Payment failed:', event.data);
      break;
    case 'order.cancelled':
      console.log('Order cancelled:', event.data);
      break;
  }
  
  res.status(200).send('OK');
});
```

## TypeScript Support

The SDK is built with TypeScript and provides comprehensive type definitions:

```typescript
import { Customer, Order, OrderStatus } from '@membros/node-sdk';

// Full type safety
const customer: Customer = await membros.customers.create({
  name: 'João Silva',
  email: 'joao@example.com',
  document: '123.456.789-00'
});

// Type-safe order status
const status: OrderStatus = 'paid';
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@membros.com
- 📖 Documentation: https://docs.membros.com
- 🐛 Issues: https://github.com/membros/node-sdk/issues

---

Made with ❤️ by the Membros team
