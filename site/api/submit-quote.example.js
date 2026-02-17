/**
 * Serverless Function Example for Quote Submission
 * 
 * This is an example implementation for various serverless platforms.
 * Choose the appropriate implementation based on your hosting provider.
 * 
 * Supported Platforms:
 * - Netlify Functions
 * - Vercel Serverless Functions
 * - AWS Lambda
 * - Cloudflare Workers
 */

// ============================================================================
// NETLIFY FUNCTIONS IMPLEMENTATION
// ============================================================================
// File: netlify/functions/submit-quote.js

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const submission = JSON.parse(event.body);
    
    // Validate submission data
    if (!submission.ramSpec || !submission.contact || !submission.quote) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid submission data' }),
      };
    }

    // Send email notification (using a service like SendGrid, Mailgun, etc.)
    await sendEmailNotification(submission);
    
    // Store in database (optional)
    await storeSubmission(submission);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Quote request submitted successfully',
        submissionId: submission.submissionId,
      }),
    };
  } catch (error) {
    console.error('Submission error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

// ============================================================================
// VERCEL SERVERLESS FUNCTIONS IMPLEMENTATION
// ============================================================================
// File: api/submit-quote.js

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const submission = req.body;
    
    // Validate submission data
    if (!submission.ramSpec || !submission.contact || !submission.quote) {
      return res.status(400).json({ error: 'Invalid submission data' });
    }

    // Send email notification
    await sendEmailNotification(submission);
    
    // Store in database (optional)
    await storeSubmission(submission);

    return res.status(200).json({
      success: true,
      message: 'Quote request submitted successfully',
      submissionId: submission.submissionId,
    });
  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ============================================================================
// SHARED HELPER FUNCTIONS
// ============================================================================

/**
 * Send email notification using SendGrid
 * Install: npm install @sendgrid/mail
 */
async function sendEmailNotification(submission) {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const { ramSpec, contact, quote } = submission;

  const msg = {
    to: process.env.NOTIFICATION_EMAIL, // Your team's email
    from: process.env.FROM_EMAIL, // Verified sender
    replyTo: contact.email,
    subject: `New RAM Quote Request - ${submission.submissionId}`,
    text: `
New RAM Quote Request

Submission ID: ${submission.submissionId}
Timestamp: ${submission.timestamp}

RAM Specifications:
- Type: ${ramSpec.type}
- Capacity: ${ramSpec.capacity} GB
- Speed: ${ramSpec.speed} MHz
- Brand: ${ramSpec.brand}
- Condition: ${ramSpec.condition}
- Quantity: ${ramSpec.quantity}

Quote Details:
- Estimated Value: $${quote.estimatedValue.toFixed(2)}
- Price Range: $${quote.priceRange.min.toFixed(2)} - $${quote.priceRange.max.toFixed(2)}
- Timeline: ${quote.timeline}

Contact Information:
- Name: ${contact.name}
- Email: ${contact.email}
- Phone: ${contact.phone}
- Preferred Contact: ${contact.preferredContact}
- Location: ${contact.location}

Next Steps:
${quote.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
    `,
    html: `
      <h2>New RAM Quote Request</h2>
      
      <p><strong>Submission ID:</strong> ${submission.submissionId}<br>
      <strong>Timestamp:</strong> ${submission.timestamp}</p>
      
      <h3>RAM Specifications</h3>
      <ul>
        <li><strong>Type:</strong> ${ramSpec.type}</li>
        <li><strong>Capacity:</strong> ${ramSpec.capacity} GB</li>
        <li><strong>Speed:</strong> ${ramSpec.speed} MHz</li>
        <li><strong>Brand:</strong> ${ramSpec.brand}</li>
        <li><strong>Condition:</strong> ${ramSpec.condition}</li>
        <li><strong>Quantity:</strong> ${ramSpec.quantity}</li>
      </ul>
      
      <h3>Quote Details</h3>
      <ul>
        <li><strong>Estimated Value:</strong> $${quote.estimatedValue.toFixed(2)}</li>
        <li><strong>Price Range:</strong> $${quote.priceRange.min.toFixed(2)} - $${quote.priceRange.max.toFixed(2)}</li>
        <li><strong>Timeline:</strong> ${quote.timeline}</li>
      </ul>
      
      <h3>Contact Information</h3>
      <ul>
        <li><strong>Name:</strong> ${contact.name}</li>
        <li><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></li>
        <li><strong>Phone:</strong> ${contact.phone}</li>
        <li><strong>Preferred Contact:</strong> ${contact.preferredContact}</li>
        <li><strong>Location:</strong> ${contact.location}</li>
      </ul>
      
      <h3>Next Steps</h3>
      <ol>
        ${quote.nextSteps.map(step => `<li>${step}</li>`).join('')}
      </ol>
    `,
  };

  await sgMail.send(msg);
  
  // Send confirmation email to customer
  const customerMsg = {
    to: contact.email,
    from: process.env.FROM_EMAIL,
    subject: 'Your RAM Quote Request - Confirmation',
    text: `
Dear ${contact.name},

Thank you for your RAM quote request!

We have received your request for:
- ${ramSpec.quantity}x ${ramSpec.capacity}GB ${ramSpec.type} ${ramSpec.speed}MHz (${ramSpec.brand})

Your estimated quote: $${quote.estimatedValue.toFixed(2)}

We will contact you via ${contact.preferredContact} within ${quote.timeline}.

Reference ID: ${submission.submissionId}

Best regards,
The RAM Buying Team
    `,
  };

  await sgMail.send(customerMsg);
}

/**
 * Store submission in database (example using MongoDB)
 * Install: npm install mongodb
 */
async function storeSubmission(submission) {
  // Example MongoDB implementation
  // const { MongoClient } = require('mongodb');
  // const client = new MongoClient(process.env.MONGODB_URI);
  // 
  // try {
  //   await client.connect();
  //   const db = client.db('rambuying');
  //   const collection = db.collection('submissions');
  //   await collection.insertOne(submission);
  // } finally {
  //   await client.close();
  // }

  // For now, just log
  console.log('Submission stored:', submission.submissionId);
}

// ============================================================================
// ENVIRONMENT VARIABLES REQUIRED
// ============================================================================
/*
SENDGRID_API_KEY=your_sendgrid_api_key
NOTIFICATION_EMAIL=team@yourcompany.com
FROM_EMAIL=noreply@yourcompany.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname (optional)
*/
