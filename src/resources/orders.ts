import { BaseResource } from './base';
import { 
  Order, 
  OrderCreateParams, 
  OrderPixParams,
  OrderCreditCardParams,
  OrderBoletoParams,
  OrderListParams,
  OrderRefundParams,
  Refund,
  OrderItem 
} from '../types/order';
import { MembrosListResponse } from '../types/common';
import { MembrosValidationError } from '../errors/membros-error';
import { 
  validateCustomerData, 
  getDocumentType,
  formatDocument,
  formatBrazilianPhone 
} from '../utils/validation';

export class OrdersResource extends BaseResource {
  constructor(http: any) {
    super(http, '/orders');
  }

  /**
   * Create a new order
   */
  async create(params: OrderCreateParams): Promise<Order> {
    const orderData = await this.prepareOrderData(params);
    return this.createResource<Order, typeof orderData>(orderData);
  }

  /**
   * Create a PIX payment order
   */
  async createPix(params: OrderPixParams): Promise<Order> {
    const orderData = await this.prepareOrderData({
      ...params,
      payment_method: 'pix'
    });

    return this.createResource<Order, typeof orderData>(orderData, 'pix');
  }

  /**
   * Create a credit card payment order
   */
  async createCreditCard(params: OrderCreditCardParams): Promise<Order> {
    if (!params.card_token) {
      throw new MembrosValidationError(
        'Card token is required for credit card payments',
        'MISSING_CARD_TOKEN'
      );
    }

    const orderData = await this.prepareOrderData({
      ...params,
      payment_method: 'credit_card'
    });

    // Add credit card specific fields
    const creditCardData = {
      ...orderData,
      card_token: params.card_token,
      installments: params.installments || 1
    };

    return this.createResource<Order, typeof creditCardData>(creditCardData, 'credit-card');
  }

  /**
   * Create a boleto payment order
   */
  async createBoleto(params: OrderBoletoParams): Promise<Order> {
    const orderData = await this.prepareOrderData({
      ...params,
      payment_method: 'boleto'
    });

    return this.createResource<Order, typeof orderData>(orderData, 'boleto');
  }

  /**
   * Retrieve an order by ID
   */
  async retrieve(orderId: string): Promise<Order> {
    return this.retrieveResource<Order>(orderId);
  }

  /**
   * List orders with optional filters
   */
  async list(params?: OrderListParams): Promise<MembrosListResponse<Order>> {
    return this.listResources<Order>(undefined, params);
  }

  /**
   * Cancel an order
   */
  async cancel(orderId: string, reason?: string): Promise<Order> {
    const cancelData = { reason };
    const response = await this.http.post<Order>(`${this.buildPath(orderId)}/cancel`, cancelData);
    return response.data;
  }

  /**
   * Refund an order
   */
  async refund(orderId: string, params?: OrderRefundParams): Promise<Refund> {
    const refundData = params || {};
    const response = await this.http.post<Refund>(`${this.buildPath(orderId)}/refunds`, refundData);
    return response.data;
  }

  /**
   * Get PIX QR code for an order
   */
  async getPixQrCode(orderId: string): Promise<{
    qr_code: string;
    qr_code_url: string;
    expires_at: string;
  }> {
    const response = await this.http.get<{ qr_code: string; qr_code_url: string; expires_at: string; }>(`${this.buildPath(orderId)}/pix/qr-code`);
    return response.data;
  }

  /**
   * Get boleto URL and barcode for an order
   */
  async getBoleto(orderId: string): Promise<{
    boleto_url: string;
    barcode: string;
    expires_at: string;
  }> {
    const response = await this.http.get<{ boleto_url: string; barcode: string; expires_at: string; }>(`${this.buildPath(orderId)}/boleto`);
    return response.data;
  }

  /**
   * List refunds for an order
   */
  async listRefunds(orderId: string): Promise<MembrosListResponse<Refund>> {
    return this.listResources<Refund>(`${orderId}/refunds`);
  }

  /**
   * Get order status and payment details
   */
  async getStatus(orderId: string): Promise<{
    status: Order['status'];
    payment_status: string;
    paid_at?: string;
    amount_paid?: number;
  }> {
    const response = await this.http.get<{ status: Order['status']; payment_status: string; paid_at?: string; amount_paid?: number; }>(`${this.buildPath(orderId)}/status`);
    return response.data;
  }

  /**
   * Prepare order data for API requests
   */
  private async prepareOrderData(params: OrderCreateParams): Promise<any> {
    // Validate items
    this.validateOrderItems(params.items);

    // Prepare customer data
    let customerData: any;
    if (typeof params.customer === 'string') {
      // Existing customer ID
      customerData = params.customer;
    } else {
      // New customer data
      validateCustomerData(params.customer);
      
      customerData = {
        ...params.customer,
        document_type: params.customer.document_type || getDocumentType(params.customer.document),
        document: formatDocument(params.customer.document, params.customer.document_type)
      };

      // Format phone numbers if provided
      if (params.customer.phones) {
        const phones: any = {};
        
        if (params.customer.phones.mobile_phone) {
          const mobilePhone = params.customer.phones.mobile_phone;
          if (typeof mobilePhone === 'string') {
            phones.mobile_phone = formatBrazilianPhone(mobilePhone);
          } else {
            phones.mobile_phone = mobilePhone;
          }
        }

        if (params.customer.phones.home_phone) {
          const homePhone = params.customer.phones.home_phone;
          if (typeof homePhone === 'string') {
            phones.home_phone = formatBrazilianPhone(homePhone);
          } else {
            phones.home_phone = homePhone;
          }
        }

        customerData.phones = phones;
      }
    }

    // Calculate total amount
    const totalAmount = params.items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);

    return {
      customer: customerData,
      items: params.items,
      amount: totalAmount,
      payment_method: params.payment_method,
      expires_in: params.expires_in,
      metadata: params.metadata
    };
  }

  /**
   * Validate order items
   */
  private validateOrderItems(items: OrderItem[]): void {
    if (!items || items.length === 0) {
      throw new MembrosValidationError(
        'At least one order item is required',
        'MISSING_ORDER_ITEMS'
      );
    }

    const errors: string[] = [];

    items.forEach((item, index) => {
      if (!item.description || item.description.trim().length === 0) {
        errors.push(`Item ${index + 1}: Description is required`);
      }

      if (!item.amount || item.amount <= 0) {
        errors.push(`Item ${index + 1}: Amount must be greater than 0`);
      }

      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }

      // Validate amount is in cents (integer)
      if (!Number.isInteger(item.amount)) {
        errors.push(`Item ${index + 1}: Amount must be an integer (in cents)`);
      }

      // Validate quantity is integer
      if (!Number.isInteger(item.quantity)) {
        errors.push(`Item ${index + 1}: Quantity must be an integer`);
      }
    });

    if (errors.length > 0) {
      throw new MembrosValidationError(
        `Order validation failed: ${errors.join(', ')}`,
        'ORDER_VALIDATION_ERROR',
        400,
        { errors }
      );
    }
  }
}