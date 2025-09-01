// src/components/layout/Sidebar.jsx
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Home,
  Article,
  Favorite,
  Person,
  TrendingUp,
  Create
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 240;

const menuItems = [
  { text: 'Home', icon: <Home />, path: '/home' },
  { text: 'Trending', icon: <TrendingUp />, path: '/trending' },
  { text: 'Write Article', icon: <Create />, path: '/create' },
  { text: 'My Articles', icon: <Article />, path: '/my-articles' },
  { text: 'Liked Articles', icon: <Favorite />, path: '/liked-articles' },
  { text: 'Profile', icon: <Person />, path: '/profile' },
];

const Sidebar = ({ open, onClose, variant = 'permanent' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleItemClick = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawer = (
    <Box>
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.slice(0, 3).map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleItemClick(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                    borderRight: `3px solid ${theme.palette.primary.main}`,
                    '&:hover': {
                      backgroundColor: 'rgba(211, 47, 47, 0.15)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(211, 47, 47, 0.05)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path 
                      ? theme.palette.primary.main 
                      : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 1 }} />
        <List>
          {menuItems.slice(3).map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleItemClick(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                    borderRight: `3px solid ${theme.palette.primary.main}`,
                    '&:hover': {
                      backgroundColor: 'rgba(211, 47, 47, 0.15)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(211, 47, 47, 0.05)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path 
                      ? theme.palette.primary.main 
                      : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;