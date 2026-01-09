/**
 * Utility functions for data transformation and sanitization
 */

import type { RAMSpecification, SellerContact } from './types';

/**
 * Sanitizes string input by trimming whitespace and removing potentially harmful characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes that could break JSON
    .substring(0, 255); // Limit length to prevent abuse
}

/**
 * Sanitizes and normalizes phone number format
 */
export function sanitizePhoneNumber(phone: string): string {
  if (typeof phone !== 'string') {
    return '';
  }
  
  // Remove all non-digit characters except + at the beginning
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Ensure + is only at the beginning
  if (cleaned.includes('+')) {
    const parts = cleaned.split('+');
    cleaned = '+' + parts.join('');
  }
  
  return cleaned;
}

/**
 * Sanitizes and normalizes email format
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }
  
  return email.trim().toLowerCase();
}

/**
 * Transforms RAM specification input to ensure proper types and values
 */
export function transformRAMSpecification(input: any): Partial<RAMSpecification> {
  const transformed: Partial<RAMSpecification> = {};

  // Transform type
  if (typeof input.type === 'string') {
    const upperType = input.type.toUpperCase();
    if (['DDR3', 'DDR4', 'DDR5'].includes(upperType)) {
      transformed.type = upperType as RAMSpecification['type'];
    }
  }

  // Transform capacity
  if (input.capacity !== undefined) {
    const capacity = parseInt(String(input.capacity), 10);
    if (!isNaN(capacity) && capacity > 0) {
      transformed.capacity = capacity;
    }
  }

  // Transform speed
  if (input.speed !== undefined) {
    const speed = parseInt(String(input.speed), 10);
    if (!isNaN(speed) && speed > 0) {
      transformed.speed = speed;
    }
  }

  // Transform brand
  if (typeof input.brand === 'string') {
    transformed.brand = sanitizeString(input.brand);
  }

  // Transform condition
  if (typeof input.condition === 'string') {
    const lowerCondition = input.condition.toLowerCase();
    if (['new', 'excellent', 'good', 'fair'].includes(lowerCondition)) {
      transformed.condition = lowerCondition as RAMSpecification['condition'];
    }
  }

  // Transform quantity
  if (input.quantity !== undefined) {
    const quantity = parseInt(String(input.quantity), 10);
    if (!isNaN(quantity) && quantity > 0) {
      transformed.quantity = quantity;
    }
  }

  return transformed;
}

/**
 * Transforms contact information input to ensure proper types and sanitization
 */
export function transformSellerContact(input: any): Partial<SellerContact> {
  const transformed: Partial<SellerContact> = {};

  // Transform name
  if (typeof input.name === 'string') {
    transformed.name = sanitizeString(input.name);
  }

  // Transform email
  if (typeof input.email === 'string') {
    transformed.email = sanitizeEmail(input.email);
  }

  // Transform phone
  if (typeof input.phone === 'string') {
    transformed.phone = sanitizePhoneNumber(input.phone);
  }

  // Transform preferred contact
  if (typeof input.preferredContact === 'string') {
    const lowerPreferred = input.preferredContact.toLowerCase();
    if (['email', 'phone', 'either'].includes(lowerPreferred)) {
      transformed.preferredContact = lowerPreferred as SellerContact['preferredContact'];
    }
  }

  // Transform location
  if (typeof input.location === 'string') {
    transformed.location = sanitizeString(input.location);
  }

  return transformed;
}

/**
 * Formats RAM specification for display
 */
export function formatRAMSpecification(spec: RAMSpecification): string {
  return `${spec.brand} ${spec.type}-${spec.speed} ${spec.capacity}GB (${spec.condition}) x${spec.quantity}`;
}

/**
 * Formats contact information for display (with privacy protection)
 */
export function formatContactForDisplay(contact: SellerContact): string {
  const maskedEmail = contact.email.replace(/(.{2}).*(@.*)/, '$1***$2');
  const maskedPhone = contact.phone.replace(/(.{3}).*(.{2})/, '$1***$2');
  
  return `${contact.name} (${maskedEmail}, ${maskedPhone}) - ${contact.location}`;
}

/**
 * Creates a deep copy of an object to prevent mutation
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * Generates a unique identifier for tracking purposes
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}