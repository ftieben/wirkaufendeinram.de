import { describe, it, expect } from 'vitest';
import { generateQuote } from '../src/lib/pricing';
import type { RAMSpecification } from '../src/lib/types';

/**
 * Integration tests for enhanced quote display functionality
 * Tests the enhancements made to task 5: Enhance quote display functionality
 */

describe('Enhanced Quote Display Functionality', () => {
  const validRAMSpec: RAMSpecification = {
    type: 'DDR4',
    capacity: 16,
    speed: 3200,
    brand: 'Corsair',
    condition: 'excellent',
    quantity: 2
  };

  it('should generate quotes with proper currency-ready values', () => {
    const quote = generateQuote(validRAMSpec);
    
    // Test that values are properly formatted for currency display
    expect(quote.estimatedValue).toBeGreaterThan(0);
    expect(typeof quote.estimatedValue).toBe('number');
    expect(Number.isFinite(quote.estimatedValue)).toBe(true);
    
    // Test that price range is logical for currency display
    expect(quote.priceRange.min).toBeGreaterThan(0);
    expect(quote.priceRange.max).toBeGreaterThan(quote.priceRange.min);
    expect(typeof quote.priceRange.min).toBe('number');
    expect(typeof quote.priceRange.max).toBe('number');
    
    // Values should be rounded to 2 decimal places for currency
    expect(quote.estimatedValue).toBe(Math.round(quote.estimatedValue * 100) / 100);
    expect(quote.priceRange.min).toBe(Math.round(quote.priceRange.min * 100) / 100);
    expect(quote.priceRange.max).toBe(Math.round(quote.priceRange.max * 100) / 100);
  });

  it('should display all required quote elements prominently', () => {
    const quote = generateQuote(validRAMSpec);
    
    // Verify all required elements are present for prominent display
    expect(quote.estimatedValue).toBeDefined();
    expect(quote.priceRange).toBeDefined();
    expect(quote.priceRange.min).toBeDefined();
    expect(quote.priceRange.max).toBeDefined();
    expect(quote.timeline).toBeDefined();
    expect(quote.factors).toBeDefined();
    expect(quote.nextSteps).toBeDefined();
    
    // Verify elements have meaningful content
    expect(quote.estimatedValue).toBeGreaterThan(0);
    expect(quote.factors.length).toBeGreaterThan(0);
    expect(quote.nextSteps.length).toBeGreaterThan(0);
    expect(quote.timeline.length).toBeGreaterThan(0);
    
    // Verify factors are descriptive
    quote.factors.forEach(factor => {
      expect(typeof factor).toBe('string');
      expect(factor.length).toBeGreaterThan(5); // Should be descriptive
    });
    
    // Verify next steps are clear and actionable
    quote.nextSteps.forEach(step => {
      expect(typeof step).toBe('string');
      expect(step.length).toBeGreaterThan(10); // Should be descriptive
    });
  });

  it('should include estimated response time for purchase follow-up', () => {
    const quote = generateQuote(validRAMSpec);
    
    // Verify timeline is present and contains response time information
    expect(quote.timeline).toBeDefined();
    expect(typeof quote.timeline).toBe('string');
    expect(quote.timeline.length).toBeGreaterThan(0);
    
    // Timeline should contain time-related keywords
    const timelineText = quote.timeline.toLowerCase();
    const hasTimeReference = 
      timelineText.includes('hour') || 
      timelineText.includes('day') || 
      timelineText.includes('response') || 
      timelineText.includes('within');
    
    expect(hasTimeReference).toBe(true);
  });

  it('should provide clear next steps in the quote workflow', () => {
    const quote = generateQuote(validRAMSpec);
    
    // Verify next steps are comprehensive and clear
    expect(quote.nextSteps).toBeDefined();
    expect(Array.isArray(quote.nextSteps)).toBe(true);
    expect(quote.nextSteps.length).toBeGreaterThan(0);
    
    // Each step should be clear and actionable
    quote.nextSteps.forEach((step, index) => {
      expect(typeof step).toBe('string');
      expect(step.length).toBeGreaterThan(10); // Should be descriptive
      expect(step.trim()).toBe(step); // No leading/trailing whitespace
      
      // Steps should form a logical workflow
      if (index === 0) {
        expect(step.toLowerCase()).toMatch(/review|evaluate|assess/);
      }
    });
    
    // Should include key workflow elements
    const allSteps = quote.nextSteps.join(' ').toLowerCase();
    expect(allSteps).toMatch(/review|verify|offer|contact|arrange/);
  });

  it('should handle different quantities with appropriate response times', () => {
    // Test single module
    const singleSpec: RAMSpecification = { ...validRAMSpec, quantity: 1 };
    const singleQuote = generateQuote(singleSpec);
    
    // Test bulk modules
    const bulkSpec: RAMSpecification = { ...validRAMSpec, quantity: 15 };
    const bulkQuote = generateQuote(bulkSpec);
    
    // Single modules should have faster response times
    expect(singleQuote.timeline).toMatch(/2-4 hours/);
    
    // Bulk orders should have longer response times
    expect(bulkQuote.timeline).toMatch(/8-24 hours|bulk/);
    
    // Both should have valid timelines
    expect(singleQuote.timeline.length).toBeGreaterThan(0);
    expect(bulkQuote.timeline.length).toBeGreaterThan(0);
  });

  it('should generate quotes that support contact preference workflows', () => {
    const quote = generateQuote(validRAMSpec);
    
    // Quote should contain information that supports follow-up communication
    expect(quote.timeline).toBeDefined();
    expect(quote.nextSteps).toBeDefined();
    
    // Timeline should be specific enough to set expectations
    expect(quote.timeline).toMatch(/\d+/); // Should contain numbers (hours/days)
    
    // Next steps should include communication-related actions
    const allSteps = quote.nextSteps.join(' ').toLowerCase();
    expect(allSteps).toMatch(/contact|reach|communicate|offer|follow/);
  });
});