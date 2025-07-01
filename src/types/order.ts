import { Customer, CustomerCreateParams } from './customer';
import { MembrosMetadata } from './common';

export type PaymentMethod = 'pix' | 'credit_card' | 'boleto';
export type OrderStatus = 'pending' | 'paid' | 'canceled' | 'expired' | 'refunded';

export interface OrderItem {
  id?: string;
  description: string;
  amount: number; // Amount in cents
  quantity: number;
  metadata?: MembrosMetadata;
}

export interface Order {
  id: string;
  customer_id: string;
  customer?: Customer;
  items: OrderItem[];
  amount: number; // Total amount in cents
  payment_method: PaymentMethod;
  status: OrderStatus;
  metadata?: MembrosMetadata;
  pix_qr_code?: string;
  pix_qr_code_url?: string;
  pix_expires_at?: string;
  boleto_url?: string;
  boleto_barcode?: string;
  boleto_expires_at?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  canceled_at?: string;
  expired_at?: string;
}

export interface OrderCreateParams {
  customer: CustomerCreateParams | string; // Customer data or existing customer ID
  items: OrderItem[];
  payment_method: PaymentMethod;
  metadata?: MembrosMetadata;
  expires_in?: number; // Expiration time in seconds (for PIX/boleto)
}

export interface OrderPixParams {
  customer: CustomerCreateParams | string;
  items: OrderItem[];
  expires_in?: number; // Default: 3600 (1 hour)
  metadata?: MembrosMetadata;
}

export interface OrderCreditCardParams {
  customer: CustomerCreateParams | string;
  items: OrderItem[];
  card_token: string;
  installments?: number; // Default: 1
  metadata?: MembrosMetadata;
}

export interface OrderBoletoParams {
  customer: CustomerCreateParams | string;
  items: OrderItem[];
  expires_in?: number; // Default: 259200 (3 days)
  metadata?: MembrosMetadata;
}

export interface OrderListParams {
  limit?: number;
  offset?: number;
  customer_id?: string;
  status?: OrderStatus;
  payment_method?: PaymentMethod;
  created_after?: string;
  created_before?: string;
}

export interface OrderRefundParams {
  amount?: number; // Partial refund amount in cents (full refund if not specified)
  reason?: string;
  metadata?: MembrosMetadata;
}

export interface Refund {
  id: string;
  order_id: string;
  amount: number;
  reason?: string;
  status: 'processing' | 'completed' | 'failed';
  metadata?: MembrosMetadata;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}