import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Table,
  Button,
  Badge,
  Tooltip,
  Modal,
  SegmentedControl,
  Switch,
  Alert,
  Text,
  Group,
  Box,
  Container,
  Paper,
  SimpleGrid,
  Stack,
  ScrollArea,
  ThemeIcon
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconEdit,
  IconTrash,
  IconCirclePlus,
  IconQuestionMark,
  IconCopy,
  IconUsers,
  IconRefresh,
  IconTable,
  IconLayoutGrid,
  IconCircleCheck,
  IconMail,
  IconPower
} from "@tabler/icons-react";
import PageTitle from "../../../components/PageTitle";
import ExamCard from "../../../components/ExamCard";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { getAllExams, deleteExamById, regenerateExamToken, updateExamStatus } from "../../../apicalls/exams";
import moment from "moment";
import { message } from "../../../utils/notifications";

function Exams() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [exams, setExams] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [regenerateModalVisible, setRegenerateModalVisible] = useState(false);
  const [examToRegenerate, setExamToRegenerate] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [registeredUsersModalVisible, setRegisteredUsersModalVisible] = useState(false);
  const [notifyUsersModalVisible, setNotifyUsersModalVisible] = useState(false);
  const [examToToggle, setExamToToggle] = useState(null);
  const [isActivating, setIsActivating] = useState(false);

  const getExamsData = useCallback(async () => {
    try {
      dispatch(ShowLoading());
      const response = await getAllExams();
      if (response.success) {
        setExams(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  }, [dispatch]);

  const deleteExam = async (examId) => {
    try {
      dispatch(ShowLoading());
      const response = await deleteExamById({ examId });
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        setRefreshTrigger(prev => prev + 1);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const confirmDeleteExam = (examId) => {
    modals.openConfirmModal({
      title: 'Delete Exam',
      children: <Text>Are you sure you want to delete this exam?</Text>,
      labels: { confirm: 'Yes', cancel: 'No' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteExam(examId),
    });
  };

  const confirmRegenerateToken = (exam) => {
    setExamToRegenerate(exam);
    setRegenerateModalVisible(true);
  };

  const handleToggleStatus = (exam) => {
    if (exam.status === "active") {
      toggleExamStatus(exam._id, "inactive", false);
      return;
    }

    if (exam.registeredUsers && exam.registeredUsers.length > 0) {
      setExamToToggle(exam);
      setIsActivating(true);
      setNotifyUsersModalVisible(true);
    } else {
      toggleExamStatus(exam._id, "active", false);
    }
  };

  const toggleExamStatus = async (examId, status, shouldNotifyUsers = false) => {
    try {
      dispatch(ShowLoading());
      const response = await updateExamStatus({
        examId,
        status,
        shouldNotifyUsers
      });

      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        setNotifyUsersModalVisible(false);
        setRefreshTrigger(prev => prev + 1);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message || "Something went wrong");
    }
  };

  const handleRegenerateToken = async () => {
    if (!examToRegenerate) return;

    try {
      dispatch(ShowLoading());
      const response = await regenerateExamToken({
        examId: examToRegenerate._id
      });

      dispatch(HideLoading());
      if (response.success) {
        message.success("Exam token regenerated successfully and notifications sent");
        setRegenerateModalVisible(false);
        setRefreshTrigger(prev => prev + 1);
      } else {
        message.error(response.message || "Failed to regenerate token");
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message || "Something went wrong");
    }
  };

  useEffect(() => {
    getExamsData();
  }, [getExamsData, refreshTrigger]);

  const handleShare = (method) => {
    if (!selectedExam) return;

    const examInfo = `
Exam Name: ${selectedExam.name}
Category: ${selectedExam.category}
Duration: ${Math.floor(selectedExam.duration / 60)} minutes
Exam Code: ${selectedExam.examCode}

This code is required to access the exam. Please keep it confidential.`;

    if (method === 'copy') {
      navigator.clipboard.writeText(examInfo);
      message.success('Exam details copied to clipboard!');
    } else if (method === 'email') {
      const subject = encodeURIComponent(`Exam Details: ${selectedExam.name}`);
      const body = encodeURIComponent(examInfo);
      window.open(`mailto:?subject=${subject}&body=${body}`);
    }

    setShareModalVisible(false);
  };

  const handleViewRegisteredUsers = (exam) => {
    setSelectedExam(exam);
    if (exam.registeredUsers && exam.registeredUsers.length > 0) {
      setRegisteredUsersModalVisible(true);
    } else {
      message.info("No users have registered for this exam yet.");
    }
  };

  const renderCardView = () => (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
      {exams.map((exam) => (
        <ExamCard
          key={exam._id}
          exam={exam}
          onDelete={deleteExam}
          onEdit={(exam) => navigate(`/admin/exams/edit/${exam._id}`)}
          onQuestions={(exam) => navigate(`/admin/exams/questions/${exam._id}`)}
          onRegenerateToken={confirmRegenerateToken}
          onToggleStatus={handleToggleStatus}
        />
      ))}
    </SimpleGrid>
  );

  const renderTableView = () => (
    <Paper withBorder>
      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Exam Name</Table.Th>
              <Table.Th>Duration (in seconds)</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Total Marks</Table.Th>
              <Table.Th>Passing Marks</Table.Th>
              <Table.Th>Exam Code</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Registered Users</Table.Th>
              <Table.Th>Created On</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {exams.map((exam) => (
              <Table.Tr key={exam._id}>
                <Table.Td>{exam.name}</Table.Td>
                <Table.Td>{exam.duration}</Table.Td>
                <Table.Td>{exam.category}</Table.Td>
                <Table.Td>{exam.totalMarks}</Table.Td>
                <Table.Td>{exam.passingMarks}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Badge color="blue">{exam.examCode || "N/A"}</Badge>
                    <Tooltip label="Copy exam code">
                      <Button
                        variant="subtle"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(exam.examCode);
                          message.success("Exam code copied to clipboard!");
                        }}
                      >
                        <IconCopy size={14} />
                      </Button>
                    </Tooltip>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap="sm">
                    <Badge color={exam.status === "active" ? "green" : "red"}>
                      {exam.status ? exam.status.toUpperCase() : 'INACTIVE'}
                    </Badge>
                    <Switch
                      checked={exam.status === "active"}
                      onChange={() => handleToggleStatus(exam)}
                      disabled={exam.questions?.length === 0 || exam.questions?.length !== exam.totalMarks}
                      onLabel={<IconCircleCheck size={12} />}
                      offLabel={<IconPower size={12} />}
                    />
                  </Group>
                </Table.Td>
                <Table.Td>
                  {exam.isPaid ?
                    <Badge color="yellow">PAID (₹{exam.isPaid.price || 0})</Badge> :
                    <Badge color="green">FREE</Badge>}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Badge color={exam.registeredUsers?.length > 0 ? "green" : "gray"}>
                      {exam.registeredUsers?.length || 0}
                    </Badge>
                    <Button
                      variant="default"
                      size="xs"
                      leftSection={<IconUsers size={14} />}
                      disabled={!exam.registeredUsers?.length}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewRegisteredUsers(exam);
                      }}
                    >
                      View
                    </Button>
                  </Group>
                </Table.Td>
                <Table.Td>{moment(exam.createdAt).format("DD-MM-YYYY hh:mm:ss")}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button size="xs" onClick={() => navigate(`/admin/exams/edit/${exam._id}`)}>
                      <IconEdit size={14} />
                    </Button>
                    <Button size="xs" onClick={() => navigate(`/admin/exams/questions/${exam._id}`)}>
                      <IconQuestionMark size={14} />
                    </Button>
                    <Button size="xs" color="red" onClick={() => confirmDeleteExam(exam._id)}>
                      <IconTrash size={14} />
                    </Button>
                    <Tooltip label="Regenerate Token">
                      <Button size="xs" onClick={() => confirmRegenerateToken(exam)}>
                        <IconRefresh size={14} />
                      </Button>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="md">
        <PageTitle title="Exams" />
        <Button
          leftSection={<IconCirclePlus size={16} />}
          onClick={() => navigate("/admin/exams/add")}
        >
          Add Exam
        </Button>
      </Group>

      <Group justify="flex-end" mb="lg">
        <SegmentedControl
          value={viewMode}
          onChange={setViewMode}
          data={[
            { label: <Group gap="xs"><IconTable size={16} /> Table View</Group>, value: 'table' },
            { label: <Group gap="xs"><IconLayoutGrid size={16} /> Card View</Group>, value: 'cards' },
          ]}
        />
      </Group>

      {viewMode === 'table' ? renderTableView() : renderCardView()}

      {/* Regenerate Token Modal */}
      <Modal
        title="Regenerate Exam Token"
        opened={regenerateModalVisible}
        onClose={() => setRegenerateModalVisible(false)}
      >
        <Text mb="md">Are you sure you want to regenerate the token for this exam?</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setRegenerateModalVisible(false)}>No</Button>
          <Button onClick={handleRegenerateToken}>Yes</Button>
        </Group>
      </Modal>

      {/* Share Modal */}
      <Modal
        title="Share Exam Details"
        opened={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
      >
        {selectedExam && (
          <Stack>
            <Box>
              <Text size="sm" c="dimmed">Exam Name</Text>
              <Text fw={500}>{selectedExam.name}</Text>
            </Box>
            <Box>
              <Text size="sm" c="dimmed">Category</Text>
              <Text fw={500}>{selectedExam.category}</Text>
            </Box>
            <Box>
              <Text size="sm" c="dimmed">Duration</Text>
              <Text fw={500}>{Math.floor(selectedExam.duration / 60)} minutes</Text>
            </Box>
            <Box>
              <Text size="sm" c="dimmed">Exam Code</Text>
              <Text fw={500}>{selectedExam.examCode}</Text>
            </Box>
            <Group mt="md">
              <Button onClick={() => handleShare('copy')}>Copy to Clipboard</Button>
              <Button variant="default" onClick={() => handleShare('email')}>Share via Email</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Registered Users Modal */}
      <Modal
        title={selectedExam ? `Registered Users - ${selectedExam.name}` : "Registered Users"}
        opened={registeredUsersModalVisible}
        onClose={() => setRegisteredUsersModalVisible(false)}
        size="lg"
      >
        {selectedExam && selectedExam.registeredUsers && selectedExam.registeredUsers.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Email</Table.Th>
                <Table.Th>Registered On</Table.Th>
                <Table.Th>Payment Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {selectedExam.registeredUsers.map((user, index) => (
                <Table.Tr key={user.userId || index}>
                  <Table.Td>{user.email}</Table.Td>
                  <Table.Td>{user.registeredAt ? moment(user.registeredAt).format('DD-MM-YYYY hh:mm A') : 'N/A'}</Table.Td>
                  <Table.Td>
                    <Badge
                      color={user.paymentStatus === 'completed' ? 'green' : user.paymentStatus === 'pending' ? 'orange' : 'red'}
                    >
                      {user.paymentStatus ? user.paymentStatus.toUpperCase() : 'N/A'}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Box ta="center" py="xl">
            <Text c="dimmed">No users have registered for this exam yet.</Text>
          </Box>
        )}
      </Modal>

      {/* Notify Users Modal */}
      <Modal
        title="Notify Registered Users"
        opened={notifyUsersModalVisible}
        onClose={() => setNotifyUsersModalVisible(false)}
        size="md"
      >
        {examToToggle && (
          <Stack gap="md">
            <Paper withBorder p="md" bg="green.0">
              <Group>
                <ThemeIcon color="green" variant="light" size="lg">
                  <IconCircleCheck size={20} />
                </ThemeIcon>
                <Text size="md">
                  <Text component="span" fw={700}>{examToToggle?.registeredUsers?.length || 0}</Text> users have registered for this exam
                </Text>
              </Group>
            </Paper>

            <Alert
              title={isActivating ?
                "Would you like to notify these users that the exam is now active?" :
                "You are about to deactivate this exam"
              }
              color={isActivating ? "blue" : "yellow"}
            >
              {isActivating ?
                "An email will be sent to all registered users informing them that the exam is now available to take." :
                "Registered users will not be able to take the exam while it is inactive."
              }
            </Alert>

            {isActivating && (
              <Paper withBorder>
                <Text fw={600} p="sm" bg="gray.1" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                  Registered Users:
                </Text>
                <ScrollArea h={200}>
                  <Stack gap={0}>
                    {examToToggle?.registeredUsers?.map((user, index) => (
                      <Group key={index} justify="space-between" p="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                        <Text size="sm">{user.email}</Text>
                        <Badge
                          size="sm"
                          color={user.paymentStatus === 'completed' ? 'green' : user.paymentStatus === 'pending' ? 'orange' : 'red'}
                        >
                          {user.paymentStatus?.toUpperCase()}
                        </Badge>
                      </Group>
                    ))}
                  </Stack>
                </ScrollArea>
              </Paper>
            )}
          </Stack>
        )}

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => setNotifyUsersModalVisible(false)}>
            Cancel
          </Button>
          <Button
            variant="light"
            onClick={() => toggleExamStatus(examToToggle?._id, isActivating ? "active" : "inactive", false)}
          >
            {isActivating ? "Activate Without Notification" : "Deactivate"}
          </Button>
          {isActivating && (
            <Button
              leftSection={<IconMail size={16} />}
              onClick={() => toggleExamStatus(examToToggle?._id, "active", true)}
            >
              Activate & Notify Users
            </Button>
          )}
        </Group>
      </Modal>
    </Container>
  );
}

export default Exams;
