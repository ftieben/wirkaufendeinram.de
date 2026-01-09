# 🎭 RAM Buying Site - Apache2 Hosting Guide

This guide will help you deploy your RAM buying parody site using Apache2.

## Prerequisites

- Ubuntu/Debian server with Apache2 installed
- Root or sudo access
- Domain name (optional, can use localhost for testing)

## Quick Deployment

### 1. Install Apache2 (if not already installed)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install apache2

# Enable and start Apache
sudo systemctl enable apache2
sudo systemctl start apache2
```

### 2. Build the Site

```bash
cd site
npm install
npm run build
```

### 3. Deploy Using the Script

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment script
sudo ./deploy.sh
```

The script will:
- ✅ Copy built files to `/var/www/rambuying`
- ✅ Install Apache configuration
- ✅ Enable required Apache modules
- ✅ Set proper permissions
- ✅ Enable the site
- ✅ Test configuration
- ✅ Reload Apache

### 4. Test Your Site

Visit `http://rambuying.local` (or your configured domain) to see your site!

## Manual Deployment (Alternative)

If you prefer to deploy manually:

### 1. Copy Files

```bash
# Build the site first
cd site && npm run build

# Copy to web directory
sudo mkdir -p /var/www/rambuying
sudo cp -r site/dist/* /var/www/rambuying/
sudo chown -R www-data:www-data /var/www/rambuying
sudo chmod -R 755 /var/www/rambuying
```

### 2. Configure Apache

```bash
# Copy the configuration
sudo cp apache-config.conf /etc/apache2/sites-available/rambuying.conf

# Enable required modules
sudo a2enmod rewrite headers expires deflate

# Enable the site
sudo a2ensite rambuying.conf

# Test configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2
```

### 3. Configure Domain (Local Testing)

```bash
# Add to hosts file for local testing
echo "127.0.0.1 rambuying.local www.rambuying.local" | sudo tee -a /etc/hosts
```

## Production Considerations

### SSL/HTTPS Setup

1. **Get SSL Certificate** (Let's Encrypt recommended):
```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com
```

2. **Update Apache Config**: Uncomment the SSL virtual host section in the config file

### Security Enhancements

1. **Firewall Configuration**:
```bash
sudo ufw allow 'Apache Full'
sudo ufw enable
```

2. **Hide Apache Version**:
```bash
echo "ServerTokens Prod" | sudo tee -a /etc/apache2/apache2.conf
echo "ServerSignature Off" | sudo tee -a /etc/apache2/apache2.conf
```

3. **Regular Updates**:
```bash
sudo apt update && sudo apt upgrade
```

### Performance Optimization

1. **Enable HTTP/2** (requires SSL):
```bash
sudo a2enmod http2
```

2. **Configure Caching**: The provided config already includes caching headers

3. **Monitor Logs**:
```bash
# Error logs
sudo tail -f /var/log/apache2/rambuying_error.log

# Access logs
sudo tail -f /var/log/apache2/rambuying_access.log
```

## File Structure

After deployment, your file structure will be:

```
/var/www/rambuying/
├── index.html              # Homepage
├── contact/
│   └── index.html         # Contact page
├── help/
│   └── index.html         # Help & FAQ page
├── privacy/
│   └── index.html         # Privacy policy
├── process/
│   └── index.html         # How it works page
├── terms/
│   └── index.html         # Terms of service
├── _astro/                # CSS and JS assets
├── favicon.svg            # Site icon
└── .htaccess             # Apache configuration
```

## Troubleshooting

### Common Issues

1. **403 Forbidden Error**:
   - Check file permissions: `sudo chmod -R 755 /var/www/rambuying`
   - Check ownership: `sudo chown -R www-data:www-data /var/www/rambuying`

2. **404 Not Found for Clean URLs**:
   - Ensure mod_rewrite is enabled: `sudo a2enmod rewrite`
   - Check .htaccess file exists and is readable

3. **Apache Won't Start**:
   - Test configuration: `sudo apache2ctl configtest`
   - Check error logs: `sudo journalctl -u apache2`

4. **Site Not Loading**:
   - Check Apache status: `sudo systemctl status apache2`
   - Verify port 80/443 are open: `sudo netstat -tlnp | grep :80`

### Useful Commands

```bash
# Restart Apache
sudo systemctl restart apache2

# Check Apache status
sudo systemctl status apache2

# Test configuration
sudo apache2ctl configtest

# View enabled sites
sudo a2ensite

# View enabled modules
sudo a2enmod
```

## Updating the Site

To update your site with new changes:

1. Build the updated site:
```bash
cd site
npm run build
```

2. Copy new files:
```bash
sudo cp -r site/dist/* /var/www/rambuying/
sudo chown -R www-data:www-data /var/www/rambuying
```

3. Clear browser cache or use hard refresh (Ctrl+F5)

## Support

If you encounter issues:

1. Check Apache error logs: `/var/log/apache2/rambuying_error.log`
2. Verify all files are in place: `ls -la /var/www/rambuying`
3. Test Apache configuration: `sudo apache2ctl configtest`
4. Ensure all required modules are enabled

Your RAM buying parody site should now be live and ready to accept those sweet, sweet memory modules! 🎭💾