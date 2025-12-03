/**
 * Home Page - Clean shadcn-inspired design
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Group,
  SimpleGrid,
  Card,
  Badge,
  Progress,
  Box,
  ThemeIcon,
} from '@mantine/core';
import {
  IconRocket,
  IconTrophy,
  IconBook,
  IconChartBar,
  IconUser,
  IconClipboardList,
  IconFileText,
  IconSettings,
  IconArrowRight,
  IconCheck,
  IconCoin,
} from '@tabler/icons-react';
import { HideLoading, ShowLoading } from '../../../redux/loaderSlice';

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, description, color = 'violet' }) => (
  <Card padding="lg" radius="md" withBorder>
    <Group justify="space-between" align="flex-start">
      <Box>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
          {label}
        </Text>
        <Text size="xl" fw={700}>
          {value}
        </Text>
        {description && (
          <Text size="xs" c="dimmed" mt={4}>
            {description}
          </Text>
        )}
      </Box>
      <ThemeIcon size={42} radius="md" variant="light" color={color}>
        <Icon size={22} />
      </ThemeIcon>
    </Group>
  </Card>
);

// Action Card Component  
const ActionCard = ({ icon: Icon, title, description, onClick, color = 'violet', primary }) => (
  <Card
    padding="lg"
    radius="md"
    withBorder
    className="clickable-card"
    onClick={onClick}
  >
    <Group justify="space-between" wrap="nowrap">
      <Group gap="md" wrap="nowrap">
        <ThemeIcon size={42} radius="md" variant={primary ? 'filled' : 'light'} color={color}>
          <Icon size={20} />
        </ThemeIcon>
        <Box>
          <Text fw={600} size="sm">{title}</Text>
          <Text size="xs" c="dimmed">{description}</Text>
        </Box>
      </Group>
      <ThemeIcon variant="subtle" color="gray" size="sm">
        <IconArrowRight size={16} />
      </ThemeIcon>
    </Group>
  </Card>
);

function Home() {
  const { user } = useSelector((state) => state.users);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [stats, setStats] = useState({
    examsTaken: 0,
    examsPassed: 0,
    avgScore: 0,
  });

  const userActions = [
    {
      title: 'Take a Quiz',
      icon: IconRocket,
      description: 'Start a new quiz now',
      action: () => navigate('/available-exams'),
      color: 'violet',
      primary: true,
    },
    {
      title: 'Browse Quizzes',
      icon: IconBook,
      description: 'View all available quizzes',
      action: () => navigate('/available-exams'),
      color: 'blue',
    },
    {
      title: 'My Reports',
      icon: IconChartBar,
      description: 'View your performance',
      action: () => navigate('/user/reports'),
      color: 'teal',
    },
    {
      title: 'Leaderboard',
      icon: IconTrophy,
      description: 'See rankings',
      action: () => navigate('/leaderboard'),
      color: 'yellow',
    },
    {
      title: 'Payment History',
      icon: IconCoin,
      description: 'View transactions',
      action: () => navigate('/user/payment-history'),
      color: 'green',
    },
    {
      title: 'My Profile',
      icon: IconUser,
      description: 'Account settings',
      action: () => navigate('/profile'),
      color: 'gray',
    },
  ];

  const adminActions = [
    {
      title: 'Manage Quizzes',
      icon: IconClipboardList,
      description: 'Create and edit quizzes',
      action: () => navigate('/admin/exams'),
      color: 'violet',
      primary: true,
    },
    {
      title: 'User Reports',
      icon: IconFileText,
      description: 'View all user reports',
      action: () => navigate('/admin/reports'),
      color: 'blue',
    },
    {
      title: 'Payments',
      icon: IconCoin,
      description: 'Manage payments',
      action: () => navigate('/admin/payments'),
      color: 'green',
    },
    {
      title: 'Settings',
      icon: IconSettings,
      description: 'Platform settings',
      action: () => navigate('/profile'),
      color: 'gray',
    },
  ];

  const actions = user?.isAdmin ? adminActions : userActions;

  useEffect(() => {
    const loadStats = async () => {
      try {
        dispatch(ShowLoading());
        await new Promise((resolve) => setTimeout(resolve, 300));
        setStats({
          examsTaken: 12,
          examsPassed: 10,
          avgScore: 82,
        });
        dispatch(HideLoading());
      } catch (error) {
        dispatch(HideLoading());
      }
    };

    if (!user?.isAdmin) {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const passRate = stats.examsTaken > 0 ? Math.round((stats.examsPassed / stats.examsTaken) * 100) : 0;

  return (
    <Container size="lg" py="xl">
      {/* Welcome Header */}
      <Box mb="xl">
        <Text size="sm" c="dimmed" tt="uppercase" fw={600} mb={4}>
          {user?.isAdmin ? 'Admin Dashboard' : 'Welcome back'}
        </Text>
        <Title order={2} mb={4}>
          Hello, {user?.name || 'User'}
        </Title>
        <Text c="dimmed">
          {user?.isAdmin
            ? 'Manage quizzes, view reports, and configure settings.'
            : 'Ready to test your knowledge? Start a quiz or check your progress.'}
        </Text>
      </Box>

      {/* Stats Section - User only */}
      {!user?.isAdmin && (
        <Box mb="xl">
          <Text size="sm" fw={600} mb="md">Your Progress</Text>
          <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
            <StatCard
              icon={IconClipboardList}
              label="Quizzes Taken"
              value={stats.examsTaken}
              color="violet"
            />
            <StatCard
              icon={IconCheck}
              label="Passed"
              value={stats.examsPassed}
              color="teal"
            />
            <StatCard
              icon={IconChartBar}
              label="Avg Score"
              value={`${stats.avgScore}%`}
              color="blue"
            />
            <StatCard
              icon={IconTrophy}
              label="Pass Rate"
              value={`${passRate}%`}
              color="yellow"
            />
          </SimpleGrid>

          {/* Progress Bar */}
          <Card padding="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>Overall Progress</Text>
              <Badge variant="light" color="teal">{passRate}% Pass Rate</Badge>
            </Group>
            <Progress value={passRate} color="teal" size="sm" radius="xl" />
            <Text size="xs" c="dimmed" mt="xs">
              {stats.examsPassed} of {stats.examsTaken} quizzes passed
            </Text>
          </Card>
        </Box>
      )}

      {/* Quick Actions */}
      <Box>
        <Text size="sm" fw={600} mb="md">
          {user?.isAdmin ? 'Admin Tools' : 'Quick Actions'}
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {actions.map((action, index) => (
            <ActionCard
              key={index}
              icon={action.icon}
              title={action.title}
              description={action.description}
              onClick={action.action}
              color={action.color}
              primary={action.primary}
            />
          ))}
        </SimpleGrid>
      </Box>
    </Container>
  );
}

export default Home;
