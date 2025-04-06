import React, { useState } from 'react';
import { Study, PublicationBiasResults } from '@/types/meta-analysis';
import { Box, Typography, Paper, Button, CircularProgress, Alert, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

interface PublicationBiasTestsProps {
  studies: Study[];
  effectMeasure: string;
  onRunTests: () => Promise<PublicationBiasResults>;
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

const PublicationBiasTests: React.FC<PublicationBiasTestsProps> = ({
  studies,
  effectMeasure,
  onRunTests,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PublicationBiasResults | null>(null);

  const handleRunTests = async () => {
    setLoading(true);
    setError(null);

    try {
      const testResults = await onRunTests();
      setResults(testResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while running the tests');
    } finally {
      setLoading(false);
    }
  };

  const interpretEggerTest = (pValue: number): string => {
    return pValue < 0.05
      ? 'Significant publication bias detected'
      : 'No significant publication bias detected';
  };

  const interpretBeggsTest = (pValue: number): string => {
    return pValue < 0.05
      ? 'Significant publication bias detected'
      : 'No significant publication bias detected';
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom>
        Publication Bias Tests ({effectMeasure})
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={handleRunTests}
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Run Publication Bias Tests'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {results && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ResultBox>
              <Typography variant="subtitle1" gutterBottom>
                Egger's Test
              </Typography>
              <Typography variant="body2" gutterBottom>
                Intercept: {results.egger_test.intercept.toFixed(3)} (SE = {results.egger_test.se.toFixed(3)})
              </Typography>
              <Typography variant="body2" gutterBottom>
                t-value: {results.egger_test.t_value.toFixed(3)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                p-value: {results.egger_test.p_value.toFixed(3)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {interpretEggerTest(results.egger_test.p_value)}
              </Typography>
            </ResultBox>
          </Grid>

          <Grid item xs={12} md={6}>
            <ResultBox>
              <Typography variant="subtitle1" gutterBottom>
                Begg's Test
              </Typography>
              <Typography variant="body2" gutterBottom>
                Rank Correlation: {results.begg_test.rank_correlation.toFixed(3)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                p-value: {results.begg_test.p_value.toFixed(3)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {interpretBeggsTest(results.begg_test.p_value)}
              </Typography>
            </ResultBox>
          </Grid>

          <Grid item xs={12} md={6}>
            <ResultBox>
              <Typography variant="subtitle1" gutterBottom>
                Trim and Fill Analysis
              </Typography>
              <Typography variant="body2" gutterBottom>
                Original Estimate: {results.trim_and_fill.original_estimate.toFixed(3)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Adjusted Estimate: {results.trim_and_fill.adjusted_estimate.toFixed(3)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Missing Studies: {results.trim_and_fill.n_missing}
              </Typography>
            </ResultBox>
          </Grid>

          <Grid item xs={12} md={6}>
            <ResultBox>
              <Typography variant="subtitle1" gutterBottom>
                Fail-Safe N
              </Typography>
              <Typography variant="body2" gutterBottom>
                Rosenthal's N: {results.fail_safe_n.rosenthal}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Orwin's N: {results.fail_safe_n.orwin}
              </Typography>
            </ResultBox>
          </Grid>
        </Grid>
      )}
    </StyledPaper>
  );
};

export default PublicationBiasTests; 