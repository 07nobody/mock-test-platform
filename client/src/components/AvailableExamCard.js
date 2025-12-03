import React from "react";
import { 
  Card, 
  Button, 
  Badge, 
  Tooltip, 
  Progress, 
  Group, 
  Text, 
  Box,
  SimpleGrid,
  ThemeIcon,
  Divider,
  Stack
} from "@mantine/core";
import { 
  IconClock, 
  IconQuestionMark, 
  IconCircleCheck,
  IconCurrencyDollar,
  IconTrophy,
  IconUserPlus,
  IconSend
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { resendExamCode } from "../apicalls/exams";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../redux/loaderSlice";
import { message } from "../utils/notifications";

function AvailableExamCard({ exam, registrationStatus, onRegisterClick, registrationLoading }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isRegistered = registrationStatus?.isRegistered;
  const isPaid = exam.isPaid;
  const paymentComplete = !isPaid || (registrationStatus?.paymentStatus === "completed");

  const getDifficulty = (passingMarks, totalMarks) => {
    const ratio = passingMarks / totalMarks;
    if (ratio >= 0.9) return { color: "red", level: "Hard", percent: 90 };
    if (ratio >= 0.75) return { color: "orange", level: "Medium", percent: 75 };
    return { color: "green", level: "Easy", percent: 50 };
  };
  
  const difficulty = getDifficulty(exam.passingMarks, exam.totalMarks);

  const handleResendCode = async () => {
    try {
      dispatch(ShowLoading());
      const response = await resendExamCode({ examId: exam._id });
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

  const renderActionButtons = () => {
    if (isRegistered && paymentComplete) {
      return (
        <Stack gap="xs">
          <Badge color="green" variant="dot" size="sm">Registered</Badge>
          <Group gap="xs">
            <Button 
              size="xs"
              leftSection={<IconTrophy size={14} />}
              onClick={() => navigate(`/user/write-exam/${exam._id}`)}
            >
              Start Exam
            </Button>
            <Tooltip label="Resend exam code to email">
              <Button 
                size="xs"
                variant="light"
                onClick={handleResendCode}
              >
                <IconSend size={14} />
              </Button>
            </Tooltip>
          </Group>
        </Stack>
      );
    }
    
    if (isRegistered && !paymentComplete) {
      return (
        <Stack gap="xs">
          <Badge color="orange" variant="dot" size="sm">Payment Required</Badge>
          <Button
            size="xs"
            color="orange"
            leftSection={<IconCurrencyDollar size={14} />}
            onClick={() => navigate(`/payment-portal/${exam._id}`)}
          >
            Pay ₹{exam.price || 99}
          </Button>
        </Stack>
      );
    }
    
    return (
      <Button
        size="xs"
        color="green"
        leftSection={<IconUserPlus size={14} />}
        onClick={() => onRegisterClick(exam)}
        loading={registrationLoading}
        fullWidth
      >
        Register for Exam
      </Button>
    );
  };

  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between" mb="xs">
        <Badge color={difficulty.color} variant="light">{difficulty.level}</Badge>
        {isPaid && (
          <Badge color="yellow" variant="light" leftSection={<IconCurrencyDollar size={12} />}>
            ₹{exam.price}
          </Badge>
        )}
      </Group>

      <Text fw={600} size="lg" mb="xs" lineClamp={2}>{exam.name}</Text>
      
      <Badge variant="outline" size="sm" mb="md">{exam.category}</Badge>

      <SimpleGrid cols={3} spacing="xs" mb="md">
        <Tooltip label="Exam Duration">
          <Box ta="center">
            <ThemeIcon variant="light" size="md" mb={4}>
              <IconClock size={14} />
            </ThemeIcon>
            <Text size="xs" c="dimmed">Duration</Text>
            <Text size="sm" fw={500}>{Math.floor(exam.duration / 60)} min</Text>
          </Box>
        </Tooltip>
        <Tooltip label="Total Questions">
          <Box ta="center">
            <ThemeIcon variant="light" size="md" mb={4}>
              <IconQuestionMark size={14} />
            </ThemeIcon>
            <Text size="xs" c="dimmed">Questions</Text>
            <Text size="sm" fw={500}>{exam.questions?.length || 0}</Text>
          </Box>
        </Tooltip>
        <Tooltip label="Passing Score">
          <Box ta="center">
            <ThemeIcon variant="light" size="md" mb={4}>
              <IconCircleCheck size={14} />
            </ThemeIcon>
            <Text size="xs" c="dimmed">Pass</Text>
            <Text size="sm" fw={500}>{exam.passingMarks}/{exam.totalMarks}</Text>
          </Box>
        </Tooltip>
      </SimpleGrid>

      <Box mb="md">
        <Group justify="space-between" mb={4}>
          <Text size="xs" c="dimmed">Difficulty Level</Text>
          <Text size="xs" c={difficulty.color}>{difficulty.level}</Text>
        </Group>
        <Progress value={difficulty.percent} color={difficulty.color} size="xs" radius="xl" />
      </Box>

      <Divider mb="md" />

      {renderActionButtons()}
    </Card>
  );
}

export default AvailableExamCard;
