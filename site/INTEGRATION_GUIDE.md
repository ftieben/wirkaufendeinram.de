# Form Submission Integration Guide

## Quick Start

The form submission system is now integrated into the RAM buying site. Here's what you need to know:

## What's Included

### 1. Client-Side Submission Handler (`src/lib/submission.ts`)
- ✅ Form submission with validation
- ✅ Rate limiting (3 submissions/hour per browser)
- ✅ Spam detection
- ✅ Local storage backup
- ✅ Unique submission ID generation

### 2. Server-Side API Endpoint (`public/api/submit-quote.php`)
- ✅ PHP endpoint for Apache hosting
- ✅ Server-side rate limiting (3 submissions/hour per IP)
- ✅ Email notifications
- ✅ Data storage in JSON files
- ✅ Spam protection

### 3. Updated Form Component (`src/components/EvaluationForm.astro`)
- ✅ Integrated submission handling
- ✅ Enhanced user feedback
- ✅ Submission ID display
- ✅ Error handling

## Configuration Required

### Step 1: Configure Email Settings

Edit `site/public/api/submit-quote.php` (lines 18-19):

```php
define('NOTIFICATION_EMAIL', 'your-team@example.com'); // ← Change this!
define('FROM_EMAIL', 'noreply@yoursite.com');          // ← Change this!
```

### Step 2: Deploy

Run the deployment script:

```bash
sudo ./deploy.sh
```

The script will automatically:
- Create the data directory
- Set proper permissions
- Deploy all files including the API endpoint

### Step 3: Test

1. Visit your site: `http://rambuying.local`
2. Fill out the evaluation form
3. Click "Get My Quote"
4. Click "Accept This Quote"
5. Check your email for the notification

## How It Works

### User Flow

1. **User fills out form** → Client-side validation
2. **User gets quote** → Price calculation
3. **User accepts quote** → Submission process begins
4. **Rate limit check** → Prevents spam (client + server)
5. **Spam detection** → Filters suspicious submissions
6. **Data storage** → Saved to JSON file
7. **Email sent** → Notification to team
8. **Confirmation shown** → User sees success message with reference ID

### Data Flow

```
Browser (EvaluationForm.astro)
    ↓
Client Library (submission.ts)
    ↓ POST /api/submit-quote
PHP API (submit-quote.php)
    ↓
Email Service (mail())
    ↓
Data Storage (submissions.json)
```

## Features

### Rate Limiting

**Client-Side:**
- 3 submissions per hour per browser
- Stored in localStorage
- Can be bypassed by clearing browser data

**Server-Side:**
- 3 submissions per hour per IP address
- Stored in `data/rate_limit.json`
- More reliable protection

### Spam Detection

Automatically rejects submissions containing:
- Common spam keywords (viagra, casino, lottery, etc.)
- URLs in name/location fields
- Excessive repeated characters

### Data Storage

Submissions are stored in `public/data/submissions.json`:
- Keeps last 100 submissions
- Includes all form data
- Includes quote details
- Timestamped with submission ID

### Email Notifications

Two emails are sent:
1. **Team notification** - Full submission details
2. **Customer confirmation** - Quote acceptance confirmation

## Testing

### Test Successful Submission

```bash
# 1. Start dev server
cd site
npm run dev

# 2. Open browser to http://localhost:4321
# 3. Fill out form and accept quote
# 4. Check console for logs
# 5. Check site/public/data/submissions.json
```

### Test Rate Limiting

```bash
# Submit 3 quotes quickly
# Try to submit a 4th
# Should see: "Too many submissions. Please try again in X minutes."
```

### Test Spam Detection

```bash
# Enter "viagra" in the name field
# Submit form
# Should see: "Your submission was flagged as suspicious"
```

### Clear Rate Limit (for testing)

In browser console:
```javascript
localStorage.removeItem('ram_submission_timestamps');
```

## File Structure

```
site/
├── src/
│   ├── lib/
│   │   └── submission.ts          # Client-side submission logic
│   └── components/
│       └── EvaluationForm.astro   # Form with integrated submission
├── public/
│   ├── api/
│   │   └── submit-quote.php       # PHP API endpoint
│   ├── data/                      # Created on deployment
│   │   ├── submissions.json       # Stored submissions
│   │   └── rate_limit.json        # Rate limit tracking
│   └── .htaccess                  # Apache routing config
├── api/
│   └── submit-quote.example.js    # Serverless examples
├── SUBMISSION_SETUP.md            # Detailed setup guide
└── INTEGRATION_GUIDE.md           # This file
```

## Troubleshooting

### Emails Not Sending

**Check PHP mail configuration:**
```bash
php -i | grep mail
```

**Check mail logs:**
```bash
tail -f /var/log/mail.log
```

**Solution:** Configure SMTP or use a service like SendGrid

### Submissions Not Storing

**Check data directory permissions:**
```bash
ls -la /var/www/rambuying/data
```

**Should show:**
```
drwxrwxr-x www-data www-data data
```

**Fix permissions:**
```bash
sudo chmod 775 /var/www/rambuying/data
sudo chown www-data:www-data /var/www/rambuying/data
```

### Rate Limiting Not Working

**Check rate limit file:**
```bash
cat /var/www/rambuying/data/rate_limit.json
```

**Clear rate limits:**
```bash
sudo rm /var/www/rambuying/data/rate_limit.json
```

### API Endpoint Not Found (404)

**Check .htaccess is deployed:**
```bash
ls -la /var/www/rambuying/.htaccess
```

**Check mod_rewrite is enabled:**
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

## Production Checklist

- [ ] Update NOTIFICATION_EMAIL in PHP file
- [ ] Update FROM_EMAIL in PHP file
- [ ] Test email delivery
- [ ] Test form submission end-to-end
- [ ] Configure SSL/HTTPS
- [ ] Set up proper SMTP (recommended)
- [ ] Add CAPTCHA (optional but recommended)
- [ ] Set up monitoring for submissions
- [ ] Configure automated backups
- [ ] Review and adjust rate limits
- [ ] Test on mobile devices
- [ ] Load test the submission endpoint

## Next Steps

### Immediate
1. Configure email settings
2. Deploy and test
3. Monitor first few submissions

### Short Term
1. Set up proper SMTP service
2. Add CAPTCHA for extra protection
3. Create admin dashboard for viewing submissions

### Long Term
1. Integrate with CRM
2. Set up automated follow-up emails
3. Add analytics and reporting
4. Consider database instead of JSON files

## Support

For detailed setup instructions, see `SUBMISSION_SETUP.md`

For deployment help, see `HOSTING_GUIDE.md`

For general questions, check the logs:
- Apache errors: `/var/log/apache2/rambuying_error.log`
- PHP errors: Check Apache error log
- Submissions: `public/data/submissions.json`
