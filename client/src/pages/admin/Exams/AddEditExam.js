import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  TextInput,
  NumberInput,
  Grid,
  Select,
  Switch,
  Button,
  Card,
  Tooltip,
  Alert,
  Badge,
  Modal,
  Group,
  Text,
  Box,
  Stack,
  Container,
  Paper,
  List,
  ThemeIcon,
  ScrollArea
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconArrowLeft,
  IconCurrencyDollar,
  IconQuestionMark,
  IconFlask,
  IconInfoCircle,
  IconMail,
  IconCircleCheck
} from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { addExam, getExamById, editExamById } from "../../../apicalls/exams";
import PageTitle from "../../../components/PageTitle";
import { message } from "../../../utils/notifications";

function AddEditExam() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();
  const [examData, setExamData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isPaidExam, setIsPaidExam] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [previousStatus, setPreviousStatus] = useState('');

  const form = useForm({
    initialValues: {
      name: '',
      duration: 60,
      category: 'General Knowledge',
      totalMarks: 10,
      passingMarks: 7,
      status: false,
      isPaid: false,
      price: 99
    },
    validate: {
      name: (value) => (!value ? 'Please enter exam name' : null),
      category: (value) => (!value ? 'Please select a category' : null),
      duration: (value) => (value < 30 ? 'Duration must be at least 30 seconds' : null),
      totalMarks: (value) => (value < 1 ? 'Total marks must be at least 1' : null),
      passingMarks: (value, values) => {
        if (value < 1) return 'Passing marks must be at least 1';
        if (value > values.totalMarks) return 'Passing marks cannot be greater than total marks';
        return null;
      },
      price: (value, values) => (values.isPaid && value < 1 ? 'Price must be at least ₹1' : null),
    },
  });

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());

      const formattedValues = {
        ...values,
        status: values.status ? "active" : "inactive",
        isPaid: values.isPaid ? { price: values.price || 99 } : null
      };

      delete formattedValues.price;

      if (isEdit && formattedValues.status === "active") {
        if (!examData.questions || examData.questions.length === 0) {
          message.error("Cannot activate exam. Please add questions first.");
          dispatch(HideLoading());
          return;
        }

        if (examData.questions.length !== examData.totalMarks) {
          message.warning(`Number of questions (${examData.questions.length}) does not match total marks (${examData.totalMarks}). Each question counts as 1 mark.`);
          dispatch(HideLoading());
          return;
        }

        if (examData.passingMarks > examData.totalMarks) {
          message.error("Passing marks cannot be greater than total marks.");
          dispatch(HideLoading());
          return;
        }

        if (previousStatus === "inactive" && examData.registeredUsers && examData.registeredUsers.length > 0) {
          setPreviousStatus("active");
          setShowNotifyModal(true);
          dispatch(HideLoading());
          return;
        }
      }

      let response;
      if (isEdit) {
        response = await editExamById({
          ...formattedValues,
          examId: params.id,
        });
      } else {
        response = await addExam(formattedValues);
      }

      if (response.success) {
        message.success(response.message);
        navigate("/admin/exams");
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const proceedWithExamUpdate = async (shouldNotify) => {
    try {
      dispatch(ShowLoading());
      setShowNotifyModal(false);

      const values = form.values;
      const formattedValues = {
        ...values,
        status: "active",
        isPaid: values.isPaid ? { price: values.price || 99 } : null
      };

      delete formattedValues.price;

      const response = await editExamById({
        ...formattedValues,
        examId: params.id,
        shouldNotifyUsers: shouldNotify
      });

      if (response.success) {
        if (shouldNotify) {
          message.success("Exam activated and notifications sent to registered users!");
        } else {
          message.success("Exam activated successfully!");
        }
        navigate("/admin/exams");
      } else {
        message.error(response.message);
      }

      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const getExamData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getExamById({ examId: params.id });
      dispatch(HideLoading());
      if (response.success) {
        setExamData(response.data);
        setPreviousStatus(response.data.status);
        const isPaid = !!response.data.isPaid;
        setIsPaidExam(isPaid);

        form.setValues({
          name: response.data.name,
          duration: response.data.duration,
          category: response.data.category,
          totalMarks: response.data.totalMarks,
          passingMarks: response.data.passingMarks,
          status: response.data.status === "active",
          isPaid: isPaid,
          price: isPaid ? response.data.isPaid.price : 99
        });
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    if (params.id) {
      setIsEdit(true);
      getExamData();
    }
  }, [params.id]);

  const handlePaidStatusChange = (checked) => {
    setIsPaidExam(checked);
    form.setFieldValue('isPaid', checked);

    if (checked && !form.values.price) {
      form.setFieldValue('price', 99);
    }
  };

  const categoryOptions = [
    { value: 'General Knowledge', label: 'General Knowledge' },
    { value: 'Science', label: 'Science' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'History', label: 'History' },
    { value: 'Geography', label: 'Geography' },
    { value: 'Literature', label: 'Literature' },
    { value: 'Current Affairs', label: 'Current Affairs' },
  ];

  return (
    <Container size="lg" py="md">
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <PageTitle title={isEdit ? "Edit Exam" : "Add Exam"} />
          {isPaidExam && (
            <Badge color="orange" leftSection={<IconCurrencyDollar size={12} />}>
              PAID
            </Badge>
          )}
        </Group>
        <Button
          variant="default"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/admin/exams")}
        >
          Back
        </Button>
      </Group>

      {isEdit && examData && (
        <Stack gap="sm" mb="lg">
          <Alert
            color={examData.status === "inactive" ? "yellow" : "green"}
            title={
              examData.status === "inactive" ?
                "This exam is currently inactive. Users can register but cannot take the exam until you activate it." :
                "This exam is active. Registered users can take the exam."
            }
          />

          {examData.questions && (
            <Alert
              color={examData.questions.length === examData.totalMarks ? "green" : "blue"}
              title={`Questions: ${examData.questions.length} of ${examData.totalMarks} required`}
            />
          )}
        </Stack>
      )}

      <form onSubmit={form.onSubmit(onFinish)}>
        <Stack gap="lg">
          {/* Exam Details Card */}
          <Card withBorder p="lg">
            <Text fw={600} size="lg" mb="md">Exam Details</Text>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Exam Name"
                  placeholder="Enter exam name"
                  required
                  {...form.getInputProps('name')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Category"
                  placeholder="Select a category"
                  required
                  data={categoryOptions}
                  {...form.getInputProps('category')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <NumberInput
                  label="Duration (in seconds)"
                  min={30}
                  required
                  {...form.getInputProps('duration')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <NumberInput
                  label="Total Marks"
                  min={1}
                  required
                  {...form.getInputProps('totalMarks')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <NumberInput
                  label="Passing Marks"
                  min={1}
                  required
                  {...form.getInputProps('passingMarks')}
                />
              </Grid.Col>
            </Grid>
          </Card>

          {/* Access Settings Card */}
          <Card withBorder p="lg">
            <Group gap="xs" mb="md">
              <Text fw={600} size="lg">Exam Access Settings</Text>
              <Tooltip label="Configure how users can access this exam">
                <IconQuestionMark size={16} />
              </Tooltip>
            </Group>

            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Box>
                  <Text size="sm" fw={500} mb="xs">Status</Text>
                  <Switch
                    label={form.values.status ? "Active" : "Inactive"}
                    checked={form.values.status}
                    onChange={(event) => form.setFieldValue('status', event.currentTarget.checked)}
                    disabled={isEdit && examData && (!examData.questions || examData.questions.length === 0)}
                  />
                </Box>

                {isEdit && examData && (!examData.questions || examData.questions.length === 0) && (
                  <Alert color="blue" mt="sm">
                    <Text size="sm">
                      Add questions to activate exam. Go to{' '}
                      <Button
                        variant="subtle"
                        size="compact-xs"
                        onClick={() => navigate(`/admin/exams/questions/${params.id}`)}
                      >
                        Question Management
                      </Button>
                    </Text>
                  </Alert>
                )}
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Box>
                  <Group gap="xs" mb="xs">
                    <Text size="sm" fw={500}>Paid Exam</Text>
                    <Badge size="xs" color="violet" leftSection={<IconFlask size={10} />}>
                      BETA
                    </Badge>
                  </Group>
                  <Switch
                    label={isPaidExam ? "Paid" : "Free"}
                    checked={isPaidExam}
                    onChange={(event) => handlePaidStatusChange(event.currentTarget.checked)}
                  />
                </Box>
              </Grid.Col>

              {isPaidExam && (
                <Grid.Col span={12}>
                  <Alert
                    color="yellow"
                    title="Paid Exam Feature (Beta)"
                    icon={<IconFlask size={16} />}
                    mb="md"
                  >
                    The paid exam feature is currently in beta testing. All payments are simulated for testing purposes.
                  </Alert>

                  <Paper withBorder p="md">
                    <Text fw={500} mb="md">Payment Settings</Text>
                    <Grid gutter="md">
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <NumberInput
                          label="Price (₹)"
                          min={1}
                          leftSection="₹"
                          placeholder="Enter price"
                          disabled={!isPaidExam}
                          required={isPaidExam}
                          {...form.getInputProps('price')}
                        />
                      </Grid.Col>

                      <Grid.Col span={12}>
                        <Paper p="md" bg="gray.0" radius="sm">
                          <Group gap="xs" mb="sm">
                            <IconInfoCircle size={16} />
                            <Text fw={500}>How Paid Exams Work:</Text>
                          </Group>
                          <List size="sm" spacing="xs">
                            <List.Item>Users must pay the specified price to access the exam</List.Item>
                            <List.Item>Payment is processed through our secure payment gateway</List.Item>
                            <List.Item>Users will receive an access code after payment</List.Item>
                            <List.Item>Real-time analytics on paid exam conversions available in reports</List.Item>
                          </List>
                        </Paper>
                      </Grid.Col>
                    </Grid>
                  </Paper>
                </Grid.Col>
              )}
            </Grid>
          </Card>

          {/* Action Buttons */}
          <Group justify="flex-end">
            <Button variant="default" onClick={() => navigate("/admin/exams")}>
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Update Exam" : "Create Exam"}
            </Button>
          </Group>
        </Stack>
      </form>

      {/* Notify Users Modal */}
      <Modal
        title="Notify Registered Users"
        opened={showNotifyModal}
        onClose={() => setShowNotifyModal(false)}
        size="md"
      >
        <Stack gap="md">
          <Paper withBorder p="md" bg="green.0">
            <Group>
              <ThemeIcon color="green" variant="light" size="lg">
                <IconCircleCheck size={20} />
              </ThemeIcon>
              <Text>
                <Text component="span" fw={700}>{examData?.registeredUsers?.length || 0}</Text> users have registered for this exam while it was inactive
              </Text>
            </Group>
          </Paper>

          <Alert color="blue" title="Would you like to notify these users that the exam is now active?">
            An email will be sent to all registered users informing them that the exam is now available to take.
          </Alert>

          <Paper withBorder>
            <Text fw={600} p="sm" bg="gray.1" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
              Registered Users:
            </Text>
            <ScrollArea h={200}>
              <Stack gap={0}>
                {examData?.registeredUsers?.map((user, index) => (
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
                {(!examData?.registeredUsers || examData?.registeredUsers.length === 0) && (
                  <Text c="dimmed" ta="center" p="md">No users have registered for this exam yet.</Text>
                )}
              </Stack>
            </ScrollArea>
          </Paper>
        </Stack>

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => setShowNotifyModal(false)}>
            Cancel
          </Button>
          <Button variant="light" onClick={() => proceedWithExamUpdate(false)}>
            Activate Without Notification
          </Button>
          <Button leftSection={<IconMail size={16} />} onClick={() => proceedWithExamUpdate(true)}>
            Send Notifications
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}

export default AddEditExam;
