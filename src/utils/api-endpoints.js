export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me'
  },
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id) => `/categories/${id}`
  },
  TRANSACTIONS: {
    BASE: '/transactions',
    BY_ID: (id) => `/transactions/${id}`,
    BULK: '/transactions/bulk',
    MONTHLY_STATS: '/transactions/stats/monthly',
    EXPORT_PDF: '/transactions/export/pdf',
    EXPORT_CSV: '/transactions/export/csv',
    IMPORT_CSV: '/transactions/import/csv',
    IMPORT_TEMPLATE: '/transactions/import/template'
  }
};