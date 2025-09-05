# 🚀 Omise Payment Gateway Integration Guide

## 📋 Overview

คู่มือการใช้งาน Omise Payment Gateway สำหรับระบบ Malai Resort
ระบบนี้รองรับการชำระเงินผ่านบัตรเครดิต, Internet Banking, และ Digital Wallets

## 🔑 Prerequisites

### 1. Omise Account
- สมัครบัญชีที่ [omise.co](https://omise.co)
- ยืนยันตัวตนและข้อมูลธุรกิจ
- รอการอนุมัติจาก Omise

### 2. API Keys
```
Public Key: pk_test_xxxxxxxxxxxxxxxxxxxxx
Secret Key: sk_test_xxxxxxxxxxxxxxxxxxxxx
Webhook Secret: whsec_xxxxxxxxxxxxxxxxxxxxx
```

### 3. Environment Setup
```bash
# Copy environment template
cp omise.env.template .env

# Fill in your credentials
OMISE_PUBLIC_KEY=pk_test_your_key_here
OMISE_SECRET_KEY=sk_test_your_key_here
OMISE_WEBHOOK_SECRET=whsec_your_secret_here
```

## 🏗️ Architecture

### Payment Flow
```
1. Guest enters card details → Frontend
2. Frontend creates Omise token → Omise.js
3. Frontend sends token to backend → API
4. Backend creates charge → Omise API
5. Omise processes payment → Webhook
6. Backend updates booking status → Database
7. Guest receives confirmation → Email/SMS
```

### Security Layers
```
┌─────────────────────────────────────┐
│           Rate Limiting             │
├─────────────────────────────────────┤
│         Fraud Detection             │
├─────────────────────────────────────┤
│      Input Validation               │
├─────────────────────────────────────┤
│    Signature Verification           │
├─────────────────────────────────────┤
│         Database Security           │
└─────────────────────────────────────┘
```

## 🔧 Configuration

### Environment Variables
```env
# Required
OMISE_PUBLIC_KEY=pk_test_...
OMISE_SECRET_KEY=sk_test_...
OMISE_WEBHOOK_SECRET=whsec_...

# Optional
OMISE_ENVIRONMENT=test
PAYMENT_CURRENCY=THB
OMISE_TIMEOUT=30000
OMISE_RETRY_ATTEMPTS=3
FRONTEND_URL=https://yourdomain.com
```

### Webhook Configuration
```
URL: https://yourdomain.com/api/v1/webhooks/omise
Events: charge.create, charge.complete, charge.failed
Secret: whsec_your_secret_here
```

## 💳 Payment Methods

### 1. Credit/Debit Cards
- **Visa**: 4242424242424242
- **MasterCard**: 5555555555554444
- **JCB**: 3566111111111113

### 2. Internet Banking
- ธนาคารกรุงเทพ
- ธนาคารกสิกรไทย
- ธนาคารไทยพาณิชย์

### 3. Digital Wallets
- True Money
- PromptPay
- Rabbit LINE Pay
- GrabPay

## 📱 Frontend Integration

### 1. Install Omise.js
```bash
npm install omise-js
```

### 2. Payment Form
```jsx
import { OmiseCard } from 'omise-js';

const PaymentForm = ({ bookingId, amount }) => {
  const handleSubmit = async (cardData) => {
    try {
      // Create Omise token
      const token = await OmiseCard.createToken(cardData);
      
      // Send to backend
      const response = await fetch('/api/v1/payments/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          omiseToken: token.id,
          amount: amount * 100 // Convert to satang
        })
      });
      
      const result = await response.json();
      if (result.success) {
        // Handle success
      }
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Card input fields */}
    </form>
  );
};
```

### 3. Card Input Fields
```jsx
const cardFields = {
  card: {
    name: 'Card Number',
    placeholder: '1234 5678 9012 3456',
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  },
  expiry: {
    placeholder: 'MM/YY',
  },
  cvc: {
    placeholder: 'CVC',
  },
};
```

## 🔒 Security Features

### 1. Webhook Signature Verification
```typescript
// Backend automatically verifies all webhooks
const isValid = omiseService.verifyWebhookSignature(payload, signature);
```

### 2. Rate Limiting
- Payment creation: 10 requests per 15 minutes
- Webhook: 100 requests per minute

### 3. Fraud Detection
- IP address validation
- User agent analysis
- Amount pattern detection
- Geographic risk assessment

### 4. Input Validation
- UUID validation for IDs
- Amount range checking (1-100,000 THB)
- Currency validation (THB only)

## 📊 Testing

### Test Cards
```
Card Number: 4242424242424242
Expiry: 12/25
CVV: 123
Amount: 1000 (10.00 THB)
```

### Test Scenarios
1. **Successful Payment**
   - Use valid test card
   - Check webhook delivery
   - Verify database update

2. **Failed Payment**
   - Use invalid card (4000000000000002)
   - Check error handling
   - Verify webhook delivery

3. **Expired Payment**
   - Use expired card
   - Check timeout handling

### Webhook Testing
```bash
# Test webhook locally
ngrok http 3001

# Update webhook URL in Omise dashboard
https://your-ngrok-url.ngrok.io/api/v1/webhooks/omise
```

## 🚨 Error Handling

### Common Errors
```typescript
// Invalid card
{
  "error_code": "invalid_card",
  "message": "The card information is invalid"
}

// Insufficient funds
{
  "error_code": "insufficient_fund",
  "message": "The card has insufficient funds"
}

// Expired card
{
  "error_code": "expired_card",
  "message": "The card has expired"
}
```

### Error Response Format
```typescript
{
  success: false,
  message: 'Payment failed',
  error: 'INSUFFICIENT_FUND',
  details: {
    omiseErrorCode: 'insufficient_fund',
    omiseMessage: 'The card has insufficient funds'
  }
}
```

## 📈 Monitoring

### 1. Omise Dashboard
- Monitor payment success rates
- Check webhook delivery status
- View transaction logs

### 2. Application Logs
```typescript
// Payment creation
🔐 [Omise] POST /charges

// Webhook processing
✅ [Omise] 200 /webhooks/omise

// Error handling
❌ [Omise] Failed to create charge: insufficient_fund
```

### 3. Database Monitoring
- Payment status tracking
- Webhook event logging
- Audit trail maintenance

## 🔄 Production Deployment

### 1. Environment Switch
```env
OMISE_ENVIRONMENT=live
OMISE_PUBLIC_KEY=pk_live_...
OMISE_SECRET_KEY=sk_live_...
OMISE_WEBHOOK_SECRET=whsec_live_...
```

### 2. SSL Certificate
- Ensure HTTPS is enabled
- Valid SSL certificate required
- Webhook URLs must use HTTPS

### 3. Monitoring Setup
- Set up webhook failure alerts
- Monitor payment success rates
- Track fraud detection metrics

## 🆘 Troubleshooting

### Common Issues

#### 1. Webhook Not Received
- Check webhook URL in Omise dashboard
- Verify SSL certificate
- Check firewall settings

#### 2. Signature Verification Failed
- Verify webhook secret
- Check timestamp freshness
- Ensure payload format is correct

#### 3. Payment Creation Failed
- Verify API keys
- Check amount format (satang)
- Validate card token

### Debug Mode
```env
NODE_ENV=development
DEBUG=omise:*
```

### Support Contacts
- **Omise Support**: support@omise.co
- **Technical Issues**: Check application logs
- **Business Issues**: Contact Omise account manager

## 📚 Additional Resources

### Documentation
- [Omise API Documentation](https://www.omise.co/docs)
- [Omise.js Documentation](https://github.com/omise/omise.js)
- [Webhook Guide](https://www.omise.co/docs/webhooks)

### Testing Tools
- [Omise Test Dashboard](https://dashboard.omise.co/test)
- [Test Card Generator](https://www.omise.co/docs/test-cards)

### Security Best Practices
- [PCI Compliance Guide](https://www.omise.co/docs/pci-compliance)
- [Security Checklist](https://www.omise.co/docs/security)

---

## 🎯 Next Steps

1. **Complete Omise Account Setup**
2. **Configure Environment Variables**
3. **Test Payment Flow in Test Mode**
4. **Implement Frontend Integration**
5. **Set Up Webhook Monitoring**
6. **Go Live with Production Keys**

---

**⚠️ Important**: Never commit API keys to version control. Always use environment variables for sensitive information.
