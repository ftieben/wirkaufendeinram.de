#!/bin/bash

# RAM Buying Site Deployment Script for Apache2
# Run this script as root or with sudo

set -e  # Exit on any error

echo "🎭 RAM Buying Site - Apache2 Deployment Script"
echo "=============================================="

# Configuration
SITE_NAME="rambuying"
DOMAIN="rambuying.local"  # Change this to your actual domain
APACHE_SITES_DIR="/etc/apache2/sites-available"
WEB_ROOT="/var/www/$SITE_NAME"
CURRENT_DIR=$(pwd)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root or with sudo"
   exit 1
fi

# Check if Apache2 is installed
if ! command -v apache2 &> /dev/null; then
    print_error "Apache2 is not installed. Please install it first:"
    echo "  Ubuntu/Debian: sudo apt update && sudo apt install apache2"
    echo "  CentOS/RHEL: sudo yum install httpd"
    exit 1
fi

# Check if required Apache modules are enabled
print_status "Checking Apache modules..."
a2enmod rewrite headers expires deflate ssl 2>/dev/null || {
    print_warning "Some modules might already be enabled or not available"
}

# Create web directory
print_status "Creating web directory: $WEB_ROOT"
mkdir -p "$WEB_ROOT"

# Copy built files
if [ -d "$CURRENT_DIR/site/dist" ]; then
    print_status "Copying built site files..."
    cp -r "$CURRENT_DIR/site/dist/"* "$WEB_ROOT/"
    
    # Create data directory for submissions
    print_status "Creating data directory for form submissions..."
    mkdir -p "$WEB_ROOT/data"
    chmod 755 "$WEB_ROOT/data"
    
    # Set proper permissions
    chown -R www-data:www-data "$WEB_ROOT"
    chmod -R 755 "$WEB_ROOT"
    
    # Ensure data directory is writable
    chmod 775 "$WEB_ROOT/data"
    
    print_status "Files copied successfully"
else
    print_error "Built site not found at $CURRENT_DIR/site/dist"
    print_error "Please run 'npm run build' in the site directory first"
    exit 1
fi

# Copy Apache configuration
if [ -f "$CURRENT_DIR/apache-config.conf" ]; then
    print_status "Installing Apache configuration..."
    cp "$CURRENT_DIR/apache-config.conf" "$APACHE_SITES_DIR/$SITE_NAME.conf"
    
    # Update the configuration with actual paths
    sed -i "s|/var/www/rambuying|$WEB_ROOT|g" "$APACHE_SITES_DIR/$SITE_NAME.conf"
    sed -i "s|rambuying.local|$DOMAIN|g" "$APACHE_SITES_DIR/$SITE_NAME.conf"
    
    print_status "Apache configuration installed"
else
    print_error "Apache configuration file not found at $CURRENT_DIR/apache-config.conf"
    exit 1
fi

# Enable the site
print_status "Enabling Apache site..."
a2ensite "$SITE_NAME.conf"

# Disable default site (optional)
read -p "Do you want to disable the default Apache site? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    a2dissite 000-default.conf
    print_status "Default site disabled"
fi

# Test Apache configuration
print_status "Testing Apache configuration..."
if apache2ctl configtest; then
    print_status "Apache configuration is valid"
else
    print_error "Apache configuration test failed"
    exit 1
fi

# Reload Apache
print_status "Reloading Apache..."
systemctl reload apache2

# Add to hosts file for local testing (if using .local domain)
if [[ "$DOMAIN" == *.local ]]; then
    if ! grep -q "$DOMAIN" /etc/hosts; then
        echo "127.0.0.1 $DOMAIN www.$DOMAIN" >> /etc/hosts
        print_status "Added $DOMAIN to /etc/hosts for local testing"
    fi
fi

# Final status
echo
echo "🎉 Deployment Complete!"
echo "======================"
echo "Site URL: http://$DOMAIN"
echo "Document Root: $WEB_ROOT"
echo "Apache Config: $APACHE_SITES_DIR/$SITE_NAME.conf"
echo "Log Files:"
echo "  - Error: /var/log/apache2/${SITE_NAME}_error.log"
echo "  - Access: /var/log/apache2/${SITE_NAME}_access.log"
echo

print_status "Next Steps:"
echo "1. Visit http://$DOMAIN to test your site"
echo "2. Configure SSL certificates for HTTPS (recommended)"
echo "3. Update DNS records to point to your server"
echo "4. Consider setting up automated deployments"

# Show Apache status
echo
print_status "Apache Status:"
systemctl status apache2 --no-pager -l