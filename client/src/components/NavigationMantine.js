/**
 * Navigation Component - Clean shadcn-inspired design
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Avatar,
  Menu,
  ActionIcon,
  Text,
  useMantineColorScheme,
  Tooltip,
  Stack,
  Divider,
  Box,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconHome,
  IconClipboardList,
  IconFileText,
  IconTrophy,
  IconUser,
  IconLogout,
  IconSun,
  IconMoon,
  IconSettings,
  IconCoin,
  IconChevronRight,
} from '@tabler/icons-react';
import { SetUser } from '../redux/usersSlice';
import { useTheme } from '../contexts/ThemeContext';
import { message } from '../utils/notifications';
import AccessibilitySettings from './AccessibilitySettingsMantine';

function Navigation({ children }) {
  const { user } = useSelector((state) => state.users);
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toggleTheme, isDarkMode } = useTheme();
  const { setColorScheme } = useMantineColorScheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setColorScheme(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode, setColorScheme]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(SetUser(null));
    message.success('Logged out successfully');
    navigate('/login');
  };

  const userMenuItems = [
    { path: '/', label: 'Dashboard', icon: IconHome },
    { path: '/available-exams', label: 'Quizzes', icon: IconClipboardList },
    { path: '/user/reports', label: 'My Reports', icon: IconFileText },
    { path: '/user/payment-history', label: 'Payments', icon: IconCoin },
    { path: '/leaderboard', label: 'Leaderboard', icon: IconTrophy },
  ];

  const adminMenuItems = [
    { path: '/admin/exams', label: 'Manage Exams', icon: IconClipboardList },
    { path: '/admin/reports', label: 'All Reports', icon: IconFileText },
    { path: '/admin/payments', label: 'All Payments', icon: IconCoin },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    closeMobile();
  };

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <NavLink
        label={item.label}
        leftSection={<item.icon size={18} stroke={1.5} />}
        rightSection={isActive && <IconChevronRight size={14} />}
        active={isActive}
        onClick={() => handleNavClick(item.path)}
        styles={{
          root: {
            borderRadius: 8,
            fontWeight: isActive ? 600 : 500,
          },
        }}
      />
    );
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      {/* Header */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
            
            <Group gap={6}>
              <ThemeIcon size={32} radius="md" color="violet">
                <IconClipboardList size={18} />
              </ThemeIcon>
              <Text fw={700} size="lg" visibleFrom="xs">Quiz Platform</Text>
            </Group>
          </Group>

          <Group gap="xs">
            <Tooltip label={isDarkMode ? 'Light mode' : 'Dark mode'}>
              <ActionIcon variant="subtle" size="lg" onClick={toggleTheme} color="gray">
                {isDarkMode ? <IconSun size={18} /> : <IconMoon size={18} />}
              </ActionIcon>
            </Tooltip>

            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Avatar size={36} radius="md" color="violet">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>
                  <Text size="sm" fw={600}>{user?.name}</Text>
                  <Text size="xs" c="dimmed">{user?.email}</Text>
                </Menu.Label>
                <Menu.Divider />
                <Menu.Item leftSection={<IconUser size={16} />} onClick={() => navigate('/profile')}>
                  Profile
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={16} />} onClick={() => setSettingsOpen(true)}>
                  Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                  Sign out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Sidebar */}
      <AppShell.Navbar p="sm">
        <AppShell.Section grow>
          <Stack gap={4}>
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" px="sm" mb={4}>
              Menu
            </Text>
            {userMenuItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}

            {user?.isAdmin && (
              <>
                <Divider my="sm" />
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" px="sm" mb={4}>
                  Admin
                </Text>
                {adminMenuItems.map((item) => (
                  <NavItem key={item.path} item={item} />
                ))}
              </>
            )}
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Divider mb="sm" />
          <Box p="sm">
            <Group gap="sm">
              <Avatar size={38} radius="md" color="violet">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Box flex={1}>
                <Text size="sm" fw={600} truncate>{user?.name}</Text>
                <Text size="xs" c="dimmed">
                  {user?.isAdmin ? 'Admin' : 'Student'}
                </Text>
              </Box>
            </Group>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>

      <AccessibilitySettings
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </AppShell>
  );
}

export default Navigation;
