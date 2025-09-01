// src/components/articles/ArticleCard.jsx
import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Avatar,
  Box,
  Chip,
  Tooltip,
  Skeleton
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Share,
  BookmarkBorder,
  Bookmark,
  AccessTime,
  Visibility
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../../services/apiService';

const ArticleCard = ({ article, onLikeUpdate }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(article.likes || 0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      await postAPI.likePost(article.id);
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
      if (onLikeUpdate) {
        onLikeUpdate(article.id, !liked);
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: window.location.origin + `/article/${article.id}`,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.origin + `/article/${article.id}`);
    }
  };

  const handleCardClick = () => {
    navigate(`/article/${article.id}`);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = (now - postDate) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  return (
    <Card
      sx={{
        maxWidth: 400,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={handleCardClick}
    >
      {article.imageUrl && (
        <Box sx={{ position: 'relative' }}>
          {!imageLoaded && (
            <Skeleton variant="rectangular" width="100%" height={200} />
          )}
          <CardMedia
            component="img"
            height="200"
            image={article.imageUrl}
            alt={article.title}
            onLoad={() => setImageLoaded(true)}
            sx={{ 
              display: imageLoaded ? 'block' : 'none',
              objectFit: 'cover'
            }}
          />
          {article.category && (
            <Chip
              label={article.category}
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                backgroundColor: 'rgba(255,255,255,0.9)',
                fontWeight: 600,
              }}
            />
          )}
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography
          gutterBottom
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 600,
            lineHeight: 1.3,
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
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2,
            lineHeight: 1.5,
          }}
        >
          {article.description || article.content?.substring(0, 120) + '...'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={article.author?.photoUrl}
            alt={article.author?.name}
            sx={{ width: 32, height: 32, mr: 1 }}
          >
            {article.author?.name?.[0]}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" fontWeight={500}>
              {article.author?.name || 'Anonymous'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {formatTimeAgo(article.createdAt)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={liked ? 'Unlike' : 'Like'}>
            <IconButton
              size="small"
              onClick={handleLike}
              color={liked ? 'error' : 'default'}
            >
              {liked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Tooltip>
          <Typography variant="body2" color="text.secondary">
            {likeCount}
          </Typography>

          <Tooltip title="Share">
            <IconButton size="small" onClick={handleShare}>
              <Share />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={bookmarked ? 'Remove bookmark' : 'Bookmark'}>
            <IconButton
              size="small"
              onClick={handleBookmark}
              color={bookmarked ? 'primary' : 'default'}
            >
              {bookmarked ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );
};

export default ArticleCard;