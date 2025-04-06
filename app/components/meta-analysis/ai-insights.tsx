import React, { useState } from 'react';
import { Study } from '@/types/meta-analysis';
import { Button, TextField, Typography, Paper, Box, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';

interface AIInsightsProps {
  studies: Study[];
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const QueryInput = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: '100%',
}));

const ResponseBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  whiteSpace: 'pre-wrap',
}));

const AIInsights: React.FC<AIInsightsProps> = ({ studies }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studies,
          query,
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to process query');
      }
      
      setResponse(data.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h5" gutterBottom>
        AI Insights
      </Typography>
      
      <Typography variant="body1" paragraph>
        Ask questions about your meta-analysis data and get AI-powered insights.
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Example queries:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => handleExampleQuery('Is there significant heterogeneity in the studies?')}
          >
            Check heterogeneity
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => handleExampleQuery('Is there evidence of publication bias?')}
          >
            Check publication bias
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => handleExampleQuery('Are there any outliers in the dataset?')}
          >
            Find outliers
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => handleExampleQuery('Is there a temporal trend in the effect sizes?')}
          >
            Check temporal trends
          </Button>
        </Box>
      </Box>
      
      <form onSubmit={handleSubmit}>
        <QueryInput
          label="Your question"
          variant="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Is there significant heterogeneity in the studies?"
          multiline
          rows={2}
          disabled={loading}
        />
        
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={loading || !query.trim()}
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Get Insights'}
        </Button>
      </form>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {response && (
        <ResponseBox>
          <Typography variant="body1">
            {response}
          </Typography>
        </ResponseBox>
      )}
    </StyledPaper>
  );
};

export default AIInsights; 