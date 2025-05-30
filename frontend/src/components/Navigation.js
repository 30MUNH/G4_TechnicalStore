import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

// Constants
const MENU_ITEMS = [
  { text: 'Home', path: '/' },
  { text: 'Hot Deals', path: '/hot-deals' },
  { text: 'Categories', path: '/categories' },
  { text: 'Laptops', path: '/laptops' },
  { text: 'PCs', path: '/pcs' },
  { text: 'Accessories', path: '/accessories' },
  { text: 'Optional PC', path: '/optionalPC' },
];

// Styles
const styles = {
  desktopMenu: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '40px',
    width: '100%',
    backgroundColor: '#232f3e',
    padding: '0.5rem 0',
  },
  menuButton: {
    borderRadius: '8px',
    padding: '8px 20px',
    color: '#fff',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: '#1e90ff',
      color: '#fff',
    },
    transition: 'all 0.3s ease',
    fontWeight: 500,
    fontSize: '1.05rem',
  },
  mobileMenuButton: {
    mr: 2,
    display: { sm: 'none' },
    color: '#fff',
  },
  drawer: {
    display: { xs: 'block', sm: 'none' },
    '& .MuiDrawer-paper': {
      boxSizing: 'border-box',
      width: 240,
      backgroundColor: '#232f3e',
      color: '#fff',
    }
  },
  toolbar: {
    justifyContent: 'center',
    backgroundColor: '#232f3e',
    minHeight: '56px',
  },
  listItem: {
    '&:hover': {
      backgroundColor: '#1e90ff',
      color: '#fff',
    },
    transition: 'all 0.3s ease',
    borderRadius: '8px',
    margin: '4px 0',
  }
};

// Sub-components
const DesktopMenu = ({ menuItems }) => (
  <div style={styles.desktopMenu}>
    {menuItems.map((item) => (
      <Button
        key={item.text}
        component={Link}
        to={item.path}
        color="inherit"
        sx={styles.menuButton}
      >
        {item.text}
      </Button>
    ))}
  </div>
);

DesktopMenu.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired
    })
  ).isRequired
};

const MobileMenu = ({ open, onClose, menuItems }) => (
  <Drawer
    variant="temporary"
    anchor="left"
    open={open}
    onClose={onClose}
    ModalProps={{
      keepMounted: true // Better open performance on mobile
    }}
    sx={styles.drawer}
  >
    <List>
      {menuItems.map((item) => (
        <ListItem
          button
          key={item.text}
          component={Link}
          to={item.path}
          onClick={onClose}
          sx={styles.listItem}
        >
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  </Drawer>
);

MobileMenu.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired
    })
  ).isRequired
};

const Navigation = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <nav>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar sx={styles.toolbar}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={styles.mobileMenuButton}
          >
            <MenuIcon />
          </IconButton>

          <DesktopMenu menuItems={MENU_ITEMS} />
        </Toolbar>
      </AppBar>

      <MobileMenu
        open={mobileOpen}
        onClose={handleDrawerToggle}
        menuItems={MENU_ITEMS}
      />
    </nav>
  );
};

export default Navigation; 