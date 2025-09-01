// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Container,
  Tabs,
  Tab,
  Paper,
  InputAdornment,
  TextField,
  Chip,
  Stack,
  Fade
} from '@mui/material';
import { Search, TrendingUp, NewReleases as New, Star } from '@mui/icons-material';
import ArticleCard from '../components/articles/ArticleCard';
import { postAPI, handleApiError } from '../services/apiService';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [filteredArticles, setFilteredArticles] = useState([]);

  const categories = ['All', 'Technology', 'Design', 'Business', 'Science', 'Lifestyle'];

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, selectedTab]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await postAPI.getHomePosts();
      setArticles(response.data || []);
      setError('');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = [...articles];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by tab selection
    switch (selectedTab) {
      case 0: // Latest
        filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 1: // Trending (by score)
        filtered = filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
        break;
      case 2: // Most Liked
        filtered = filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      default:
        break;
    }

    setFilteredArticles(filtered);
  };

  const handleLikeUpdate = (articleId, isLiked) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, likes: (article.likes || 0) + (isLiked ? 1 : -1) }
        : article
    ));
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getTabIcon = (index) => {
    switch (index) {
      case 0: return <New />;
      case 1: return <TrendingUp />;
      case 2: return <Star />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Fade in timeout={800}>
        <Box>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #d32f2f, #ff6659)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Discover Amazing Articles
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Explore the latest stories, insights, and ideas from our community
            </Typography>

            {/* Search Bar */}
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search articles, topics, or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                maxWidth: 600,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'background.paper',
                }
              }}
            />
          </Box>

          {/* Categories */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  variant="outlined"
                  clickable
                  sx={{
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Tabs for sorting */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 60,
                  fontWeight: 600,
                },
              }}
            >
              <Tab icon={getTabIcon(0)} label="Latest" />
              <Tab icon={getTabIcon(1)} label="Trending" />
              <Tab icon={getTabIcon(2)} label="Most Liked" />
            </Tabs>
          </Paper>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Articles Grid */}
          {filteredArticles.length > 0 ? (
            <Grid container spacing={3}>
              {filteredArticles.map((article) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={article.id}>
                  <ArticleCard 
                    article={article} 
                    onLikeUpdate={handleLikeUpdate}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              minHeight="300px"
            >
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No articles found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {searchTerm ? 'Try adjusting your search terms' : 'Be the first to share your story!'}
              </Typography>
            </Box>
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default Home;