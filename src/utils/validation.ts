import { DocumentType } from '../types/common';
import { MembrosValidationError } from '../errors/membros-error';

/**
 * Validates and formats a Brazilian CPF document
 */
export function validateCPF(cpf: string): boolean {
  // Remove non-digit characters
  const cleanCPF = cpf.replace(/\D/g, '');

  // Check if has 11 digits
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Check for invalid patterns (all same digits)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Validate CPF algorithm
  let sum = 0;
  let remainder: number;

  // First verification digit
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  // Second verification digit
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
}

/**
 * Validates and formats a Brazilian CNPJ document
 */
export function validateCNPJ(cnpj: string): boolean {
  // Remove non-digit characters
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  // Check if has 14 digits
  if (cleanCNPJ.length !== 14) {
    return false;
  }

  // Check for invalid patterns (all same digits)
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false;
  }

  // Validate CNPJ algorithm
  let length = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, length);
  const digits = cleanCNPJ.substring(length);
  let sum = 0;
  let pos = length - 7;

  // First verification digit
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  // Second verification digit
  length = length + 1;
  numbers = cleanCNPJ.substring(0, length);
  sum = 0;
  pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
}

/**
 * Formats a Brazilian document (CPF or CNPJ) with proper mask
 */
export function formatDocument(document: string, type?: DocumentType): string {
  const cleanDocument = document.replace(/\D/g, '');
  
  if (type === 'CPF' || cleanDocument.length === 11) {
    return cleanDocument.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (type === 'CNPJ' || cleanDocument.length === 14) {
    return cleanDocument.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return document;
}

/**
 * Determines document type based on length
 */
export function getDocumentType(document: string): DocumentType {
  const cleanDocument = document.replace(/\D/g, '');
  
  if (cleanDocument.length === 11) {
    return 'CPF';
  } else if (cleanDocument.length === 14) {
    return 'CNPJ';
  }
  
  throw new MembrosValidationError(
    'Invalid document format. Must be a valid CPF (11 digits) or CNPJ (14 digits)',
    'INVALID_DOCUMENT_FORMAT'
  );
}

/**
 * Validates a Brazilian document (CPF or CNPJ)
 */
export function validateDocument(document: string, type?: DocumentType): boolean {
  const cleanDocument = document.replace(/\D/g, '');
  const documentType = type || getDocumentType(document);
  
  if (documentType === 'CPF') {
    return validateCPF(cleanDocument);
  } else if (documentType === 'CNPJ') {
    return validateCNPJ(cleanDocument);
  }
  
  return false;
}

/**
 * Validates an email address
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a Brazilian phone number
 */
export function validateBrazilianPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Brazilian mobile: 11 digits (2 area code + 9 mobile digit + 8 digits)
  // Brazilian landline: 10 digits (2 area code + 8 digits)
  return cleanPhone.length === 10 || cleanPhone.length === 11;
}

/**
 * Formats a Brazilian phone number
 */
export function formatBrazilianPhone(phone: string): { country_code: string; area_code: string; number: string } {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (!validateBrazilianPhone(cleanPhone)) {
    throw new MembrosValidationError(
      'Invalid Brazilian phone number format',
      'INVALID_PHONE_FORMAT'
    );
  }
  
  const areaCode = cleanPhone.substring(0, 2);
  const number = cleanPhone.substring(2);
  
  return {
    country_code: '55',
    area_code: areaCode,
    number: number
  };
}

/**
 * Validates required fields for customer creation
 */
export function validateCustomerData(data: {
  name?: string;
  email?: string;
  document?: string;
}): void {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters long');
  }
  
  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email address is required');
  }
  
  if (!data.document) {
    errors.push('Document is required');
  } else if (!validateDocument(data.document)) {
    errors.push('Invalid document format. Must be a valid CPF or CNPJ');
  }
  
  if (errors.length > 0) {
    throw new MembrosValidationError(
      `Validation failed: ${errors.join(', ')}`,
      'CUSTOMER_VALIDATION_ERROR',
      400,
      { errors }
    );
  }
}