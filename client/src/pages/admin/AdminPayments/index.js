import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  Table,
  Badge,
  TextInput,
  Button,
  Group,
  SegmentedControl,
  Text,
  Container,
  Paper,
  SimpleGrid,
  Card,
  Stack,
  Box,
  ScrollArea
} from "@mantine/core";
import {
  IconTable,
  IconLayoutGrid,
  IconBuildingBank,
  IconWallet,
  IconTag,
  IconCircleCheck,
  IconCircleX,
  IconSearch,
  IconX,
  IconUser,
  IconGift,
  IconReceipt
} from "@tabler/icons-react";
import moment from "moment";

import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { getAllPayments } from "../../../apicalls/payments";
import PageTitle from "../../../components/PageTitle";
import { message } from "../../../utils/notifications";

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [filters, setFilters] = useState({
    userName: "",
    examName: "",
    startDate: null,
    endDate: null
  });
  const dispatch = useDispatch();

  const getPaymentData = useCallback(async (filterParams = {}) => {
    try {
      dispatch(ShowLoading());
      const response = await getAllPayments(filterParams);
      dispatch(HideLoading());

      if (response.success) {
        setPayments(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message || "Something went wrong");
    }
  }, [dispatch]);

  useEffect(() => {
    getPaymentData();
  }, [getPaymentData]);

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge color="green" leftSection={<IconCircleCheck size={12} />}>Completed</Badge>;
      case "failed":
        return <Badge color="red" leftSection={<IconCircleX size={12} />}>Failed</Badge>;
      case "pending":
        return <Badge color="yellow">Pending</Badge>;
      case "refunded":
        return <Badge color="blue">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "credit_card":
      case "debit_card":
        return <IconBuildingBank size={16} />;
      case "netbanking":
        return <IconBuildingBank size={16} />;
      case "upi":
      case "wallet":
        return <IconWallet size={16} />;
      case "free_test":
        return <IconGift size={16} />;
      default:
        return <IconTag size={16} />;
    }
  };

  const handleFiltersChange = (value, field) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };

  const handleSearch = () => {
    getPaymentData(filters);
  };

  const handleClearFilters = () => {
    setFilters({
      userName: "",
      examName: "",
      startDate: null,
      endDate: null
    });
    getPaymentData({});
  };

  const renderTableView = () => (
    <Paper withBorder>
      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Receipt Number</Table.Th>
              <Table.Th>User</Table.Th>
              <Table.Th>Exam</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Payment Method</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {payments.map((payment) => (
              <Table.Tr key={payment._id}>
                <Table.Td>{payment.receiptNumber}</Table.Td>
                <Table.Td>{payment.userId?.name || "N/A"}</Table.Td>
                <Table.Td>{payment.examId?.name || "N/A"}</Table.Td>
                <Table.Td>{moment(payment.createdAt).format("DD-MM-YYYY hh:mm A")}</Table.Td>
                <Table.Td>
                  <Text fw={600} c="blue">₹{payment.amount}</Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {getPaymentMethodIcon(payment.paymentMethod)}
                    <Text size="sm">{payment.paymentMethod?.replace('_', ' ')?.toUpperCase()}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>{getPaymentStatusBadge(payment.status)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );

  const renderCardView = () => (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {payments.length > 0 ? (
        payments.map((payment) => (
          <Card key={payment._id} withBorder p="md">
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <IconReceipt size={16} />
                <Text size="sm" fw={600}>{payment.receiptNumber}</Text>
              </Group>
              {getPaymentStatusBadge(payment.status)}
            </Group>

            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">User:</Text>
                <Text size="sm" fw={500}>{payment.userId?.name || "N/A"}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Exam:</Text>
                <Text size="sm" fw={500}>{payment.examId?.name || "N/A"}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Date:</Text>
                <Text size="sm">{moment(payment.createdAt).format("DD-MM-YYYY")}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Time:</Text>
                <Text size="sm">{moment(payment.createdAt).format("hh:mm A")}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Amount:</Text>
                <Text size="sm" fw={700} c="blue">₹{payment.amount}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Payment Method:</Text>
                <Group gap="xs">
                  {getPaymentMethodIcon(payment.paymentMethod)}
                  <Text size="sm">{payment.paymentMethod?.replace('_', ' ')?.toUpperCase()}</Text>
                </Group>
              </Group>
            </Stack>
          </Card>
        ))
      ) : (
        <Box ta="center" py="xl" style={{ gridColumn: '1 / -1' }}>
          <Text c="dimmed">No payment records found</Text>
        </Box>
      )}
    </SimpleGrid>
  );

  return (
    <Container size="xl" py="md">
      <PageTitle title="All Payments" />

      {/* Filters */}
      <Paper withBorder p="md" mb="lg">
        <Group gap="md" align="flex-end" wrap="wrap">
          <Box style={{ flex: 1, minWidth: 200 }}>
            <Text size="sm" fw={500} mb="xs">Filter by User</Text>
            <TextInput
              leftSection={<IconUser size={16} />}
              placeholder="Search by user name"
              value={filters.userName}
              onChange={(e) => handleFiltersChange(e.target.value, "userName")}
            />
          </Box>

          <Box style={{ flex: 1, minWidth: 200 }}>
            <Text size="sm" fw={500} mb="xs">Filter by Exam</Text>
            <TextInput
              leftSection={<IconSearch size={16} />}
              placeholder="Search by exam name"
              value={filters.examName}
              onChange={(e) => handleFiltersChange(e.target.value, "examName")}
            />
          </Box>

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

      {/* View Toggle */}
      <Group justify="flex-end" mb="md">
        <SegmentedControl
          value={viewMode}
          onChange={setViewMode}
          data={[
            { label: <Group gap="xs"><IconTable size={16} /> Table</Group>, value: 'table' },
            { label: <Group gap="xs"><IconLayoutGrid size={16} /> Cards</Group>, value: 'cards' },
          ]}
        />
      </Group>

      {/* Content */}
      {viewMode === 'table' ? renderTableView() : renderCardView()}
    </Container>
  );
}

export default AdminPayments;
