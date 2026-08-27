import React from 'react';
import { InvoiceFormData, InvoiceCalculations, InvoiceTemplateId } from '../types';
import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { CorporateTemplate } from './CorporateTemplate';

interface InvoiceRendererProps {
  data: InvoiceFormData;
  calculations: InvoiceCalculations;
  templateId?: InvoiceTemplateId;
}

export const InvoiceRenderer: React.FC<InvoiceRendererProps> = ({
  data,
  calculations,
  templateId,
}) => {
  const activeTemplate = templateId || data.templateId;

  switch (activeTemplate) {
    case 'modern':
      return <ModernTemplate data={data} calculations={calculations} />;
    case 'minimal':
      return <MinimalTemplate data={data} calculations={calculations} />;
    case 'corporate':
      return <CorporateTemplate data={data} calculations={calculations} />;
    case 'classic':
    default:
      return <ClassicTemplate data={data} calculations={calculations} />;
  }
};
