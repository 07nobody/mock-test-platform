import React, { useEffect, useCallback, useRef, useState } from "react";
import { 
  Container, 
  Title, 
  Text, 
  Table, 
  Badge, 
  Paper, 
  Group, 
  Stack, 
  Card,
  SimpleGrid,
  SegmentedControl,
  Progress,
  ThemeIcon,
  Box,
  ScrollArea
} from "@mantine/core";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { getAllReportsByUser } from "../../../apicalls/reports";
import { message } from "../../../utils/notifications";
import { 
  IconFileAnalytics, 
  IconCalendar,
  IconTable,
  IconLayoutGrid,
  IconFileOff
} from "@tabler/icons-react";
import moment from "moment";

function UserReports() {
  const [reportsData, setReportsData] = useState([]);
  const [viewMode, setViewMode] = useState("cards");
  const dispatch = useDispatch();
  const dataFetchedRef = useRef(false);

  const getData = useCallback(async () => {
    try {
      dispatch(ShowLoading());
      const response = await getAllReportsByUser();
      if (response.success) {
        setReportsData(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.response?.data?.message || "Something went wrong");
    }
  }, [dispatch]);

  useEffect(() => {
    if (!dataFetchedRef.current) {
      dataFetchedRef.current = true;
      getData();
    }
    return () => {
      dataFetchedRef.current = false;
    };
  }, [getData]);

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
              <Table.Th>Date</Table.Th>
              <Table.Th>Total Marks</Table.Th>
              <Table.Th>Passing Marks</Table.Th>
              <Table.Th>Obtained</Table.Th>
              <Table.Th>Result</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {reportsData.length > 0 ? (
              reportsData.map((report) => (
                <Table.Tr key={report._id}>
                  <Table.Td fw={500}>{report.exam?.name || "Unknown"}</Table.Td>
                  <Table.Td c="dimmed">{moment(report.createdAt).format("DD MMM YYYY")}</Table.Td>
                  <Table.Td>{report.exam?.totalMarks || "-"}</Table.Td>
                  <Table.Td>{report.exam?.passingMarks || "-"}</Table.Td>
                  <Table.Td fw={500}>{report.result?.correctAnswers?.length || 0}</Table.Td>
                  <Table.Td>
                    <Badge 
                      color={report.result?.verdict === "Pass" ? "green" : "red"}
                      variant="light"
                    >
                      {report.result?.verdict || "N/A"}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={6}>
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
                <Text fw={600} size="lg" lineClamp={1}>
                  {report.exam?.name || "Unknown Exam"}
                </Text>
                <Badge 
                  color={isPassed ? "green" : "red"} 
                  variant="light"
                  size="lg"
                >
                  {report.result?.verdict || "N/A"}
                </Badge>
              </Group>

              <Stack gap="sm">
                <Group gap="xs">
                  <IconCalendar size={16} color="gray" />
                  <Text size="sm" c="dimmed">
                    {moment(report.createdAt).format("DD MMM YYYY, hh:mm A")}
                  </Text>
                </Group>

                <Group grow>
                  <Box>
                    <Text size="xs" c="dimmed" tt="uppercase">Score</Text>
                    <Text fw={600} size="xl" c={isPassed ? "green" : "red"}>
                      {report.result?.correctAnswers?.length || 0}/{report.exam?.totalMarks || 0}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed" tt="uppercase">Pass Mark</Text>
                    <Text fw={500} size="xl">
                      {report.exam?.passingMarks || 0}
                    </Text>
                  </Box>
                </Group>

                <Box>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs" c="dimmed">Progress</Text>
                    <Text size="xs" fw={500}>{scorePercent}%</Text>
                  </Group>
                  <Progress 
                    value={scorePercent} 
                    color={isPassed ? "green" : "red"} 
                    size="sm"
                    radius="xl"
                  />
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
            <Text c="dimmed" size="sm">Complete an exam to see your results here</Text>
          </Stack>
        </Card>
      )}
    </SimpleGrid>
  );

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <ThemeIcon size={40} radius="md" variant="gradient" gradient={{ from: 'violet', to: 'indigo' }}>
            <IconFileAnalytics size={22} />
          </ThemeIcon>
          <Box>
            <Title order={2}>Your Reports</Title>
            <Text c="dimmed" size="sm">View your exam results and performance</Text>
          </Box>
        </Group>
        
        <SegmentedControl
          value={viewMode}
          onChange={setViewMode}
          data={[
            { label: <Group gap={4}><IconLayoutGrid size={16} />Cards</Group>, value: 'cards' },
            { label: <Group gap={4}><IconTable size={16} />Table</Group>, value: 'table' },
          ]}
        />
      </Group>

      {viewMode === 'table' ? renderTableView() : renderCardView()}
    </Container>
  );
}

export default UserReports;
