# CostKatana Integration Setup Guide

## Overview

This guide will help you set up and configure CostKatana in your chatty-backend project. CostKatana provides cost tracking, optimization, and analytics for AI operations.

## Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher
- CostKatana API key (get one at [https://costkatana.com](https://costkatana.com))

## Installation

### Step 1: Install the Package

bash
npm install cost-katana


### Step 2: Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   bash
   cp .env.example .env
   

2. Edit `.env` and add your CostKatana API key:
   env
   COSTKATANA_API_KEY=your_actual_api_key_here
   

### Step 3: Verify Installation

Start your application:
bash
npm start


You should see:

✅ CostKatana initialized successfully
CostKatana integration ready
Server is running on port 3000


## Features Configuration

### Cost Tracking

Cost tracking is enabled by default. Configure thresholds and alerts:

env
COSTKATANA_COST_TRACKING_ENABLED=true
COSTKATANA_ALERT_THRESHOLD=100  # Alert when daily cost exceeds $100
COSTKATANA_CURRENCY=USD


**Usage Example:**

javascript
// Track AI operation cost
await costKatana.trackCost({
  type: 'text-completion',
  model: 'amazon.nova-lite-v1:0',
  tokens: 150,
  metadata: {
    requestId: 'req-123',
    userId: 'user-456'
  }
});


### Cortex Optimization

Cortex automatically selects the most cost-effective model for your needs:

env
COSTKATANA_CORTEX_ENABLED=true
COSTKATANA_AUTO_OPTIMIZE=true  # Automatically switch models
COSTKATANA_MODEL_SELECTION=balanced  # Options: cost, performance, balanced


**Usage Example:**

javascript
// Get optimized model recommendation
const recommendation = await costKatana.getOptimizedModel({
  taskType: 'text-generation',
  maxLatency: 3000,  // Max 3 seconds
  maxCost: 0.5,      // Max $0.50 per request
  quality: 'balanced'
});

console.log('Recommended model:', recommendation.model);
console.log('Estimated cost:', recommendation.estimatedCost);


### Analytics

Analytics provides insights into your AI spending patterns:

env
COSTKATANA_ANALYTICS_ENABLED=true
COSTKATANA_DASHBOARD_ENABLED=true  # Enable web dashboard
COSTKATANA_REPORTING_INTERVAL=daily  # Options: hourly, daily, weekly, monthly


**Usage Example:**

javascript
// Get cost analytics
const analytics = await costKatana.getAnalytics({
  startDate: new Date('2024-01-01'),
  endDate: new Date(),
  groupBy: 'day',
  metrics: ['cost', 'usage', 'performance']
});

console.log('Total cost:', analytics.totalCost);
console.log('Average daily cost:', analytics.averageDailyCost);


## API Endpoints

### AI Completion with Cost Tracking

bash
POST /api/ai/completion
Content-Type: application/json

{
  "prompt": "Your prompt here",
  "maxTokens": 150
}


### Get Cost Analytics

bash
GET /api/analytics/costs?startDate=2024-01-01&endDate=2024-01-31&groupBy=day


### Health Check

bash
GET /health


## Monitoring and Alerts

### Cost Threshold Alerts

CostKatana will emit events when thresholds are exceeded:

javascript
costKatana.getInstance().on('cost-threshold-exceeded', (data) => {
  // Send notification to team
  console.warn(`Cost alert: $${data.currentCost}`);
  // Implement your alert logic here
});


### Optimization Suggestions

Receive real-time optimization suggestions:

javascript
costKatana.getInstance().on('optimization-suggestion', (suggestion) => {
  console.log(`Suggestion: ${suggestion.message}`);
  console.log(`Potential savings: $${suggestion.potentialSavings}`);
});


## Best Practices

1. **Set Appropriate Thresholds**: Configure cost thresholds based on your budget
2. **Use Caching**: Enable caching to reduce redundant API calls
3. **Monitor Analytics**: Regularly review analytics to identify optimization opportunities
4. **Implement Graceful Degradation**: Handle CostKatana failures gracefully
5. **Track Metadata**: Include relevant metadata for better cost attribution

## Troubleshooting

### CostKatana Not Initializing

1. Check your API key is valid
2. Verify network connectivity
3. Check logs for detailed error messages

### Cost Tracking Not Working

1. Ensure `COSTKATANA_COST_TRACKING_ENABLED=true`
2. Verify the middleware is properly applied
3. Check that AI operations are marked with `req.aiOperation`

### Analytics Data Missing

1. Ensure analytics is enabled
2. Wait for the reporting interval to complete
3. Check that operations are being tracked

## Advanced Configuration

### Custom Model Pricing

javascript
await costKatana.initialize({
  customPricing: {
    'custom-model-1': {
      inputTokenCost: 0.0001,
      outputTokenCost: 0.0002
    }
  }
});


### Batch Operations

javascript
const operations = [
  { type: 'completion', tokens: 100 },
  { type: 'embedding', tokens: 50 },
  { type: 'completion', tokens: 200 }
];

await costKatana.trackBatch(operations);


### Export Analytics

javascript
const report = await costKatana.getInstance().analytics.exportReport({
  format: 'csv',
  startDate: new Date('2024-01-01'),
  endDate: new Date()
});


## Support

- Documentation: [https://docs.costkatana.com](https://docs.costkatana.com)
- Support Email: support@costkatana.com
- GitHub Issues: [https://github.com/costkatana/cost-katana](https://github.com/costkatana/cost-katana)

## License

MIT