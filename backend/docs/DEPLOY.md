# Deployment Guide

This guide describes how to deploy the PDR Website backend from scratch.

## Prerequisites

- **Node.js**: v18+
- **MongoDB**: v5+ (Local or Atlas)
- **PNPM**: Recommended package manager

## 1. Environment Configuration

Copy the example configuration file:

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:

```env
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

# Database
MONGO_URI=mongodb://localhost:27017/pdr-website

# Security
JWT_SECRET=your-super-secure-secret-key-at-least-32-chars
JWT_EXPIRES_IN=7d

# Cors
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-backend-domain.com/api

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# LiqPay Payment Integration
# For sandbox/testing use sandbox_ prefixed keys
# For production use your production keys from LiqPay dashboard
LIQPAY_PUBLIC_KEY=sandbox_i76442899394
LIQPAY_PRIVATE_KEY=sandbox_iltbnxnwzQ5jsIKABtF6Fs3PSCvrz9jpnJR1VPIZ
```

> [!IMPORTANT]
> Ensure `JWT_SECRET` is strong and generated using a secure random generator.

> [!WARNING]
> Never commit production LiqPay keys to version control. Use environment variables or secrets management.

## 2. Installation

Install dependencies:

```bash
pnpm install
```

## 3. Building

Build the application for production:

```bash
pnpm build
```

This will create a `.output` directory with the compiled server.

## 4. Running

Start the server:

```bash
node .output/server/index.mjs
```

Or using PM2 (recommended for production):

```bash
pm2 start .output/server/index.mjs --name "pdr-backend"
```

## 5. LiqPay Payment Integration

### Overview

The payment system uses LiqPay (https://www.liqpay.ua/) for processing payments. The integration supports:

- Checkout flow with redirect to LiqPay payment page
- Server-to-server callbacks for payment status updates
- Sandbox mode for testing

### Configuration

1. Create an account at https://www.liqpay.ua/
2. Get your API keys from the dashboard
3. For testing, use sandbox keys (prefixed with `sandbox_`)
4. Set the keys in your `.env` file

### API Endpoints

- `POST /api/payment/checkout` - Create a new checkout session
- `POST /api/payment/liqpay-callback` - Server-to-server callback from LiqPay
- `GET /api/payment/status?orderId=<id>` - Check order status

### Callback URL

Make sure your server is accessible from the internet for LiqPay callbacks.
The callback URL is: `https://your-backend-domain.com/api/payment/liqpay-callback`

### Testing

Use sandbox credentials for testing:
- Public Key: `sandbox_i76442899394`
- Private Key: `sandbox_iltbnxnwzQ5jsIKABtF6Fs3PSCvrz9jpnJR1VPIZ`

In sandbox mode, use test card numbers provided by LiqPay documentation.

## 6. Database Backup

To configure automatic backups, you can add a cron job that runs the backup script:

```bash
# Run backup every day at 3 AM
0 3 * * * cd /path/to/backend && /usr/bin/node scripts/backup-db.ts >> logs/backup.log 2>&1
```

## 7. Project Structure

- `config/`: Configuration validation (Zod)
- `models/`: MongoDB schemas and models
- `services/`: Business logic
  - `liqpay.service.ts`: LiqPay payment integration
  - `payment.service.ts`: Order management and payment processing
- `api/`: API endpoints (Nitro handlers)
  - `payment/`: Payment-related endpoints
- `utils/`: Shared utilities (logger, db connection, etc.)
- `middleware/`: Request processing (auth, rate limiting)

## Troubleshooting

- **Connection Error**: Check `MONGO_URI` in `.env`.
- **Auth Error**: Check `JWT_SECRET` consistency.
- **Rate Limit**: Check `RATE_LIMIT_*` variables if users are getting 429 errors.
- **Payment Error**: Verify LiqPay keys are correct and the callback URL is accessible.
- **Callback Not Received**: Ensure your server is publicly accessible and the `BACKEND_URL` is correctly set.