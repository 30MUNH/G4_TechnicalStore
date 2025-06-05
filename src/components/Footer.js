import React from 'react';
import { Container, Grid, Typography, Link, Box, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, YouTube } from '@mui/icons-material';

const Footer = () => {
  const categories = [
    'Hot Deals',
    'Laptops',
    'Smartphones',
    'Cameras',
    'Accessories',
  ];

  const customerService = [
    'My Account',
    'View Cart',
    'Wishlist',
    'Track My Order',
    'Help',
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1e1e27',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container>
        <Grid container spacing={4}>
          {/* About */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              ABOUT US
            </Typography>
            <Typography variant="body2" paragraph>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="inherit">
                <Facebook />
              </IconButton>
              <IconButton color="inherit">
                <Twitter />
              </IconButton>
              <IconButton color="inherit">
                <Instagram />
              </IconButton>
              <IconButton color="inherit">
                <YouTube />
              </IconButton>
            </Box>
          </Grid>

          {/* Categories */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              CATEGORIES
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
              {categories.map((category) => (
                <Box component="li" key={category} sx={{ mb: 1 }}>
                  <Link
                    href="#"
                    color="inherit"
                    underline="hover"
                    sx={{ display: 'block' }}
                  >
                    {category}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Customer Service */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              CUSTOMER SERVICE
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
              {customerService.map((service) => (
                <Box component="li" key={service} sx={{ mb: 1 }}>
                  <Link
                    href="#"
                    color="inherit"
                    underline="hover"
                    sx={{ display: 'block' }}
                  >
                    {service}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            mt: 4,
            pt: 4,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2">
            Copyright © {new Date().getFullYear()} All rights reserved | This
            template is made with ❤️ by{' '}
            <Link href="#" color="inherit" underline="hover">
              Colorlib
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 