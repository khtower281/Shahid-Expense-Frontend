/**
 * Client-side CSV template — generates a starter CSV in the browser.
 * Nothing is fetched from the server, nothing is uploaded.
 */
const TEMPLATE_HEADERS = [
  'Date',
  'Currency',
  'Amount',
  'Description',
  'Category',
  'Status',
  'Payment Method',
  'Check Number',
  'Receipt URL'
];

const TEMPLATE_EXAMPLE = [
  '15 Jan 2025',
  'PKR',
  '2500.00',
  'Lunch with team',
  'Food',
  'Completed',
  'Cash',
  '',
  ''
];

const escapeCell = (value) => {
  const s = value === undefined || value === null ? '' : String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

export const buildTemplateCSV = () => {
  const header = TEMPLATE_HEADERS.map(escapeCell).join(',');
  const example = TEMPLATE_EXAMPLE.map(escapeCell).join(',');
  return `${header}\r\n${example}\r\n`;
};

/**
 * Trigger a browser download of the given text as a file.
 * Stateless — everything happens in the browser.
 */
export const downloadTextFile = (text, filename, mime = 'text/csv;charset=utf-8') => {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const downloadTemplateCSV = () => {
  downloadTextFile(buildTemplateCSV(), 'shahid-expense-template.csv');
};