import React from 'react';
import { Study, OverallEffect } from '@/types/meta-analysis';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ForestPlotProps {
  studies: Study[];
  overallEffect: OverallEffect;
  effectMeasure: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const ForestPlot: React.FC<ForestPlotProps> = ({ studies, overallEffect, effectMeasure }) => {
  // Calculate the range of effect sizes for scaling
  const effectSizes = studies.map(study => study.effect_size);
  const minEffect = Math.min(...effectSizes, overallEffect.ci_lower);
  const maxEffect = Math.max(...effectSizes, overallEffect.ci_upper);
  const range = maxEffect - minEffect;
  const padding = range * 0.1; // 10% padding on each side

  // Calculate the width of the plot
  const plotWidth = 800;
  const plotHeight = studies.length * 40 + 100; // 40px per study + 100px for overall effect

  // Helper function to convert effect size to x-coordinate
  const effectToX = (effect: number) => {
    return ((effect - (minEffect - padding)) / (maxEffect - minEffect + 2 * padding)) * plotWidth;
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom>
        Forest Plot ({effectMeasure})
      </Typography>

      <Box sx={{ position: 'relative', width: plotWidth, height: plotHeight }}>
        {/* Vertical line at zero effect */}
        <Box
          sx={{
            position: 'absolute',
            left: effectToX(0),
            top: 0,
            bottom: 0,
            borderLeft: '1px dashed #ccc',
          }}
        />

        {/* Studies */}
        {studies.map((study, index) => {
          const x = effectToX(study.effect_size);
          const y = index * 40 + 20;
          const ciLower = effectToX(study.effect_size - 1.96 * study.se);
          const ciUpper = effectToX(study.effect_size + 1.96 * study.se);

          return (
            <React.Fragment key={study.study_id}>
              {/* Study label */}
              <Typography
                sx={{
                  position: 'absolute',
                  left: 10,
                  top: y - 10,
                  width: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                variant="body2"
              >
                {study.study_label}
              </Typography>

              {/* Confidence interval line */}
              <Box
                sx={{
                  position: 'absolute',
                  left: ciLower,
                  top: y,
                  width: ciUpper - ciLower,
                  height: 2,
                  backgroundColor: '#666',
                }}
              />

              {/* Effect size point */}
              <Box
                sx={{
                  position: 'absolute',
                  left: x - 4,
                  top: y - 4,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#000',
                }}
              />

              {/* Weight (size of point) */}
              <Typography
                sx={{
                  position: 'absolute',
                  left: plotWidth + 10,
                  top: y - 10,
                  width: 50,
                  textAlign: 'right',
                }}
                variant="body2"
              >
                {study.weight.toFixed(1)}
              </Typography>
            </React.Fragment>
          );
        })}

        {/* Overall effect */}
        <Box
          sx={{
            position: 'absolute',
            left: effectToX(overallEffect.estimate),
            top: plotHeight - 60,
            width: 2,
            height: 30,
            backgroundColor: '#000',
          }}
        />

        {/* Overall effect confidence interval */}
        <Box
          sx={{
            position: 'absolute',
            left: effectToX(overallEffect.ci_lower),
            top: plotHeight - 45,
            width: effectToX(overallEffect.ci_upper) - effectToX(overallEffect.ci_lower),
            height: 2,
            backgroundColor: '#000',
          }}
        />

        {/* Overall effect label */}
        <Typography
          sx={{
            position: 'absolute',
            left: 10,
            top: plotHeight - 60,
            width: 200,
          }}
          variant="body1"
          fontWeight="bold"
        >
          Overall Effect
        </Typography>

        {/* Overall effect value */}
        <Typography
          sx={{
            position: 'absolute',
            left: plotWidth + 10,
            top: plotHeight - 60,
            width: 100,
            textAlign: 'right',
          }}
          variant="body1"
          fontWeight="bold"
        >
          {overallEffect.estimate.toFixed(3)}
          <br />
          [{overallEffect.ci_lower.toFixed(3)}, {overallEffect.ci_upper.toFixed(3)}]
        </Typography>
      </Box>
    </StyledPaper>
  );
};

export default ForestPlot; 