import React, { useState } from 'react';
import { Study } from '@/types/meta-analysis';
import { Button, TextField, Typography, Paper, Box, CircularProgress, Alert, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';

interface SubgroupAnalysisProps {
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

const SubgroupAnalysis: React.FC<SubgroupAnalysisProps> = ({ studies, effectMeasure, onRunAnalysis }) => {
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  // Extract potential subgroup variables from studies
  const potentialVariables = React.useMemo(() => {
    if (studies.length === 0) return [];
    const study = studies[0];
    return Object.keys(study).filter(key => 
      key !== 'study_id' && 
      key !== 'study_label' && 
      key !== 'effect_size' && 
      key !== 'se' && 
      key !== 'weight'
    );
  }, [studies]);

  const handleVariableChange = (event: any) => {
    setSelectedVariable(event.target.value);
  };

  const calculateSubgroupAnalysis = async () => {
    if (!selectedVariable) {
      setError('Please select a variable for subgroup analysis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (onRunAnalysis) {
        const analysisResults = await onRunAnalysis();
        setResults(analysisResults);
        return;
      }

      // Group studies by the selected variable
      const groups = studies.reduce((acc, study) => {
        const value = study[selectedVariable as keyof Study];
        if (value !== undefined) {
          const key = String(value);
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(study);
        }
        return acc;
      }, {} as Record<string, Study[]>);

      // Calculate effect size for each subgroup
      const subgroupResults = Object.entries(groups).map(([group, groupStudies]) => {
        const weightedSum = groupStudies.reduce((sum, study) => sum + study.effect_size * study.weight, 0);
        const totalWeight = groupStudies.reduce((sum, study) => sum + study.weight, 0);
        const weightedMean = weightedSum / totalWeight;
        const se = Math.sqrt(1 / totalWeight);
        const ci_lower = weightedMean - 1.96 * se;
        const ci_upper = weightedMean + 1.96 * se;
        const z = Math.abs(weightedMean / se);
        const p_value = 2 * (1 - 0.5 * (1 + erf(z / Math.sqrt(2))));

        return {
          group,
          n_studies: groupStudies.length,
          estimate: weightedMean,
          se,
          ci_lower,
          ci_upper,
          p_value
        };
      });

      setResults(subgroupResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while calculating subgroup analysis');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate the error function (erf)
  function erf(x: number): number {
    const t = 1.0 / (1.0 + 0.5 * Math.abs(x));
    const tau = t * Math.exp(-x * x - 1.26551223 + 
      t * (1.00002368 + 
      t * (0.37409196 + 
      t * (0.09678418 + 
      t * (-0.18628806 + 
      t * (0.27886807 + 
      t * (-1.13520398 + 
      t * (1.48851587 + 
      t * (-0.82215223 + 
      t * 0.17087277)))))))));
    return x >= 0 ? 1 - tau : tau - 1;
  }

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom>
        Subgroup Analysis
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="subgroup-variable-label">Subgroup Variable</InputLabel>
          <Select
            labelId="subgroup-variable-label"
            id="subgroup-variable"
            value={selectedVariable}
            onChange={handleVariableChange}
            label="Subgroup Variable"
          >
            {potentialVariables.map((variable) => (
              <MenuItem key={variable} value={variable}>
                {variable}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={calculateSubgroupAnalysis}
        disabled={loading || !selectedVariable}
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Run Subgroup Analysis'}
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
                Subgroup Results
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Group</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>N Studies</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Estimate</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>SE</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>CI Lower</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>CI Upper</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>p-value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result: any) => (
                      <tr key={result.group}>
                        <td style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                          {result.group}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                          {result.n_studies}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                          {result.estimate.toFixed(3)}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                          {result.se.toFixed(3)}
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

export default SubgroupAnalysis; 