import React, { useMemo, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Badge, 
  Menu, 
  Switch, 
  Tooltip, 
  Group, 
  Text,
  Stack,
  Box,
  Divider
} from '@mantine/core';
import { 
  IconEdit, 
  IconTrash, 
  IconDots,
  IconFileText,
  IconClock, 
  IconCircleCheck,
  IconRefresh,
  IconUsers
} from '@tabler/icons-react';

/**
 * Card component for displaying an exam in the admin section
 */
function ExamCard({ exam, onDelete, onEdit, onQuestions, onRegenerateToken, onToggleStatus }) {
  const handleEdit = useCallback(() => onEdit(exam), [exam, onEdit]);
  const handleQuestions = useCallback(() => onQuestions(exam), [exam, onQuestions]);
  const handleDelete = useCallback(() => onDelete(exam._id), [exam._id, onDelete]);
  const handleRegenerateToken = useCallback(() => onRegenerateToken(exam), [exam, onRegenerateToken]);
  const handleToggleStatus = useCallback(() => onToggleStatus(exam), [exam, onToggleStatus]);
  
  const isStatusToggleDisabled = useMemo(() => 
    !exam.questions || exam.questions.length === 0 || exam.questions.length !== exam.totalMarks,
    [exam.questions, exam.totalMarks]
  );
  
  const durationString = useMemo(() => `${Math.floor(exam.duration / 60)} mins`, [exam.duration]);
  
  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between" mb="md">
        <Box>
          <Text fw={600} size="lg" lineClamp={1}>{exam.name}</Text>
          <Badge variant="outline" size="sm" mt={4}>{exam.category}</Badge>
        </Box>
        <Group gap="xs">
          <Badge color={exam.status === "active" ? "green" : "red"} variant="light">
            {exam.status === "active" ? "ACTIVE" : "INACTIVE"}
          </Badge>
          <Tooltip 
            label={
              isStatusToggleDisabled ? 
              "Add required questions to enable activation" : 
              exam.status === "active" ? "Deactivate exam" : "Activate exam"
            }
          >
            <Switch
              checked={exam.status === "active"}
              onChange={handleToggleStatus}
              disabled={isStatusToggleDisabled}
              size="sm"
            />
          </Tooltip>
        </Group>
      </Group>

      <Stack gap="xs">
        <Group gap="lg">
          <Group gap={4}>
            <IconClock size={14} color="gray" />
            <Text size="sm" c="dimmed">Duration:</Text>
            <Text size="sm" fw={500}>{durationString}</Text>
          </Group>
          <Group gap={4}>
            <IconCircleCheck size={14} color="green" />
            <Text size="sm" c="dimmed">Pass:</Text>
            <Text size="sm" fw={500}>{exam.passingMarks}/{exam.totalMarks}</Text>
          </Group>
        </Group>

        <Group gap="lg">
          <Group gap={4}>
            <IconFileText size={14} color="gray" />
            <Text size="sm" c="dimmed">Questions:</Text>
            <Text size="sm" fw={500}>{exam.questions?.length || 0}</Text>
          </Group>
          {exam.registeredUsers?.length > 0 && (
            <Group gap={4}>
              <IconUsers size={14} color="gray" />
              <Text size="sm" c="dimmed">Registered:</Text>
              <Badge size="sm" color="green">{exam.registeredUsers.length}</Badge>
            </Group>
          )}
        </Group>

        <Badge color="blue" variant="light" tt="uppercase" size="sm">
          Code: {exam.examCode}
        </Badge>
      </Stack>

      <Divider my="md" />

      <Group justify="space-between">
        <Group gap="xs" visibleFrom="sm">
          <Button size="xs" leftSection={<IconEdit size={14} />} onClick={handleEdit}>
            Edit
          </Button>
          <Button size="xs" variant="light" leftSection={<IconFileText size={14} />} onClick={handleQuestions}>
            Questions
          </Button>
          <Button size="xs" variant="subtle" color="red" leftSection={<IconTrash size={14} />} onClick={handleDelete}>
            Delete
          </Button>
        </Group>

        <Menu shadow="md" width={200} hiddenFrom="sm">
          <Menu.Target>
            <Button variant="default" leftSection={<IconDots size={14} />}>Actions</Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconEdit size={14} />} onClick={handleEdit}>Edit Exam</Menu.Item>
            <Menu.Item leftSection={<IconFileText size={14} />} onClick={handleQuestions}>Manage Questions</Menu.Item>
            <Menu.Item leftSection={<IconRefresh size={14} />} onClick={handleRegenerateToken}>Regenerate Token</Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={handleDelete}>Delete Exam</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Card>
  );
}

export default React.memo(ExamCard);
