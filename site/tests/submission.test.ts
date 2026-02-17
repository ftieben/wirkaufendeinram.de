import { describe, it, expect, beforeEach } from 'vitest';
import { submitQuoteRequest, clearRateLimit, getSubmissionHistory } from '../src/lib/submission';
import type { RAMSpecification, SellerContact, QuoteResponse } from '../src/lib/types';

describe('Form Submission System', () => {
  // Sample test data
  const sampleRAMSpec: RAMSpecification = {
    type: 'DDR4',
    capacity: 16,
    speed: 3200,
    brand: 'Corsair',
    condition: 'excellent',
    quantity: 2,
  };

  const sampleContact: SellerContact = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-1234',
    preferredContact: 'email',
    location: 'San Francisco, CA',
  };

  const sampleQuote: QuoteResponse = {
    estimatedValue: 120.50,
    priceRange: { min: 110.00, max: 130.00 },
    factors: ['DDR4 premium', 'Excellent condition'],
    timeline: '24-48 hours',
    nextSteps: ['Review quote', 'Contact seller'],
  };

  beforeEach(() => {
    // Clear rate limit before each test
    clearRateLimit();
    // Clear localStorage
    localStorage.clear();
  });

  describe('submitQuoteRequest', () => {
    it('should successfully submit a valid quote request', async () => {
      const result = await submitQuoteRequest(sampleRAMSpec, sampleContact, sampleQuote);
      
      expect(result.success).toBe(true);
      expect(result.submissionId).toBeDefined();
      expect(result.submissionId).toMatch(/^RAM-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(result.message).toContain('successfully');
    });

    it('should generate unique submission IDs', async () => {
      const result1 = await submitQuoteRequest(sampleRAMSpec, sampleContact, sampleQuote);
      clearRateLimit(); // Allow second submission
      const result2 = await submitQuoteRequest(sampleRAMSpec, sampleContact, sampleQuote);
      
      expect(result1.submissionId).not.toBe(res