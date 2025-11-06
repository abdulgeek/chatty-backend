# CostKatana Integration Setup Guide

## Overview
CostKatana has been integrated into your Express.js application to track and monitor AI API costs in real-time.

## Installation

### Step 1: Install the package
bash
npm install cost-katana


### Step 2: Configure environment variables
1. Copy `.env.example` to `.env`:
   bash
   cp .env.example .env
   

2. Add your CostKatana API key:
   - Sign up at [https://costkatana.com](https://costkatana.com)
   - Navigate to Dashboard → API Keys
   - Copy your API key and add it to `.env`:
   
   COSTKATANA_API_KEY=your_actual_api_key_here
   

### Step 3: Update your app.js
The integration has been added to your `app.js` file. Make sure to:
1. Import the CostKatana service at the top of the file
2. Initialize it after your middleware setup
3. Optionally add the cost tracking endpoints

## Features

### 1. Manual Cost Tracking
Track AI API usage in your endpoints:

javascript
import costKatanaService from './src/costkatana.js';

// In your AI endpoint
app.post('/api/ai/generate', async (req, res) => {
  const aiResponse = await yourAIService.generate(req.body);
  
  // Track the cost
  await costKatanaService.track({
    model: 'gpt-3.5-turbo',
    inputTokens: aiResponse.usage.prompt_tokens,
    outputTokens: aiResponse.usage.completion_tokens,
    operation: 'text-generation',
    metadata: {
      userId: req.user?.id,
      endpoint: '/api/ai/generate'
    }
  });
  
  res.json(aiResponse);
});


### 2. Automatic Tracking (Optional)
Enable automatic tracking via middleware:

env
COSTKATANA_AUTO_TRACKING=true


The middleware will automatically track costs for responses containing AI-related data.

### 3. Cost Monitoring Endpoints
The following endpoints are available for monitoring:

#### Get Cost Summary
bash
GET /api/costs/summary?startDate=2024-01-01&endDate=2024-01-31&groupBy=day


#### Get Analytics
bash
GET /api/costs/analytics


#### Get Usage Statistics
bash
GET /api/costs/usage


### 4. Cost Alerts
Set up alerts for when costs exceed a threshold:

env
COSTKATANA_ALERT_THRESHOLD=10.00


Customize alert handling in `app.js`:

javascript
await costKatanaService.setAlertThreshold(10.00, (alert) => {
  // Send email, Slack notification, etc.
  console.warn(`Cost alert: $${alert.currentTotal}`);
});


## Configuration Options

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `COSTKATANA_API_KEY` | Your CostKatana API key | - | Yes |
| `COSTKATANA_DEFAULT_MODEL` | Default AI model for tracking | `amazon.nova-lite-v1:0` | No |
| `COSTKATANA_AUTO_TRACKING` | Enable automatic middleware tracking | `false` | No |
| `COSTKATANA_ENABLE_LOGGING` | Enable console logging | `true` | No |
| `COSTKATANA_MAX_RETRIES` | Max retry attempts for API calls | `3` | No |
| `COSTKATANA_TIMEOUT` | Request timeout (ms) | `30000` | No |
| `COSTKATANA_ALERT_THRESHOLD` | Daily cost alert threshold (USD) | - | No |

## Supported AI Models

CostKatana supports tracking for:
- OpenAI: GPT-3.5, GPT-4, GPT-4 Turbo
- Anthropic: Claude 3 (Opus, Sonnet, Haiku)
- Google: Gemini Pro, Gemini Ultra
- AWS Bedrock: Amazon Nova, Claude, Llama
- Cohere: Command, Embed
- And many more...

## Testing the Integration

### 1. Verify Initialization
Start your server and check for the success message:
bash
npm start
# Should see: ✅ CostKatana initialized successfully


### 2. Test Manual Tracking
javascript
// Add this test endpoint to your app
app.get('/api/test-costkatana', async (req, res) => {
  const result = await costKatanaService.track({
    model: 'gpt-3.5-turbo',
    inputTokens: 100,
    outputTokens: 50,
    operation: 'test',
    metadata: { test: true }
  });
  res.json({ success: true, cost: result?.cost });
});


### 3. Check Cost Summary
bash
curl http://localhost:3000/api/costs/summary


## Troubleshooting

### CostKatana not initializing
- Check if `COSTKATANA_API_KEY` is set correctly
- Verify your API key is valid at https://costkatana.com/dashboard
- Check console for error messages

### Costs not being tracked
- Ensure `costKatanaService.track()` is called after AI API responses
- Verify token counts are being passed correctly
- Check if the model name matches supported models

### Middleware not working
- Ensure `COSTKATANA_AUTO_TRACKING=true` in `.env`
- Verify middleware is added after CostKatana initialization
- Check that your responses include AI-related fields

## Best Practices

1. **Always track costs**: Add tracking to all AI API calls
2. **Use metadata**: Include relevant context (userId, sessionId, etc.)
3. **Monitor regularly**: Check cost summaries daily/weekly
4. **Set alerts**: Configure threshold alerts for budget control
5. **Handle errors**: Wrap tracking calls in try-catch blocks
6. **Test thoroughly**: Verify tracking in development before production

## Support

- Documentation: https://docs.costkatana.com
- Support: support@costkatana.com
- GitHub Issues: https://github.com/costkatana/cost-katana-js

## License

MIT