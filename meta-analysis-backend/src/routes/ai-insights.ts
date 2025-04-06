import express from 'express';
import { processQuery, checkRAvailability } from '../ai-insights';
import { Study } from '../../types/meta-analysis';

const router = express.Router();

/**
 * @route POST /api/ai-insights
 * @desc Process a user query about meta-analysis data
 * @access Public
 */
router.post('/', async (req, res) => {
  try {
    const { studies, query } = req.body;
    
    // Validate input
    if (!studies || !Array.isArray(studies) || studies.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid studies data. Expected a non-empty array.' 
      });
    }
    
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid query. Expected a non-empty string.' 
      });
    }
    
    // Check if R is available
    const rAvailable = await checkRAvailability();
    if (!rAvailable) {
      return res.status(503).json({ 
        success: false, 
        error: 'R or required packages are not available. Please contact the administrator.' 
      });
    }
    
    // Process the query
    const response = await processQuery(studies as Study[], query);
    
    // Return the response
    res.json(response);
  } catch (error) {
    console.error('Error processing AI insights query:', error);
    res.status(500).json({ 
      success: false, 
      error: 'An error occurred while processing your query.' 
    });
  }
});

/**
 * @route GET /api/ai-insights/available
 * @desc Get a list of available analysis types
 * @access Public
 */
router.get('/available', (req, res) => {
  try {
    const availableAnalyses = [
      'heterogeneity',
      'publication_bias',
      'moderators',
      'outliers',
      'trends',
      'clusters',
      'text_mining'
    ];
    
    res.json({ 
      success: true, 
      available_analyses: availableAnalyses 
    });
  } catch (error) {
    console.error('Error getting available analyses:', error);
    res.status(500).json({ 
      success: false, 
      error: 'An error occurred while getting available analyses.' 
    });
  }
});

export default router; 