# Form Submission and Notification System Setup

This document explains how to set up the form submission and notification system for the RAM buying site.

## Overview

The submission system includes:
- Client-side form submission handling with validation
- Rate limiting (3 submissions per hour per client)
- Spam detection
- Email notifications
- Data storage for follow-up communication
- Multiple deployment options (PHP, Serverless, etc.)

## Architecture

### Client-Side (`site/src/lib/submission.ts`)
- Handles form submission logic
- Implements rate limiting using localStorage
- Detects spam patterns
- Stores submissions locally for backup
- Communicates with backend API

### Backend Options

#### Option 1: PHP (For Apache Hosting) ✅ Recommended for Current Setup
Location: `site/public/api/submit-quote.php`

**Setup Steps:**

1. **Configure Email Settings**
   Edit `site/public/api/submit-quote.php`:
   ```php
   define('NOTIFICATION_EMAIL', 'your-team@example.com');
   define('FROM_EMAIL', 'noreply@yoursite.com');
   ```

2. **Create Data Directory**
   ```bash
   mkdir -p site/public/data
   chmod 755 site/public/data
   ```

3. **Test PHP Mail**
   ```bash
   php -r "mail('test@example.com', 'Test', 'Test message');"
   ```

4. **Deploy**
   The PHP file will be automatically deployed with your site to `/var/www/rambuying/api/submit-quote.php`

5. **Update Client Configuration**
   The client will automatically use `/api/submit-quote.php` as the endpoint.

**Requirements:**
- PHP 7.4 or higher
- `mail()` function enabled OR SMTP configured
- Write permissions for data directory

#### Option 2: Serverless Functions (For Cloud Hosting)
Location: `site/api/submit-quote.example.js`

**Supported Platforms:**
- Netlify Functions
- Vercel Serverless Functions
- AWS Lambda
- Cloudflare Workers

**Setup Steps:**

1. **Choose Your Platform**
   Copy the appropriate implementation from `submit-quote.example.js`

2. **Install Dependencies**
   ```bash
   npm install @sendgrid/mail
   # or
   npm install nodemailer
   ```

3. **Configure Environment Variables**
   ```bash
   SENDGRID_API_KEY=your_api_key
   NOTIFICATION_EMAIL=team@yourcompany.com
   FROM_EMAIL=noreply@yourcompany.com
   ```

4. **Deploy**
   Follow your platform's deployment instructions

## Email Service Options

### Option 1: PHP mail() (Simple, Built-in)
- Already configured in PHP implementation
- Works out of the box on most servers
- May have deliverability issues
- Good for testing and low-volume

### Option 2: SMTP (Better Deliverability)
For PHP, use PHPMailer:
```bash
composer require phpmailer/phpmailer
```

Update PHP script to use SMTP:
```php
use PHPMailer\PHPMailer\PHPMailer;

$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->Host = 'smtp.gmail.com';
$mail->SMTPAuth = true;
$mail->Username = 'your-email@gmail.com';
$mail->Password = 'your-app-password';
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
$mail->Port = 587;
```

### Option 3: SendGrid (Recommended for Production)
- Reliable email delivery
- Good analytics and tracking
- Free tier: 100 emails/day

**Setup:**
1. Sign up at https://sendgrid.com
2. Get API key
3. Use serverless implementation with SendGrid

### Option 4: Mailgun
- Similar to SendGrid
- Free tier: 5,000 emails/month

### Option 5: AWS SES
- Very cost-effective
- Requires AWS account
- Good for high volume

## Rate Limiting

### Client-Side (Implemented)
- 3 submissions per hour per browser
- Uses localStorage
- Can be cleared by user (not foolproof)

### Server-Side (Implemented in PHP)
- 3 submissions per hour per IP address
- Stored in JSON file
- More reliable than client-side

### Production Recommendations
For high-traffic sites, consider:
- Redis for distributed rate limiting
- IP-based blocking for repeat offenders
- CAPTCHA for additional protection

## Spam Protection

### Current Implementation
- Pattern matching for common spam keywords
- URL detection in text fields
- Repeated character detection

### Additional Options
1. **Google reCAPTCHA**
   ```html
   <script src="https://www.google.com/recaptcha/api.js"></script>
   <div class="g-recaptcha" data-sitekey="your-site-key"></div>
   ```

