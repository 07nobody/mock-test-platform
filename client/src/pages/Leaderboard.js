import React, { useState, useEffect } from 'react';
import {
  Table,
  Select,
  Tabs,
  Card,
  Avatar,
  Badge,
  Button,
  Text,
  Loader,
  Grid,
  Group,
  Stack,
  Paper,
  Container,
  Box,
  ThemeIcon,
  Center
} from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconTrophy,
  IconUser,
  IconTrendingUp,
  IconCircleCheck,
  IconWorld,
  IconHistory
} from '@tabler/icons-react';
import { HideLoading, ShowLoading } from '../redux/loaderSlice';
import PageTitle from '../components/PageTitle';
import { getLeaderboardData, getUserLeaderboardStats } from '../apicalls/leaderboard';
import { getAllExams } from '../apicalls/exams';
import { message } from '../utils/notifications';

function Leaderboard() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.users);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [timeFrame, setTimeFrame] = useState('all');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(['all']);
  const [examId, setExamId] = useState(null);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetchLeaderboardData();
    fetchExams();
    if (user?._id) {
      fetchUserStats();
    }
  }, [user?._id]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [timeFrame, category, examId]);

  const fetchExams = async () => {
    try {
      const response = await getAllExams();
      if (response.success) {
        setExams(response.data);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      await getUserLeaderboardStats(user._id);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      dispatch(ShowLoading());

      const filters = { period: timeFrame, category, examId };
      const response = await getLeaderboardData(filters);

      if (response.success) {
        if (!response.data || response.data.length === 0) {
          setLeaderboardData([]);
        } else {
          const rankedData = response.data.map((user, index) => ({
            ...user,
            rank: index + 1,
            key: user._id || index,
            score: typeof user.score === 'number' ? user.score : 0,
            examsCompleted: typeof user.examsCompleted === 'number' ? user.examsCompleted : 0,
            averageScore: typeof user.averageScore === 'number' ? user.averageScore : 0,
            passRate: typeof user.passRate === 'number' ? user.passRate : 0
          }));
          setLeaderboardData(rankedData);
        }

        if (response.categories && response.categories.length > 0) {
          setCategories(['all', ...response.categories]);
        }
      } else {
        message.error(response.message || "Failed to fetch leaderboard data");
      }

      setLoading(false);
      dispatch(HideLoading());
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
      setLoading(false);
      dispatch(HideLoading());
    }
  };

  const getMedalColor = (rank) => {
    switch (rank) {
      case 1: return 'yellow';
      case 2: return 'gray';
      case 3: return 'orange';
      default: return 'blue';
    }
  };

  const renderTableRows = () => {
    return leaderboardData.map((record) => (
      <Table.Tr key={record.key} bg={record._id === user?._id ? 'blue.0' : undefined}>
        <Table.Td>
          <Center>
            {record.rank <= 3 ? (
              <ThemeIcon color={getMedalColor(record.rank)} variant="light" size="lg">
                <IconTrophy size={18} />
              </ThemeIcon>
            ) : (
              <Text fw={600}>{record.rank}</Text>
            )}
          </Center>
        </Table.Td>
        <Table.Td>
          <Group gap="sm">
            <Avatar radius="xl" color={record._id === user?._id ? 'blue' : 'orange'}>
              <IconUser size={16} />
            </Avatar>
            <Text fw={record._id === user?._id ? 700 : 400}>
              {record.name}
              {record._id === user?._id && <Badge color="blue" variant="light" ml="xs">You</Badge>}
            </Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Text fw={700} c="blue">{record.performanceIndex || 0}</Text>
        </Table.Td>
        <Table.Td>{record.examsCompleted}</Table.Td>
        <Table.Td>
          <Group gap={4}>
            <Text>{record.examsPassed || 0}</Text>
            {record.examsCompleted ? (
              <Text c="dimmed" size="sm">
                ({Math.round((record.examsPassed / record.examsCompleted) * 100) || 0}%)
              </Text>
            ) : null}
          </Group>
        </Table.Td>
        <Table.Td>{record.averageScore || 0}%</Table.Td>
      </Table.Tr>
    ));
  };

  const renderTopPerformers = () => {
    const topThree = leaderboardData.slice(0, 3);

    if (topThree.length === 0) {
      return (
        <Text c="dimmed" ta="center" py="xl">
          No leaderboard data available
        </Text>
      );
    }

    return (
      <Grid gutter="md">
        {topThree.map((performer, index) => (
          <Grid.Col span={{ base: 12, sm: 4 }} key={performer._id || index}>
            <Paper p="md" withBorder ta="center">
              <ThemeIcon
                color={getMedalColor(index + 1)}
                variant="light"
                size="xl"
                radius="xl"
                mb="md"
              >
                <IconTrophy size={24} />
              </ThemeIcon>

              <Avatar
                size={80}
                radius="xl"
                color={getMedalColor(index + 1)}
                mx="auto"
                mb="md"
              >
                <IconUser size={40} />
              </Avatar>

              <Text fw={600} size="md">
                {performer.name}
                {performer._id === user?._id && <Badge color="blue" variant="light" ml="xs">You</Badge>}
              </Text>

              <Grid gutter="md" mt="md">
                <Grid.Col span={6}>
                  <Stack gap={0} align="center">
                    <Text size="xs" c="dimmed">Score</Text>
                    <Text fw={600} c="blue">{performer.score}</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Stack gap={0} align="center">
                    <Text size="xs" c="dimmed">Avg. Score</Text>
                    <Text fw={600} c="green">{performer.averageScore}%</Text>
                  </Stack>
                </Grid.Col>
              </Grid>

              <Group justify="center" mt="md">
                <IconCircleCheck size={16} color="var(--mantine-color-green-6)" />
                <Text size="sm">{performer.examsCompleted} exams completed</Text>
              </Group>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
    );
  };

  const renderUserStats = () => {
    const currentUser = leaderboardData.find(item => item._id === user?._id);

    if (!currentUser) {
      return (
        <Card p="xl" withBorder mb="lg">
          <Stack align="center" gap="md">
            <Text c="dimmed">You haven't taken any exams yet</Text>
            <Button onClick={() => window.location.href = '/available-exams'}>
              Take your first exam
            </Button>
          </Stack>
        </Card>
      );
    }

    return (
      <Card withBorder p="md" mb="lg">
        <Text fw={600} size="lg" mb="md">Your Performance</Text>
        <Grid gutter="md">
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Stack gap={0} align="center">
              <Group gap={4}>
                <IconTrophy size={16} color={`var(--mantine-color-${getMedalColor(currentUser.rank)}-6)`} />
                <Text size="xs" c="dimmed">Your Rank</Text>
              </Group>
              <Text fw={600} c={getMedalColor(currentUser.rank)}>
                {currentUser.rank} / {leaderboardData.length}
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Stack gap={0} align="center">
              <Text size="xs" c="dimmed">Total Score</Text>
              <Text fw={600} c="blue">{currentUser.score}</Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Stack gap={0} align="center">
              <Group gap={4}>
                <IconCircleCheck size={16} color="var(--mantine-color-green-6)" />
                <Text size="xs" c="dimmed">Exams Completed</Text>
              </Group>
              <Text fw={600} c="green">{currentUser.examsCompleted}</Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Stack gap={0} align="center">
              <Group gap={4}>
                <IconTrendingUp size={16} color="var(--mantine-color-orange-6)" />
                <Text size="xs" c="dimmed">Average Score</Text>
              </Group>
              <Text fw={600} c="orange">{currentUser.averageScore}%</Text>
            </Stack>
          </Grid.Col>
        </Grid>
      </Card>
    );
  };

  const renderLeaderboardFilters = () => (
    <Paper withBorder p="md" mb="lg">
      <Group gap="md" wrap="wrap">
        <Box style={{ flex: 1, minWidth: 150 }}>
          <Text size="sm" fw={500} mb="xs">Time Period</Text>
          <Select
            value={timeFrame}
            onChange={setTimeFrame}
            data={[
              { value: 'all', label: 'All Time' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'year', label: 'This Year' },
            ]}
          />
        </Box>

        <Box style={{ flex: 1, minWidth: 150 }}>
          <Text size="sm" fw={500} mb="xs">Category</Text>
          <Select
            value={category}
            onChange={setCategory}
            data={categories.map(cat => ({ value: cat, label: cat === 'all' ? 'All Categories' : cat }))}
          />
        </Box>

        <Box style={{ flex: 1, minWidth: 150 }}>
          <Text size="sm" fw={500} mb="xs">Exam</Text>
          <Select
            value={examId || 'all'}
            onChange={(value) => setExamId(value === 'all' ? null : value)}
            data={[
              { value: 'all', label: 'All Exams' },
              ...exams.map(exam => ({ value: exam._id, label: exam.name }))
            ]}
          />
        </Box>
      </Group>
    </Paper>
  );

  const renderGlobalTab = () => (
    <Stack gap="lg">
      {renderUserStats()}
      {renderLeaderboardFilters()}

      <Card withBorder p="md">
        <Text fw={600} size="lg" mb="md">Top Performers</Text>
        {loading ? (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        ) : (
          renderTopPerformers()
        )}
      </Card>

      <Card withBorder p="md">
        <Text fw={600} size="lg" mb="md">Full Rankings</Text>
        {loading ? (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={80}>Rank</Table.Th>
                <Table.Th>User</Table.Th>
                <Table.Th>Performance</Table.Th>
                <Table.Th>Exams Completed</Table.Th>
                <Table.Th>Exams Passed</Table.Th>
                <Table.Th>Avg. Score</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {renderTableRows()}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Stack>
  );

  const renderHistoryTab = () => (
    <Card withBorder p="xl">
      <Text c="dimmed" ta="center">
        Detailed exam history will be available in a future update
      </Text>
    </Card>
  );

  return (
    <Container size="xl" py="md">
      <PageTitle title="Leaderboard" />

      <Tabs defaultValue="global">
        <Tabs.List mb="lg">
          <Tabs.Tab value="global" leftSection={<IconWorld size={16} />}>
            Global Rankings
          </Tabs.Tab>
          <Tabs.Tab value="history" leftSection={<IconHistory size={16} />}>
            Exam History
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="global">
          {renderGlobalTab()}
        </Tabs.Panel>

        <Tabs.Panel value="history">
          {renderHistoryTab()}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}

export default Leaderboard;
