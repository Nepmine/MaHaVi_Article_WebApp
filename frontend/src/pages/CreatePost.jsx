// src/pages/CreatePost.jsx
import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardMedia,
  IconButton,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Add,
  Preview,
  Publish
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { postAPI, handleApiError } from '../services/apiService';
import { uploadImageToFirebase } from '../utils/firebase';

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    category: '',
    tags: [],
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  const categories = [
    'Technology',
    'Design',
    'Business',
    'Science',
    'Lifestyle',
    'Health',
    'Travel',
    'Food',
    'Education',
    'Entertainment'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (formData.imageUrl) {
      setFormData(prev => ({ ...prev, imageUrl: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let imageUrl = formData.imageUrl;

      // Upload image if selected
      if (imageFile) {
        imageUrl = await uploadImageToFirebase(imageFile, 'articles');
      }

      const postData = {
        ...formData,
        imageUrl,
        googleId: 'current-user-google-id' // This should come from auth context
      };

      await postAPI.createPost(postData);
      navigate('/my-articles');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Open preview in new tab or modal
    console.log('Preview:', formData);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Create New Article
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Share your knowledge and insights with the community
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <TextField
              fullWidth
              label="Article Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              sx={{ mb: 3 }}
              placeholder="Enter an engaging title for your article"
            />

            {/* Description */}
            <TextField
              fullWidth
              label="Short Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={2}
              sx={{ mb: 3 }}
              placeholder="Brief description that appears in article previews"
              helperText={`${formData.description.length}/160 characters`}
              inputProps={{ maxLength: 160 }}
            />

            {/* Category */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                label="Category"
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Tags */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="Add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  size="small"
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddTag}
                  startIcon={<Add />}
                >
                  Add
                </Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>

            {/* Image Upload */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Featured Image
              </Typography>
              
              {imagePreview ? (
                <Card sx={{ maxWidth: 400, mb: 2 }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={imagePreview}
                    alt="Article preview"
                  />
                  <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton onClick={handleRemoveImage} color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                </Card>
              ) : (
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover',
                    },
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                  <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Click to upload featured image
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    PNG, JPG up to 5MB
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Content */}
            <TextField
              fullWidth
              label="Article Content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              multiline
              rows={12}
              required
              sx={{ mb: 3 }}
              placeholder="Write your article content here... Use Markdown for formatting."
              helperText="You can use Markdown syntax for formatting"
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handlePreview}
                startIcon={<Preview />}
              >
                Preview
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : <Publish />}
                sx={{ minWidth: 140 }}
              >
                {loading ? 'Publishing...' : 'Publish Article'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreatePost;