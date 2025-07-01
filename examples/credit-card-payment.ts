import Membros from '@membros/node-sdk';

// Initialize the client
const membros = new Membros('sk_test_your_api_key', {
  projectId: 'your-project-id'
});

async function creditCardPaymentExample() {
  try {
    // First, create a customer
    const customer = await membros.customers.create({
      name: 'Carlos Pereira',
      email: 'carlos@example.com',
      document: '111.222.333-44', // CPF
      phones: {
        mobile_phone: '11987654321'
      },
      address: {
        street: 'Rua das Palmeiras',
        number: '456',
        neighborhood: 'Vila Madalena',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '05422-010'
      }
    });

    console.log('Customer created:', customer.id);

    // Create credit card payment
    // Note: In a real application, the card_token would be generated
    // on the frontend using Membros.js to avoid PCI compliance issues
    const order = await membros.orders.createCreditCard({
      customer: customer.id,
      items: [
        {
          description: 'Premium Subscription - 12 months',
          amount: 59900, // R$ 599.00
          quantity: 1
        }
      ],
      card_token: 'card_token_generated_on_frontend', // This would come from frontend
      installments: 12, // 12x installments
      metadata: {
        subscription_type: 'premium',
        plan_duration: '12_months'
      }
    });

    console.log('Credit Card Order Created:');
    console.log('- Order ID:', order.id);
    console.log('- Status:', order.status);
    console.log('- Total Amount:', `R$ ${(order.amount / 100).toFixed(2)}`);
    console.log('- Customer:', order.customer?.name);

    // Check payment status
    const status = await membros.orders.getStatus(order.id);
    console.log('\nPayment Status:');
    console.log('- Status:', status.status);
    console.log('- Payment Status:', status.payment_status);

    if (status.paid_at) {
      console.log('- Paid At:', status.paid_at);
      console.log('🎉 Payment successful!');
    }

  } catch (error: any) {
    console.error('Error creating credit card payment:', error.message);
    
    // Handle specific error types
    if (error.name === 'MembrosValidationError') {
      console.error('Validation errors:', error.details?.errors);
    } else if (error.name === 'MembrosAuthenticationError') {
      console.error('Authentication failed - check your API key');
    }
  }
}

// Example of handling installments calculation
async function installmentExample() {
  try {
    const totalAmount = 120000; // R$ 1,200.00
    const installments = 6;
    const installmentAmount = Math.ceil(totalAmount / installments);

    console.log('Installment Calculation:');
    console.log('- Total Amount:', `R$ ${(totalAmount / 100).toFixed(2)}`);
    console.log('- Number of Installments:', installments);
    console.log('- Amount per Installment:', `R$ ${(installmentAmount / 100).toFixed(2)}`);

    const order = await membros.orders.createCreditCard({
      customer: {
        name: 'Ana Costa',
        email: 'ana@example.com',
        document: '555.666.777-88'
      },
      items: [{
        description: 'Professional Course',
        amount: totalAmount,
        quantity: 1
      }],
      card_token: 'card_token_from_frontend',
      installments: installments
    });

    console.log('\nOrder created with installments:', order.id);

  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

creditCardPaymentExample();
// installmentExample();