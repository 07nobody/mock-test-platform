import React, { useEffect, useState, useCallback } from "react";
import { 
  Container,
  Title,
  Text,
  Table, 
  Select, 
  TextInput, 
  Button, 
  Badge, 
  Tooltip, 
  Modal, 
  Group, 
  SegmentedControl,
  Paper,
  Stack,
  Box,
  ScrollArea,
  Card,
  SimpleGrid,
  ThemeIcon,
  Progress,
  Divider,
  Alert
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { getAllExams, registerForExam, checkExamRegistration, resendExamCode } from "../../../apicalls/exams";
import { message } from "../../../utils/notifications";
import { 
  IconSearch, 
  IconClock, 
  IconBook, 
  IconCircleCheck,
  IconCurrencyDollar,
  IconUserPlus,
  IconLock,
  IconTable,
  IconLayoutGrid,
  IconSend,
  IconFileOff,
  IconTrophy,
  IconQuestionMark,
  IconMail
} from "@tabler/icons-react";

function AvailableExams() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [registrationStatus, setRegistrationStatus] = useState({});
  const [registrationLoading, setRegistrationLoading] = useState({});
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [viewMode, setViewMode] = useState("cards");

  const checkRegistrationStatus = async (examId) => {
    try {
      const response = await checkExamRegistration({ examId, userId: user._id });
      if (response.success) {
        setRegistrationStatus(prev => ({ ...prev, [examId]: response.data }));
      }
    } catch (error) {
      console.error("Error checking registration status:", error);
    }
  };

  const getExamsData = useCallback(async () => {
    try {
      dispatch(ShowLoading());
      const response = await getAllExams();
      dispatch(HideLoading());
      
      if (response.success) {
        const activeExams = response.data.filter((exam) => exam.status === "active");
        setExams(activeExams);
        setFilteredExams(activeExams);
        
        const uniqueCategories = [...new Set(activeExams.map((exam) => exam.category))];
        setCategories(uniqueCategories);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
  
  const handleRegisterClick = (exam) => {
    setSelectedExam(exam);
    setShowRegistrationModal(true);
  };
  
  const handleRegisterConfirm = async () => {
    if (!selectedExam) return;
    
    try {
      setRegistrationLoading(prev => ({ ...prev, [selectedExam._id]: true }));
      
      const response = await registerForExam({
        examId: selectedExam._id,
        userId: user._id,
        email: user.email
      });
      
      if (response.success) {
        await checkRegistrationStatus(selectedExam._id);
        setShowRegistrationModal(false);
        
        if (selectedExam.isPaid) {
          navigate(`/payment-portal/${selectedExam._id}`);
        } else {
          setShowSuccessModal(true);
        }
      } else {
        message.error(response.message);
      }
      
      setRegistrationLoading(prev => ({ ...prev, [selectedExam._id]: false }));
    } catch (error) {
      setRegistrationLoading(prev => ({ ...prev, [selectedExam._id]: false }));
      message.error("Failed to register for exam: " + error.message);
    }
  };

  const handleResendCode = async (examId) => {
    try {
      dispatch(ShowLoading());
      const response = await resendExamCode({ examId });
      dispatch(HideLoading());
      
      if (response.success) {
        message.success("Exam code has been resent to your email!");
      } else {
        message.error(response.message || "Failed to resend exam code");
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error("Failed to resend exam code: " + error.message);
    }
  };

  useEffect(() => {
    getExamsData();
  }, [getExamsData]);

  useEffect(() => {
    // Check registration status for all exams when exams are loaded
    exams.forEach(exam => checkRegistrationStatus(exam._id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exams]);

  useEffect(() => {
    let filtered = [...exams];
    
    if (searchTerm) {
      filtered = filtered.filter(
        (exam) => 
          exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter((exam) => exam.category === selectedCategory);
    }
    
    setFilteredExams(filtered);
  }, [searchTerm, selectedCategory, exams]);

  const getDifficulty = (passingMarks, totalMarks) => {
    const ratio = passingMarks / totalMarks;
    if (ratio >= 0.9) return { label: "Hard", color: "red" };
    if (ratio >= 0.75) return { label: "Medium", color: "orange" };
    return { label: "Easy", color: "green" };
  };

  const getStatusInfo = (exam) => {
    const status = registrationStatus[exam._id];
    if (!status?.isRegistered) return { label: "Not Registered", color: "gray" };
    if (exam.isPaid && status.paymentStatus !== "completed") return { label: "Payment Pending", color: "orange" };
    return { label: "Registered", color: "green" };
  };

  const renderActionButton = (exam) => {
    const status = registrationStatus[exam._id];
    const isRegistered = status?.isRegistered;
    const paymentComplete = !exam.isPaid || (status?.paymentStatus === "completed");
    
    if (isRegistered && paymentComplete) {
      return (
        <Group gap="xs">
          <Tooltip label="Resend exam code">
            <Button variant="light" size="xs" onClick={() => handleResendCode(exam._id)}>
              <IconSend size={14} />
            </Button>
          </Tooltip>
          <Button size="xs" onClick={() => navigate(`/user/write-exam/${exam._id}`)}>
            Start Exam
          </Button>
        </Group>
      );
    }
    
    if (isRegistered && !paymentComplete) {
      return (
        <Button 
          size="xs" 
          color="orange"
          leftSection={<IconCurrencyDollar size={14} />}
          onClick={() => navigate(`/payment-portal/${exam._id}`)}
        >
          Pay ₹{exam.price}
        </Button>
      );
    }
    
    return (
      <Button
        size="xs"
        color="green"
        leftSection={<IconUserPlus size={14} />}
        onClick={() => handleRegisterClick(exam)}
        loading={registrationLoading[exam._id]}
      >
        Register
      </Button>
    );
  };

  const renderTableView = () => (
    <Paper withBorder radius="md">
      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Exam</Table.Th>
              <Table.Th>Duration</Table.Th>
              <Table.Th>Questions</Table.Th>
              <Table.Th>Difficulty</Table.Th>
              <Table.Th>Pass Score</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredExams.map((exam) => {
              const difficulty = getDifficulty(exam.passingMarks, exam.totalMarks);
              const statusInfo = getStatusInfo(exam);
              
              return (
                <Table.Tr key={exam._id}>
                  <Table.Td>
                    <Group gap="xs">
                      <Text fw={500}>{exam.name}</Text>
                      {exam.isPaid && (
                        <Badge size="xs" color="yellow">Paid</Badge>
                      )}
                    </Group>
                    <Text size="xs" c="dimmed">{exam.category}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <IconClock size={14} />
                      {Math.floor(exam.duration / 60)} min
                    </Group>
                  </Table.Td>
                  <Table.Td>{exam.questions?.length || 0}</Table.Td>
                  <Table.Td>
                    <Badge color={difficulty.color} variant="light">{difficulty.label}</Badge>
                  </Table.Td>
                  <Table.Td>{exam.passingMarks}/{exam.totalMarks}</Table.Td>
                  <Table.Td>
                    <Badge color={statusInfo.color} variant="light">{statusInfo.label}</Badge>
                  </Table.Td>
                  <Table.Td>{renderActionButton(exam)}</Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );

  const renderCardView = () => (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {filteredExams.map((exam) => {
        const difficulty = getDifficulty(exam.passingMarks, exam.totalMarks);
        const statusInfo = getStatusInfo(exam);
        const difficultyPercent = (exam.passingMarks / exam.totalMarks) * 100;
        
        return (
          <Card key={exam._id} withBorder padding="lg" radius="md">
            <Group justify="space-between" mb="xs">
              <Badge color={difficulty.color} variant="light">{difficulty.label}</Badge>
              {exam.isPaid && (
                <Badge color="yellow" variant="light" leftSection={<IconCurrencyDollar size={12} />}>
                  ₹{exam.price}
                </Badge>
              )}
            </Group>

            <Text fw={600} size="lg" mb="xs" lineClamp={2}>{exam.name}</Text>
            
            <Badge variant="outline" size="sm" mb="md">{exam.category}</Badge>

            <SimpleGrid cols={3} spacing="xs" mb="md">
              <Box ta="center">
                <ThemeIcon variant="light" size="md" mb={4}>
                  <IconClock size={14} />
                </ThemeIcon>
                <Text size="xs" c="dimmed">Duration</Text>
                <Text size="sm" fw={500}>{Math.floor(exam.duration / 60)} min</Text>
              </Box>
              <Box ta="center">
                <ThemeIcon variant="light" size="md" mb={4}>
                  <IconQuestionMark size={14} />
                </ThemeIcon>
                <Text size="xs" c="dimmed">Questions</Text>
                <Text size="sm" fw={500}>{exam.questions?.length || 0}</Text>
              </Box>
              <Box ta="center">
                <ThemeIcon variant="light" size="md" mb={4}>
                  <IconTrophy size={14} />
                </ThemeIcon>
                <Text size="xs" c="dimmed">Pass</Text>
                <Text size="sm" fw={500}>{exam.passingMarks}/{exam.totalMarks}</Text>
              </Box>
            </SimpleGrid>

            <Box mb="md">
              <Group justify="space-between" mb={4}>
                <Text size="xs" c="dimmed">Difficulty Level</Text>
                <Text size="xs" c={difficulty.color}>{difficulty.label}</Text>
              </Group>
              <Progress value={difficultyPercent} color={difficulty.color} size="xs" radius="xl" />
            </Box>

            <Divider mb="md" />

            <Group justify="space-between">
              <Badge color={statusInfo.color} variant="dot">{statusInfo.label}</Badge>
              {renderActionButton(exam)}
            </Group>
          </Card>
        );
      })}
    </SimpleGrid>
  );

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg" wrap="wrap">
        <Group gap="sm">
          <ThemeIcon size={40} radius="md" variant="gradient" gradient={{ from: 'violet', to: 'indigo' }}>
            <IconBook size={22} />
          </ThemeIcon>
          <Box>
            <Title order={2}>Available Exams</Title>
            <Text c="dimmed" size="sm">Browse and register for exams</Text>
          </Box>
        </Group>
        
        <Group gap="sm" wrap="wrap">
          <TextInput
            leftSection={<IconSearch size={16} />}
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            w={200}
          />
          <Select
            placeholder="Category"
            value={selectedCategory}
            onChange={setSelectedCategory}
            clearable
            data={categories.map(c => ({ value: c, label: c }))}
            w={150}
          />
          <SegmentedControl
            value={viewMode}
            onChange={setViewMode}
            data={[
              { label: <Group gap={4}><IconLayoutGrid size={16} />Cards</Group>, value: 'cards' },
              { label: <Group gap={4}><IconTable size={16} />Table</Group>, value: 'table' },
            ]}
          />
        </Group>
      </Group>

      {filteredExams.length > 0 ? (
        viewMode === 'table' ? renderTableView() : renderCardView()
      ) : (
        <Paper withBorder p="xl" radius="md">
          <Stack align="center" py="xl">
            <ThemeIcon size={64} variant="light" color="gray" radius="xl">
              <IconFileOff size={32} />
            </ThemeIcon>
            <Text c="dimmed" size="lg">No exams found</Text>
            <Text c="dimmed" size="sm">Try adjusting your search or filters</Text>
          </Stack>
        </Paper>
      )}
      
      {/* Registration Modal */}
      <Modal
        title={selectedExam?.isPaid ? "Paid Exam Registration" : "Exam Registration"}
        opened={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        size="md"
      >
        {selectedExam && (
          <Stack gap="md">
            <Text fw={600} size="lg">{selectedExam.name}</Text>
            
            {registrationStatus[selectedExam?._id]?.isRegistered ? (
              <Stack gap="md">
                <Alert color="green" icon={<IconCircleCheck size={16} />}>
                  You are registered for this exam
                </Alert>
                
                {selectedExam.isPaid && registrationStatus[selectedExam._id].paymentStatus !== "completed" && (
                  <Alert color="orange" icon={<IconCurrencyDollar size={16} />}>
                    Payment pending - ₹{selectedExam.price}
                  </Alert>
                )}
                
                <Paper withBorder p="md" radius="md">
                  <Group gap="xs" mb="xs">
                    <IconMail size={16} />
                    <Text size="sm">Exam code sent to: <Text span fw={500}>{user.email}</Text></Text>
                  </Group>
                  <Group gap="xs">
                    <Button onClick={() => navigate(`/user/write-exam/${selectedExam._id}`)}>
                      Go to Exam
                    </Button>
                    <Button variant="light" leftSection={<IconSend size={14} />} onClick={() => handleResendCode(selectedExam._id)}>
                      Resend Code
                    </Button>
                  </Group>
                </Paper>
              </Stack>
            ) : (
              <Stack gap="md">
                <Text c="dimmed">You are about to register for this exam.</Text>
                
                <Paper withBorder p="md" radius="md">
                  <SimpleGrid cols={2} spacing="xs">
                    <Text size="sm" c="dimmed">Category:</Text>
                    <Text size="sm" fw={500}>{selectedExam.category}</Text>
                    <Text size="sm" c="dimmed">Duration:</Text>
                    <Text size="sm" fw={500}>{Math.floor(selectedExam.duration / 60)} minutes</Text>
                    <Text size="sm" c="dimmed">Questions:</Text>
                    <Text size="sm" fw={500}>{selectedExam.questions?.length || 0}</Text>
                    <Text size="sm" c="dimmed">Pass Score:</Text>
                    <Text size="sm" fw={500}>{selectedExam.passingMarks}/{selectedExam.totalMarks}</Text>
                  </SimpleGrid>
                </Paper>
                
                <Alert color="blue" icon={<IconLock size={16} />}>
                  <Text size="sm">After registration, an exam token will be emailed to <Text span fw={500}>{user.email}</Text></Text>
                </Alert>
                
                {selectedExam.isPaid && (
                  <Alert color="yellow" icon={<IconCurrencyDollar size={16} />}>
                    <Text size="sm">This is a paid exam. Price: <Text span fw={600}>₹{selectedExam.price}</Text></Text>
                    <Text size="xs" c="dimmed">Payment required after registration to access the exam.</Text>
                  </Alert>
                )}
                
                <Group justify="flex-end">
                  <Button variant="default" onClick={() => setShowRegistrationModal(false)}>Cancel</Button>
                  <Button onClick={handleRegisterConfirm} loading={registrationLoading[selectedExam._id]}>
                    Register Now
                  </Button>
                </Group>
              </Stack>
            )}
          </Stack>
        )}
      </Modal>

      {/* Success Modal */}
      <Modal
        opened={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        size="sm"
        centered
        withCloseButton={false}
      >
        <Stack align="center" py="md">
          <ThemeIcon size={64} color="green" radius="xl">
            <IconCircleCheck size={32} />
          </ThemeIcon>
          <Title order={3}>Registration Successful!</Title>
          <Text c="dimmed" ta="center" size="sm">
            An email with your exam token has been sent to:
          </Text>
          <Text fw={500}>{user?.email}</Text>
          <Group mt="md">
            <Button onClick={() => {
              setShowSuccessModal(false);
              if (selectedExam) navigate(`/user/write-exam/${selectedExam._id}`);
            }}>
              Go to Exam
            </Button>
            <Button variant="default" onClick={() => setShowSuccessModal(false)}>
              Close
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default AvailableExams;
