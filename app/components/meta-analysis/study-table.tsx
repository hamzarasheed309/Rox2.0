import React from 'react';
import { Study } from '@/types/meta-analysis';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

interface StudyTableProps {
  studies: Study[];
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const StudyTable: React.FC<StudyTableProps> = ({ studies }) => {
  return (
    <StyledPaper elevation={3}>
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Study</th>
              <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Year</th>
              <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Effect Size</th>
              <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>SE</th>
              <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Weight</th>
              <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>95% CI</th>
              <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>p-value</th>
              <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Sample Size</th>
            </tr>
          </thead>
          <tbody>
            {studies.map((study) => (
              <tr key={study.study_id}>
                <td style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  {study.study_label}
                  {study.author && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {study.author}
                    </Typography>
                  )}
                </td>
                <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                  {study.year || '-'}
                </td>
                <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                  {study.effect_size.toFixed(3)}
                </td>
                <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                  {study.se.toFixed(3)}
                </td>
                <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                  {study.weight.toFixed(3)}
                </td>
                <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                  {study.confidence_interval
                    ? `[${study.confidence_interval[0].toFixed(3)}, ${study.confidence_interval[1].toFixed(3)}]`
                    : `[${(study.effect_size - 1.96 * study.se).toFixed(3)}, ${(study.effect_size + 1.96 * study.se).toFixed(3)}]`}
                </td>
                <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                  {study.p_value ? study.p_value.toFixed(3) : '-'}
                </td>
                <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                  {study.sample_size
                    ? `${study.sample_size.treatment + study.sample_size.control} (${study.sample_size.treatment}/${study.sample_size.control})`
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </StyledPaper>
  );
};

export default StudyTable; 