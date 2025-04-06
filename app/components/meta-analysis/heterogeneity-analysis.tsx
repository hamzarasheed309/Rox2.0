import React, { useState } from 'react';
import { Study, HeterogeneityResults } from '@/types/meta-analysis';
import { Box, Typography, Paper, Button, CircularProgress, Alert, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

interface HeterogeneityAnalysisProps {
  studies: Study[];
  effectMeasure: string;
  onRunAnalysis?: () => Promise<any>;
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

const HeterogeneityAnalysis: React.FC<HeterogeneityAnalysisProps> = ({ studies, effectMeasure, onRunAnalysis }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<HeterogeneityResults | null>(null);

  const calculateHeterogeneity = async () => {
    setLoading(true);
    setError(null);

    try {
      if (onRunAnalysis) {
        const analysisResults = await onRunAnalysis();
        setResults(analysisResults);
        return;
      }

      // Calculate weighted mean
      const weightedSum = studies.reduce((sum, study) => sum + study.effect_size * study.weight, 0);
      const totalWeight = studies.reduce((sum, study) => sum + study.weight, 0);
      const weightedMean = weightedSum / totalWeight;

      // Calculate Q statistic
      const qStatistic = studies.reduce((sum, study) => {
        const deviation = study.effect_size - weightedMean;
        return sum + study.weight * deviation * deviation;
      }, 0);

      // Calculate degrees of freedom
      const df = studies.length - 1;

      // Calculate p-value for Q statistic
      const pValue = 1 - chiSquareCDF(qStatistic, df);

      // Calculate I²
      const iSquared = Math.max(0, ((qStatistic - df) / qStatistic) * 100);

      // Calculate tau² (method of moments estimator)
      const tauSquared = Math.max(0, (qStatistic - df) / (totalWeight - (studies.reduce((sum, study) => sum + study.weight * study.weight, 0) / totalWeight)));

      // Calculate H²
      const hSquared = qStatistic / df;

      setResults({
        i_squared: iSquared,
        q_statistic: qStatistic,
        q_pvalue: pValue,
        q_df: df,
        tau_squared: tauSquared,
        tau: Math.sqrt(tauSquared),
        h_squared: hSquared,
        h: Math.sqrt(hSquared)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while calculating heterogeneity');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate chi-square CDF
  const chiSquareCDF = (x: number, df: number): number => {
    const k = df / 2;
    return gammaInc(k, x / 2) / gamma(k);
  };

  // Helper function to calculate gamma function
  const gamma = (z: number): number => {
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    z -= 1;
    let x = 0.99999999999980993;
    const p = [
      676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059,
      12.507343278686905, -0.13857109526572012,
      9.9843695780195716e-6, 1.5056327351493116e-7
    ];
    for (let i = 0; i < 8; i++) {
      x += p[i] / (z + i + 1);
    }
    const t = z + 7.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  };

  // Helper function to calculate incomplete gamma function
  const gammaInc = (s: number, x: number): number => {
    if (x < 0 || s <= 0) return 0;
    if (x === 0) return 0;
    if (x === Infinity) return gamma(s);

    let sum = 1 / s;
    let term = sum;
    for (let i = 1; i < 100; i++) {
      term *= x / (s + i);
      sum += term;
      if (Math.abs(term) < 1e-8) break;
    }
    return Math.pow(x, s) * Math.exp(-x) * sum;
  };

  const interpretHeterogeneity = (iSquared: number): string => {
    if (iSquared < 25) return 'Low heterogeneity';
    if (iSquared < 50) return 'Moderate heterogeneity';
    if (iSquared < 75) return 'Substantial heterogeneity';
    return 'Considerable heterogeneity';
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom>
        Heterogeneity Analysis
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={calculateHeterogeneity}
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Calculate Heterogeneity'}
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
                Q Statistic
              </Typography>
              <Typography variant="body2" gutterBottom>
                Q = {results.q_statistic.toFixed(3)} (df = {results.q_df})
              </Typography>
              <Typography variant="body2" gutterBottom>
                p-value = {results.q_pvalue.toFixed(3)}
              </Typography>
            </ResultBox>
          </Grid>

          <Grid item xs={12} md={6}>
            <ResultBox>
              <Typography variant="subtitle1" gutterBottom>
                I² Statistic
              </Typography>
              <Typography variant="body2" gutterBottom>
                I² = {results.i_squared.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {interpretHeterogeneity(results.i_squared)}
              </Typography>
            </ResultBox>
          </Grid>

          <Grid item xs={12} md={6}>
            <ResultBox>
              <Typography variant="subtitle1" gutterBottom>
                Tau² (Between-Study Variance)
              </Typography>
              <Typography variant="body2" gutterBottom>
                τ² = {results.tau_squared.toFixed(3)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                τ = {results.tau.toFixed(3)}
              </Typography>
            </ResultBox>
          </Grid>

          <Grid item xs={12} md={6}>
            <ResultBox>
              <Typography variant="subtitle1" gutterBottom>
                H Statistic
              </Typography>
              <Typography variant="body2" gutterBottom>
                H² = {results.h_squared.toFixed(3)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                H = {results.h.toFixed(3)}
              </Typography>
            </ResultBox>
          </Grid>
        </Grid>
      )}
    </StyledPaper>
  );
};

export default HeterogeneityAnalysis; 