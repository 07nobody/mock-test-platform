import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Container,
  Paper,
  Text,
  Table,
  Group,
  Avatar,
  Badge,
  Select,
  Tabs,
  Grid,
  Card,
  ThemeIcon,
  Stack,
  Box,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import {
  IconTrophy,
  IconMedal,
  IconFlame,
  IconClock,
  IconTarget,
  IconUsers,
  IconChartBar,
  IconRefresh,
  IconStar
} from '@tabler/icons-react';
import { useMessage } from '../../components/MessageProvider';
import PageTitle from '../../components/PageTitle';
import { getAllExams } from '../../apicalls/exams';
import {
  getLeaderboardByExam,
  getGlobalLeaderboard,
  getAdminStats
} from '../../apicalls/leaderboard';

function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('global');
  const [activeTab, setActiveTab] = useState('score');
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showMessage } = useMessage();

  const fetchExams = useCallback(async () => {
    try {
      const response = await getAllExams();
      if (response.success) {
        setExams(response.data);
      }
    } catch (error) {
      showMessage('Error fetching exams', 'error');
    }
  }, [showMessage]);

  const fetchAdminStats = useCallback(async () => {
    try {
      const response = await getAdminStats();
      if (response.success) {
        setAdminStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (selectedExam === 'global') {
        response = await getGlobalLeaderboard({ sortBy: activeTab, limit: 50 });
      } else {
        response = await getLeaderboardByExam(selectedExam, { sortBy: activeTab, limit: 50 });
      }
      if (response.success) {
        setLeaderboardData(response.data);
      } else {
        showMessage(response.message || 'Error fetching leaderboard', 'error');
      }
    } catch (error) {
      showMessage('Error fetching leaderboard', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedExam, activeTab, showMessage]);

  useEffect(() => {
    fetchExams();
    fetchAdminStats();
  }, [fetchExams, fetchAdminStats]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const examOptions = useMemo(() => [
    { value: 'global', label: 'Global Leaderboard' },
    ...exams.map(exam => ({ value: exam._id, label: exam.name }))
  ], [exams]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <IconTrophy size={20} color="#FFD700" />;
    if (rank === 2) return <IconMedal size={20} color="#C0C0C0" />;
    if (rank === 3) return <IconMedal size={20} color="#CD7F32" />;
    return <Text size="sm" fw={500}>{rank}</Text>;
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'yellow';
    if (rank === 2) return 'gray';
    if (rank === 3) return 'orange';
    return 'blue';
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getMetricValue = (entry) => {
    switch (activeTab) {
      case 'score':
        return `${entry.percentage || entry.score || 0}%`;
      case 'timeSpent':
        return formatTime(entry.avgTimePerQuestion || entry.timeSpent);
      case 'streak':
        return `${entry.streak || 0} days`;
      case 'xp':
        return `${entry.xp || 0} XP`;
      default:
        return entry.percentage || entry.score || 0;
    }
  };

  const rows = leaderboardData.map((entry, index) => (
    <Table.Tr key={entry._id || index}>
      <Table.Td>
        <Group gap="xs">
          <Badge
            variant={index < 3 ? 'filled' : 'light'}
            color={getRankBadgeColor(index + 1)}
            size="lg"
            w={40}
          >
            {getRankIcon(index + 1)}
          </Badge>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="sm">
          <Avatar
            src={entry.user?.profileImage}
            radius="xl"
            size="md"
            color="blue"
          >
            {entry.user?.name?.charAt(0)?.toUpperCase() || '?'}
          </Avatar>
          <Box>
            <Text size="sm" fw={500}>
              {entry.user?.name || 'Unknown User'}
            </Text>
            <Text size="xs" c="dimmed">
              {entry.user?.email || ''}
            </Text>
          </Box>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={600} c="blue">
          {getMetricValue(entry)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{entry.totalAttempts || entry.attempts || 0}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap={4}>
          <IconFlame size={16} color="orange" />
          <Text size="sm">{entry.streak || 0}</Text>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <PageTitle title="Leaderboard Management" />
        <Tooltip label="Refresh data">
          <ActionIcon
            variant="light"
            size="lg"
            onClick={() => {
              fetchLeaderboard();
              fetchAdminStats();
            }}
            loading={loading}
          >
            <IconRefresh size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {adminStats && (
        <Grid mb="xl">
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="md">
              <Group justify="space-between">
                <Box>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Total Users
                  </Text>
                  <Text size="xl" fw={700}>
                    {adminStats.totalUsers || 0}
                  </Text>
                </Box>
                <ThemeIcon size="xl" variant="light" color="blue">
                  <IconUsers size={24} />
                </ThemeIcon>
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="md">
              <Group justify="space-between">
                <Box>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Total Attempts
                  </Text>
                  <Text size="xl" fw={700}>
                    {adminStats.totalAttempts || 0}
                  </Text>
                </Box>
                <ThemeIcon size="xl" variant="light" color="green">
                  <IconTarget size={24} />
                </ThemeIcon>
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="md">
              <Group justify="space-between">
                <Box>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Avg Score
                  </Text>
                  <Text size="xl" fw={700}>
                    {adminStats.avgScore?.toFixed(1) || 0}%
                  </Text>
                </Box>
                <ThemeIcon size="xl" variant="light" color="orange">
                  <IconChartBar size={24} />
                </ThemeIcon>
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="md">
              <Group justify="space-between">
                <Box>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Top Streak
                  </Text>
                  <Text size="xl" fw={700}>
                    {adminStats.topStreak || 0} days
                  </Text>
                </Box>
                <ThemeIcon size="xl" variant="light" color="red">
                  <IconFlame size={24} />
                </ThemeIcon>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between" mb="md">
          <Select
            w={250}
            placeholder="Select exam"
            data={examOptions}
            value={selectedExam}
            onChange={setSelectedExam}
            searchable
            leftSection={<IconStar size={16} />}
          />
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List mb="md">
            <Tabs.Tab value="score" leftSection={<IconTarget size={16} />}>
              Score
            </Tabs.Tab>
            <Tabs.Tab value="timeSpent" leftSection={<IconClock size={16} />}>
              Time
            </Tabs.Tab>
            <Tabs.Tab value="streak" leftSection={<IconFlame size={16} />}>
              Streak
            </Tabs.Tab>
            <Tabs.Tab value="xp" leftSection={<IconTrophy size={16} />}>
              XP
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Paper>

      <Paper withBorder>
        {leaderboardData.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={80}>Rank</Table.Th>
                <Table.Th>User</Table.Th>
                <Table.Th>
                  {activeTab === 'score' && 'Score'}
                  {activeTab === 'timeSpent' && 'Avg Time'}
                  {activeTab === 'streak' && 'Streak'}
                  {activeTab === 'xp' && 'XP'}
                </Table.Th>
                <Table.Th>Attempts</Table.Th>
                <Table.Th>Streak</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        ) : (
          <Stack align="center" py="xl">
            <ThemeIcon size={60} variant="light" color="gray">
              <IconTrophy size={30} />
            </ThemeIcon>
            <Text c="dimmed" ta="center">
              No leaderboard data available
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Data will appear once users complete exams
            </Text>
          </Stack>
        )}
      </Paper>
    </Container>
  );
}

export default Leaderboard;
