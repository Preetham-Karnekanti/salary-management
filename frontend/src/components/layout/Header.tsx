
import {
    Avatar,
    Box,
    IconButton,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

import { useMatches } from 'react-router-dom';

interface HeaderProps {
    onMenuClick: () => void;
}

interface RouteHandle {
    title?: string;
}

function Header({ onMenuClick }: HeaderProps) {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    const matches = useMatches();

    // Find the deepest matched route containing a title.
    const pageTitle =
        [...matches]
            .reverse()
            .map((match) => {
                const handle = match.handle as RouteHandle | undefined;
                return handle?.title;
            })
            .find((title): title is string => Boolean(title)) ?? 'Workspace';

    return (
        <Box
            component="header"
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: theme.zIndex.appBar,
                backgroundColor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider',
            }}
        >
            {/* Header content */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: 64,
                    px: { xs: 2, sm: 3 },
                }}
            >
                {/* Left section */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        minWidth: 0,
                    }}
                >
                    {!isDesktop && (
                        <IconButton
                            onClick={onMenuClick}
                            aria-label="Open navigation menu"
                            edge="start"
                        >
                            <MenuRoundedIcon />
                        </IconButton>
                    )}

                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 600,
                                color: 'text.primary',
                            }}
                        >
                            {pageTitle}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                display: { xs: 'none', sm: 'block' },
                            }}
                        >
                            ACME / Workspace
                        </Typography>
                    </Box>
                </Box>

                {/* Right section */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                    }}
                >
                    <Avatar
                        sx={{
                            width: 36,
                            height: 36,
                            backgroundColor: 'primary.main',
                            fontSize: 14,
                            fontWeight: 600,
                        }}
                    >
                        HR
                    </Avatar>

                    <Box
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{ fontWeight: 600 }}
                        >
                            HR Manager
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Administrator
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default Header;
