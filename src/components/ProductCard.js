import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardMedia, CardContent, Typography, IconButton, Box } from '@mui/material';
import { Favorite, ShoppingCart } from '@mui/icons-material';

// Styles
const styles = {
  card: {
    maxWidth: 345,
    position: 'relative',
    backgroundColor: '#fff',
    border: '1px solid #e3e6ea',
    boxShadow: '0 2px 8px rgba(30,47,62,0.04)',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#1e90ff', // xanh dương sáng
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    zIndex: 1,
    fontWeight: 600,
  },
  productImage: {
    objectFit: 'contain',
    padding: '20px',
    background: '#f5f7fa',
    borderRadius: '8px',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  oldPrice: {
    textDecoration: 'line-through',
    color: '#888',
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    mt: 2,
  },
};

// Sub-components
const DiscountBadge = ({ discount }) => (
  <Box sx={styles.discountBadge}>
    {discount}% OFF
  </Box>
);

const ProductImage = ({ image, name }) => (
  <CardMedia
    component="img"
    height="200"
    image={image}
    alt={name}
    sx={styles.productImage}
  />
);

const ProductInfo = ({ name, price, oldPrice }) => (
  <CardContent>
    <Typography gutterBottom variant="h6" component="div" noWrap>
      {name}
    </Typography>
    <Box sx={styles.priceContainer}>
      <Typography variant="h6" color="primary">
        ${price}
      </Typography>
      {oldPrice && (
        <Typography variant="body2" color="text.secondary" sx={styles.oldPrice}>
          ${oldPrice}
        </Typography>
      )}
    </Box>
  </CardContent>
);

const ActionButtons = () => (
  <Box sx={styles.actionButtons}>
    <IconButton color="primary" aria-label="add to wishlist">
      <Favorite />
    </IconButton>
    <IconButton color="primary" aria-label="add to cart">
      <ShoppingCart />
    </IconButton>
  </Box>
);

const ProductCard = ({ product }) => {
  const { image, name, price, oldPrice, discount } = product;

  return (
    <Card sx={styles.card}>
      {discount && <DiscountBadge discount={discount} />}
      <ProductImage image={image} name={name} />
      <ProductInfo name={name} price={price} oldPrice={oldPrice} />
      <ActionButtons />
    </Card>
  );
};

// PropTypes
ProductCard.propTypes = {
  product: PropTypes.shape({
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    oldPrice: PropTypes.number,
    discount: PropTypes.number
  }).isRequired
};

DiscountBadge.propTypes = {
  discount: PropTypes.number.isRequired
};

ProductImage.propTypes = {
  image: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};

ProductInfo.propTypes = {
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  oldPrice: PropTypes.number
};

export default ProductCard; 