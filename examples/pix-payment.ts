import Membros from '@membros/node-sdk';

// Initialize the client
const membros = new Membros('sk_test_your_api_key', {
  projectId: 'your-project-id'
});

async function pixPaymentExample() {
  try {
    // Create PIX payment with new customer
    const order = await membros.orders.createPix({
      customer: {
        name: 'Maria Santos',
        email: 'maria@example.com',
        document: '987.654.321-00',
        phones: {
          mobile_phone: '11999888777' // Will be automatically formatted
        },
        address: {
          street: 'Av. Paulista',
          number: '1000',
          complement: 'Apto 101',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01310-100'
        }
      },
      items: [
        {
          description: 'Monthly Gym Membership',
          amount: 8000, // R$ 80.00
          quantity: 1
        },
        {
          description: 'Personal Training Package',
          amount: 20000, // R$ 200.00
          quantity: 2
        }
      ],
      expires_in: 1800, // 30 minutes
      metadata: {
        gym_id: 'gym_123',
        membership_type: 'premium'
      }
    });

    console.log('PIX Order Created:');
    console.log('- Order ID:', order.id);
    console.log('- Status:', order.status);
    console.log('- Total Amount:', `R$ ${(order.amount / 100).toFixed(2)}`);
    console.log('- Expires At:', order.pix_expires_at);
    console.log('- QR Code:', order.pix_qr_code);

    // Get PIX QR code details
    const pixDetails = await membros.orders.getPixQrCode(order.id);
    console.log('\nPIX Details:');
    console.log('- QR Code URL:', pixDetails.qr_code_url);
    console.log('- Expires At:', pixDetails.expires_at);

    // Poll for payment status
    console.log('\nWaiting for payment...');
    let paymentCompleted = false;
    let attempts = 0;
    const maxAttempts = 12; // Check for 2 minutes (12 * 10 seconds)

    while (!paymentCompleted && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      
      const status = await membros.orders.getStatus(order.id);
      console.log(`Attempt ${attempts + 1}: Status is ${status.status}`);
      
      if (status.status === 'paid') {
        paymentCompleted = true;
        console.log('🎉 Payment completed!');
        console.log('- Paid At:', status.paid_at);
        console.log('- Amount Paid:', `R$ ${((status.amount_paid || 0) / 100).toFixed(2)}`);
      } else if (status.status === 'expired' || status.status === 'canceled') {
        console.log('❌ Payment failed or expired');
        break;
      }
      
      attempts++;
    }

    if (!paymentCompleted && attempts >= maxAttempts) {
      console.log('⏰ Payment check timeout - order is still pending');
    }

  } catch (error: any) {
    console.error('Error creating PIX payment:', error.message);
    if (error.details) {
      console.error('Error details:', error.details);
    }
  }
}

pixPaymentExample();