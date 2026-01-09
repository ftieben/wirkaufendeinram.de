/**
 * Main export file for RAM buying system data models and utilities
 */

// Export all types
export type {
  RAMSpecification,
  SellerContact,
  QuoteResponse,
  ValidationError,
  ValidationResult
} from './types';

// Export validation functions
export {
  validateRAMSpecification,
  validateSellerContact,
  isValidRAMSpecification,
  isValidSellerContact
} from './validation';

// Export utility functions
export {
  sanitizeString,
  sanitizePhoneNumber,
  sanitizeEmail,
  transformRAMSpecification,
  transformSellerContact,
  formatRAMSpecification,
  formatContactForDisplay,
  deepClone,
  generateId
} from './utils';

// Export pricing functions
export {
  calculateRAMPrice,
  generateQuote,
  canGenerateQuote,
  getMarketAdjustments,
  getBrandMultiplier,
  getConditionMultiplier
} from './pricing';