import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Table,
  Modal,
  TextInput,
  Textarea,
  Button,
  Tabs,
  Card,
  Select,
  Badge,
  Group,
  Text,
  Grid,
  Box,
  Container,
  Paper,
  Stack,
  SimpleGrid,
  Alert
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import {
  IconEdit,
  IconTrash,
  IconCirclePlus,
  IconArrowLeft,
  IconUpload,
  IconAlertCircle
} from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import {
  addQuestionToExam,
  getExamById,
  deleteQuestionById,
  editQuestionById
} from "../../../apicalls/exams";
import PageTitle from "../../../components/PageTitle";
import BulkUploadQuestions from "../../../components/BulkUploadQuestions";
import axios from "axios";
import { message } from "../../../utils/notifications";

function AddEditQuestion() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();
  const [examData, setExamData] = useState(null);
  const [showQuestionLimitModal, setShowQuestionLimitModal] = useState(false);
  const [showAddEditQuestionModal, setShowAddEditQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  const form = useForm({
    initialValues: {
      name: '',
      A: '',
      B: '',
      C: '',
      D: '',
      correctOption: '',
      category: 'General',
      difficulty: 'Medium',
      tags: []
    },
    validate: {
      name: (value) => (!value ? 'Please enter question' : null),
      A: (value) => (!value ? 'Please enter Option A' : null),
      B: (value) => (!value ? 'Please enter Option B' : null),
      C: (value) => (!value ? 'Please enter Option C' : null),
      D: (value) => (!value ? 'Please enter Option D' : null),
      correctOption: (value) => (!value ? 'Please select the correct option' : null),
    },
  });

  const getExamData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getExamById({ examId: params.id });
      dispatch(HideLoading());
      if (response.success) {
        setExamData(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const fetchMetadata = async () => {
    try {
      const token = localStorage.getItem("token");

      const categoriesRes = await axios.post('/api/exams/question-categories', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data);
      }

      const tagsRes = await axios.post('/api/exams/question-tags', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (tagsRes.data.success) {
        setTags(tagsRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

  const checkQuestionLimit = () => {
    if (!examData || !examData.totalMarks) return true;

    const currentQuestions = examData.questions?.length || 0;
    const maxQuestions = examData.totalMarks;

    if (!selectedQuestion && currentQuestions >= maxQuestions) {
      setShowQuestionLimitModal(true);
      return false;
    }

    return true;
  };

  const handleAddQuestionButtonClick = () => {
    if (checkQuestionLimit()) {
      setSelectedQuestion(null);
      form.reset();
      setShowAddEditQuestionModal(true);
    }
  };

  const handleAddQuestion = async (values) => {
    try {
      dispatch(ShowLoading());
      const tempOptions = {
        A: values.A,
        B: values.B,
        C: values.C,
        D: values.D,
      };

      const reqPayload = {
        name: values.name,
        correctOption: values.correctOption,
        options: tempOptions,
        exam: params.id,
        tags: values.tags || [],
        category: values.category || "General",
        difficulty: values.difficulty || "Medium"
      };

      let response;
      if (selectedQuestion) {
        response = await editQuestionById({
          ...reqPayload,
          questionId: selectedQuestion._id,
        });
      } else {
        response = await addQuestionToExam(reqPayload);
      }

      if (response.success) {
        message.success(response.message);
        getExamData();
        setShowAddEditQuestionModal(false);
        form.reset();
        setSelectedQuestion(null);
      } else {
        message.error(response.message);
      }

      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      dispatch(ShowLoading());
      const response = await deleteQuestionById({
        questionId,
        examId: params.id,
      });
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        getExamData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const confirmDeleteQuestion = (questionId) => {
    modals.openConfirmModal({
      title: 'Delete Question',
      children: <Text>Are you sure you want to delete this question?</Text>,
      labels: { confirm: 'Yes', cancel: 'No' },
      confirmProps: { color: 'red' },
      onConfirm: () => handleDeleteQuestion(questionId),
    });
  };

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    form.setValues({
      name: question.name,
      correctOption: question.correctOption,
      A: question.options.A,
      B: question.options.B,
      C: question.options.C,
      D: question.options.D,
      category: question.category || "General",
      difficulty: question.difficulty || "Medium",
      tags: question.tags || []
    });
    setShowAddEditQuestionModal(true);
  };

  useEffect(() => {
    getExamData();
    fetchMetadata();
  }, []);

  const correctOptionData = [
    { value: 'A', label: 'Option A' },
    { value: 'B', label: 'Option B' },
    { value: 'C', label: 'Option C' },
    { value: 'D', label: 'Option D' },
  ];

  const difficultyData = [
    { value: 'Easy', label: 'Easy' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Hard', label: 'Hard' },
  ];

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="md">
        <PageTitle title={examData?.name ? `${examData.name} - Questions` : "Questions"} />
        <Button
          variant="default"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/admin/exams")}
        >
          Back to Exams
        </Button>
      </Group>

      {examData && (
        <Stack gap="lg">
          {/* Stats Card */}
          <Card withBorder p="md">
            <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md">
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Total Marks</Text>
                <Text size="xl" fw={700} c="blue">{examData?.totalMarks || 0}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Passing Marks</Text>
                <Text size="xl" fw={700} c="blue">{examData?.passingMarks || 0}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Questions</Text>
                <Text size="xl" fw={700} c="blue">{examData?.questions?.length || 0}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Category</Text>
                <Text size="xl" fw={700} c="blue">{examData?.category}</Text>
              </Box>
              {examData?.duration && (
                <Box>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Duration</Text>
                  <Text size="xl" fw={700} c="blue">{examData.duration} min</Text>
                </Box>
              )}
            </SimpleGrid>
          </Card>

          {/* Action Buttons */}
          <Group justify="flex-end">
            <Button
              leftSection={<IconCirclePlus size={16} />}
              onClick={handleAddQuestionButtonClick}
            >
              Add Question
            </Button>
            <Button
              variant="default"
              leftSection={<IconUpload size={16} />}
              onClick={() => setActiveTab("2")}
            >
              Bulk Upload
            </Button>
          </Group>

          {/* Tabs */}
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="1">Question List</Tabs.Tab>
              <Tabs.Tab value="2">Bulk Upload</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="1" pt="md">
              <Paper withBorder>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th w="30%">Question</Table.Th>
                      <Table.Th w="30%">Options</Table.Th>
                      <Table.Th w="10%">Correct Answer</Table.Th>
                      <Table.Th w="10%">Category</Table.Th>
                      <Table.Th w="10%">Difficulty</Table.Th>
                      <Table.Th w="10%">Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {examData?.questions?.map((question) => (
                      <Table.Tr key={question._id}>
                        <Table.Td>{question.name}</Table.Td>
                        <Table.Td>
                          <Stack gap={2}>
                            {question.options?.A && <Text size="sm">A: {question.options.A}</Text>}
                            {question.options?.B && <Text size="sm">B: {question.options.B}</Text>}
                            {question.options?.C && <Text size="sm">C: {question.options.C}</Text>}
                            {question.options?.D && <Text size="sm">D: {question.options.D}</Text>}
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="green">{question.correctOption}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="blue">{question.category || 'General'}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={question.difficulty === 'Easy' ? 'green' : question.difficulty === 'Hard' ? 'red' : 'orange'}
                          >
                            {question.difficulty || 'Medium'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Button size="xs" onClick={() => handleEditQuestion(question)}>
                              <IconEdit size={14} />
                            </Button>
                            <Button size="xs" color="red" onClick={() => confirmDeleteQuestion(question._id)}>
                              <IconTrash size={14} />
                            </Button>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="2" pt="md">
              <Card withBorder>
                <BulkUploadQuestions examId={params.id} onSuccess={getExamData} />
              </Card>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      )}

      {/* Add/Edit Question Modal */}
      <Modal
        title={selectedQuestion ? "Edit Question" : "Add Question"}
        opened={showAddEditQuestionModal}
        onClose={() => setShowAddEditQuestionModal(false)}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleAddQuestion)}>
          <Stack gap="md">
            <Textarea
              label="Question"
              placeholder="Enter question"
              required
              rows={3}
              {...form.getInputProps('name')}
            />

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Option A"
                  placeholder="Enter Option A"
                  required
                  {...form.getInputProps('A')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Option B"
                  placeholder="Enter Option B"
                  required
                  {...form.getInputProps('B')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Option C"
                  placeholder="Enter Option C"
                  required
                  {...form.getInputProps('C')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Option D"
                  placeholder="Enter Option D"
                  required
                  {...form.getInputProps('D')}
                />
              </Grid.Col>
            </Grid>

            <Select
              label="Correct Option"
              placeholder="Select the correct option"
              required
              data={correctOptionData}
              {...form.getInputProps('correctOption')}
            />

            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Category"
                  placeholder="Select or add a category"
                  data={categories.map(cat => ({ value: cat, label: cat }))}
                  searchable
                  creatable
                  getCreateLabel={(query) => `+ Create "${query}"`}
                  onCreate={(query) => {
                    setCategories([...categories, query]);
                    return query;
                  }}
                  {...form.getInputProps('category')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Difficulty Level"
                  placeholder="Select difficulty level"
                  data={difficultyData}
                  {...form.getInputProps('difficulty')}
                />
              </Grid.Col>
            </Grid>

            <Select
              label="Tags"
              placeholder="Add tags"
              data={tags.map(tag => ({ value: tag, label: tag }))}
              multiple
              searchable
              creatable
              getCreateLabel={(query) => `+ Create "${query}"`}
              onCreate={(query) => {
                setTags([...tags, query]);
                return query;
              }}
              {...form.getInputProps('tags')}
            />

            <Group justify="flex-end">
              <Button variant="default" onClick={() => setShowAddEditQuestionModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedQuestion ? "Update Question" : "Add Question"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Question Limit Modal */}
      <Modal
        title="Question Limit Reached"
        opened={showQuestionLimitModal}
        onClose={() => setShowQuestionLimitModal(false)}
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size={16} />} title="Maximum Questions Limit Reached" color="red">
            <Text size="sm">
              This exam is configured for a maximum of <Text component="span" fw={700}>{examData?.totalMarks}</Text> questions,
              but you already have <Text component="span" fw={700}>{examData?.questions?.length}</Text> questions.
            </Text>
            <Text size="sm" mt="xs">
              Please delete an existing question before adding a new one, or edit an existing question instead.
            </Text>
          </Alert>

          <Paper withBorder p="md" bg="gray.0">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500}>Total Marks:</Text>
                <Text size="sm" fw={700} c="blue">{examData?.totalMarks}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" fw={500}>Current Questions:</Text>
                <Text size="sm" fw={700} c="blue">{examData?.questions?.length}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" fw={500}>Passing Marks:</Text>
                <Text size="sm" fw={700} c="blue">{examData?.passingMarks}</Text>
              </Group>
            </Stack>
          </Paper>

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setShowQuestionLimitModal(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                setShowQuestionLimitModal(false);
                setActiveTab("1");
              }}
            >
              Delete Questions First
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default AddEditQuestion;
