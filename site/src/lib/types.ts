/**
 * Core data models and interfaces for the RAM buying system
 */

export interface RAMSpecification {
  type: 'DDR3' | 'DDR4' | 'DDR5';
  capacity: number; // in GB
  speed: number; // in MHz
  brand: string;
  condition: 'new' | 'excellent' | 'good' | 'fair';
  quantity: number;
}

export interface SellerContact {
  name: string;
  email: string;
  phone: string;
  preferredContact: 'email' | 'phone' | 'either';
  location: string; // for shipping estimates
}

export interface QuoteResponse {
  estimatedValue: number;
  priceRange: { min: number; max: number };
  factors: string[]; // factors affecting price
  timeline: string; // expected response time
  nextSteps: string[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}