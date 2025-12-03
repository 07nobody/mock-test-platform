import React, { useState, useEffect } from "react";
import { 
  Paper,
  Title,
  Text,
  Divider,
  Alert,
  Button,
  TextInput,
  Stack,
  Group,
  Badge,
  Box,
  Table
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { 
  IconUser,
  IconLock,
  IconShieldCheck,
  IconMail,
  IconAlertTriangle,
  IconLogin
} from "@tabler/icons-react";
import LottiePlayer from "../../../components/LottiePlayer";
import { checkExamRegistration } from "../../../apicalls/exams";
import { message } from "../../../utils/notifications";

function AuthVerification({ user, examData, setView }) {
  const [loading, setLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [codeFromEmail, setCodeFromEmail] = useState(false);

  const form = useForm({
    initialValues: {
      examCode: '',
    },
    validate: {
      examCode: (value) => (!value ? 'Please enter the exam code from your email' : null),
    },
  });

  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const response = await checkExamRegistration({
          examId: examData._id,
          userId: user._id
        });

        if (response.success && response.data.isRegistered) {
          setRegistrationStatus(response.data);
          if (response.data.examCode) {
            message.info("You can use the exam code sent to your email to access this exam.");
            setCodeFromEmail(true);
          }
        }
      } catch (error) {
        console.error("Error checking registration:", error);
      }
    };

    if (user && examData) {
      checkRegistration();
    }
  }, [user, examData]);

  const handleSubmit = (values) => {
    setLoading(true);
    
    if (values.examCode === examData.examCode) {
      message.success("Authentication successful! Proceeding to instructions.");
      
      setTimeout(() => {
        setView("instructions");
      }, 1000);
    } else {
      message.error("Incorrect exam code. Please check and try again.");
      setLoading(false);
    }
  };

  return (
    <Box className="auth-verification-container">
      <Paper shadow="xl" radius="lg" className="auth-card">
        <div className="auth-header">
          <Title order={2} c="white" fw={600}>
            Exam Authentication
          </Title>
          <Text c="white" opacity={0.85} size="lg" mt="xs">
            {examData.name}
          </Text>
        </div>
        
        <Box p="xl">
          <Stack gap="lg">
            <Box ta="center">
              <LottiePlayer
                src="https://assets5.lottiefiles.com/packages/lf20_q5qvqtnr.json"
                background="transparent"
                speed={1}
                loop={true}
                autoplay={true}
                className="auth-animation"
              />
            </Box>
            
            <Box>
              <Text size="md" ta="center" c="dimmed" mb="md">
                Please verify your identity before proceeding to the examination.
              </Text>
              
              {codeFromEmail && (
                <Alert
                  icon={<IconMail size={16} />}
                  color="blue"
                  mb="md"
                  radius="md"
                >
                  <Group gap="xs">
                    <span>Check your email for the exam access code sent when you registered.</span>
                  </Group>
                </Alert>
              )}
            </Box>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <Paper withBorder p="md" radius="md" className="user-info-card">
                  <Text fw={600} size="md" mb="sm">User Information</Text>
                  <Table withRowBorders={false}>
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td fw={500} w={120}>
                          <Group gap="xs">
                            <IconUser size={16} />
                            <span>Name</span>
                          </Group>
                        </Table.Td>
                        <Table.Td>{user?.name}</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td fw={500}>
                          <Group gap="xs">
                            <IconMail size={16} />
                            <span>Email</span>
                          </Group>
                        </Table.Td>
                        <Table.Td>{user?.email}</Table.Td>
                      </Table.Tr>
                      {examData.isPaid && (
                        <Table.Tr>
                          <Table.Td fw={500}>
                            <Group gap="xs">
                              <IconLock size={16} />
                              <span>Payment</span>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            {registrationStatus?.paymentStatus === "completed" ? (
                              <Badge color="green">Completed</Badge>
                            ) : (
                              <Badge color="yellow">Pending</Badge>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      )}
                    </Table.Tbody>
                  </Table>
                </Paper>
                
                {(!examData.isPaid || (registrationStatus?.paymentStatus === "completed")) && (
                  <>
                    <TextInput
                      label={<Text fw={600}>Exam Access Code</Text>}
                      placeholder="Enter exam code sent to your email"
                      size="lg"
                      leftSection={<IconShieldCheck size={18} />}
                      radius="md"
                      {...form.getInputProps('examCode')}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      loading={loading}
                      fullWidth
                      leftSection={<IconLogin size={18} />}
                      radius="md"
                      mt="sm"
                    >
                      {loading ? 'Verifying...' : 'Start Exam'}
                    </Button>
                  </>
                )}
                
                {examData.isPaid && registrationStatus?.paymentStatus !== "completed" && (
                  <Alert
                    title="Payment Required"
                    color="yellow"
                    icon={<IconAlertTriangle size={18} />}
                    radius="md"
                  >
                    <Text mb="md">You need to complete payment before you can take this exam.</Text>
                    <Button 
                      color="red"
                      size="lg"
                      onClick={() => window.history.back()}
                      radius="md"
                      fullWidth
                    >
                      Go Back & Complete Payment
                    </Button>
                  </Alert>
                )}
              </Stack>
            </form>
            
            <Divider my="lg" />
            
            <Text c="dimmed" ta="center" size="sm">
              Having trouble? Contact support at <a href="mailto:support@quizapp.com">support@quizapp.com</a>
            </Text>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default AuthVerification;