import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Paper,
  TextInput,
  Button,
  Title,
  Text,
  Container,
  Stack,
  Box,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAt, IconArrowLeft } from '@tabler/icons-react';
import { forgotPassword } from '../../../apicalls/users';
import { HideLoading, ShowLoading } from '../../../redux/loaderSlice';
import { message } from '../../../utils/notifications';

function ForgotPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Please enter a valid email'),
    },
  });

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      dispatch(ShowLoading());

      const response = await forgotPassword(values.email);

      dispatch(HideLoading());
      setLoading(false);

      if (response.success) {
        message.success(response.message);
        form.reset();
        // Navigate to OTP verification page or show OTP input
        navigate(`/reset-password/${encodeURIComponent(values.email)}`);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
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
            <Text c="dimmed" size="sm" ta="center" mb="xl">
              Enter your email to receive a reset link
            </Text>

            <form onSubmit={form.onSubmit(onSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  size="md"
                  leftSection={<IconAt size={18} stroke={1.5} />}
                  {...form.getInputProps('email')}
                />

                <Button type="submit" fullWidth size="md" loading={loading} mt="md">
                  Send Reset Link
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

export default ForgotPassword;