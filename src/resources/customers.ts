import { BaseResource } from './base';
import { 
  Customer, 
  CustomerCreateParams, 
  CustomerUpdateParams, 
  CustomerListParams 
} from '../types/customer';
import { MembrosListResponse } from '../types/common';
import { 
  validateCustomerData, 
  getDocumentType, 
  formatDocument,
  formatBrazilianPhone 
} from '../utils/validation';

export class CustomersResource extends BaseResource {
  constructor(http: any) {
    super(http, '/customers');
  }

  /**
   * Create a new customer
   */
  async create(params: CustomerCreateParams): Promise<Customer> {
    // Validate required fields
    validateCustomerData(params);

    // Prepare customer data
    const customerData = {
      ...params,
      document_type: params.document_type || getDocumentType(params.document),
      document: formatDocument(params.document, params.document_type)
    };

    // Format phone numbers if provided
    if (params.phones) {
      const phones: any = {};
      
      if (params.phones.mobile_phone) {
        const mobilePhone = params.phones.mobile_phone;
        if (typeof mobilePhone === 'string') {
          phones.mobile_phone = formatBrazilianPhone(mobilePhone);
        } else {
          phones.mobile_phone = mobilePhone;
        }
      }

      if (params.phones.home_phone) {
        const homePhone = params.phones.home_phone;
        if (typeof homePhone === 'string') {
          phones.home_phone = formatBrazilianPhone(homePhone);
        } else {
          phones.home_phone = homePhone;
        }
      }

      customerData.phones = phones;
    }

    return this.createResource<Customer, typeof customerData>(customerData);
  }

  /**
   * Retrieve a customer by ID
   */
  async retrieve(customerId: string): Promise<Customer> {
    return this.retrieveResource<Customer>(customerId);
  }

  /**
   * Update a customer
   */
  async update(customerId: string, params: CustomerUpdateParams): Promise<Customer> {
    // Validate document if provided
    if (params.document) {
      const customerData = {
        document: params.document,
        document_type: params.document_type || getDocumentType(params.document)
      };
      
      // Only validate if we have both document and type
      if (customerData.document && customerData.document_type) {
        validateCustomerData({
          name: 'temp', // Skip name validation for updates
          email: 'temp@example.com', // Skip email validation for updates
          document: customerData.document
        });
      }
    }

    // Prepare update data
    const updateData = { ...params };

    // Format document if provided
    if (params.document) {
      updateData.document_type = params.document_type || getDocumentType(params.document);
      updateData.document = formatDocument(params.document, updateData.document_type);
    }

    // Format phone numbers if provided
    if (params.phones) {
      const phones: any = {};
      
      if (params.phones.mobile_phone) {
        const mobilePhone = params.phones.mobile_phone;
        if (typeof mobilePhone === 'string') {
          phones.mobile_phone = formatBrazilianPhone(mobilePhone);
        } else {
          phones.mobile_phone = mobilePhone;
        }
      }

      if (params.phones.home_phone) {
        const homePhone = params.phones.home_phone;
        if (typeof homePhone === 'string') {
          phones.home_phone = formatBrazilianPhone(homePhone);
        } else {
          phones.home_phone = homePhone;
        }
      }

      updateData.phones = phones;
    }

    return this.updateResource<Customer, typeof updateData>(customerId, updateData);
  }

  /**
   * List customers with optional filters
   */
  async list(params?: CustomerListParams): Promise<MembrosListResponse<Customer>> {
    const listParams = {
      ...params,
      // Format document if provided for search
      document: params?.document ? formatDocument(params.document) : undefined
    };

    return this.listResources<Customer>(undefined, listParams);
  }

  /**
   * Delete a customer (if supported by API)
   */
  async delete(customerId: string): Promise<{ deleted: boolean; id: string }> {
    return this.deleteResource<{ deleted: boolean; id: string }>(customerId);
  }

  /**
   * Search customers by various criteria
   */
  async search(query: {
    name?: string;
    email?: string;
    document?: string;
    limit?: number;
    offset?: number;
  }): Promise<MembrosListResponse<Customer>> {
    const searchParams = {
      ...query,
      document: query.document ? formatDocument(query.document) : undefined
    };

    return this.listResources<Customer>('search', searchParams);
  }
}