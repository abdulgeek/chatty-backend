import CostKatana from 'cost-katana';
import dotenv from 'dotenv';

dotenv.config();

/**
 * CostKatana Service
 * Handles AI cost tracking and monitoring for the application
 */
class CostKatanaService {
  constructor() {
    this.ck = null;
    this.isInitialized = false;
    this.config = {
      apiKey: process.env.COSTKATANA_API_KEY,
      defaultModel: process.env.COSTKATANA_DEFAULT_MODEL || 'amazon.nova-lite-v1:0',
      environment: process.env.NODE_ENV || 'development',
      enableAutoTracking: process.env.COSTKATANA_AUTO_TRACKING === 'true',
      enableLogging: process.env.COSTKATANA_ENABLE_LOGGING !== 'false',
      maxRetries: parseInt(process.env.COSTKATANA_MAX_RETRIES || '3'),
      timeout: parseInt(process.env.COSTKATANA_TIMEOUT || '30000')
    };
  }

  /**
   * Initialize CostKatana with configuration
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        console.log('CostKatana is already initialized');
        return;
      }

      if (!this.config.apiKey) {
        console.warn('⚠️  CostKatana API key not found. Cost tracking will be disabled.');
        return;
      }

      this.ck = new CostKatana({
        apiKey: this.config.apiKey,
        defaultModel: this.config.defaultModel,
        environment: this.config.environment,
        enableAutoTracking: this.config.enableAutoTracking,
        maxRetries: this.config.maxRetries,
        timeout: this.config.timeout
      });

      await this.ck.initialize();
      this.isInitialized = true;

      if (this.config.enableLogging) {
        console.log('✅ CostKatana initialized successfully');
        console.log(`   - Environment: ${this.config.environment}`);
        console.log(`   - Default Model: ${this.config.defaultModel}`);
        console.log(`   - Auto Tracking: ${this.config.enableAutoTracking}`);
      }
    } catch (error) {
      console.error('❌ Failed to initialize CostKatana:', error.message);
      throw error;
    }
  }

  /**
   * Track AI API usage and costs
   * @param {Object} params - Tracking parameters
   * @param {string} params.model - AI model used
   * @param {number} params.inputTokens - Number of input tokens
   * @param {number} params.outputTokens - Number of output tokens
   * @param {string} params.operation - Operation name/identifier
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<Object>} Tracking result with cost information
   */
  async track(params) {
    if (!this.isInitialized) {
      if (this.config.enableLogging) {
        console.warn('CostKatana not initialized. Skipping tracking.');
      }
      return null;
    }

    try {
      const result = await this.ck.track({
        model: params.model || this.config.defaultModel,
        inputTokens: params.inputTokens || 0,
        outputTokens: params.outputTokens || 0,
        operation: params.operation || 'unknown',
        metadata: {
          ...params.metadata,
          timestamp: new Date().toISOString(),
          environment: this.config.environment
        }
      });

      if (this.config.enableLogging) {
        console.log(`💰 Cost tracked: $${result.cost.toFixed(6)} for ${params.operation}`);
      }

      return result;
    } catch (error) {
      console.error('Error tracking cost:', error.message);
      return null;
    }
  }

  /**
   * Get cost summary for a specific period
   * @param {Object} options - Query options
   * @param {Date} options.startDate - Start date for the summary
   * @param {Date} options.endDate - End date for the summary
   * @param {string} options.groupBy - Group results by (day, week, month)
   * @returns {Promise<Object>} Cost summary
   */
  async getCostSummary(options = {}) {
    if (!this.isInitialized) {
      throw new Error('CostKatana not initialized');
    }

    try {
      const summary = await this.ck.getCostSummary({
        startDate: options.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: options.endDate || new Date(),
        groupBy: options.groupBy || 'day'
      });

      return summary;
    } catch (error) {
      console.error('Error getting cost summary:', error.message);
      throw error;
    }
  }

  /**
   * Get detailed cost analytics
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Detailed analytics
   */
  async getAnalytics(filters = {}) {
    if (!this.isInitialized) {
      throw new Error('CostKatana not initialized');
    }

    try {
      const analytics = await this.ck.getAnalytics(filters);
      return analytics;
    } catch (error) {
      console.error('Error getting analytics:', error.message);
      throw error;
    }
  }

  /**
   * Express middleware for automatic request tracking
   * @returns {Function} Express middleware
   */
  middleware() {
    return async (req, res, next) => {
      if (!this.isInitialized || !this.config.enableAutoTracking) {
        return next();
      }

      // Store original json method
      const originalJson = res.json;
      
      // Override json method to track costs
      res.json = function(data) {
        // Check if response contains AI-related data
        if (data && (data.aiResponse || data.tokens || data.model)) {
          const trackingData = {
            model: data.model || req.headers['x-ai-model'],
            inputTokens: data.inputTokens || data.tokens?.input || 0,
            outputTokens: data.outputTokens || data.tokens?.output || 0,
            operation: `${req.method} ${req.path}`,
            metadata: {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
              userId: req.user?.id,
              sessionId: req.session?.id
            }
          };

          // Track asynchronously to not block response
          costKatanaService.track(trackingData).catch(err => {
            console.error('Failed to track cost in middleware:', err);
          });
        }

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    };
  }

  /**
   * Set cost alert threshold
   * @param {number} threshold - Cost threshold in USD
   * @param {Function} callback - Callback function when threshold is exceeded
   */
  async setAlertThreshold(threshold, callback) {
    if (!this.isInitialized) {
      throw new Error('CostKatana not initialized');
    }

    try {
      await this.ck.setAlertThreshold(threshold, callback);
      console.log(`⚠️  Cost alert threshold set to $${threshold}`);
    } catch (error) {
      console.error('Error setting alert threshold:', error.message);
      throw error;
    }
  }

  /**
   * Get current usage statistics
   * @returns {Promise<Object>} Current usage stats
   */
  async getUsageStats() {
    if (!this.isInitialized) {
      throw new Error('CostKatana not initialized');
    }

    try {
      const stats = await this.ck.getUsageStats();
      return stats;
    } catch (error) {
      console.error('Error getting usage stats:', error.message);
      throw error;
    }
  }

  /**
   * Cleanup and close connections
   */
  async shutdown() {
    if (this.isInitialized && this.ck) {
      await this.ck.close();
      this.isInitialized = false;
      console.log('CostKatana shutdown complete');
    }
  }
}

// Create singleton instance
const costKatanaService = new CostKatanaService();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await costKatanaService.shutdown();
});

process.on('SIGTERM', async () => {
  await costKatanaService.shutdown();
});

export default costKatanaService;

// Example usage functions for reference
export const trackAIUsage = async (model, inputTokens, outputTokens, operation, metadata = {}) => {
  return await costKatanaService.track({
    model,
    inputTokens,
    outputTokens,
    operation,
    metadata
  });
};

export const getCostReport = async (startDate, endDate) => {
  return await costKatanaService.getCostSummary({
    startDate,
    endDate,
    groupBy: 'day'
  });
};

export const costKatanaMiddleware = () => costKatanaService.middleware();