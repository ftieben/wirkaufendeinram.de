/**
 * Validation functions for RAM specifications and contact information
 */

import type { RAMSpecification, SellerContact, ValidationResult, ValidationError } from './types';

// Known RAM brands for validation
const KNOWN_RAM_BRANDS = [
  'Corsair', 'G.Skill', 'Kingston', 'Crucial', 'Samsung', 'SK Hynix', 
  'Micron', 'ADATA', 'Team', 'Patriot', 'HyperX', 'Mushkin', 'GeIL'
];

// Valid speed ranges for each RAM type (in MHz)
const RAM_SPEED_RANGES = {
  DDR3: { min: 800, max: 2133 },
  DDR4: { min: 1600, max: 3200 },
  DDR5: { min: 3200, max: 6400 }
};

// Valid capacity values (in GB)
const VALID_CAPACITIES = [1, 2, 4, 8, 16, 32, 64, 128];

/**
 * Validates RAM specification against known standards
 */
export function validateRAMSpecification(spec: Partial<RAMSpecification>): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate RAM type
  if (!spec.type) {
    errors.push({ field: 'type', message: 'RAM type is required' });
  } else if (!['DDR3', 'DDR4', 'DDR5'].includes(spec.type)) {
    errors.push({ field: 'type', message: 'RAM type must be DDR3, DDR4, or DDR5' });
  }

  // Validate capacity
  if (!spec.capacity) {
    errors.push({ field: 'capacity', message: 'Capacity is required' });
  } else if (!Number.isInteger(spec.capacity) || spec.capacity <= 0) {
    errors.push({ field: 'capacity', message: 'Capacity must be a positive integer' });
  } else if (!VALID_CAPACITIES.includes(spec.capacity)) {
    errors.push({ 
      field: 'capacity', 
      message: `Capacity must be one of: ${VALID_CAPACITIES.join(', ')} GB` 
    });
  }

  // Validate speed
  if (!spec.speed) {
    errors.push({ field: 'speed', message: 'Speed is required' });
  } else if (!Number.isInteger(spec.speed) || spec.speed <= 0) {
    errors.push({ field: 'speed', message: 'Speed must be a positive integer' });
  } else if (spec.type && RAM_SPEED_RANGES[spec.type]) {
    const range = RAM_SPEED_RANGES[spec.type];
    if (spec.speed < range.min || spec.speed > range.max) {
      errors.push({ 
        field: 'speed', 
        message: `Speed for ${spec.type} must be between ${range.min} and ${range.max} MHz` 
      });
    }
  }

  // Validate brand
  if (!spec.brand) {
    errors.push({ field: 'brand', message: 'Brand is required' });
  } else if (typeof spec.brand !== 'string' || spec.brand.trim().length === 0) {
    errors.push({ field: 'brand', message: 'Brand must be a non-empty string' });
  } else if (!KNOWN_RAM_BRANDS.includes(spec.brand)) {
    errors.push({ 
      field: 'brand', 
      message: `Unknown brand. Known brands: ${KNOWN_RAM_BRANDS.join(', ')}` 
    });
  }

  // Validate condition
  if (!spec.condition) {
    errors.push({ field: 'condition', message: 'Condition is required' });
  } else if (!['new', 'excellent', 'good', 'fair'].includes(spec.condition)) {
    errors.push({ 
      field: 'condition', 
      message: 'Condition must be new, excellent, good, or fair' 
    });
  }

  // Validate quantity
  if (!spec.quantity) {
    errors.push({ field: 'quantity', message: 'Quantity is required' });
  } else if (!Number.isInteger(spec.quantity) || spec.quantity <= 0) {
    errors.push({ field: 'quantity', message: 'Quantity must be a positive integer' });
  } else if (spec.quantity > 100) {
    errors.push({ field: 'quantity', message: 'Quantity cannot exceed 100 modules' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates contact information format and structure
 */
export function validateSellerContact(contact: Partial<SellerContact>): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate name
  if (!contact.name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (typeof contact.name !== 'string' || contact.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name must be a non-empty string' });
  } else if (contact.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  }

  // Validate email format
  if (!contact.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (typeof contact.email !== 'string') {
    errors.push({ field: 'email', message: 'Email must be a string' });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.email)) {
      errors.push({ field: 'email', message: 'Email format is invalid' });
    }
  }

  // Validate phone number structure
  if (!contact.phone) {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  } else if (typeof contact.phone !== 'string') {
    errors.push({ field: 'phone', message: 'Phone number must be a string' });
  } else {
    // Remove common formatting characters
    const cleanPhone = contact.phone.replace(/[\s\-\(\)\+]/g, '');
    if (!/^\d{10,15}$/.test(cleanPhone)) {
      errors.push({ 
        field: 'phone', 
        message: 'Phone number must contain 10-15 digits' 
      });
    }
  }

  // Validate preferred contact method
  if (!contact.preferredContact) {
    errors.push({ field: 'preferredContact', message: 'Preferred contact method is required' });
  } else if (!['email', 'phone', 'either'].includes(contact.preferredContact)) {
    errors.push({ 
      field: 'preferredContact', 
      message: 'Preferred contact must be email, phone, or either' 
    });
  }

  // Validate location
  if (!contact.location) {
    errors.push({ field: 'location', message: 'Location is required' });
  } else if (typeof contact.location !== 'string' || contact.location.trim().length === 0) {
    errors.push({ field: 'location', message: 'Location must be a non-empty string' });
  } else if (contact.location.trim().length < 2) {
    errors.push({ field: 'location', message: 'Location must be at least 2 characters long' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Checks if a RAM specification is complete and valid
 */
export function isValidRAMSpecification(spec: any): spec is RAMSpecification {
  const validation = validateRAMSpecification(spec);
  return validation.isValid;
}

/**
 * Checks if contact information is complete and valid
 */
export function isValidSellerContact(contact: any): contact is SellerContact {
  const validation = validateSellerContact(contact);
  return validation.isValid;
}