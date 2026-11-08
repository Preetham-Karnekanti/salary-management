
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';

import { NavLink } from 'react-router-dom';

const SIDEBAR_WIDTH = 250;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const navigationItemStyles = {
    borderRadius: 2,
    mb: 0.5,
    px: 2,
    py: 1.2,
    color: 'text.secondary',

    '& .MuiListItemIcon-root': {
      minWidth: 38,
      color: 'inherit',
    },

    '&.active': {
      backgroundColor: 'primary.light',
      color: '#FFFFFF',
    },

    '&:hover': {
      backgroundColor: 'action.hover',
    },
  };

  return (
    <Drawer
      variant={isDesktop ? 'permanent' : 'temporary'}
      open={isDesktop || mobileOpen}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        width: isDesktop ? SIDEBAR_WIDTH : 0,
        flexShrink: 0,

        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          height: '100vh',
          position: isDesktop ? 'relative' : 'fixed',
          borderRight: 1,
          borderColor: 'divider',
        },
      }}
    >
      <Box
        component="aside"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Branding */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 3,
            py: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: 'primary.main',
              color: '#FFFFFF',
            }}
          >
            <BusinessRoundedIcon />
          </Box>

          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              ACME
            </Typography>

            <Typography variant="caption" color="text.secondary">
              People Management
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Navigation */}
        <Box sx={{ px: 2, py: 3, flexGrow: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ px: 2, mb: 1.5, display: 'block' }}
          >
            WORKSPACE
          </Typography>

          <List disablePadding>
            <ListItemButton
              component={NavLink}
              to="/employees"
              end
              onClick={onClose}
              sx={navigationItemStyles}
            >
              <ListItemIcon>
                <PeopleAltOutlinedIcon />
              </ListItemIcon>

              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                    Employees
                  </Typography>
                }
              />
            </ListItemButton>

            <ListItemButton
              component={NavLink}
              to="/salary-management"
              onClick={onClose}
              sx={navigationItemStyles}
            >
              <ListItemIcon>
                <PaymentsOutlinedIcon />
              </ListItemIcon>

              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                    Salary Management
                  </Typography>
                }
              />
            </ListItemButton>
          </List>
        </Box>

        {/* Footer */}
        <Divider />

        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="caption" color="text.secondary">
            ACME HR Management
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}

export default Sidebar;
