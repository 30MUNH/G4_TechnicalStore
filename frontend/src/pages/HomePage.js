import React from 'react';
import { Container, Grid, Card, CardMedia, CardContent, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const shops = [
    {
      id: 1,
      image: '/img/shop01.png',
      title: 'Laptops',
      description: 'New Arrivals',
    },
    {
      id: 2,
      image: '/img/shop02.png',
      title: 'Smartphones',
      description: 'New Arrivals',
    },
    {
      id: 3,
      image: '/img/shop03.png',
      title: 'Cameras',
      description: 'New Arrivals',
    },
  ];

  const featuredProducts = [
    {
      id: 1,
      image: '/img/product01.png',
      name: 'HP Laptop Pro',
      price: 999.99,
      oldPrice: 1299.99,
      discount: 23,
    },
    {
      id: 2,
      image: '/img/product02.png',
      name: 'Samsung Galaxy S21',
      price: 799.99,
      oldPrice: 899.99,
      discount: 11,
    },
    {
      id: 3,
      image: '/img/product03.png',
      name: 'Canon EOS R5',
      price: 3499.99,
      oldPrice: 3999.99,
      discount: 13,
    },
    {
      id: 4,
      image: '/img/product04.png',
      name: 'Apple MacBook Air',
      price: 1299.99,
      oldPrice: 1499.99,
      discount: 13,
    },
  ];

  const newProducts = [
    {
      id: 5,
      image: '/img/product05.png',
      name: 'Sony WH-1000XM4',
      price: 349.99,
      oldPrice: 399.99,
      discount: 13,
    },
    {
      id: 6,
      image: '/img/product06.png',
      name: 'Dell XPS 13',
      price: 1199.99,
      oldPrice: 1299.99,
      discount: 8,
    },
    {
      id: 7,
      image: '/img/product07.png',
      name: 'iPhone 13 Pro',
      price: 999.99,
      oldPrice: 1099.99,
      discount: 9,
    },
    {
      id: 8,
      image: '/img/product08.png',
      name: 'Nikon Z6 II',
      price: 1999.99,
      oldPrice: 2199.99,
      discount: 9,
    },
  ];

  return (
    <div>
      {/* Shops Section */}
      <Container sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {shops.map((shop) => (
            <Grid item key={shop.id} xs={12} sm={6} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={shop.image}
                  alt={shop.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {shop.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {shop.description}
                  </Typography>
                  <Button
                    component={Link}
                    to={`/${shop.title.toLowerCase()}`}
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                  >
                    Shop Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products Section */}
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Featured Products
        </Typography>
        <Grid container spacing={4}>
          {featuredProducts.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={3}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* New Products Section */}
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          New Products
        </Typography>
        <Grid container spacing={4}>
          {newProducts.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={3}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
};

export default HomePage; 