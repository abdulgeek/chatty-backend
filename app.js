const express = require('express');
const costKatana = require('./src/costkatana');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize CostKatana
async function initializeCostKatana() {
  try {
    await costKatana.initialize();
    console.log('CostKatana integration ready');
  } catch (error) {
    console.error('Failed to initialize CostKatana:', error);
    // Continue running the app even if CostKatana fails to initialize
  }
}

// Apply CostKatana middleware for tracking
app.use(costKatana.expressMiddleware());

// Example route demonstrating cost tracking
app.post('/api/ai/completion', async (req, res) => {
  try {
    // Mark this as an AI operation for cost tracking
    req.aiOperation = {
      type: 'text-completion',
      model: 'amazon.nova-lite-v1:0',
      tokens: 150 // Example token count
    };

    // Get optimized model recommendation
    const optimizedModel = await costKatana.getOptimizedModel({
      taskType: 'text-generation',
      maxLatency: 3000,
      maxCost: 0.5,
      quality: 'balanced'
    });

    // Your AI operation logic here
    const result = {
      message: 'AI completion processed',
      model: optimizedModel.model,
      estimatedCost: optimizedModel.estimatedCost
    };

    // Track the cost
    await costKatana.trackCost({
      type: 'text-completion',
      model: optimizedModel.model,
      tokens: 150,
      metadata: {
        requestId: req.id,
        userId: req.user?.id
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Error processing AI completion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics endpoint
app.get('/api/analytics/costs', async (req, res) => {
  try {
    const analytics = await costKatana.getAnalytics({
      startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
      groupBy: req.query.groupBy || 'day'
    });

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    costKatana: costKatana.isInitialized ? 'active' : 'inactive',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await costKatana.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await costKatana.shutdown();
  process.exit(0);
});

// Start server
async function startServer() {
  await initializeCostKatana();
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch(console.error);

module.exports = app;