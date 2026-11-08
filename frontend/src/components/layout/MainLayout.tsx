import { useState } from 'react';

import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuOpen = () => {
    setMobileOpen(true);
  };

  const handleMenuClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'background.default',
      }}>
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onClose={handleMenuClose} />

      {/* Main section */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}>
        {/* Header */}
        <Header onMenuClick={handleMenuOpen} />

        {/* Current page */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            p: {
              xs: 2,
              sm: 3,
              md: 4,
            },
          }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;
