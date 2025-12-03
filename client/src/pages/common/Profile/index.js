import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Container,
  Paper,
  Card,
  Group,
  Stack,
  Title,
  Text,
  Avatar,
  Tabs,
  Button,
  TextInput,
  PasswordInput,
  Modal,
  Loader,
  Badge,
  SimpleGrid,
  Center,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconUser,
  IconMail,
  IconEdit,
  IconShield,
  IconLock,
  IconDeviceFloppy,
  IconX,
  IconCircleCheck,
  IconCircleX,
} from "@tabler/icons-react";
import { message } from "../../../utils/notifications";
import PageTitle from "../../../components/PageTitle";
import { getUserInfo, updateUserProfile, changePassword, getUserStats } from "../../../apicalls/users";
import { SetUser } from "../../../redux/usersSlice";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import ResponsiveCard from "../../../components/ResponsiveCard";
import InfoItem from "../../../components/InfoItem";
import ActionButtons from "../../../components/ActionButtons";
import moment from "moment";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { user } = useSelector((state) => state.users);
  const [editing, setEditing] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
    },
    validate: {
      name: (value) => (!value ? "Please enter your name" : null),
      email: (value) => {
        if (!value) return "Please enter your email";
        if (!/^\S+@\S+$/.test(value)) return "Please enter a valid email";
        return null;
      },
    },
  });

  const passwordForm = useForm({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      currentPassword: (value) => (!value ? "Please enter your current password" : null),
      newPassword: (value) => {
        if (!value) return "Please enter your new password";
        if (value.length < 6) return "Password must be at least 6 characters";
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return "Please confirm your new password";
        if (value !== values.newPassword) return "The two passwords do not match";
        return null;
      },
    },
  });

  const refreshUserData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getUserInfo();
      dispatch(HideLoading());
      if (response.success) {
        dispatch(SetUser(response.data));
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await getUserStats();
      setLoading(false);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      setLoading(false);
      message.error(error.message);
    }
  };

  useEffect(() => {
    if (!user) {
      refreshUserData();
    } else if (editing) {
      form.setValues({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, editing]);

  useEffect(() => {
    if (activeTab === "activity") {
      fetchUserStats();
    }
  }, [activeTab]);

  useEffect(() => {
    if (passwordModalVisible) {
      passwordForm.reset();
    }
  }, [passwordModalVisible]);

  const handleUpdateProfile = async (values) => {
    try {
      dispatch(ShowLoading());
      const response = await updateUserProfile(values);
      dispatch(HideLoading());
      if (response.success) {
        message.success("Profile updated successfully");
        dispatch(SetUser(response.data));
        setEditing(false);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      dispatch(ShowLoading());
      const response = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      dispatch(HideLoading());

      if (response.success) {
        message.success("Password changed successfully");
        setPasswordModalVisible(false);
        passwordForm.reset();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return null;
  }

  return (
    <Container size="lg" px="xs">
      <PageTitle title="My Profile" />

      <Stack gap="lg">
        {/* Profile Header */}
        <Group gap="lg" align="center">
          <Avatar
            size={100}
            radius="xl"
            color="blue"
            className="profile-avatar"
          >
            <Text size="xl" fw={700} c="white">
              {getInitials(user?.name)}
            </Text>
          </Avatar>

          <Stack gap={4}>
            <Title order={2}>{user?.name}</Title>
            <Text c="dimmed">{user?.isAdmin ? "Administrator" : "Student"}</Text>
          </Stack>
        </Group>

        {/* Tabs */}
        <ResponsiveCard>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="profile">Profile Information</Tabs.Tab>
              <Tabs.Tab value="activity">Activity Summary</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="profile" pt="md">
              <Box p="sm">
                {editing ? (
                  <form onSubmit={form.onSubmit(handleUpdateProfile)} className="profile-form">
                    <Stack gap="md">
                      <TextInput
                        label="Name"
                        placeholder="Enter your name"
                        leftSection={<IconUser size={16} />}
                        {...form.getInputProps("name")}
                      />

                      <TextInput
                        label="Email"
                        placeholder="Enter your email"
                        leftSection={<IconMail size={16} />}
                        disabled
                        {...form.getInputProps("email")}
                      />

                      <ActionButtons>
                        <Button
                          variant="default"
                          leftSection={<IconX size={16} />}
                          onClick={() => setEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" leftSection={<IconDeviceFloppy size={16} />}>
                          Save Changes
                        </Button>
                      </ActionButtons>
                    </Stack>
                  </form>
                ) : (
                  <Stack gap="lg">
                    <Stack gap="md">
                      <InfoItem
                        icon={<IconUser size={18} />}
                        label="Name:"
                        value={user?.name || "Not set"}
                      />

                      <InfoItem icon={<IconMail size={18} />} label="Email:" value={user?.email} />

                      <InfoItem
                        icon={<IconShield size={18} />}
                        label="Role:"
                        value={user?.isAdmin ? "Administrator" : "Student"}
                      />
                    </Stack>

                    <ActionButtons>
                      <Button leftSection={<IconEdit size={16} />} onClick={() => setEditing(true)}>
                        Edit Profile
                      </Button>
                      <Button
                        variant="default"
                        leftSection={<IconLock size={16} />}
                        onClick={() => setPasswordModalVisible(true)}
                      >
                        Change Password
                      </Button>
                    </ActionButtons>
                  </Stack>
                )}
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="activity" pt="md">
              <Box p="sm">
                {loading ? (
                  <Center py="xl">
                    <Loader size="lg" />
                  </Center>
                ) : stats ? (
                  <Stack gap="xl">
                    {/* Stats Cards */}
                    <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="lg">
                      <Paper
                        p="lg"
                        radius="md"
                        shadow="sm"
                        ta="center"
                        className="stat-card stat-card-primary"
                      >
                        <Text size="2.5rem" fw={700} c="var(--primary)">
                          {stats.examsCompleted || 0}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Exams Taken
                        </Text>
                      </Paper>

                      <Paper
                        p="lg"
                        radius="md"
                        shadow="sm"
                        ta="center"
                        className="stat-card stat-card-success"
                      >
                        <Text size="2.5rem" fw={700} c="var(--success)">
                          {Math.round(stats.examsCompleted * (stats.passRate / 100)) || 0}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Exams Passed
                        </Text>
                      </Paper>

                      <Paper
                        p="lg"
                        radius="md"
                        shadow="sm"
                        ta="center"
                        className="stat-card stat-card-danger"
                      >
                        <Text size="2.5rem" fw={700} c="var(--secondary)">
                          {stats.averageScore || 0}%
                        </Text>
                        <Text size="sm" c="dimmed">
                          Avg. Score
                        </Text>
                      </Paper>

                      <Paper
                        p="lg"
                        radius="md"
                        shadow="sm"
                        ta="center"
                        className="stat-card stat-card-warning"
                      >
                        <Text size="2.5rem" fw={700} c="var(--warning)">
                          {stats.rank || "-"}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Global Rank
                        </Text>
                      </Paper>
                    </SimpleGrid>

                    {/* Recent Exams */}
                    {stats.recentEntries && stats.recentEntries.length > 0 && (
                      <Stack gap="md">
                        <Title order={4}>Recent Exam Activity</Title>
                        <Stack gap="sm">
                          {stats.recentEntries.map((entry) => (
                            <Paper key={entry._id} p="md" radius="md" withBorder>
                              <Group justify="space-between" wrap="nowrap">
                                <Group gap="md" wrap="nowrap">
                                  <Avatar
                                    size="md"
                                    radius="xl"
                                    color={entry.isPassed ? "green" : "red"}
                                  >
                                    {entry.isPassed ? (
                                      <IconCircleCheck size={20} />
                                    ) : (
                                      <IconCircleX size={20} />
                                    )}
                                  </Avatar>
                                  <Stack gap={2}>
                                    <Text fw={500}>{entry.examName}</Text>
                                    <Text size="sm" c="dimmed">
                                      Category: {entry.category || "General"} • Date:{" "}
                                      {moment(entry.date).format("MMM DD, YYYY")}
                                    </Text>
                                  </Stack>
                                </Group>
                                <Text fw={600}>
                                  Score:{" "}
                                  <Text
                                    component="span"
                                    c={entry.isPassed ? "var(--success)" : "var(--danger)"}
                                  >
                                    {entry.score}%
                                  </Text>
                                </Text>
                              </Group>
                            </Paper>
                          ))}
                        </Stack>
                      </Stack>
                    )}

                    {/* Category Performance */}
                    {stats.categoryPerformance && stats.categoryPerformance.length > 0 && (
                      <Stack gap="md">
                        <Title order={4}>Performance by Category</Title>
                        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                          {stats.categoryPerformance.map((cat, index) => (
                            <Card key={index} shadow="sm" padding="md" radius="md" withBorder>
                              <Card.Section withBorder inheritPadding py="xs">
                                <Text fw={500}>{cat.category}</Text>
                              </Card.Section>

                              <Group mt="md" gap="xl">
                                <Stack gap={2}>
                                  <Text size="sm" c="dimmed">
                                    Avg. Score
                                  </Text>
                                  <Text size="xl" fw={700} c="var(--primary)">
                                    {cat.averageScore}%
                                  </Text>
                                </Stack>
                                <Stack gap={2}>
                                  <Text size="sm" c="dimmed">
                                    Pass Rate
                                  </Text>
                                  <Text
                                    size="xl"
                                    fw={700}
                                    c={cat.passRate >= 70 ? "var(--success)" : "var(--warning)"}
                                  >
                                    {cat.passRate}%
                                  </Text>
                                </Stack>
                              </Group>

                              <Badge color="blue" mt="md">
                                {cat.examCount} exams taken
                              </Badge>
                            </Card>
                          ))}
                        </SimpleGrid>
                      </Stack>
                    )}
                  </Stack>
                ) : (
                  <Center py="xl">
                    <Stack align="center" gap="md">
                      <Text c="dimmed" ta="center">
                        Start taking exams to see your activity summary here!
                      </Text>
                      <Button onClick={() => navigate("/available-exams")}>
                        Browse Available Exams
                      </Button>
                    </Stack>
                  </Center>
                )}
              </Box>
            </Tabs.Panel>
          </Tabs>
        </ResponsiveCard>
      </Stack>

      {/* Password Change Modal */}
      <Modal
        opened={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
        title="Change Password"
        centered
      >
        <form onSubmit={passwordForm.onSubmit(handleChangePassword)}>
          <Stack gap="md">
            <PasswordInput
              label="Current Password"
              placeholder="Enter current password"
              leftSection={<IconLock size={16} />}
              {...passwordForm.getInputProps("currentPassword")}
            />

            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              leftSection={<IconLock size={16} />}
              {...passwordForm.getInputProps("newPassword")}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm new password"
              leftSection={<IconLock size={16} />}
              {...passwordForm.getInputProps("confirmPassword")}
            />

            <ActionButtons>
              <Button variant="default" onClick={() => setPasswordModalVisible(false)}>
                Cancel
              </Button>
              <Button type="submit">Change Password</Button>
            </ActionButtons>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}

export default Profile;
