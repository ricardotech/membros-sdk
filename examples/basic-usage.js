const Membros = require('@membros/node-sdk');

// Initialize the client
const membros = new Membros.MembrosClient('sk_test_your_api_key', {
  projectId: 'your-project-id'
});

async function basicExample() {
  try {
    // Create a customer
    console.log('Creating customer...');
    const customer = await membros.customers.create({
      name: 'João da Silva',
      email: 'joao@example.com',
      document: '123.456.789-00',
      phones: {
        mobile_phone: {
          country_code: '55',
          area_code: '11',
          number: '999999999'
        }
      }
    });
    console.log('Customer created:', customer.id);

    // Create a PIX order
    console.log('Creating PIX order...');
    const order = await membros.orders.createPix({
      customer: customer.id,
      items: [{
        description: 'Personal Training Session',
        amount: 15000, // R$ 150.00 in cents
        quantity: 1
      }],
      expires_in: 3600 // 1 hour
    });
    
    console.log('Order created:', order.id);
    console.log('PIX QR Code:', order.pix_qr_code);
    
    // Get order status
    console.log('Getting order status...');
    const status = await membros.orders.getStatus(order.id);
    console.log('Order status:', status);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

basicExample();