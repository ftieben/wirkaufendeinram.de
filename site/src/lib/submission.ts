/**
 * Form Submission Handler
 * Handles quote request submissions with validation and notification
 */

import type { RAMSpecification, SellerContact, QuoteResponse } from './types.js';

export interface QuoteSubmission {
  ramSpec: RAMSpecification;
  contact: SellerContact;
  quote: QuoteResponse;
  timestamp: string;
  submissionId: string;
}

export interface SubmissionResult {
  success: boolean;
  submissionId?: string;
  message: string;
  error?: string;
}

/**
 * Generate a unique submission ID
 */
function generateSubmissionId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `RAM-${timestamp}-${randomStr}`.toUpperCase();
}

/**
 * Rate limiting check using localStorage
 * Prevents spam by limiting submissions per time window
 */
function checkRateLimit(): { allowed: boolean; retryAfter?: number } {
  const RATE_LIMIT_KEY = 'ram_submission_timestamps';
  const MAX_SUBMISSIONS = 3; // Maximum submissions
  const TIME_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const timestamps: number[] = stored ? JSON.parse(stored) : [];
    const now = Date.now();

    // Remove timestamps outside the time window
    const recentTimestamps = timestamps.filter(ts => now - ts < TIME_WINDOW);

    if (recentTimestamps.length >= MAX_SUBMISSIONS) {
      const oldestTimestamp = Math.min(...recentTimestamps);
      const retryAfter = Math.ceil((oldestTimestamp + TIME_WINDOW - now) / 1000 / 60); // minutes
      return { allowed: false, retryAfter };
    }

    // Add current timestamp and save
    recentTimestamps.push(now);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentTimestamps));

    return { allowed: true };
  } catch (error) {
    // If localStorage is not available, allow the submission
    console.warn('Rate limiting unavailable:', error);
    return { allowed: true };
  }
}

/**
 * Basic spam detection
 * Checks for suspicious patterns in submission data
 */
function detectSpam(contact: SellerContact): boolean {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /viagra|cialis|casino|lottery|winner/i,
    /\b(http|https):\/\//gi, // URLs in name
    /(.)\1{10,}/, // Repeated characters
  ];

  const textToCheck = `${contact.name} ${contact.email} ${contact.location}`;

  return suspiciousPatterns.some(pattern => pattern.test(textToCheck));
}

/**
 * Store submission data locally
 * In production, this would send to a backend API
 */
function storeSubmission(submission: QuoteSubmission): void {
  try {
    const STORAGE_KEY = 'ram_submissions';
    const stored = localStorage.getItem(STORAGE_KEY);
    const submissions: QuoteSubmission[] = stored ? JSON.parse(stored) : [];

    // Keep only last 10 submissions to avoid storage limits
    if (submissions.length >= 10) {
      submissions.shift();
    }

    submissions.push(submission);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  } catch (error) {
    console.error('Failed to store submission locally:', error);
  }
}

/**
 * Send notification email
 * In production, this would call a backend API or serverless function
 */
async function sendNotification(submission: QuoteSubmission): Promise<boolean> {
  // In a real implementation, this would call your backend API
  // For now, we'll simulate the API call
  
  const apiEndpoint = '/api/submit-quote'; // This would be your actual API endpoint
  
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In production, you would do:
    // const response = await fetch(apiEndpoint, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(submission),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Failed to send notification');
    // }
    // 
    // return true;

    // For static site, log the submission details
    console.log('Quote submission ready for backend processing:', {
      submissionId: submission.submissionId,
      timestamp: submission.timestamp,
      contact: {
        name: submission.contact.name,
        email: submission.contact.email,
        preferredContact: submission.contact.preferredContact,
      },
      quote: {
        estimatedValue: submission.quote.estimatedValue,
        timeline: submission.quote.timeline,
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

/**
 * Submit a quote request
 * Main entry point for form submission
 */
export async function submitQuoteRequest(
  ramSpec: RAMSpecification,
  contact: SellerContact,
  quote: QuoteResponse
): Promise<SubmissionResult> {
  // Check rate limiting
  const rateLimitCheck = checkRateLimit();
  if (!rateLimitCheck.allowed) {
    return {
      success: false,
      message: `Too many submissions. Please try again in ${rateLimitCheck.retryAfter} minutes.`,
      error: 'RATE_LIMIT_EXCEEDED',
    };
  }

  // Check for spam
  if (detectSpam(contact)) {
    return {
      success: false,
      message: 'Your submission was flagged as suspicious. Please contact us directly.',
      error: 'SPAM_DETECTED',
    };
  }

  // Create submission object
  const submission: QuoteSubmission = {
    ramSpec,
    contact,
    quote,
    timestamp: new Date().toISOString(),
    submissionId: generateSubmissionId(),
  };

  // Store submission locally
  storeSubmission(submission);

  // Send notification
  const notificationSent = await sendNotification(submission);

  if (!notificationSent) {
    return {
      success: false,
      message: 'Failed to send notification. Please try again or contact us directly.',
      error: 'NOTIFICATION_FAILED',
    };
  }

  return {
    success: true,
    submissionId: submission.submissionId,
    message: 'Your quote request has been submitted successfully!',
  };
}

/**
 * Get submission history (for debugging/admin purposes)
 */
export function getSubmissionHistory(): QuoteSubmission[] {
  try {
    const STORAGE_KEY = 'ram_submissions';
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to retrieve submission history:', error);
    return [];
  }
}

/**
 * Clear rate limit (for testing purposes)
 */
export function clearRateLimit(): void {
  try {
    localStorage.removeItem('ram_submission_timestamps');
  } catch (error) {
    console.error('Failed to clear rate limit:', error);
  }
}
