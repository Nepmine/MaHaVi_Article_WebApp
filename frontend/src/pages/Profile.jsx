// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Stack
} from '@mui/material';
import {
  Edit,
  Article,
  Favorite,
  Visibility,
  TrendingUp,
  Person,
  Email,
  CalendarToday,
  Save,
  Cancel
} from '@mui/icons-material';
import { authAPI, postAPI, handleApiError } from '../services/apiService';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalLikes: 0,
    totalViews: 0,
    articlesThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: ''
  });

  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUserDetails();
      setUser(response.data);
      setEditForm({
        name: response.data.name || '',
        bio: response.data.bio || '',
        location: response.data.location || ''
      });
      setError('');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const [articlesResponse] = await Promise.all([
        postAPI.getUserPosts()
      ]);
      
      const articles = articlesResponse.data || [];
      const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0);
      const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
      
      // Calculate articles this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const articlesThisMonth = articles.filter(article => {
        const articleDate = new Date(article.createdAt);
        return articleDate.getMonth() === currentMonth && articleDate.getFullYear() === currentYear;
      }).length;

      setStats({
        totalArticles: articles.length,
        totalLikes,
        totalViews,
        articlesThisMonth
      });
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
    }
  };

  const handleEditSubmit = async () => {
    try {
      // Note: You'll need to implement this API endpoint
      // await authAPI.updateProfile(editForm);
      setUser(prev => ({ ...prev, ...editForm }));
      setEditDialog(false);
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const StatCard = ({ icon, title, value, color = 'primary' }) => (
    <Card sx={{ height: '100%', textAlign: 'center' }}>
      <CardContent>
        <Box sx={{ color: `${color}.main`, mb: 2 }}>
          {icon}
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

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

  return (
    <Container maxWidth="lg">
      <Fade in timeout={800}>
        <Box>
          {/* Profile Header */}
          <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item>
                <Avatar
                  src={user?.photoUrl}
                  alt={user?.name}
                  sx={{ 
                    width: 120, 
                    height: 120,
                    border: '4px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  {user?.name?.[0]}
                </Avatar>
              </Grid>
              
              <Grid item xs>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                      {user?.name}
                    </Typography>
                    {user?.auther && (
                      <Chip 
                        icon={<Edit />} 
                        label="Author" 
                        color="primary" 
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                    )}
                  </Box>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setEditDialog(true)}
                  >
                    Edit Profile
                  </Button>
                </Box>

                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body1" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                  
                  {user?.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body1" color="text.secondary">
                        {user.location}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body1" color="text.secondary">
                      Joined {formatDate(user?.createdAt || '2023-01-01')}
                    </Typography>
                  </Box>
                </Stack>

                {user?.bio && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                      "{user.bio}"
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>

          {/* Statistics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<Article sx={{ fontSize: 40 }} />}
                title="Total Articles"
                value={stats.totalArticles}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<Favorite sx={{ fontSize: 40 }} />}
                title="Total Likes"
                value={stats.totalLikes}
                color="error"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<Visibility sx={{ fontSize: 40 }} />}
                title="Total Views"
                value={stats.totalViews}
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<TrendingUp sx={{ fontSize: 40 }} />}
                title="This Month"
                value={stats.articlesThisMonth}
                color="success"
              />
            </Grid>
          </Grid>

          {/* Recent Activity */}
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
              Profile Overview
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  About
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {user?.bio || 'No bio provided yet. Edit your profile to add a bio.'}
                </Typography>
                
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Achievements
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {stats.totalArticles >= 1 && (
                    <Chip label="First Article" icon={<Article />} color="primary" variant="outlined" />
                  )}
                  {stats.totalArticles >= 10 && (
                    <Chip label="Prolific Writer" icon={<Edit />} color="success" variant="outlined" />
                  )}
                  {stats.totalLikes >= 50 && (
                    <Chip label="Popular Author" icon={<Favorite />} color="error" variant="outlined" />
                  )}
                  {stats.totalViews >= 1000 && (
                    <Chip label="Trending Writer" icon={<TrendingUp />} color="warning" variant="outlined" />
                  )}
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button variant="outlined" startIcon={<Article />} fullWidth>
                    View My Articles
                  </Button>
                  <Button variant="outlined" startIcon={<Favorite />} fullWidth>
                    View Liked Articles
                  </Button>
                  <Button variant="contained" startIcon={<Edit />} fullWidth>
                    Write New Article
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Fade>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={editDialog} 
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={editForm.name}
              onChange={handleInputChange}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Bio"
              name="bio"
              value={editForm.bio}
              onChange={handleInputChange}
              multiline
              rows={3}
              sx={{ mb: 3 }}
              placeholder="Tell us about yourself..."
            />
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={editForm.location}
              onChange={handleInputChange}
              placeholder="City, Country"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setEditDialog(false)}
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit}
            variant="contained"
            startIcon={<Save />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;