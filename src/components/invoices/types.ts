export type InvoiceTemplateId = 'classic' | 'modern' | 'minimal' | 'corporate';

export interface InvoiceTemplateMeta {
  id: InvoiceTemplateId;
  number: string;
  name: string;
  tagline: string;
  badge: string;
  description: string;
  accentColor: string;
  recommendedFor: string;
}

export interface InvoiceItemForm {
  id: string;
  description: string;
  hsn: string;
  quantity: number;
  unit: string;
  rate: number;
  discountPct: number;
  gstRate: number; // 0, 5, 12, 18, 28
  amount: number; // Taxable line value after discount
  cgst: number;
  sgst: number;
  igst: number;
  total: number; // Line item inclusive of tax
}

export interface InvoiceBusinessDetails {
  name: string;
  tradeName?: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  email: string;
  phone: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  upiId?: string;
}

export interface InvoiceCustomerDetails {
  id?: string;
  name: string;
  tradeName?: string;
  gstin: string;
  pan?: string;
  billingAddress: string;
  shippingAddress?: string;
  city: string;
  state: string;
  pincode?: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  placeOfSupply: string;
}

export interface InvoiceMetadataDetails {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  poNumber?: string;
  paymentTerms: string;
  reverseCharge: boolean;
  isInterstate: boolean;
}

export interface InvoiceFormData {
  templateId: InvoiceTemplateId;
  business: InvoiceBusinessDetails;
  customer: InvoiceCustomerDetails;
  metadata: InvoiceMetadataDetails;
  items: InvoiceItemForm[];
  additionalDiscount: number;
  shippingCharges: number;
  notes: string;
  termsAndConditions: string;
  authorizedSignatory: string;
  signatoryTitle: string;
}

export interface InvoiceCalculations {
  subtotal: number;
  itemDiscounts: number;
  additionalDiscount: number;
  shippingCharges: number;
  taxableAmount: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  rawTotal: number;
  roundOff: number;
  grandTotal: number;
  amountInWords: string;
}
