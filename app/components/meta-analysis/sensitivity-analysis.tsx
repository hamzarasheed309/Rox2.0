import React, { useState } from 'react';
import { Study, SensitivityResults } from '@/types/meta-analysis';
import { Box, Typography, Paper, Button, CircularProgress, Alert, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

interface SensitivityAnalysisProps {
  studies: Study[];
  effectMeasure: string;
  onRunAnalysis: () => Promise<SensitivityResults>;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const ResultBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));

const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({
  studies,
  effectMeasure,
  onRunAnalysis,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SensitivityResults | null>(null);

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const analysisResults = await onRunAnalysis();
      setResults(analysisResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while running the analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom>
        Sensitivity Analysis ({effectMeasure})
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={handleRunAnalysis}
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Run Sensitivity Analysis'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {results && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ResultBox>
              <Typography variant="subtitle1" gutterBottom>
                Leave-One-Out Analysis
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Study</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Estimate</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>CI Lower</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>CI Upper</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>p-value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(results.leave_one_out).map(([studyId, result]) => (
                      <tr key={studyId}>
                        <td style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                          {studyId}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                          {result.estimate.toFixed(3)}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                          {result.ci_lower.toFixed(3)}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                          {result.ci_upper.toFixed(3)}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                          {result.p_value.toFixed(3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </ResultBox>
          </Grid>

          <Grid item xs={12}>
            <ResultBox>
              <Typography variant="subtitle1" gutterBottom>
                Cumulative Meta-Analysis
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Studies</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Estimate</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>CI Lower</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>CI Upper</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>p-value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(results.cumulative).map(([nStudies, result]) => (
                      <tr key={nStudies}>
                        <td style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                          {nStudies} studies
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                          {result.estimate.toFixed(3)}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                          {result.ci_lower.toFixed(3)}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                          {result.ci_upper.toFixed(3)}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                          {result.p_value.toFixed(3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </ResultBox>
          </Grid>
        </Grid>
      )}
    </StyledPaper>
  );
};

export default SensitivityAnalysis; 