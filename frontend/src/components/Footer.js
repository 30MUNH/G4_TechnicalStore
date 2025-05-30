import React from 'react';
import PropTypes from 'prop-types';
import { Container, Grid, Typography, Link, Box, IconButton } from '@mui/material';
import { Facebook, Twitter, Instagram, YouTube } from '@mui/icons-material';

// Constants
const CATEGORIES = [
  'Hot Deals',
  'Laptops',
  'PCs',
  'Accessories',
  'Optional PC',
];

const CUSTOMER_SERVICE = [
  'My Account',
  'View Cart',
  'Wishlist',
  'Track My Order',
  'Help',
];

const SOCIAL_LINKS = [
  { icon: Facebook, url: '#' },
  { icon: Twitter, url: '#' },
  { icon: Instagram, url: '#' },
  { icon: YouTube, url: '#' },
];

// Styles
const styles = {
  footer: {
    backgroundColor: '#232f3e',
    color: 'white',
    py: 6,
    mt: 'auto',
  },
  list: {
    listStyle: 'none',
    p: 0,
  },
  listItem: {
    mb: 1,
  },
  link: {
    display: 'block',
  },
  copyright: {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    mt: 4,
    pt: 4,
    textAlign: 'center',
  },
};

// Sub-components
const SocialLinks = ({ links }) => (
  <Box sx={{ mt: 2 }}>
    {links.map(({ icon: Icon, url }, index) => (
      <IconButton key={index} color="inherit" component="a" href={url}
        sx={{
          color: '#fff',
          '&:hover': { color: '#1e90ff', backgroundColor: 'rgba(30,144,255,0.1)' }
        }}
      >
        <Icon />
      </IconButton>
    ))}
  </Box>
);

SocialLinks.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.elementType.isRequired,
      url: PropTypes.string.isRequired,
    })
  ).isRequired,
};

const FooterSection = ({ title, items }) => (
  <Grid item xs={12} md={4}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Box component="ul" sx={styles.list}>
      {items.map((item) => (
        <Box component="li" key={item} sx={styles.listItem}>
          <Link href="#" color="inherit" underline="hover" sx={styles.link}>
            {item}
          </Link>
        </Box>
      ))}
    </Box>
  </Grid>
);

FooterSection.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const Copyright = () => (
  <Box sx={styles.copyright}>
    <Typography variant="body2">
      Copyright © {new Date().getFullYear()} All rights reserved | This template is made with ❤️ by{' '}
      <Link href="#" color="inherit" underline="hover">
        Colorlib
      </Link>
    </Typography>
  </Box>
);

const Footer = () => {
  return (
    <Box component="footer" sx={styles.footer}>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              ABOUT US
            </Typography>
            <Typography variant="body2" paragraph>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Typography>
            <SocialLinks links={SOCIAL_LINKS} />
          </Grid>

          <FooterSection title="CATEGORIES" items={CATEGORIES} />
          <FooterSection title="CUSTOMER SERVICE" items={CUSTOMER_SERVICE} />
        </Grid>

        <Copyright />
      </Container>
    </Box>
  );
};

export default Footer; 