// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Cookies from 'js-cookie';

// Theme
import theme from './theme/theme';

// Components
import Login from './components/auth/Login';
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import MyArticles from './pages/MyArticles';
import LikedArticles from './pages/LikedArticles';
import Profile from './pages/Profile';
import ArticleDetail from './components/articles/ArticleDetail';

// Auth service
import { authAPI } from './services/apiService';

function App() {
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [loading, setLoading] = useState(true);

  const changeLoginStatus = (state) => {
    setIsLoggedin(state);
  };

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = Cookies.get('access_token');
      if (token) {
        try {
          await authAPI.login(); // Verify token with backend
          setIsLoggedin(true);
        } catch (error) {
          console.error('Token validation failed:', error);
          Cookies.remove('access_token');
          setIsLoggedin(false);
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div>Loading...</div>; // You can replace with a proper loading component
    }
    
    return isLoggedin ? (
      <Layout changeLoginStatus={changeLoginStatus}>{children}</Layout>
    ) : (
      <Navigate to="/" />
    );
  };

  if (loading) {
    return <div>Loading...</div>; // You can replace with a proper loading component
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              isLoggedin ? (
                <Navigate to="/home" />
              ) : (
                <Login isLoggedin={isLoggedin} changeLoginStatus={changeLoginStatus} />
              )
            } 
          />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-articles"
            element={
              <ProtectedRoute>
                <MyArticles />
              </ProtectedRoute>
            }
          />

          <Route
            path="/liked-articles"
            element={
              <ProtectedRoute>
                <LikedArticles />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/article/:id"
            element={
              <ProtectedRoute>
                <ArticleDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-article/:id"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trending"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route
            path="*"
            element={<Navigate to={isLoggedin ? "/home" : "/"} />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;