import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

const Navigation = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const menuItems = [
    { text: 'Home', path: '/' },
    { text: 'Hot Deals', path: '/hot-deals' },
    { text: 'Categories', path: '/categories' },
    { text: 'Laptops', path: '/laptops' },
    { text: 'Smartphones', path: '/smartphones' },
    { text: 'Cameras', path: '/cameras' },
    { text: 'Accessories', path: '/accessories' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <nav>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Desktop Menu */}
          <div style={{ display: { xs: 'none', sm: 'flex' }, gap: '20px' }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                to={item.path}
                color="inherit"
              >
                {item.text}
              </Button>
            ))}
          </div>
        </Toolbar>
      </AppBar>

      {/* Mobile Menu */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              onClick={handleDrawerToggle}
            >
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </nav>
  );
};

export default Navigation; 