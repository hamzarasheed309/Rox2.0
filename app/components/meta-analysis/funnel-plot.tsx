import React from 'react';
import { Study } from '@/types/meta-analysis';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

interface FunnelPlotProps {
  studies: Study[];
  effectMeasure: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const FunnelPlot: React.FC<FunnelPlotProps> = ({ studies, effectMeasure }) => {
  // Calculate the range of effect sizes and standard errors for scaling
  const effectSizes = studies.map(study => study.effect_size);
  const standardErrors = studies.map(study => study.se);
  const minEffect = Math.min(...effectSizes);
  const maxEffect = Math.max(...effectSizes);
  const maxSE = Math.max(...standardErrors);

  // Calculate the width and height of the plot
  const plotWidth = 600;
  const plotHeight = 600;
  const padding = 50;

  // Helper function to convert effect size to x-coordinate
  const effectToX = (effect: number) => {
    return ((effect - minEffect) / (maxEffect - minEffect)) * (plotWidth - 2 * padding) + padding;
  };

  // Helper function to convert standard error to y-coordinate
  const seToY = (se: number) => {
    return ((se - 0) / maxSE) * (plotHeight - 2 * padding) + padding;
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h6" gutterBottom>
        Funnel Plot ({effectMeasure})
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
        {studies.map((study) => {
          const x = effectToX(study.effect_size);
          const y = seToY(study.se);

          return (
            <Box
              key={study.study_id}
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
          );
        })}

        {/* Funnel lines */}
        <Box
          sx={{
            position: 'absolute',
            left: effectToX(0),
            top: seToY(0),
            width: plotWidth - 2 * padding,
            height: plotHeight - 2 * padding,
            border: '1px solid #ccc',
            transform: 'rotate(45deg)',
            transformOrigin: 'top left',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: effectToX(0),
            top: seToY(0),
            width: plotWidth - 2 * padding,
            height: plotHeight - 2 * padding,
            border: '1px solid #ccc',
            transform: 'rotate(-45deg)',
            transformOrigin: 'top right',
          }}
        />

        {/* Axes labels */}
        <Typography
          sx={{
            position: 'absolute',
            left: plotWidth / 2,
            top: plotHeight - padding / 2,
            transform: 'translateX(-50%)',
          }}
          variant="body2"
        >
          Effect Size
        </Typography>
        <Typography
          sx={{
            position: 'absolute',
            left: padding / 2,
            top: plotHeight / 2,
            transform: 'translateY(-50%) rotate(-90deg)',
            transformOrigin: 'left center',
          }}
          variant="body2"
        >
          Standard Error
        </Typography>
      </Box>
    </StyledPaper>
  );
};

export default FunnelPlot; 