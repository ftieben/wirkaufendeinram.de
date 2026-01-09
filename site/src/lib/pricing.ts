/**
 * Price calculation engine for RAM buying system
 * Implements pricing matrix, market adjustments, and quote generation
 */

import type { RAMSpecification, QuoteResponse } from './types';

// Base pricing matrix for different RAM types and specifications (in USD per GB)
const BASE_PRICING_MATRIX = {
  DDR3: {
    basePricePerGB: 8.00,
    speedMultipliers: {
      800: 0.7,
      1066: 0.8,
      1333: 0.9,
      1600: 1.0,
      1866: 1.1,
      2133: 1.2
    }
  },
  DDR4: {
    basePricePerGB: 12.00,
    speedMultipliers: {
      1600: 0.7,
      2133: 0.8,
      2400: 0.9,
      2666: 1.0,
      2933: 1.1,
      3200: 1.2
    }
  },
  DDR5: {
    basePricePerGB: 18.00,
    speedMultipliers: {
      3200: 0.8,
      4800: 0.9,
      5600: 1.0,
      6000: 1.1,
      6400: 1.2
    }
  }
} as const;

// Brand reputation multipliers
const BRAND_MULTIPLIERS = {
  'Corsair': 1.15,
  'G.Skill': 1.12,
  'Kingston': 1.05,
  'Crucial': 1.08,
  'Samsung': 1.20,
  'SK Hynix': 1.10,
  'Micron': 1.08,
  'ADATA': 0.95,
  'Team': 0.90,
  'Patriot': 0.92,
  'HyperX': 1.10,
  'Mushkin': 0.95,
  'GeIL': 0.88
} as const;

// Condition multipliers
const CONDITION_MULTIPLIERS = {
  'new': 1.0,
  'excellent': 0.85,
  'good': 0.70,
  'fair': 0.50
} as const;

// Market adjustment factors (can be updated based on current market conditions)
const MARKET_ADJUSTMENTS = {
  demandMultiplier: 1.25, // Current high demand for RAM
  supplyMultiplier: 0.95,  // Slightly reduced supply
  seasonalMultiplier: 1.05 // Seasonal adjustment
} as const;

// Capacity premium/discount factors
const CAPACITY_ADJUSTMENTS = {
  1: 0.8,   // Lower demand for 1GB modules
  2: 0.9,   // Lower demand for 2GB modules
  4: 1.0,   // Standard pricing
  8: 1.05,  // Slight premium for popular size
  16: 1.1,  // Premium for high-capacity
  32: 1.15, // Higher premium
  64: 1.2,  // Significant premium
  128: 1.25 // Maximum premium for enterprise-grade
} as const;

/**
 * Calculates the closest speed multiplier for a given speed
 */
function getSpeedMultiplier(ramType: RAMSpecification['type'], speed: number): number {
  const speedMultipliers = BASE_PRICING_MATRIX[ramType].speedMultipliers;
  const availableSpeeds = Object.keys(speedMultipliers).map(Number).sort((a, b) => a - b);
  
  // Find the closest speed
  let closestSpeed = availableSpeeds[0];
  let minDifference = Math.abs(speed - closestSpeed);
  
  for (const availableSpeed of availableSpeeds) {
    const difference = Math.abs(speed - availableSpeed);
    if (difference < minDifference) {
      minDifference = difference;
      closestSpeed = availableSpeed;
    }
  }
  
  return speedMultipliers[closestSpeed as keyof typeof speedMultipliers];
}

/**
 * Calculates the base price for a single RAM module
 */
function calculateBasePrice(spec: RAMSpecification): number {
  const ramTypeData = BASE_PRICING_MATRIX[spec.type];
  const basePricePerGB = ramTypeData.basePricePerGB;
  
  // Get speed multiplier
  const speedMultiplier = getSpeedMultiplier(spec.type, spec.speed);
  
  // Get brand multiplier (default to 1.0 if brand not found)
  const brandMultiplier = BRAND_MULTIPLIERS[spec.brand as keyof typeof BRAND_MULTIPLIERS] || 1.0;
  
  // Get condition multiplier
  const conditionMultiplier = CONDITION_MULTIPLIERS[spec.condition];
  
  // Get capacity adjustment
  const capacityAdjustment = CAPACITY_ADJUSTMENTS[spec.capacity as keyof typeof CAPACITY_ADJUSTMENTS] || 1.0;
  
  // Calculate base price
  const basePrice = basePricePerGB * spec.capacity * speedMultiplier * brandMultiplier * conditionMultiplier * capacityAdjustment;
  
  return basePrice;
}

/**
 * Applies market adjustments to the base price
 */
function applyMarketAdjustments(basePrice: number): number {
  const { demandMultiplier, supplyMultiplier, seasonalMultiplier } = MARKET_ADJUSTMENTS;
  return basePrice * demandMultiplier * supplyMultiplier * seasonalMultiplier;
}

