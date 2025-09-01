// src/components/articles/ArticleDetail.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Share,
  Bookmark,
  BookmarkBorder,
  AccessTime,
  Visibility,
  Edit,
  Delete,
  ArrowBack
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { postAPI, handleApiError } from '../../services/apiService';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetchArticleDetail();
  }, [id]);

  const fetchArticleDetail = async () => {
    try {
      setLoading(true);
      // Note: You'll need to add this endpoint to your API
      // const response = await postAPI.getPostById(id);
      // For now, let's simulate the API call
      
      // Mock article data - replace with actual API call
      const mockArticle = {
        id: id,
        title: 'Understanding Modern Web Development',
        content: `
# Introduction

Web development has evolved significantly over the past decade. With the rise of modern frameworks and tools, developers now have more power and flexibility than ever before.

## Key Technologies

### React
React has revolutionized the way we build user interfaces. Its component-based architecture makes it easier to:

- Build reusable components
- Manage application state
- Create interactive UIs

### Node.js
Node.js has enabled JavaScript to run on the server side, creating a unified development experience.

## Best Practices

1. **Write clean, maintainable code**
2. **Use proper version control**
3. **Implement proper testing strategies**
4. **Follow accessibility guidelines**

## Conclusion

The future of web development looks bright with continuous innovations and improvements in the ecosystem.
        `,
        description: 'A comprehensive guide to modern web development practices and technologies.',
        imageUrl: 'https://via.placeholder.com/800x400/d32f2f/ffffff?text=Web+Development',
        category: 'Technology',
        tags: ['React', 'Node.js', 'JavaScript', 'Web Development'],
        author: {
          name: 'John Doe',
          photoUrl: 'https://via.placeholder.com/40',
          email: 'john.doe@example.com'
        },
        likes: 42,
        views: 1250,
        createdAt: '2023-12-01T10:00:00Z',
        updatedAt: '2023-12-01T10:00:00Z'
      };
      
      setArticle(mockArticle);
      setLikeCount(mockArticle.likes);
      setError('');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await postAPI.likePost(id);
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You might want to show a toast notification here
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    // Implement bookmark functionality
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatContent = (content) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <Typography key={index} variant="h3" component="h1" sx={{ mt: 4, mb: 2, fontWeight: 700 }}>{line.substring(2)}</Typography>;
        } else if (line.startsWith('## ')) {
          return <Typography key={index} variant="h4" component="h2" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>{line.substring(3)}</Typography>;
        } else if (line.startsWith('### ')) {
          return <Typography key={index} variant="h5" component="h3" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>{line.substring(4)}</Typography>;
        } else if (line.startsWith('- ')) {
          return <Typography key={index} variant="body1" component="li" sx={{ ml: 2, mb: 0.5 }}>{line.substring(2)}</Typography>;
        } else if (/^\d+\.\s/.test(line)) {
          return <Typography key={index} variant="body1" component="li" sx={{ ml: 2, mb: 0.5 }}>{line.replace(/^\d+\.\s/, '')}</Typography>;
        } else if (line.trim() === '') {
          return <Box key={index} sx={{ mb: 1 }} />;
        } else {
          return <Typography key={index} variant="body1" paragraph>{line}</Typography>;
        }
      });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container maxWidth="md">
        <Alert severity="info" sx={{ mt: 4 }}>
          Article not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/home')}
          sx={{ mb: 2 }}
        >
          Back to Articles
        </Button>
      </Box>

      <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 3 }}>
        {/* Hero Image */}
        {article.imageUrl && (
          <Box
            component="img"
            src={article.imageUrl}
            alt={article.title}
            sx={{
              width: '100%',
              height: 400,
              objectFit: 'cover',
            }}
          />
        )}

        <Box sx={{ p: 4 }}>
          {/* Category and Date */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {article.category && (
                <Chip label={article.category} color="primary" variant="outlined" />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
              <AccessTime sx={{ fontSize: 16 }} />
              <Typography variant="caption">
                {formatDate(article.createdAt)}
              </Typography>
            </Box>
          </Box>

          {/* Title */}
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 2,
              lineHeight: 1.2,
            }}
          >
            {article.title}
          </Typography>

          {/* Description */}
          {article.description && (
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, fontWeight: 400, lineHeight: 1.6 }}
            >
              {article.description}
            </Typography>
          )}

          {/* Author Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar
              src={article.author.photoUrl}
              alt={article.author.name}
              sx={{ width: 56, height: 56, mr: 2 }}
            >
              {article.author.name[0]}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {article.author.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Visibility sx={{ fontSize: 16 }} />
                  <Typography variant="body2">{article.views} views</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Favorite sx={{ fontSize: 16 }} />
                  <Typography variant="body2">{likeCount} likes</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={liked ? 'Unlike' : 'Like'}>
                <IconButton
                  onClick={handleLike}
                  color={liked ? 'error' : 'default'}
                  size="large"
                >
                  {liked ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Share">
                <IconButton onClick={handleShare} size="large">
                  <Share />
                </IconButton>
              </Tooltip>
              <Tooltip title={bookmarked ? 'Remove bookmark' : 'Bookmark'}>
                <IconButton
                  onClick={handleBookmark}
                  color={bookmarked ? 'primary' : 'default'}
                  size="large"
                >
                  {bookmarked ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Content */}
          <Box sx={{ '& > *': { mb: 2 } }}>
            {formatContent(article.content)}
          </Box>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Tags
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {article.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    variant="outlined"
                    size="small"
                    clickable
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ArticleDetail;