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
      
      expect(result1.submissionId).not.toBe(result2.submissionId);
    });


    it('should enforce rate limiting', async () => {
      // Submit 3 times (the limit)
      await submitQuoteRequest(sampleRAMSpec, sampleContact, sampleQuote);
      await submitQuoteRequest(sampleRAMSpec, sampleContact, sampleQuote);
      await submitQuoteRequest(sampleRAMSpec, sampleContact, sampleQuote);
      
      // 4th submission should be rate limited
      const result = await submitQuoteRequest(sampleRAMSpec, sampleContact, sampleQuote);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('RATE_LIMIT_EXCEEDED');
      expect(result.message).toContain('Too many submissions');
    });

    it('should detect spam in contact information', async () => {
      const spamContact: SellerContact = {
        ...sampleContact,
        name: 'Buy viagra now!',
      };
      
      const result = await submitQuoteRequest(sampleRAMSpec, spamContact, sampleQuote);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('SPAM_DETECTED');
    });

    it('should detect URLs in contact fields', async () => {
      const spamContact: SellerContact = {
        ...sampleContact,
        location: 'Visit http://spam.com for deals',
      };
      
      const result = await submitQuoteRequest(sampleRAMSpec, spamContact, sampleQuote);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('SPAM_DETECTED');
    });
  });

  describe('Rate Limiting', () => {
    it('should allow submissions after clearing rate limit', async () => {
      // Fill up rate limit
      await submitQuoteRequest(sampleRAMSpec, sampleContact, sampleQuote);
      await submitQuoteRequest(sampleRAMSpec, sampleContact, sampleQuote);
      await submitQuoteRequest(sampleRAMSpec, sampleContact, sampleQuote);
      
      // Clear and try again
      clearRateLimit();
      const result = await submitQuoteRequest(sampleRAMSpec, sampleContact, sampleQuote);
      
      expect(result.success).toBe(true);
    });
  });

  describe('Submission Storage', () => {
    it('should store submissions in localStorage', async () => {
      await submitQuoteRequest(sampleRAMSpec, sampleContact, sampleQuote);
      
      const stored = localStorage.getItem('ram_submissions');
      expect(stored).toBeDefined();
      
      const submissions = JSON.parse(stored!);
      expect(submissions).toHaveLength(1);
      expect(submissions[0].ramSpec).toEqual(sampleRAMSpec);
      expect(submissions[0].contact).toEqual(sampleContact);
    });

    it('should limit stored submissions to 10', async () => {
      // Submit 12 times
      for (let i = 0; i < 12; i++) {
        clearRateLimit();
        await submitQuoteRequest(sampleRAMSpec, sampleContact, sampleQuote);
      }
      
      const stored = localStorage.getItem('ram_submissions');
      const submissions = JSON.parse(stored!);
      
      expect(submissions).toHaveLength(10);
    }, 15000); // Increase timeout to 15 seconds
  });
});
