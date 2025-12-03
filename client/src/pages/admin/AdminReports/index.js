import React, { useEffect, useState } from "react";
import { 
  Container, 
  Title, 
  Text, 
  Table, 
  TextInput, 
  Button, 
  Badge, 
  Group, 
  SegmentedControl, 
  Paper,
  Box,
  Stack,
  Card,
  SimpleGrid,
  ThemeIcon,
  Progress,
  ScrollArea
} from "@mantine/core";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { getAllReports } from "../../../apicalls/reports";
import { 
  IconTable, 
  IconLayoutGrid, 
  IconSearch, 
  IconX, 
  IconFileAnalytics, 
  IconUser,
  IconCalendar,
  IconFileOff
} from "@tabler/icons-react";
import moment from "moment";
import { message } from "../../../utils/notifications";

function AdminReports() {
  const [reportsData, setReportsData] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    examName: "",
    userName: "",
  });

  const getData = async (tempFilters) => {
    try {
      dispatch(ShowLoading());
      const response = await getAllReports(tempFilters);
      if (response.success) {
        setReportsData(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    getData(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters = { examName: "", userName: "" };
    setFilters(clearedFilters);
    getData(clearedFilters);
  };

  const getScorePercent = (report) => {
    const correct = report.result?.correctAnswers?.length || 0;
    const total = report.exam?.totalMarks || 1;
    return Math.round((correct / total) * 100);
  };

  const renderTableView = () => (
    <Paper withBorder radius="md">
      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Exam Name</Table.Th>
              <Table.Th>User Name</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Total</Table.Th>
              <Table.Th>Pass Mark</Table.Th>
              <Table.Th>Obtained</Table.Th>
              <Table.Th>Result</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {reportsData.length > 0 ? (
              reportsData.map((report) => (
                <Table.Tr key={report._id}>
                  <Table.Td fw={500}>{report.exam?.name}</Table.Td>
                  <Table.Td>{report.user?.name}</Table.Td>
                  <Table.Td c="dimmed">{moment(report.createdAt).format("DD MMM YYYY")}</Table.Td>
                  <Table.Td>{report.exam?.totalMarks}</Table.Td>
                  <Table.Td>{report.exam?.passingMarks}</Table.Td>
                  <Table.Td fw={500}>{report.result?.correctAnswers?.length || 0}</Table.Td>
                  <Table.Td>
                    <Badge color={report.result?.verdict === "Pass" ? "green" : "red"} variant="light">
                      {report.result?.verdict}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Stack align="center" py="xl">
                    <ThemeIcon size={48} variant="light" color="gray">
                      <IconFileOff size={24} />
                    </ThemeIcon>
                    <Text c="dimmed">No reports found</Text>
                  </Stack>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );

  const renderCardView = () => (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {reportsData.length > 0 ? (
        reportsData.map((report) => {
          const scorePercent = getScorePercent(report);
          const isPassed = report.result?.verdict === "Pass";
          
          return (
            <Card key={report._id} withBorder padding="lg" radius="md">
              <Group justify="space-between" mb="md">
                <Text fw={600} size="lg" lineClamp={1}>{report.exam?.name}</Text>
                <Badge color={isPassed ? "green" : "red"} variant="light" size="lg">
                  {report.result?.verdict}
                </Badge>
              </Group>

              <Stack gap="sm">
                <Group gap="xs">
                  <IconUser size={16} color="gray" />
                  <Text size="sm">{report.user?.name}</Text>
                </Group>
                
                <Group gap="xs">
                  <IconCalendar size={16} color="gray" />
                  <Text size="sm" c="dimmed">{moment(report.createdAt).format("DD MMM YYYY, hh:mm A")}</Text>
                </Group>

                <Group grow>
                  <Box>
                    <Text size="xs" c="dimmed" tt="uppercase">Score</Text>
                    <Text fw={600} size="xl" c={isPassed ? "green" : "red"}>
                      {report.result?.correctAnswers?.length || 0}/{report.exam?.totalMarks}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed" tt="uppercase">Pass Mark</Text>
                    <Text fw={500} size="xl">{report.exam?.passingMarks}</Text>
                  </Box>
                </Group>

                <Box>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs" c="dimmed">Progress</Text>
                    <Text size="xs" fw={500}>{scorePercent}%</Text>
                  </Group>
                  <Progress value={scorePercent} color={isPassed ? "green" : "red"} size="sm" radius="xl" />
                </Box>
              </Stack>
            </Card>
          );
        })
      ) : (
        <Card withBorder padding="xl" radius="md">
          <Stack align="center" py="xl">
            <ThemeIcon size={64} variant="light" color="gray" radius="xl">
              <IconFileOff size={32} />
            </ThemeIcon>
            <Text c="dimmed" size="lg">No reports found</Text>
          </Stack>
        </Card>
      )}
    </SimpleGrid>
  );

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg" wrap="wrap">
        <Group gap="sm">
          <ThemeIcon size={40} radius="md" variant="gradient" gradient={{ from: 'violet', to: 'indigo' }}>
            <IconFileAnalytics size={22} />
          </ThemeIcon>
          <Box>
            <Title order={2}>Exam Reports</Title>
            <Text c="dimmed" size="sm">View all exam results and performance</Text>
          </Box>
        </Group>
        
        <SegmentedControl
          value={viewMode}
          onChange={setViewMode}
          data={[
            { label: <Group gap={4}><IconTable size={16} />Table</Group>, value: 'table' },
            { label: <Group gap={4}><IconLayoutGrid size={16} />Cards</Group>, value: 'cards' },
          ]}
        />
      </Group>

      <Paper withBorder p="md" radius="md" mb="lg">
        <Group gap="md" wrap="wrap">
          <TextInput
            leftSection={<IconSearch size={16} />}
            placeholder="Search by exam name"
            value={filters.examName}
            onChange={(e) => setFilters({ ...filters, examName: e.target.value })}
            w={{ base: '100%', sm: 200 }}
          />
          <TextInput
            leftSection={<IconUser size={16} />}
            placeholder="Search by user name"
            value={filters.userName}
            onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
            w={{ base: '100%', sm: 200 }}
          />
          <Group gap="xs">
            <Button variant="default" leftSection={<IconX size={16} />} onClick={handleClearFilters}>
              Clear
            </Button>
            <Button leftSection={<IconSearch size={16} />} onClick={handleSearch}>
              Search
            </Button>
          </Group>
        </Group>
      </Paper>

      {viewMode === 'table' ? renderTableView() : renderCardView()}
    </Container>
  );
}

export default AdminReports;
