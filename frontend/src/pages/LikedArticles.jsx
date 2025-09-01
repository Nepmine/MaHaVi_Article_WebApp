// src/pages/LikedArticles.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import { Favorite } from '@mui/icons-material';
import ArticleCard from '../components/articles/ArticleCard';
import { postAPI, handleApiError } from '../services/apiService';

const LikedArticles = () => {
  const [likedArticles, setLikedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLikedArticles();
  }, []);

  const fetchLikedArticles = async () => {
    try {
      setLoading(true);
      const response = await postAPI.getLikedPosts();
      setLikedArticles(response.data || []);
      setError('');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLikeUpdate = (articleId, isLiked) => {
    if (!isLiked) {
      // Remove from liked articles if unliked
      setLikedArticles(prev => prev.filter(article => article.id !== articleId));
    } else {
      // Update like count if still liked
      setLikedArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, likes: (article.likes || 0) + 1 }
          : article
      ));
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
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Favorite sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Liked Articles
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Articles you've liked and want to revisit
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {likedArticles.length > 0 ? (
            <Grid container spacing={3}>
              {likedArticles.map((article) => (
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
              minHeight="400px"
              textAlign="center"
            >
              <Favorite sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No liked articles yet
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Start exploring and like articles that interest you
              </Typography>
            </Box>
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default LikedArticles;