2. **hCaptcha** (Privacy-focused alternative)
   ```html
   <script src="https://js.hcaptcha.com/1/api.js"></script>
   <div class="h-captcha" data-sitekey="your-site-key"></div>
   ```

3. **Honeypot Fields** (Already easy to add)
   ```html
   <input type="text" name="website" style="display:none" />
   ```
   Reject if filled.

## Data Storage

### Current Implementation (PHP)
- JSON file storage in `site/public/data/submissions.json`
- Keeps last 100 submissions
- Simple and requires no database

### Production Recommendations

#### Option 1: MySQL/PostgreSQL
```php
$pdo = new PDO('mysql:host=localhost;dbname=rambuying', 'user', 'pass');
$stmt = $pdo->prepare('INSERT INTO submissions (data, created_at) VALUES (?, NOW())');
$stmt->execute([json_encode($submission)]);
```

#### Option 2: MongoDB
```javascript
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI);
await client.db('rambuying').collection('submissions').insertOne(submission);
```

#### Option 3: Firebase
```javascript
import { getFirestore, collection, addDoc } from 'firebase/firestore';
const db = getFirestore();
await addDoc(collection(db, 'submissions'), submission);
```

## Testing

### Test Form Submission

1. **Start Development Server**
   ```bash
   cd site
   npm run dev
   ```

2. **Fill Out Form**
   Navigate to http://localhost:4321 and fill out the evaluation form

3. **Accept Quote**
   Click "Accept This Quote" button

4. **Check Results**
   - Browser console for logs
   - `site/public/data/submissions.json` for stored data
   - Email inbox for notifications

### Test Rate Limiting

1. Submit 3 quotes quickly
2. Try to submit a 4th
3. Should see error: "Too many submissions"

### Test Spam Detection

1. Enter "viagra" or "casino" in name field
2. Submit form
3. Should be rejected as spam

### Clear Rate Limit (for testing)
```javascript
// In browser console
localStorage.removeItem('ram_submission_timestamps');
```

## Deployment Checklist

- [ ] Configure email settings (NOTIFICATION_EMAIL, FROM_EMAIL)
- [ ] Create data directory with proper permissions
- [ ] Test email delivery
- [ ] Test form submission end-to-end
- [ ] Test rate limiting
- [ ] Test spam detection
- [ ] Set up monitoring/logging
- [ ] Configure SSL/HTTPS
- [ ] Add CAPTCHA (optional but recommended)
- [ ] Set up database (optional, for production)
- [ ] Configure backup for submissions data

## Monitoring and Maintenance

### Log Files
- PHP errors: `/var/log/apache2/rambuying_error.log`
- Submissions: `site/public/data/submissions.json`
- Rate limits: `site/public/data/rate_limit.json`

### Regular Tasks
1. **Monitor submission logs** for spam patterns
2. **Check email delivery** rates
3. **Review rate limit data** for abuse
4. **Backup submissions** regularly
5. **Update spam patterns** as needed

### Troubleshooting

**Emails not sending:**
- Check PHP mail configuration: `php -i | grep mail`
- Check server mail logs: `tail -f /var/log/mail.log`
- Verify FROM_EMAIL is valid
- Try SMTP instead of mail()

**Rate limiting not working:**
- Check file permissions on data directory
- Verify JSON files are writable
- Check for PHP errors in logs

**Submissions not storing:**
- Check data directory exists and is writable
- Verify JSON is valid
- Check disk space

## Security Considerations

1. **Never store sensitive data in localStorage** (client-side)
2. **Always validate on server-side** (don't trust client)
3. **Use HTTPS** in production
4. **Sanitize all inputs** before storing/emailing
5. **Implement CSRF protection** for production
6. **Rate limit aggressively** to prevent abuse
7. **Monitor for unusual patterns** in submissions
8. **Keep PHP and dependencies updated**

## Future Enhancements

- [ ] Admin dashboard for viewing submissions
- [ ] Automated follow-up email sequences
- [ ] CRM integration (Salesforce, HubSpot, etc.)
- [ ] SMS notifications option
- [ ] Advanced analytics and reporting
- [ ] A/B testing for quote acceptance rates
- [ ] Multi-language support
- [ ] Payment processing integration

## Support

For issues or questions:
1. Check logs first
2. Review this documentation
3. Test in isolation (form, email, storage separately)
4. Check server configuration
5. Verify all dependencies are installed

## License

This submission system is part of the RAM buying site project.
