/**
 * CostKatana Configuration and Initialization
 * Handles cost tracking, optimization, and analytics for AI operations
 */

const CostKatana = require('cost-katana');

class CostKatanaService {
  constructor() {
    this.instance = null;
    this.isInitialized = false;
  }

  /**
   * Initialize CostKatana with configuration
   * @param {Object} config - Configuration options
   * @returns {Promise<void>}
   */
  async initialize(config = {}) {
    try {
      const defaultConfig = {
        apiKey: process.env.COSTKATANA_API_KEY,
        defaultModel: process.env.COSTKATANA_DEFAULT_MODEL || 'amazon.nova-lite-v1:0',
        environment: process.env.NODE_ENV || 'development',
        
        // Cost tracking configuration
        costTracking: {
          enabled: process.env.COSTKATANA_COST_TRACKING_ENABLED !== 'false',
          alertThreshold: parseFloat(process.env.COSTKATANA_ALERT_THRESHOLD) || 100,
          currency: process.env.COSTKATANA_CURRENCY || 'USD',
          trackingInterval: parseInt(process.env.COSTKATANA_TRACKING_INTERVAL) || 60000
        },
        
        // Cortex optimization configuration
        cortexOptimization: {
          enabled: process.env.COSTKATANA_CORTEX_ENABLED !== 'false',
          autoOptimize: process.env.COSTKATANA_AUTO_OPTIMIZE === 'true',
          modelSelection: process.env.COSTKATANA_MODEL_SELECTION || 'balanced',
          cacheEnabled: process.env.COSTKATANA_CACHE_ENABLED !== 'false',
          cacheTTL: parseInt(process.env.COSTKATANA_CACHE_TTL) || 3600
        },
        
        // Analytics configuration
        analytics: {
          enabled: process.env.COSTKATANA_ANALYTICS_ENABLED !== 'false',
          dashboardEnabled: process.env.COSTKATANA_DASHBOARD_ENABLED === 'true',
          reportingInterval: process.env.COSTKATANA_REPORTING_INTERVAL || 'daily',
          metricsEndpoint: process.env.COSTKATANA_METRICS_ENDPOINT
        },
        
        // Logging configuration
        logging: {
          level: process.env.COSTKATANA_LOG_LEVEL || 'info',
          logToFile: process.env.COSTKATANA_LOG_TO_FILE === 'true',
          logPath: process.env.COSTKATANA_LOG_PATH || './logs/costkatana.log'
        }
      };

      const mergedConfig = { ...defaultConfig, ...config };
      
      if (!mergedConfig.apiKey) {
        throw new Error('CostKatana API key is required. Please set COSTKATANA_API_KEY environment variable.');
      }

      this.instance = new CostKatana(mergedConfig);
      await this.instance.initialize();
      
      this.isInitialized = true;
      console.log('✅ CostKatana initialized successfully');
      
      // Set up event listeners
      this.setupEventListeners();
      
      return this.instance;
    } catch (error) {
      console.error('❌ Failed to initialize CostKatana:', error.message);
      throw error;
    }
  }

  /**
   * Set up event listeners for CostKatana events
   */
  setupEventListeners() {
    if (!this.instance) return;

    // Cost threshold alert
    this.instance.on('cost-threshold-exceeded', (data) => {
      console.warn(`⚠️ Cost threshold exceeded: $${data.currentCost} (threshold: $${data.threshold})`);
    });

    // Optimization suggestions
    this.instance.on('optimization-suggestion', (suggestion) => {
      console.info(`💡 Optimization suggestion: ${suggestion.message}`);
    });

    // Analytics report ready
    this.instance.on('analytics-report-ready', (report) => {
      console.info(`📊 Analytics report available: ${report.reportId}`);
    });
  }

  /**
   * Track an AI operation cost
   * @param {Object} operation - Operation details
   * @returns {Promise<Object>} - Tracking result
   */
  async trackCost(operation) {
    if (!this.isInitialized) {
      throw new Error('CostKatana is not initialized. Call initialize() first.');
    }

    try {
      const result = await this.instance.track({
        model: operation.model || process.env.COSTKATANA_DEFAULT_MODEL,
        operation: operation.type || 'inference',
        tokens: operation.tokens || 0,
        duration: operation.duration || 0,
        metadata: operation.metadata || {},
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      console.error('Failed to track cost:', error);
      throw error;
    }
  }

  /**
   * Get optimized model recommendation
   * @param {Object} requirements - Requirements for model selection
   * @returns {Promise<Object>} - Recommended model configuration
   */
  async getOptimizedModel(requirements) {
    if (!this.isInitialized) {
      throw new Error('CostKatana is not initialized. Call initialize() first.');
    }

    try {
      const recommendation = await this.instance.cortex.optimize({
        taskType: requirements.taskType || 'general',
        maxLatency: requirements.maxLatency || 5000,
        maxCost: requirements.maxCost || 1.0,
        quality: requirements.quality || 'balanced',
        context: requirements.context || {}
      });

      return recommendation;
    } catch (error) {
      console.error('Failed to get optimized model:', error);
      throw error;
    }
  }

  /**
   * Get analytics summary
   * @param {Object} options - Analytics options
   * @returns {Promise<Object>} - Analytics data
   */
  async getAnalytics(options = {}) {
    if (!this.isInitialized) {
      throw new Error('CostKatana is not initialized. Call initialize() first.');
    }

    try {
      const analytics = await this.instance.analytics.getSummary({
        startDate: options.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: options.endDate || new Date(),
        groupBy: options.groupBy || 'day',
        metrics: options.metrics || ['cost', 'usage', 'performance']
      });

      return analytics;
    } catch (error) {
      console.error('Failed to get analytics:', error);
      throw error;
    }
  }

  /**
   * Middleware for Express to track API costs
   * @returns {Function} Express middleware
   */
  expressMiddleware() {
    return async (req, res, next) => {
      if (!this.isInitialized) {
        return next();
      }

      const startTime = Date.now();
      const originalSend = res.send;

      res.send = function(data) {
        const duration = Date.now() - startTime;
        
        // Track if this was an AI operation
        if (req.aiOperation) {
          this.trackCost({
            type: req.aiOperation.type,
            model: req.aiOperation.model,
            tokens: req.aiOperation.tokens,
            duration,
            metadata: {
              endpoint: req.path,
              method: req.method,
              statusCode: res.statusCode
            }
          }).catch(err => console.error('Cost tracking error:', err));
        }

        return originalSend.call(this, data);
      }.bind(this);

      next();
    };
  }

  /**
   * Get the CostKatana instance
   * @returns {Object} CostKatana instance
   */
  getInstance() {
    if (!this.isInitialized) {
      throw new Error('CostKatana is not initialized. Call initialize() first.');
    }
    return this.instance;
  }

  /**
   * Shutdown CostKatana gracefully
   * @returns {Promise<void>}
   */
  async shutdown() {
    if (this.instance) {
      await this.instance.shutdown();
      this.isInitialized = false;
      console.log('CostKatana shutdown complete');
    }
  }
}

// Create singleton instance
const costKatanaService = new CostKatanaService();

module.exports = costKatanaService;