import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateRAMPrice, generateQuote, canGenerateQuote } from '../src/lib/pricing';
import type { RAMSpecification } from '../src/lib/types';

describe('Price Calculation Engine', () => {
  const validRAMSpec: RAMSpecification = {
    type: 'DDR4',
    capacity: 8,
    speed: 2666,
    brand: 'Corsair',
    condition: 'excellent',
    quantity: 2
  };

  it('should calculate price for valid RAM specification', () => {
    const price = calculateRAMPrice(validRAMSpec);
    
    expect(price).toBeGreaterThan(0);
    expect(typeof price).toBe('number');
    expect(Number.isFinite(price)).toBe(true);
  });

  it('should generate complete quote for valid RAM specification', () => {
    const quote = generateQuote(validRAMSpec);
    
    expect(quote.estimatedValue).toBeGreaterThan(0);
    expect(quote.priceRange.min).toBeGreaterThan(0);
    expect(quote.priceRange.max).toBeGreaterThan(quote.priceRange.min);
    expect(quote.factors).toBeInstanceOf(Array);
    expect(quote.factors.length).toBeGreaterThan(0);
    expect(typeof quote.timeline).toBe('string');
    expect(quote.timeline.length).toBeGreaterThan(0);
    expect(quote.nextSteps).toBeInstanceOf(Array);
    expect(quote.nextSteps.length).toBeGreaterThan(0);
  });

  it('should validate quote generation capability', () => {
    expect(canGenerateQuote(validRAMSpec)).toBe(true);
    
    const incompleteSpec = { type: 'DDR4' as const, capacity: 8 };
    expect(canGenerateQuote(incompleteSpec)).toBe(false);
  });

  it('should handle different RAM types with appropriate pricing', () => {
    const ddr3Spec: RAMSpecification = { ...validRAMSpec, type: 'DDR3', speed: 1600 };
    const ddr4Spec: RAMSpecification = { ...validRAMSpec, type: 'DDR4', speed: 2666 };
    const ddr5Spec: RAMSpecification = { ...validRAMSpec, type: 'DDR5', speed: 4800 };

    const ddr3Price = calculateRAMPrice(ddr3Spec);
    const ddr4Price = calculateRAMPrice(ddr4Spec);
    const ddr5Price = calculateRAMPrice(ddr5Spec);

    // DDR5 should generally be more expensive than DDR4, which should be more than DDR3
    expect(ddr5Price).toBeGreaterThan(ddr4Price);
    expect(ddr4Price).toBeGreaterThan(ddr3Price);
  });

  it('should apply condition multipliers correctly', () => {
    const newSpec: RAMSpecification = { ...validRAMSpec, condition: 'new' };
    const excellentSpec: RAMSpecification = { ...validRAMSpec, condition: 'excellent' };
    const goodSpec: RAMSpecification = { ...validRAMSpec, condition: 'good' };
    const fairSpec: RAMSpecification = { ...validRAMSpec, condition: 'fair' };

    const newPrice = calculateRAMPrice(newSpec);
    const excellentPrice = calculateRAMPrice(excellentSpec);
    const goodPrice = calculateRAMPrice(goodSpec);
    const fairPrice = calculateRAMPrice(fairSpec);

    // Prices should decrease with condition
    expect(newPrice).toBeGreaterThan(excellentPrice);
    expect(excellentPrice).toBeGreaterThan(goodPrice);
    expect(goodPrice).toBeGreaterThan(fairPrice);
  });

  it('should scale price with quantity', () => {
    const singleSpec: RAMSpecification = { ...validRAMSpec, quantity: 1 };
    const doubleSpec: RAMSpecification = { ...validRAMSpec, quantity: 2 };

    const singlePrice = calculateRAMPrice(singleSpec);
    const doublePrice = calculateRAMPrice(doubleSpec);

    expect(doublePrice).toBeGreaterThan(singlePrice);
    expect(doublePrice).toBeCloseTo(singlePrice * 2, 1); // Should be approximately double
  });

  // **Feature: ram-buying-site, Property 2: Valid specifications generate quotes**
  // **Validates: Requirements 1.3**
  it('should generate quotes for any valid RAM specification', () => {
    // Generator for valid RAM specifications
    const validRAMSpecArb = fc.record({
      type: fc.constantFrom('DDR3', 'DDR4', 'DDR5'),
      capacity: fc.constantFrom(1, 2, 4, 8, 16, 32, 64, 128),
      speed: fc.integer({ min: 800, max: 6400 }),
      brand: fc.constantFrom(
        'Corsair', 'G.Skill', 'Kingston', 'Crucial', 'Samsung', 
        'SK Hynix', 'Micron', 'ADATA', 'Team', 'Patriot', 'HyperX', 
        'Mushkin', 'GeIL'
      ),
      condition: fc.constantFrom('new', 'excellent', 'good', 'fair'),
      quantity: fc.integer({ min: 1, max: 100 })
    }).filter((spec) => {
      // Ensure speed is within valid range for the RAM type
      const speedRanges = {
        DDR3: { min: 800, max: 2133 },
        DDR4: { min: 1600, max: 3200 },
        DDR5: { min: 3200, max: 6400 }
      };
      const range = speedRanges[spec.type];
      return spec.speed >= range.min && spec.speed <= range.max;
    });

    fc.assert(
      fc.property(validRAMSpecArb, (spec) => {
        // Generate quote for the valid specification
        const quote = generateQuote(spec);
        
        // Property: Valid specifications should generate quotes with positive values
        expect(quote.estimatedValue).toBeGreaterThan(0);
        expect(typeof quote.estimatedValue).toBe('number');
        expect(Number.isFinite(quote.estimatedValue)).toBe(true);
        
        // Additional quote completeness checks
        expect(quote.priceRange.min).toBeGreaterThan(0);
        expect(quote.priceRange.max).toBeGreaterThan(quote.priceRange.min);
        expect(quote.factors).toBeInstanceOf(Array);
        expect(quote.factors.length).toBeGreaterThan(0);
        expect(typeof quote.timeline).toBe('string');
        expect(quote.timeline.length).toBeGreaterThan(0);
        expect(quote.nextSteps).toBeInstanceOf(Array);
        expect(quote.nextSteps.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  // **Feature: ram-buying-site, Property 3: Quote completeness**
  // **Validates: Requirements 1.4**
  it('should generate complete quotes with all required elements prominently displayed', () => {
    // Generator for valid RAM specifications
    const validRAMSpecArb = fc.record({
      type: fc.constantFrom('DDR3', 'DDR4', 'DDR5'),
      capacity: fc.constantFrom(1, 2, 4, 8, 16, 32, 64, 128),
      speed: fc.integer({ min: 800, max: 6400 }),
      brand: fc.constantFrom(
        'Corsair', 'G.Skill', 'Kingston', 'Crucial', 'Samsung', 
        'SK Hynix', 'Micron', 'ADATA', 'Team', 'Patriot', 'HyperX', 
        'Mushkin', 'GeIL'
      ),
      condition: fc.constantFrom('new', 'excellent', 'good', 'fair'),
      quantity: fc.integer({ min: 1, max: 100 })
    }).filter((spec) => {
      // Ensure speed is within valid range for the RAM type
      const speedRanges = {
        DDR3: { min: 800, max: 2133 },
        DDR4: { min: 1600, max: 3200 },
        DDR5: { min: 3200, max: 6400 }
      };
      const range = speedRanges[spec.type];
      return spec.speed >= range.min && spec.speed <= range.max;
    });

    fc.assert(
      fc.property(validRAMSpecArb, (spec) => {
        const quote = generateQuote(spec);
        
        // Property: Quote completeness - all required elements must be present and valid
        
        // 1. Estimated value must be prominently available (positive number)
        expect(quote.estimatedValue).toBeGreaterThan(0);
        expect(typeof quote.estimatedValue).toBe('number');
        expect(Number.isFinite(quote.estimatedValue)).toBe(true);
        
        // 2. Price range must be complete and logical
        expect(quote.priceRange).toBeDefined();
        expect(quote.priceRange.min).toBeGreaterThan(0);
        expect(quote.priceRange.max).toBeGreaterThan(quote.priceRange.min);
        expect(typeof quote.priceRange.min).toBe('number');
        expect(typeof quote.priceRange.max).toBe('number');
        expect(Number.isFinite(quote.priceRange.min)).toBe(true);
        expect(Number.isFinite(quote.priceRange.max)).toBe(true);
        
        // 3. Condition summary through factors must be present and informative
        expect(quote.factors).toBeDefined();
        expect(Array.isArray(quote.factors)).toBe(true);
        expect(quote.factors.length).toBeGreaterThan(0);
        // Each factor should be a non-empty string
        quote.factors.forEach(factor => {
          expect(typeof factor).toBe('string');
          expect(factor.length).toBeGreaterThan(0);
          expect(factor.trim()).toBe(factor); // No leading/trailing whitespace
        });
        
        // 4. Timeline must be present and informative
        expect(quote.timeline).toBeDefined();
        expect(typeof quote.timeline).toBe('string');
        expect(quote.timeline.length).toBeGreaterThan(0);
        expect(quote.timeline.trim()).toBe(quote.timeline); // No leading/trailing whitespace
        // Timeline should contain time-related information
        expect(quote.timeline.toLowerCase()).toMatch(/hour|day|response|within/);
        
        // 5. Next steps must be clear and actionable
        expect(quote.nextSteps).toBeDefined();
        expect(Array.isArray(quote.nextSteps)).toBe(true);
        expect(quote.nextSteps.length).toBeGreaterThan(0);
        // Each next step should be a non-empty string
        quote.nextSteps.forEach(step => {
          expect(typeof step).toBe('string');
          expect(step.length).toBeGreaterThan(0);
          expect(step.trim()).toBe(step); // No leading/trailing whitespace
        });
        
        // 6. Ensure the quote contains condition-related information in factors (when applicable)
        // For 'new' condition, no explicit mention is needed as it's the baseline
        // For other conditions, explicit mention should be present
        if (spec.condition !== 'new') {
          const conditionMentioned = quote.factors.some(factor => 
            factor.toLowerCase().includes(spec.condition) || 
            factor.toLowerCase().includes('condition') ||
            factor.toLowerCase().includes('used')
          );
          expect(conditionMentioned).toBe(true);
        }
        // For 'new' condition, we just verify that factors exist (condition summary through other factors)
        expect(quote.factors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  // **Feature: ram-buying-site, Property 7: Quote response time inclusion**
  // **Validates: Requirements 6.5**
  it('should include estimated response time for purchase follow-up in all generated quotes', () => {
    // Generator for valid RAM specifications
    const validRAMSpecArb = fc.record({
      type: fc.constantFrom('DDR3', 'DDR4', 'DDR5'),
      capacity: fc.constantFrom(1, 2, 4, 8, 16, 32, 64, 128),
      speed: fc.integer({ min: 800, max: 6400 }),
      brand: fc.constantFrom(
        'Corsair', 'G.Skill', 'Kingston', 'Crucial', 'Samsung', 
        'SK Hynix', 'Micron', 'ADATA', 'Team', 'Patriot', 'HyperX', 
        'Mushkin', 'GeIL'
      ),
      condition: fc.constantFrom('new', 'excellent', 'good', 'fair'),
      quantity: fc.integer({ min: 1, max: 100 })
    }).filter((spec) => {
      // Ensure speed is within valid range for the RAM type
      const speedRanges = {
        DDR3: { min: 800, max: 2133 },
        DDR4: { min: 1600, max: 3200 },
        DDR5: { min: 3200, max: 6400 }
      };
      const range = speedRanges[spec.type];
      return spec.speed >= range.min && spec.speed <= range.max;
    });

    fc.assert(
      fc.property(validRAMSpecArb, (spec) => {
        const quote = generateQuote(spec);
        
        // Property: Quote response time inclusion - timeline must be present and meaningful
        
        // 1. Timeline field must exist and be a string
        expect(quote.timeline).toBeDefined();
        expect(typeof quote.timeline).toBe('string');
        
        // 2. Timeline must not be empty
        expect(quote.timeline.length).toBeGreaterThan(0);
        expect(quote.timeline.trim().length).toBeGreaterThan(0);
        
        // 3. Timeline must contain response time information
        // Should include time-related keywords indicating when follow-up will occur
        const timelineText = quote.timeline.toLowerCase();
        const hasTimeReference = 
          timelineText.includes('hour') || 
          timelineText.includes('day') || 
          timelineText.includes('response') || 
          timelineText.includes('within') ||
          timelineText.includes('time');
        expect(hasTimeReference).toBe(true);
        
        // 4. Timeline should be contextually appropriate based on quantity
        // Single modules should have faster response times than bulk orders
        if (spec.quantity === 1) {
          // Should mention hours for single items
          expect(timelineText).toMatch(/hour/);
        } else if (spec.quantity > 10) {
          // Bulk orders should mention longer timeframes
          expect(timelineText).toMatch(/hour|day/);
        }
        
        // 5. Timeline should not contain placeholder or generic text
        expect(timelineText).not.toMatch(/tbd|todo|placeholder|xxx|pending/);
        
        // 6. Timeline should be properly formatted (no leading/trailing whitespace)
        expect(quote.timeline.trim()).toBe(quote.timeline);
        
        // 7. Timeline should be reasonably descriptive (not just a single word)
        expect(quote.timeline.split(' ').length).toBeGreaterThan(1);
      }),
      { numRuns: 100 }
    );
  });
});