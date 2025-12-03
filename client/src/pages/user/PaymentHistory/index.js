import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Badge,
  SegmentedControl,
  Paper,
  Text,
  Group,
  Box,
  ScrollArea,
  Container,
  Card,
  Stack,
  ThemeIcon,
  SimpleGrid
} from "@mantine/core";
import {
  IconTable,
  IconLayoutGrid,
  IconBuildingBank,
  IconWallet,
  IconTag,
  IconCircleCheck,
  IconCircleX,
  IconGift,
  IconReceipt
} from "@tabler/icons-react";
import moment from "moment";

import { message } from "../../../utils/notifications";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { getUserPayments } from "../../../apicalls/payments";
import PageTitle from "../../../components/PageTitle";

function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [viewMode, setViewMode] = useState("cards");
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);

  const getPaymentData = useCallback(async () => {
    try {
      dispatch(ShowLoading());
      const response = await getUserPayments({ userId: user._id });
      dispatch(HideLoading());

      if (response.success) {
        setPayments(response.data);
        if (response.data.length === 0) {
          message.info("No payment history found for your account");
        }
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message || "Something went wrong");
    }
  }, [dispatch, user._id]);

  useEffect(() => {
    getPaymentData();
  }, [getPaymentData]);

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge color="green" leftSection={<IconCircleCheck size={14} />}>Completed</Badge>;
      case "failed":
        return <Badge color="red" leftSection={<IconCircleX size={14} />}>Failed</Badge>;
      case "pending":
        return <Badge color="yellow">Pending</Badge>;
      case "refunded":
        return <Badge color="blue">Refunded</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
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

  const renderTableView = () => (
    <Paper withBorder>
      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Receipt Number</Table.Th>
              <Table.Th>Exam</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Payment Method</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <Table.Tr key={payment._id}>
                  <Table.Td>{payment.receiptNumber}</Table.Td>
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
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Stack align="center" py="xl">
                    <ThemeIcon size={60} variant="light" color="gray">
                      <IconReceipt size={30} />
                    </ThemeIcon>
                    <Text c="dimmed">No payment history found</Text>
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
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Transaction ID:</Text>
                <Text size="xs" ff="monospace">{payment.transactionId}</Text>
              </Group>
            </Stack>
          </Card>
        ))
      ) : (
        <Box ta="center" py="xl" style={{ gridColumn: '1 / -1' }}>
          <Stack align="center">
            <ThemeIcon size={60} variant="light" color="gray">
              <IconReceipt size={30} />
            </ThemeIcon>
            <Text c="dimmed">No payment history found</Text>
          </Stack>
        </Box>
      )}
    </SimpleGrid>
  );

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="md">
        <PageTitle title="Payment History" />
        <SegmentedControl
          value={viewMode}
          onChange={setViewMode}
          data={[
            {
              label: (
                <Group gap="xs">
                  <IconLayoutGrid size={16} />
                  <span>Cards</span>
                </Group>
              ),
              value: 'cards'
            },
            {
              label: (
                <Group gap="xs">
                  <IconTable size={16} />
                  <span>Table</span>
                </Group>
              ),
              value: 'table'
            },
          ]}
        />
      </Group>

      {viewMode === 'table' ? renderTableView() : renderCardView()}
    </Container>
  );
}

export default PaymentHistory;
