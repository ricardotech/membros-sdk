const express = require('express');
const crypto = require('crypto');
const Membros = require('@membros/node-sdk');

const app = express();
const port = 3000;

// Initialize Membros client
const membros = new Membros.MembrosClient('sk_test_your_api_key', {
  projectId: 'your-project-id'
});

// Webhook secret for signature verification
const WEBHOOK_SECRET = process.env.MEMBROS_WEBHOOK_SECRET || 'your_webhook_secret';

// Middleware to capture raw body for signature verification
app.use('/webhooks/membros', express.raw({ type: 'application/json' }));
app.use(express.json()); // For other routes

/**
 * Verify webhook signature to ensure it came from Membros
 */
function verifyWebhookSignature(payload, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Handle Membros webhook events
 */
app.post('/webhooks/membros', async (req, res) => {
  try {
    const signature = req.headers['x-membros-signature'];
    const payload = req.body;

    // Verify signature
    if (!signature || !verifyWebhookSignature(payload, signature)) {
      console.error('Invalid webhook signature');
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(payload.toString());
    console.log('Received webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'charge.paid':
        await handlePaymentSuccess(event.data);
        break;
        
      case 'charge.payment_failed':
        await handlePaymentFailure(event.data);
        break;
        
      case 'charge.refunded':
        await handleRefund(event.data);
        break;
        
      case 'order.created':
        await handleOrderCreated(event.data);
        break;
        
      case 'order.cancelled':
        await handleOrderCancelled(event.data);
        break;
        
      case 'order.expired':
        await handleOrderExpired(event.data);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(eventData) {
  console.log('Payment successful for order:', eventData.order_id);
  
  try {
    // Get full order details
    const order = await membros.orders.retrieve(eventData.order_id);
    
    console.log('Order details:');
    console.log('- Customer:', order.customer?.name);
    console.log('- Amount:', `R$ ${(order.amount / 100).toFixed(2)}`);
    console.log('- Payment Method:', order.payment_method);
    
    // Update your database
    await updateOrderStatus(order.id, 'paid');
    
    // Send confirmation email to customer
    await sendPaymentConfirmationEmail(order);
    
    // Fulfill the order (activate service, ship product, etc.)
    await fulfillOrder(order);
    
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

/**
 * Handle payment failure
 */
async function handlePaymentFailure(eventData) {
  console.log('Payment failed for order:', eventData.order_id);
  
  try {
    const order = await membros.orders.retrieve(eventData.order_id);
    
    // Update database
    await updateOrderStatus(order.id, 'payment_failed');
    
    // Send payment failure notification
    await sendPaymentFailureEmail(order, eventData.failure_reason);
    
    // Log for analytics
    console.log('Payment failure reason:', eventData.failure_reason);
    
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

/**
 * Handle refund processing
 */
async function handleRefund(eventData) {
  console.log('Refund processed for order:', eventData.order_id);
  
  try {
    const order = await membros.orders.retrieve(eventData.order_id);
    
    // Update database
    await updateOrderStatus(order.id, 'refunded');
    
    // Send refund confirmation
    await sendRefundConfirmationEmail(order, eventData.refund_amount);
    
    // Reverse fulfillment if needed
    await reverseFulfillment(order);
    
  } catch (error) {
    console.error('Error handling refund:', error);
  }
}

/**
 * Handle order creation
 */
async function handleOrderCreated(eventData) {
  console.log('Order created:', eventData.id);
  
  // Log order creation for analytics
  await logOrderCreation(eventData);
}

/**
 * Handle order cancellation
 */
async function handleOrderCancelled(eventData) {
  console.log('Order cancelled:', eventData.id);
  
  try {
    // Update database
    await updateOrderStatus(eventData.id, 'cancelled');
    
    // Send cancellation notification
    await sendOrderCancellationEmail(eventData);
    
  } catch (error) {
    console.error('Error handling order cancellation:', error);
  }
}

/**
 * Handle order expiration (e.g., PIX payment expired)
 */
async function handleOrderExpired(eventData) {
  console.log('Order expired:', eventData.id);
  
  try {
    // Update database
    await updateOrderStatus(eventData.id, 'expired');
    
    // Send expiration notification
    await sendOrderExpirationEmail(eventData);
    
  } catch (error) {
    console.error('Error handling order expiration:', error);
  }
}

// Placeholder functions for your business logic
async function updateOrderStatus(orderId, status) {
  // Update order status in your database
  console.log(`Updating order ${orderId} status to: ${status}`);
}

async function sendPaymentConfirmationEmail(order) {
  // Send confirmation email
  console.log(`Sending confirmation email to: ${order.customer?.email}`);
}

async function sendPaymentFailureEmail(order, reason) {
  // Send failure notification
  console.log(`Sending failure email to: ${order.customer?.email}, reason: ${reason}`);
}

async function sendRefundConfirmationEmail(order, amount) {
  // Send refund confirmation
  console.log(`Sending refund confirmation: R$ ${(amount / 100).toFixed(2)}`);
}

async function fulfillOrder(order) {
  // Fulfill the order (activate service, etc.)
  console.log(`Fulfilling order: ${order.id}`);
}

async function reverseFulfillment(order) {
  // Reverse fulfillment for refunded orders
  console.log(`Reversing fulfillment for order: ${order.id}`);
}

async function logOrderCreation(orderData) {
  // Log for analytics
  console.log(`Logging order creation: ${orderData.id}`);
}

async function sendOrderCancellationEmail(orderData) {
  // Send cancellation email
  console.log(`Sending cancellation email for order: ${orderData.id}`);
}

async function sendOrderExpirationEmail(orderData) {
  // Send expiration email
  console.log(`Sending expiration email for order: ${orderData.id}`);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Webhook server listening at http://localhost:${port}`);
  console.log(`Webhook endpoint: http://localhost:${port}/webhooks/membros`);
});