import React from 'react';
import { Card, CardMedia, CardContent, Typography, IconButton, Box } from '@mui/material';
import { Favorite, ShoppingCart } from '@mui/icons-material';

const ProductCard = ({ product }) => {
  const { image, name, price, oldPrice, discount } = product;

  return (
    <Card sx={{ maxWidth: 345, position: 'relative' }}>
      {/* Discount Badge */}
      {discount && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: '#D10024',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            zIndex: 1,
          }}
        >
          {discount}% OFF
        </Box>
      )}

      {/* Product Image */}
      <CardMedia
        component="img"
        height="200"
        image={image}
        alt={name}
        sx={{ objectFit: 'contain', padding: '20px' }}
      />

      {/* Product Info */}
      <CardContent>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" color="primary">
            ${price}
          </Typography>
          {oldPrice && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'line-through' }}
            >
              ${oldPrice}
            </Typography>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <IconButton color="primary" aria-label="add to wishlist">
            <Favorite />
          </IconButton>
          <IconButton color="primary" aria-label="add to cart">
            <ShoppingCart />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard; 