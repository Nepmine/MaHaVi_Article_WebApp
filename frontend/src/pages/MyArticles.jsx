// src/pages/MyArticles.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  Favorite,
  Share,
  Analytics,
  Public,
  Drafts as Draft
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { postAPI, handleApiError } from '../services/apiService';

const MyArticles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, article: null });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    fetchMyArticles();
  }, []);

  const fetchMyArticles = async () => {
    try {
      setLoading(true);
      const response = await postAPI.getUserPosts();
      setArticles(response.data || []);
      setError('');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, article) => {
    setAnchorEl(event.currentTarget);
    setSelectedArticle(article);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedArticle(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialog({ open: true, article: selectedArticle });
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      // await postAPI.deletePost(deleteDialog.article.id);
      setArticles(prev => prev.filter(article => article.id !== deleteDialog.article.id));
      setDeleteDialog({ open: false, article: null });
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleViewArticle = (articleId) => {
    navigate(`/article/${articleId}`);
  };

  const handleEditArticle = (articleId) => {
    navigate(`/edit-article/${articleId}`);
    handleMenuClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusChip = (article) => {
    const isPublished = article.status === 'published' || !article.status;
    return (
      <Chip
        icon={isPublished ? <Public /> : <Draft />}
        label={isPublished ? 'Published' : 'Draft'}
        color={isPublished ? 'success' : 'warning'}
        size="small"
      />
    );
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
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            My Articles
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/create')}
            size="large"
          >
            Write New Article
          </Button>
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          Manage and track your published articles
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {articles.length > 0 ? (
        <Grid container spacing={3}>
          {articles.map((article) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={article.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                }}
              >
                {article.imageUrl && (
                  <CardMedia
                    component="img"
                    height="160"
                    image={article.imageUrl}
                    alt={article.title}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    {getStatusChip(article)}
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, article)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {article.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {article.description || article.content?.substring(0, 100) + '...'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {article.category && (
                      <Chip label={article.category} size="small" variant="outlined" />
                    )}
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Published on {formatDate(article.createdAt)}
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Favorite sx={{ fontSize: 16, color: 'error.main' }} />
                      <Typography variant="body2">{article.likes || 0}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Visibility sx={{ fontSize: 16, color: 'info.main' }} />
                      <Typography variant="body2">{article.views || 0}</Typography>
                    </Box>
                  </Box>

                  <Button
                    size="small"
                    onClick={() => handleViewArticle(article.id)}
                    startIcon={<Visibility />}
                  >
                    View
                  </Button>
                </CardActions>
              </Card>
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
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No articles yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start sharing your thoughts and ideas with the world
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => navigate('/create')}
          >
            Write Your First Article
          </Button>
        </Box>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleViewArticle(selectedArticle?.id)}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEditArticle(selectedArticle?.id)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Analytics fontSize="small" />
          </ListItemIcon>
          <ListItemText>Analytics</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, article: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Article</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.article?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, article: null })}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyArticles;