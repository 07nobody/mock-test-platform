/**
 * Register Page - Clean shadcn-inspired design
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Container,
  Stack,
  Box,
  Divider,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUser, IconAt, IconLock, IconClipboardList } from '@tabler/icons-react';
import { registerUser } from '../../../apicalls/users';
import { HideLoading, ShowLoading } from '../../../redux/loaderSlice';
import { message } from '../../../utils/notifications';

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: { name: '', email: '', password: '' },
    validate: {
      name: (value) => (value.length > 0 ? null : 'Name is required'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
    },
  });

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      dispatch(ShowLoading());
      const response = await registerUser(values);
      dispatch(HideLoading());
      setLoading(false);

      if (response.success) {
        message.success(response.message);
        navigate('/login');
      } else {
        message.error(response.message);
      }
    } catch (error) {
      setLoading(false);
      dispatch(HideLoading());
      message.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center p-4 page-muted-bg">
      <Container size={420} w="100%">
        <Paper radius="lg" p="xl" withBorder>
          <Stack gap="sm" mb="lg" align="center">
            <ThemeIcon size={48} radius="md" color="violet">
              <IconClipboardList size={26} />
            </ThemeIcon>
            <Box ta="center">
              <Title order={2}>Create account</Title>
              <Text size="sm" c="dimmed">Join us today</Text>
            </Box>
          </Stack>

          <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Full Name"
                placeholder="John Doe"
                leftSection={<IconUser size={16} />}
                {...form.getInputProps('name')}
              />
              <TextInput
                label="Email"
                placeholder="your@email.com"
                leftSection={<IconAt size={16} />}
                {...form.getInputProps('email')}
              />
              <PasswordInput
                label="Password"
                placeholder="Create a password"
                leftSection={<IconLock size={16} />}
                {...form.getInputProps('password')}
              />
              <Text size="xs" c="dimmed">Password must be at least 6 characters</Text>
              <Button type="submit" fullWidth loading={loading}>
                Create Account
              </Button>
              <Divider label="Already have an account?" labelPosition="center" />
              <Button component={Link} to="/login" variant="outline" fullWidth>
                Sign in
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default Register;