/**
 * Calculates price range with confidence intervals
 */
function calculatePriceRange(estimatedValue: number): { min: number; max: number } {
  const variance = 0.15; // 15% variance for market fluctuations
  const min = Math.max(0, estimatedValue * (1 - variance));
  const max = estimatedValue * (1 + variance);
  
  return {
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100
  };
}

/**
 * Generates factors that affected the pricing calculation
 */
function generatePricingFactors(spec: RAMSpecification): string[] {
  const factors: string[] = [];
  
  // RAM type factor
  factors.push(`${spec.type} base pricing applied`);
  
  // Speed factor
  const speedMultiplier = getSpeedMultiplier(spec.type, spec.speed);
  if (speedMultiplier > 1.0) {
    factors.push(`High speed (${spec.speed}MHz) premium applied`);
  } else if (speedMultiplier < 1.0) {
    factors.push(`Lower speed (${spec.speed}MHz) discount applied`);
  }
  
  // Brand factor
  const brandMultiplier = BRAND_MULTIPLIERS[spec.brand as keyof typeof BRAND_MULTIPLIERS] || 1.0;
  if (brandMultiplier > 1.0) {
    factors.push(`Premium brand (${spec.brand}) bonus applied`);
  } else if (brandMultiplier < 1.0) {
    factors.push(`Budget brand (${spec.brand}) adjustment applied`);
  }
  
  // Condition factor
  if (spec.condition !== 'new') {
    factors.push(`Used condition (${spec.condition}) adjustment applied`);
  }
  
  // Capacity factor
  const capacityAdjustment = CAPACITY_ADJUSTMENTS[spec.capacity as keyof typeof CAPACITY_ADJUSTMENTS] || 1.0;
  if (capacityAdjustment > 1.0) {
    factors.push(`High capacity (${spec.capacity}GB) premium applied`);
  } else if (capacityAdjustment < 1.0) {
    factors.push(`Low capacity (${spec.capacity}GB) discount applied`);
  }
  
  // Market factors
  factors.push('Current market demand adjustment applied');
  
  // Quantity factor
  if (spec.quantity > 1) {
    factors.push(`Bulk quantity (${spec.quantity} modules) considered`);
  }
  
  return factors;
}

/**
 * Calculates the estimated value for RAM specifications
 */
export function calculateRAMPrice(spec: RAMSpecification): number {
  // Calculate base price for a single module
  const singleModulePrice = calculateBasePrice(spec);
  
  // Apply market adjustments
  const adjustedPrice = applyMarketAdjustments(singleModulePrice);
  
  // Apply quantity (total price for all modules)
  const totalPrice = adjustedPrice * spec.quantity;
  
  // Round to 2 decimal places
  return Math.round(totalPrice * 100) / 100;
}

/**
 * Generates a complete quote response for RAM specifications
 */
export function generateQuote(spec: RAMSpecification): QuoteResponse {
  // Calculate estimated value
  const estimatedValue = calculateRAMPrice(spec);
  
  // Calculate price range
  const priceRange = calculatePriceRange(estimatedValue);
  
  // Generate pricing factors
  const factors = generatePricingFactors(spec);
  
  // Determine timeline based on quantity and complexity
  let timeline: string;
  if (spec.quantity === 1) {
    timeline = 'Response within 2-4 hours';
  } else if (spec.quantity <= 5) {
    timeline = 'Response within 4-8 hours';
  } else {
    timeline = 'Response within 8-24 hours for bulk evaluation';
  }
  
  // Generate next steps
  const nextSteps = [
    'Our team will review your RAM specifications',
    'We will verify current market conditions',
    'You will receive a formal purchase offer',
    'Upon acceptance, we will arrange pickup or shipping'
  ];
  
  return {
    estimatedValue,
    priceRange,
    factors,
    timeline,
    nextSteps
  };
}

/**
 * Validates that a RAM specification can generate a valid quote
 */
export function canGenerateQuote(spec: Partial<RAMSpecification>): boolean {
  // Check if all required fields are present and valid
  return !!(
    spec.type &&
    spec.capacity &&
    spec.speed &&
    spec.brand &&
    spec.condition &&
    spec.quantity &&
    spec.quantity > 0 &&
    spec.capacity > 0 &&
    spec.speed > 0
  );
}

/**
 * Gets the current market adjustment factors (for display/debugging)
 */
export function getMarketAdjustments() {
  return { ...MARKET_ADJUSTMENTS };
}

/**
 * Gets the brand multiplier for a specific brand (for display/debugging)
 */
export function getBrandMultiplier(brand: string): number {
  return BRAND_MULTIPLIERS[brand as keyof typeof BRAND_MULTIPLIERS] || 1.0;
}

/**
 * Gets the condition multiplier for a specific condition (for display/debugging)
 */
export function getConditionMultiplier(condition: RAMSpecification['condition']): number {
  return CONDITION_MULTIPLIERS[condition];
}