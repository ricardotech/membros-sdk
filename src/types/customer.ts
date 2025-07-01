import { DocumentType, Phone, Address, MembrosMetadata } from './common';

export interface Customer {
  id: string;
  name: string;
  email: string;
  document: string;
  document_type: DocumentType;
  phones?: {
    mobile_phone?: Phone;
    home_phone?: Phone;
  };
  address?: Address;
  metadata?: MembrosMetadata;
  created_at: string;
  updated_at: string;
}

export interface CustomerCreateParams {
  name: string;
  email: string;
  document: string;
  document_type?: DocumentType;
  phones?: {
    mobile_phone?: Phone;
    home_phone?: Phone;
  };
  address?: Address;
  metadata?: MembrosMetadata;
}

export interface CustomerUpdateParams {
  name?: string;
  email?: string;
  document?: string;
  document_type?: DocumentType;
  phones?: {
    mobile_phone?: Phone;
    home_phone?: Phone;
  };
  address?: Address;
  metadata?: MembrosMetadata;
}

export interface CustomerListParams {
  limit?: number;
  offset?: number;
  email?: string;
  document?: string;
  created_after?: string;
  created_before?: string;
}