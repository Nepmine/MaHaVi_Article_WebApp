// src/components/layout/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import { authAPI } from '../../services/apiService';

const Layout = ({ children, changeLoginStatus }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await authAPI.getUserDetails();
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleDrawerClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <Header
        user={user}
        onMenuClick={handleDrawerToggle}
        changeLoginStatus={changeLoginStatus}
      />
      
      <Sidebar
        open={sidebarOpen}
        onClose={handleDrawerClose}
        variant={isMobile ? 'temporary' : 'permanent'}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 240px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;