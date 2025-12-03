import React, { useState } from "react";
import { 
  Paper,
  Title,
  Text,
  Checkbox,
  Divider,
  Button,
  Alert,
  Badge,
  Group,
  Stack,
  Box,
  Stepper,
  Accordion,
  Tooltip,
  Grid
} from "@mantine/core";
import { 
  IconClock,
  IconFileText,
  IconAlertTriangle,
  IconArrowRight,
  IconCircleCheck,
  IconQuestionMark,
  IconBook,
  IconShieldCheck,
  IconChevronLeft,
  IconBolt,
  IconAlertCircle,
  IconInfoCircle,
  IconSettings
} from "@tabler/icons-react";
import { message } from "../../../utils/notifications";

function Instructions({ examData, setView, startTimer }) {
  const [agreed, setAgreed] = useState(false);

  const handleStartExam = () => {
    if (agreed) {
      startTimer();
      setView("questions");
    } else {
      message.error("You must agree to the instructions before starting the exam.");
    }
  };

  const StatItem = ({ icon, title, value, color }) => (
    <Box>
      <Group gap="xs" mb={4}>
        {icon}
        <Text size="sm" c="dimmed">{title}</Text>
      </Group>
      <Text fw={600} size="xl" c={color}>{value}</Text>
    </Box>
  );

  const TimelineItem = ({ children, color = "gray", icon = null }) => (
    <Group gap="md" align="flex-start" mb="sm">
      <Box className={`timeline-dot timeline-${color}`}>
        {icon || <Box className="timeline-inner-dot" />}
      </Box>
      <Text size="sm" className="timeline-content">{children}</Text>
    </Group>
  );

  return (
    <Box className="instructions-container">
      <Paper shadow="lg" radius="lg" className="instructions-card">
        <div className="instructions-header">
          <Title order={2} c="white" fw={600} mb="xs">
            Exam Instructions
          </Title>
          <Text c="white" opacity={0.85} size="lg" mt="xs">
            {examData.name}
          </Text>
        </div>

        <Box p="xl" pb="md">
          <Stepper 
            active={agreed ? 1 : 0} 
            className="instructions-stepper"
            mb="xl"
          >
            <Stepper.Step 
              label="Read Instructions" 
              icon={<IconFileText size={18} />}
              completedIcon={<IconCircleCheck size={18} />}
            />
            <Stepper.Step 
              label="Accept Rules" 
              icon={agreed ? <IconCircleCheck size={18} /> : <IconSettings size={18} />}
              completedIcon={<IconCircleCheck size={18} />}
            />
            <Stepper.Step 
              label="Begin Exam" 
              icon={<IconBolt size={18} />}
            />
          </Stepper>
        </Box>
        
        <Box px="xl" pb="xl" className="instructions-content">
          <Stack gap="lg">
            <Paper withBorder p="lg" radius="md" className="exam-details-card">
              <Group gap="xs" mb="md">
                <IconFileText size={18} />
                <Text fw={600}>Exam Details</Text>
              </Group>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatItem 
                    icon={<IconClock size={16} color="var(--mantine-color-blue-6)" />}
                    title="Duration"
                    value={`${Math.floor(examData.duration / 60)} minutes`}
                    color="blue"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatItem 
                    icon={<IconQuestionMark size={16} color="var(--mantine-color-cyan-6)" />}
                    title="Total Questions"
                    value={examData.totalMarks}
                    color="cyan"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatItem 
                    icon={<IconCircleCheck size={16} color="var(--mantine-color-green-6)" />}
                    title="Passing Marks"
                    value={examData.passingMarks}
                    color="green"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <StatItem 
                    icon={<IconBook size={16} color="var(--mantine-color-yellow-6)" />}
                    title="Category"
                    value={examData.category}
                    color="yellow.7"
                  />
                </Grid.Col>
              </Grid>
            </Paper>

            <Accordion
              defaultValue={['important', 'navigation']}
              multiple
              radius="md"
              variant="separated"
              className="instructions-accordion"
            >
              <Accordion.Item value="important">
                <Accordion.Control icon={<IconAlertCircle size={18} />}>
                  <Text fw={500}>Important Instructions</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="xs">
                    <TimelineItem>This exam consists of multiple-choice questions (MCQs).</TimelineItem>
                    <TimelineItem>All questions carry equal marks.</TimelineItem>
                    <TimelineItem>There is no negative marking in this examination.</TimelineItem>
                    <TimelineItem color="blue" icon={<IconInfoCircle size={14} />}>
                      <strong>Timer:</strong> A countdown timer in the top-right corner will display the remaining time.
                    </TimelineItem>
                    <TimelineItem color="red" icon={<IconAlertTriangle size={14} />}>
                      <strong>Do not refresh</strong> the page during the examination as it may result in termination of your exam.
                    </TimelineItem>
                    <TimelineItem>You can review and change your answers before final submission.</TimelineItem>
                    <TimelineItem>The exam will be automatically submitted when the timer expires.</TimelineItem>
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="navigation">
                <Accordion.Control icon={<IconQuestionMark size={18} />}>
                  <Text fw={500}>Question Navigation</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="xs">
                    <TimelineItem color="green" icon={<IconCircleCheck size={14} />}>
                      <strong>Save & Next:</strong> Saves your answer and moves to the next question.
                    </TimelineItem>
                    <TimelineItem color="orange" icon={<IconAlertCircle size={14} />}>
                      <strong>Mark for Review:</strong> Allows you to flag questions to review later.
                    </TimelineItem>
                    <TimelineItem>
                      <Stack gap="xs">
                        <span><strong>Question Panel:</strong> Use the numbered buttons on the left to navigate between questions.</span>
                        <Group gap="xs" wrap="wrap">
                          <Badge color="gray" variant="light">Not Visited</Badge>
                          <Badge color="blue" variant="light">Current</Badge>
                          <Badge color="green" variant="light">Answered</Badge>
                          <Badge color="yellow" variant="light">Marked for Review</Badge>
                          <Badge color="red" variant="light">Not Answered</Badge>
                        </Group>
                      </Stack>
                    </TimelineItem>
                    <TimelineItem>Different colors indicate the status of questions (Answered, Not Answered, Marked for Review).</TimelineItem>
                    <TimelineItem>You can change your answers at any time before submitting the exam.</TimelineItem>
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="submission">
                <Accordion.Control icon={<IconArrowRight size={18} />}>
                  <Text fw={500}>Submission Guidelines</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="xs">
                    <TimelineItem>Click on the "Submit" button to end the exam once you've answered all questions.</TimelineItem>
                    <TimelineItem>After submission, your answers will be evaluated and results displayed immediately.</TimelineItem>
                    <TimelineItem>You can review your answers and see explanations after submission.</TimelineItem>
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>

            <Alert
              color="yellow"
              icon={<IconShieldCheck size={18} />}
              radius="md"
            >
              <Checkbox 
                checked={agreed} 
                onChange={(e) => setAgreed(e.currentTarget.checked)}
                label={
                  <Text size="sm">
                    <strong>Declaration:</strong> I have read and understood the instructions. I agree not to use any unfair means during the exam and understand that violation of any instructions may result in cancellation of my results.
                  </Text>
                }
              />
            </Alert>
          </Stack>
        </Box>
        
        <Box px="xl" py="md" className="instructions-footer">
          <Tooltip label="Timer starts when you click Begin Exam">
            <Group gap="xs">
              <IconClock size={18} color="var(--mantine-color-blue-6)" />
              <Text size="sm">
                Exam Duration: <Text span fw={600} c="blue">{Math.floor(examData.duration / 60)} minutes</Text>
              </Text>
            </Group>
          </Tooltip>
          
          <Group gap="sm">
            <Button 
              variant="default"
              leftSection={<IconChevronLeft size={16} />}
              onClick={() => setView("auth")}
            >
              Back
            </Button>
            <Button 
              leftSection={<IconBolt size={16} />}
              onClick={handleStartExam}
              disabled={!agreed}
              size="md"
            >
              Begin Exam
            </Button>
          </Group>
        </Box>
      </Paper>
    </Box>
  );
}

export default Instructions;
