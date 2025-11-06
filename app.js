// IMPORTANT: This is a template showing where to add CostKatana imports
// ADD these lines to your existing app.js file - DO NOT replace the entire file

// === ADD THIS IMPORT AT THE TOP OF YOUR FILE (with other imports) ===
import costKatanaService from './src/costkatana.js';

// === Your existing imports remain here ===
import express from 'express';
// ... other existing imports ...

const app = express();

// === Your existing middleware setup remains here ===
app.use(express.json());
// ... other existing middleware ...

// === ADD THIS: Initialize CostKatana (after middleware setup, before routes) ===
// Initialize CostKatana service
(async () => {
  try {
    await costKatanaService.initialize();
    
    // Optional: Add CostKatana middleware for automatic tracking
    if (process.env.COSTKATANA_AUTO_TRACKING === 'true') {
      app.use(costKatanaService.middleware());
    }

    // Optional: Set up cost alerts
    if (process.env.COSTKATANA_ALERT_THRESHOLD) {
      const threshold = parseFloat(process.env.COSTKATANA_ALERT_THRESHOLD);
      await costKatanaService.setAlertThreshold(threshold, (alert) => {
        console.warn(`⚠️  Cost Alert: Daily spending exceeded $${threshold}`);
        console.warn(`   Current total: $${alert.currentTotal}`);
        // Add your alert handling logic here (e.g., send email, Slack notification)
      });
    }
  } catch (error) {
    console.error('Failed to initialize CostKatana:', error);
    // Application continues to run even if CostKatana fails to initialize
  }
})();

// === ADD THIS: Cost tracking endpoints (optional) ===
// CostKatana API endpoints for monitoring
app.get('/api/costs/summary', async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;
    const summary = await costKatanaService.getCostSummary({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      groupBy: groupBy || 'day'
    });
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/costs/analytics', async (req, res) => {
  try {
    const analytics = await costKatanaService.getAnalytics(req.query);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/costs/usage', async (req, res) => {
  try {
    const stats = await costKatanaService.getUsageStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === Your existing routes remain here ===
// ... all your existing route definitions ...

// === ADD THIS: Example of manual cost tracking in your AI endpoints ===
// Example: If you have an AI chat endpoint, add tracking like this:
/*
app.post('/api/chat', async (req, res) => {
  try {
    // Your existing AI logic here
    const response = await callYourAIService(req.body);
    
    // Track the cost
    await costKatanaService.track({
      model: 'gpt-3.5-turbo', // or your model
      inputTokens: response.usage.prompt_tokens,
      outputTokens: response.usage.completion_tokens,
      operation: 'chat-completion',
      metadata: {
        userId: req.user?.id,
        messageId: response.id
      }
    });
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/

// === Your existing server setup remains here ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// === ADD THIS: Graceful shutdown handling ===
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await costKatanaService.shutdown();
  process.exit(0);
});

export default app;