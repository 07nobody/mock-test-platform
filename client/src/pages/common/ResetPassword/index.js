import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Paper,
  PasswordInput,
  Button,
  Title,
  Text,
  Container,
  Stack,
  Box,
  Divider,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconLock, IconArrowLeft, IconAt } from '@tabler/icons-react';
import axiosInstance from '../../../apicalls';
import { message } from '../../../utils/notifications';

function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { email } = useParams();

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: {
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Passwords do not match',
    },
  });

  const onSubmit = async (values) => {
    try {
      if (!email) {
        message.error('Email is required. Please try the password reset process again.');
        return;
      }

      setLoading(true);
      const response = await axiosInstance.post('/users/reset-password', {
        email: decodeURIComponent(email),
        newPassword: values.password,
      });

      setLoading(false);
      if (response.data.success) {
        message.success(response.data.message);
        navigate('/login');
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      setLoading(false);
      message.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Box className="auth-page-container">
      <Container size={1000} w="100%">
        <Paper radius="lg" shadow="xl" className="auth-split-card">
          {/* Left branding panel */}
          <Box visibleFrom="md" className="auth-branding-panel">
            <Box className="auth-branding-bg" />
            <Title order={1} c="white" pos="relative" className="z-1">
              Mock Test Platform
            </Title>
            <Text size="xl" c="white" opacity={0.9} mt="sm" pos="relative" className="z-1">
              Test Your Knowledge
            </Text>
          </Box>

          {/* Right form panel */}
          <Box p="xl" className="auth-form-panel">
            <Title order={2} ta="center" mb="xs">
              Reset Password
            </Title>
            <Text c="dimmed" size="sm" ta="center" mb="md">
              Create a new password for your account
            </Text>

            <Alert icon={<IconAt size={16} />} color="blue" mb="lg">
              {decodeURIComponent(email)}
            </Alert>

            <form onSubmit={form.onSubmit(onSubmit)}>
              <Stack gap="md">
                <PasswordInput
                  label="New Password"
                  placeholder="Enter new password"
                  size="md"
                  leftSection={<IconLock size={18} stroke={1.5} />}
                  {...form.getInputProps('password')}
                />

                <PasswordInput
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  size="md"
                  leftSection={<IconLock size={18} stroke={1.5} />}
                  {...form.getInputProps('confirmPassword')}
                />

                <Button type="submit" fullWidth size="md" loading={loading} mt="md">
                  Reset Password
                </Button>

                <Divider my="sm" />

                <Button
                  component={Link}
                  to="/login"
                  variant="subtle"
                  fullWidth
                  size="md"
                  leftSection={<IconArrowLeft size={18} stroke={1.5} />}
                >
                  Back to Login
                </Button>
              </Stack>
            </form>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default ResetPassword;