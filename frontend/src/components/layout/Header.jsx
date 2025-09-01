// src/components/layout/Header.jsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Add as AddIcon,
  AccountCircle,
  Logout,
  Person,
  Favorite,
  Article
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Header = ({ user, onMenuClick, changeLoginStatus }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    Cookies.remove('access_token');
    changeLoginStatus(false);
    navigate('/');
    handleClose();
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    handleClose();
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 700,
            cursor: 'pointer'
          }}
          onClick={() => navigate('/home')}
        >
          ArticleHub
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            color="inherit"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create')}
            sx={{ 
              display: { xs: 'none', sm: 'flex' },
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
              }
            }}
          >
            Write Article
          </Button>

          <IconButton
            color="inherit"
            onClick={() => navigate('/create')}
            sx={{ display: { xs: 'flex', sm: 'none' } }}
          >
            <AddIcon />
          </IconButton>

          <IconButton
            color="inherit"
            onClick={handleProfileClick}
            sx={{ p: 0.5 }}
          >
            {user?.photoUrl ? (
              <Avatar
                src={user.photoUrl}
                alt={user.name}
                sx={{ width: 32, height: 32 }}
              />
            ) : (
              <AccountCircle sx={{ fontSize: 32 }} />
            )}
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
              }
            }}
          >
            <MenuItem onClick={() => handleMenuItemClick('/profile')}>
              <Person sx={{ mr: 2 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('/my-articles')}>
              <Article sx={{ mr: 2 }} />
              My Articles
            </MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('/liked-articles')}>
              <Favorite sx={{ mr: 2 }} />
              Liked Articles
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <Logout sx={{ mr: 2 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;