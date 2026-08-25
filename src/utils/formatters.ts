/**
 * Currency, date, and validation utilities tailored for Indian Accounting Standards.
 */

export function formatINR(amount: number | string | undefined | null, includeDecimals = true): string {
  if (amount === undefined || amount === null || amount === '') return '₹0';
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return '₹0';

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? (Number.isInteger(numeric) ? 0 : 2) : 0,
    maximumFractionDigits: 2,
  }).format(numeric);

  return formatted;
}

export function formatNumberIN(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(amount);
}

export function validateGSTIN(gstin: string): { isValid: boolean; message: string; stateCode?: string } {
  const clean = gstin.trim().toUpperCase();
  if (!clean) return { isValid: false, message: 'GSTIN is required' };
  
  // Standard 15-character Indian GSTIN Regex: 2 digits state code, 10 char PAN, 1 entity num, 1 'Z', 1 checksum
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (clean.length !== 15) {
    return { isValid: false, message: `GSTIN must be exactly 15 characters (currently ${clean.length})` };
  }
  if (!regex.test(clean)) {
    return { isValid: false, message: 'Invalid format. Expected: 27AABCA1234F1Z5' };
  }
  const stateCode = clean.substring(0, 2);
  return { isValid: true, message: `Valid GSTIN (State Code: ${stateCode})`, stateCode };
}

export function validatePAN(pan: string): { isValid: boolean; message: string } {
  const clean = pan.trim().toUpperCase();
  if (!clean) return { isValid: false, message: 'PAN is required' };
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (clean.length !== 10) {
    return { isValid: false, message: `PAN must be exactly 10 characters (currently ${clean.length})` };
  }
  if (!regex.test(clean)) {
    return { isValid: false, message: 'Invalid format. Expected 5 letters, 4 numbers, 1 letter (e.g. AABCA1234F)' };
  }
  return { isValid: true, message: 'Valid PAN' };
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function numberToWordsIndian(num: number): string {
  if (num === 0) return 'Zero Rupees Only';
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ',
    'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ',
    'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    let str = '';
    if (n > 19) {
      str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    } else {
      str += a[n];
    }
    return str;
  }

  let amount = Math.floor(Math.abs(num));
  const crore = Math.floor(amount / 10000000);
  amount %= 10000000;
  const lakh = Math.floor(amount / 100000);
  amount %= 100000;
  const thousand = Math.floor(amount / 1000);
  amount %= 1000;
  const hundred = Math.floor(amount / 100);
  const rem = amount % 100;

  let result = '';
  if (crore > 0) result += inWords(crore) + 'Crore ';
  if (lakh > 0) result += inWords(lakh) + 'Lakh ';
  if (thousand > 0) result += inWords(thousand) + 'Thousand ';
  if (hundred > 0) result += inWords(hundred) + 'Hundred ';
  if (rem > 0) result += (result !== '' ? 'and ' : '') + inWords(rem);

  return 'INR ' + result.trim() + ' Only';
}
