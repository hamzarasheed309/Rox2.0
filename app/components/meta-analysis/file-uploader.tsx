import React, { useState } from 'react';
import { Study } from '@/types/meta-analysis';
import { Box, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onUpload: (studies: Study[]) => void;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  border: `2px dashed ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the data structure
      if (!Array.isArray(data)) {
        throw new Error('Invalid file format: Expected an array of studies');
      }

      // Validate each study object
      const studies: Study[] = data.map((study, index) => {
        if (!study.study_id || !study.study_label || typeof study.effect_size !== 'number' || typeof study.se !== 'number') {
          throw new Error(`Invalid study data at index ${index}`);
        }

        return {
          study_id: study.study_id,
          study_label: study.study_label,
          effect_size: study.effect_size,
          se: study.se,
          weight: study.weight || 1 / Math.pow(study.se, 2),
          year: study.year,
          author: study.author,
          sample_size: study.sample_size,
          confidence_interval: study.confidence_interval,
          p_value: study.p_value,
        };
      });

      onUpload(studies);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledPaper elevation={0}>
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Box sx={{ textAlign: 'center', cursor: 'pointer' }}>
          <Upload size={48} style={{ marginBottom: 16 }} />
          <Typography variant="h6" gutterBottom>
            Upload Study Data
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Drag and drop a JSON file or click to browse
          </Typography>
          <Button
            variant="contained"
            component="span"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Processing...' : 'Select File'}
          </Button>
        </Box>
      </label>

      {error && (
        <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
          {error}
        </Alert>
      )}
    </StyledPaper>
  );
};

export default FileUploader; 