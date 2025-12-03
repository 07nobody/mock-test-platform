import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Button, 
  Card, 
  Title, 
  Text, 
  Badge, 
  Alert, 
  Stepper, 
  Divider, 
  Modal, 
  TextInput, 
  Select, 
  Group, 
  Stack,
  Box,
  ScrollArea
} from '@mantine/core';
import { Dropzone, MS_EXCEL_MIME_TYPE } from '@mantine/dropzone';
import { 
  IconUpload, 
  IconFileSpreadsheet, 
  IconCircleCheck, 
  IconInfoCircle, 
  IconEdit, 
  IconTrash,
  IconX
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { HideLoading, ShowLoading } from '../redux/loaderSlice';
import { message } from '../utils/notifications';

const BulkUploadQuestions = ({ examId, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadStats, setUploadStats] = useState(null);
  const dispatch = useDispatch();
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [examData, setExamData] = useState(null);

  const form = useForm({
    initialValues: {
      name: '',
      correctOption: '',
      A: '',
      B: '',
      C: '',
      D: '',
      category: '',
      difficulty: '',
      tags: ''
    },
    validate: {
      name: (value) => (!value ? 'Question is required' : null),
      A: (value) => (!value ? 'Option A is required' : null),
      B: (value) => (!value ? 'Option B is required' : null),
      correctOption: (value) => (!value ? 'Correct option is required' : null),
    }
  });

  useEffect(() => {
    getExamData();
  }, []);

  // Fetch exam data to validate question limits
  const getExamData = async () => {
    try {
      dispatch(ShowLoading());
      // Get authentication token from localStorage
      const token = localStorage.getItem("token");
      
      const response = await axios.post('/api/exams/get-exam-by-id', {
        examId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setExamData(response.data.data);
      } else {
        message.error("Failed to fetch exam data for validation");
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      console.error("Error fetching exam data:", error);
    }
  };
  
  // Check if the upload would exceed question limit
  const checkQuestionLimit = () => {
    if (!examData || !examData.totalMarks) return true;
    
    const currentQuestions = examData.questions?.length || 0;
    const maxQuestions = examData.totalMarks;
    const remainingSlots = maxQuestions - currentQuestions;
    
    if (parsedData.length > remainingSlots) {
      modals.open({
        title: 'Question Limit Exceeded',
        children: (
          <Stack>
            <Text>This upload contains <Text span fw={700}>{parsedData.length}</Text> questions, but you can only add <Text span fw={700}>{remainingSlots}</Text> more questions to this exam.</Text>
            <Text>The exam is configured for a maximum of <Text span fw={700}>{maxQuestions}</Text> questions and currently has <Text span fw={700}>{currentQuestions}</Text> questions.</Text>
            <Text>Please reduce the number of questions in your file or delete some existing questions from the exam.</Text>
            <Group justify="flex-end" mt="md">
              <Button onClick={() => modals.closeAll()}>OK</Button>
            </Group>
          </Stack>
        )
      });
      return false;
    }
    
    return true;
  };

  const handleFileUpload = (files) => {
    if (!files || files.length === 0) {
      message.error('No file selected. Please choose a file to upload.');
      return;
    }
    
    const fileObj = files[0];
    setFile(fileObj);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        // Determine file type from extension
        const isCSV = fileObj.name.toLowerCase().endsWith('.csv');
        
        // Parse the file based on its type
        let parsedFileData;
        if (isCSV) {
          // For CSV files, use a different parsing approach
          const workbook = XLSX.read(data, { type: 'string' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          parsedFileData = XLSX.utils.sheet_to_json(worksheet);
        } else {
          // For Excel files
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          parsedFileData = XLSX.utils.sheet_to_json(worksheet);
        }
        
        console.log('Parsed data from file:', parsedFileData);
        
        if (!parsedFileData || parsedFileData.length === 0) {
          message.error('The file appears to be empty. Please check your file and try again.');
          return;
        }
        
        // Validate file structure
        const firstRow = parsedFileData[0];
        const requiredFields = ['question', 'optionA', 'optionB', 'correctOption'];
        const missingFields = requiredFields.filter(field => !Object.keys(firstRow).includes(field));
        
        if (missingFields.length > 0) {
          message.error(`Your file is missing required columns: ${missingFields.join(', ')}. Please download the template and ensure your file matches the required format.`);
          return;
        }
        
        // Standardize and validate data
        let invalidRows = 0;
        const formattedData = parsedFileData.map((item, index) => {
          // Check if the required fields exist
          if (!item.question || !item.correctOption || 
              !item.optionA || !item.optionB) {
            message.warning(`Row ${index + 1} is missing required fields and will be skipped.`);
            invalidRows++;
            return null;
          }
          
          // Validate correctOption
          if (!['A', 'B', 'C', 'D'].includes(item.correctOption)) {
            message.warning(`Row ${index + 1} has an invalid correct option "${item.correctOption}". Only A, B, C, or D are allowed. This row will be skipped.`);
            invalidRows++;
            return null;
          }
          
          // Format options into the expected structure
          const options = {};
          if (item.optionA) options.A = item.optionA;
          if (item.optionB) options.B = item.optionB;
          if (item.optionC) options.C = item.optionC;
          if (item.optionD) options.D = item.optionD;
          
          return {
            name: item.question,
            correctOption: item.correctOption,
            options,
            tags: item.tags ? item.tags.split(',').map(tag => tag.trim()) : [],
            category: item.category || 'General',
            difficulty: ['Easy', 'Medium', 'Hard'].includes(item.difficulty) ? item.difficulty : 'Medium'
          };
        }).filter(Boolean); // Remove null entries
        
        if (formattedData.length === 0) {
          message.error('No valid questions found in the uploaded file. Please check your file format and data.');
          return;
        }
        
        if (invalidRows > 0) {
          message.warning(`${invalidRows} invalid row(s) will be skipped during upload.`);
        }
        
        setParsedData(formattedData);
        setCurrentStep(1);
        message.success(`File processed successfully: ${formattedData.length} valid questions found and ready to upload.`);
      } catch (error) {
        console.error('Error parsing file:', error);
        message.error('Failed to parse the file. Please ensure it is a valid Excel/CSV file with the correct column headers.');
      }
    };
    
    reader.onerror = () => {
      message.error('Error reading file. The file may be corrupted or in an unsupported format.');
    };
    
    // Use different reader method based on file type
    if (fileObj.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(fileObj);
    } else {
      reader.readAsBinaryString(fileObj);
    }
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) {
      message.error('No questions to upload.');
      return;
    }
    
    // Check question limit before proceeding with upload
    if (!checkQuestionLimit()) {
      return;
    }
    
    try {
      dispatch(ShowLoading());
      
      // Get authentication token from localStorage
      const token = localStorage.getItem("token");
      
      const response = await axios.post('/api/exams/bulk-upload-questions', {
        examId,
        questions: parsedData
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setUploadStats(response.data.data);
        setCurrentStep(2);
        message.success(response.data.message);
        if (onSuccess) onSuccess();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('Failed to upload questions. Please try again.');
      console.error('Upload error:', error);
    } finally {
      dispatch(HideLoading());
    }
  };

  const downloadTemplate = () => {
    // Create a template worksheet
    const template = [
      {
        question: 'Sample question text?',
        optionA: 'First option',
        optionB: 'Second option',
        optionC: 'Third option',
        optionD: 'Fourth option',
        correctOption: 'A',
        category: 'General Knowledge',
        difficulty: 'Medium',
        tags: 'sample,template,example'
      },
      {
        question: 'Another sample question?',
        optionA: 'Option A',
        optionB: 'Option B',
        optionC: 'Option C',
        optionD: 'Option D',
        correctOption: 'B',
        category: 'Science',
        difficulty: 'Easy',
        tags: 'science,basic'
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    // Generate and download the file
    XLSX.writeFile(wb, 'question_upload_template.xlsx');
  };

  // Function to open the edit modal for a question
  const handleEditQuestion = (question, index) => {
    setEditingQuestion(question);
    setQuestionIndex(index);
    
    // Set form values
    form.setValues({
      name: question.name,
      correctOption: question.correctOption,
      A: question.options.A,
      B: question.options.B,
      C: question.options.C || '',
      D: question.options.D || '',
      category: question.category,
      difficulty: question.difficulty,
      tags: question.tags.join(',')
    });
    
    setIsEditModalVisible(true);
  };
  
  // Function to save edited question
  const handleSaveQuestion = () => {
    const validation = form.validate();
    if (validation.hasErrors) return;

    const values = form.values;
    
    // Create options object
    const options = {};
    if (values.A) options.A = values.A;
    if (values.B) options.B = values.B;
    if (values.C) options.C = values.C;
    if (values.D) options.D = values.D;
    
    // Create updated question
    const updatedQuestion = {
      name: values.name,
      correctOption: values.correctOption,
      options: options,
      category: values.category || 'General',
      difficulty: values.difficulty || 'Medium',
      tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : []
    };
    
    // Update the question in the parsedData
    const updatedParsedData = [...parsedData];
    updatedParsedData[questionIndex] = updatedQuestion;
    setParsedData(updatedParsedData);
    
    // Close modal and show success message
    setIsEditModalVisible(false);
    message.success('Question updated successfully');
  };
  
  // Function to delete a question from the list
  const handleDeleteQuestion = (index) => {
    modals.openConfirmModal({
      title: 'Delete Question',
      children: <Text>Are you sure you want to delete this question?</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        const updatedParsedData = [...parsedData];
        updatedParsedData.splice(index, 1);
        setParsedData(updatedParsedData);
        message.success('Question removed from upload list');
      }
    });
  };

  const renderStep0 = () => (
    <div>
      <Alert
        icon={<IconInfoCircle size={16} />}
        title="File Requirements"
        color="blue"
        mb="md"
      >
        <Stack gap="xs">
          <Text size="sm">Your Excel/CSV file should have the following columns:</Text>
          <ul className="requirement-list">
            <li><Text size="sm"><strong>question</strong> - The text of the question</Text></li>
            <li><Text size="sm"><strong>optionA, optionB, optionC, optionD</strong> - The answer options</Text></li>
            <li><Text size="sm"><strong>correctOption</strong> - The letter of the correct option (A, B, C, D)</Text></li>
            <li><Text size="sm"><strong>category</strong> (optional) - Category of the question</Text></li>
            <li><Text size="sm"><strong>difficulty</strong> (optional) - Difficulty level (Easy, Medium, Hard)</Text></li>
            <li><Text size="sm"><strong>tags</strong> (optional) - Comma-separated tags</Text></li>
          </ul>
        </Stack>
      </Alert>
      
      <Button 
        leftSection={<IconFileSpreadsheet size={16} />}
        onClick={downloadTemplate}
        variant="outline"
        mb="md"
      >
        Download Template
      </Button>
      
      <Dropzone
        onDrop={handleFileUpload}
        onReject={(files) => message.error('File rejected. Please use .xlsx, .xls, or .csv files.')}
        maxSize={5 * 1024 ** 2}
        accept={[...MS_EXCEL_MIME_TYPE, 'text/csv', '.csv', '.xlsx', '.xls']}
        maxFiles={1}
      >
        <Group justify="center" gap="xl" mih={120} className="dropzone-content">
          <Dropzone.Accept>
            <IconUpload size={52} stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={52} stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconFileSpreadsheet size={52} stroke={1.5} />
          </Dropzone.Idle>
          <div>
            <Text size="xl" inline>
              Drag file here or click to select
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Support for a single Excel file (.xlsx, .xls) or CSV file (.csv)
            </Text>
          </div>
        </Group>
      </Dropzone>
      
      {file && (
        <Text size="sm" mt="sm" c="dimmed">
          Selected file: {file.name}
        </Text>
      )}
      
      <Group justify="flex-end" mt="xl">
        <Button 
          disabled={!parsedData || parsedData.length === 0} 
          onClick={() => setCurrentStep(1)}
        >
          Next
        </Button>
      </Group>
    </div>
  );

  const renderStep1 = () => (
    <div>
      <Alert
        icon={<IconCircleCheck size={16} />}
        title="Ready to Upload"
        color="green"
        mb="md"
      >
        {parsedData.length} questions will be added to the exam. You can scroll through all questions below.
      </Alert>
      
      <ScrollArea h={500} mb="md" className="preview-scroll-area">
        <Title order={4} mb="md">Question Preview ({parsedData.length} questions):</Title>
        <Stack gap="sm">
          {parsedData.map((question, index) => (
            <Card 
              key={index} 
              withBorder
              padding="sm"
            >
              <Title order={5} mb="xs">Question {index + 1}</Title>
              <Text><strong>Question:</strong> {question.name}</Text>
              <Text mt="xs"><strong>Options:</strong></Text>
              <ul className="options-list">
                {Object.entries(question.options).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value} 
                    {question.correctOption === key && (
                      <Badge color="green" size="sm" ml="xs">Correct</Badge>
                    )}
                  </li>
                ))}
              </ul>
              <Group gap="md" mt="xs">
                <Text size="sm"><strong>Category:</strong> {question.category}</Text>
                <Text size="sm"><strong>Difficulty:</strong> {question.difficulty}</Text>
              </Group>
              {question.tags && question.tags.length > 0 && (
                <Group gap="xs" mt="xs">
                  <Text size="sm"><strong>Tags:</strong></Text>
                  {question.tags.map(tag => (
                    <Badge key={tag} variant="light" size="sm">{tag}</Badge>
                  ))}
                </Group>
              )}
              <Group mt="md" gap="xs">
                <Button 
                  size="xs"
                  variant="outline"
                  leftSection={<IconEdit size={14} />}
                  onClick={() => handleEditQuestion(question, index)}
                >
                  Edit
                </Button>
                <Button 
                  size="xs"
                  color="red"
                  variant="outline"
                  leftSection={<IconTrash size={14} />}
                  onClick={() => handleDeleteQuestion(index)}
                >
                  Delete
                </Button>
              </Group>
            </Card>
          ))}
        </Stack>
      </ScrollArea>
      
      <Group justify="space-between" mt="xl">
        <Button variant="default" onClick={() => setCurrentStep(0)}>Back</Button>
        <Button onClick={handleUpload}>
          Upload {parsedData.length} Questions
        </Button>
      </Group>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <Alert
        icon={<IconCircleCheck size={16} />}
        title="Upload Successful"
        color="green"
        mb="xl"
      >
        {uploadStats?.insertedQuestions || 0} questions were successfully added to the exam.
      </Alert>
      
      <Card withBorder>
        <Title order={5} mb="md">Upload Statistics</Title>
        <Stack gap="xs">
          <Text><strong>Total Questions in File:</strong> {uploadStats?.totalQuestions || 0}</Text>
          <Text><strong>Valid Questions:</strong> {uploadStats?.validQuestions || 0}</Text>
          <Text><strong>Successfully Inserted:</strong> {uploadStats?.insertedQuestions || 0}</Text>
        </Stack>
      </Card>
      
      <Group justify="center" mt="xl">
        <Button onClick={() => {
          setParsedData([]);
          setFile(null);
          setCurrentStep(0);
        }}>
          Upload More Questions
        </Button>
      </Group>
    </div>
  );

  const stepContent = [renderStep0, renderStep1, renderStep2];

  return (
    <div>
      <Title order={3}>Bulk Upload Questions</Title>
      <Text c="dimmed" mb="md">
        Easily add multiple questions to your exam using an Excel or CSV file.
      </Text>
      
      <Divider my="md" />
      
      <Stepper active={currentStep} mb="xl">
        <Stepper.Step label="Upload File" />
        <Stepper.Step label="Preview & Confirm" />
        <Stepper.Step label="Complete" />
      </Stepper>
      
      <Box mt="xl">
        {stepContent[currentStep]()}
      </Box>

      <Modal
        title="Edit Question"
        opened={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        size="lg"
      >
        <Stack gap="md">
          <TextInput 
            label="Question" 
            required
            {...form.getInputProps('name')}
          />
          <TextInput 
            label="Option A" 
            required
            {...form.getInputProps('A')}
          />
          <TextInput 
            label="Option B" 
            required
            {...form.getInputProps('B')}
          />
          <TextInput 
            label="Option C"
            {...form.getInputProps('C')}
          />
          <TextInput 
            label="Option D"
            {...form.getInputProps('D')}
          />
          <Select 
            label="Correct Option" 
            required
            data={[
              { value: 'A', label: 'A' },
              { value: 'B', label: 'B' },
              { value: 'C', label: 'C' },
              { value: 'D', label: 'D' },
            ]}
            {...form.getInputProps('correctOption')}
          />
          <TextInput 
            label="Category"
            {...form.getInputProps('category')}
          />
          <Select 
            label="Difficulty"
            data={[
              { value: 'Easy', label: 'Easy' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Hard', label: 'Hard' },
            ]}
            {...form.getInputProps('difficulty')}
          />
          <TextInput 
            label="Tags (comma-separated)"
            {...form.getInputProps('tags')}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setIsEditModalVisible(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion}>
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default BulkUploadQuestions;