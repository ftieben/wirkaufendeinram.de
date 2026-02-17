# Wir Kaufen Dein RAM

A humorous parody website that mimics wirkaufendeinauto.de but focuses on buying RAM (computer memory) instead of cars.

## Development

This project is built with [Astro](https://astro.build/) for optimal static site generation and performance.

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type check
npm run check

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
src/
├── components/     # Reusable UI components
├── layouts/        # Page templates
├── lib/           # Utilities, types, and business logic
├── pages/         # File-based routing
└── styles/        # CSS files
```

### Features

- 🚀 Static site generation with Astro
- 📱 Responsive design
- 🎯 RAM evaluation and pricing
- 📧 Form submission with email notifications
- 🛡️ Rate limiting and spam protection
- 💾 Data storage for follow-up communication
- ⚡ Optimized performance
- 🔍 SEO friendly

### Form Submission System

The site includes a complete form submission and notification system:

- **Client-side validation** with real-time feedback
- **Rate limiting** (3 submissions/hour per user)
- **Spam detection** with pattern matching
- **Email notifications** to your team
- **Data storage** for follow-up communication
- **Multiple deployment options** (PHP, Serverless)

For setup instructions, see:
- `INTEGRATION_GUIDE.md` - Quick start guide
- `SUBMISSION_SETUP.md` - Detailed configuration

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

The test suite includes:
- Unit tests for validation and pricing logic
- Property-based tests for correctness properties
- Build verification tests

## Legal Compliance

This site is designed as a parody that maintains legal compliance by:
- Using original content and copy
- Creating distinct branding
- Providing genuine RAM buying services
- Including appropriate legal disclaimers