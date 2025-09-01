// src/components/auth/Login.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  CircularProgress,
  Fade,
  useTheme,
  Grid
} from '@mui/material';
import { Google as GoogleIcon, Article, TrendingUp, People } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Login = ({ isLoggedin, changeLoginStatus }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    const callbackUrl = `${window.location.origin}`;
    const googleClientId = import.meta.env.VITE_APP_CLIENT_ID;
    console.log("Client id is :", googleClientId);
    const targetUrl = `https://accounts.google.com/o/oauth2/auth?redirect_uri=${encodeURIComponent(
      callbackUrl
    )}&response_type=token&client_id=${googleClientId}&scope=openid%20email%20profile`;
    console.log(targetUrl);
    window.location.href = targetUrl;
  };

  useEffect(() => {
    const accessTokenRegex = /access_token=([^&]+)/;
    const isMatch = window.location.href.match(accessTokenRegex);

    if (isMatch) {
      console.log("isMatch :", isMatch);
      const accessToken = isMatch[1];
      Cookies.set("access_token", accessToken, { path: '/', secure: false, expires: 7, sameSite: "Strict" });
      changeLoginStatus(true);
    }
  }, [changeLoginStatus]);

  useEffect(() => {
    if (isLoggedin) {
      navigate("/home");
    }
  }, [isLoggedin, navigate]);

  const features = [
    {
      icon: <Article sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Write & Share',
      description: 'Create and publish engaging articles with rich content and images'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Discover Trending',
      description: 'Explore trending articles and discover new perspectives from writers'
    },
    {
      icon: <People sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Build Community',
      description: 'Connect with like-minded readers and writers in our growing community'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.background.default})`,
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Grid container spacing={6} alignItems="center">
            {/* Left side - Hero content */}
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  ArticleHub
                </Typography>
                <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{ mb: 4, fontWeight: 400, lineHeight: 1.6 }}
                >
                  Your platform for sharing knowledge, insights, and stories with the world
                </Typography>

                {/* Features */}
                <Box sx={{ mb: 4 }}>
                  {features.map((feature, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 3,
                        justifyContent: { xs: 'center', md: 'flex-start' }
                      }}
                    >
                      <Box sx={{ mr: 3 }}>{feature.icon}</Box>
                      <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Right side - Login card */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Paper
                  elevation={8}
                  sx={{
                    p: 6,
                    borderRadius: 4,
                    background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    maxWidth: 400,
                    width: '100%'
                  }}
                >
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                      Welcome Back
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Sign in to start writing and reading amazing articles
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleClick}
                    disabled={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <GoogleIcon />
                      )
                    }
                    sx={{
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      textTransform: 'none',
                      background: 'linear-gradient(45deg, #d32f2f, #ff6659)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #b71c1c, #d32f2f)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(211, 47, 47, 0.3)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? 'Signing in...' : 'Continue with Google'}
                  </Button>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      textAlign: 'center',
                      mt: 3,
                      lineHeight: 1.5
                    }}
                  >
                    By continuing, you agree to our Terms of Service and Privacy Policy
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;