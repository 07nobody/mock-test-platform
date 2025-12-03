/**
 * Login Page - Clean shadcn-inspired design
 */

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Container,
  Group,
  Anchor,
  Stack,
  Box,
  Divider,
  ThemeIcon,
  Center,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconAt,
  IconLock,
  IconArrowLeft,
  IconKey,
  IconClipboardList,
} from '@tabler/icons-react';
import { HideLoading, ShowLoading } from '../../../redux/loaderSlice';
import axiosInstance from '../../../apicalls';
import { SetUser } from '../../../redux/usersSlice';
import { message } from '../../../utils/notifications';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [forgotPassword, setForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const loginForm = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length > 0 ? null : 'Password is required'),
    },
  });

  const forgotPasswordForm = useForm({
    initialValues: { email: '' },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const otpForm = useForm({
    initialValues: { otp: '' },
    validate: {
      otp: (value) => (value.length > 0 ? null : 'OTP is required'),
    },
  });

  useEffect(() => {
    if (forgotPassword) {
      loginForm.reset();
    } else {
      forgotPasswordForm.reset();
      otpForm.reset();
      setOtpSent(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forgotPassword]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/');
  }, [navigate]);

  const onLogin = async (values) => {
    try {
      setLoading(true);
      dispatch(ShowLoading());
      const response = await axiosInstance.post('/users/login', {
        email: values.email.trim(),
        password: values.password,
      });
      dispatch(HideLoading());
      setLoading(false);

      if (response.data.success) {
        message.success(response.data.message);
        localStorage.setItem('token', response.data.data);
        const userResponse = await axiosInstance.post('/users/get-user-info');
        if (userResponse.data.success) {
          dispatch(SetUser(userResponse.data.data));
          localStorage.setItem('userId', userResponse.data.data._id);
        }
        navigate('/');
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      setLoading(false);
      dispatch(HideLoading());
      message.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleForgotPassword = async (values) => {
    try {
      setLoading(true);
      dispatch(ShowLoading());
      const response = await axiosInstance.post('/users/forgot-password', { email: values.email });
      dispatch(HideLoading());
      setLoading(false);
      if (response.data.success) {
        message.success(response.data.message);
        setEmail(values.email);
        setOtpSent(true);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      setLoading(false);
      dispatch(HideLoading());
      message.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleVerifyOtp = async (values) => {
    try {
      setLoading(true);
      dispatch(ShowLoading());
      const response = await axiosInstance.post('/users/verify-otp', { email, otp: values.otp });
      dispatch(HideLoading());
      setLoading(false);
      if (response.data.success) {
        message.success(response.data.message);
        navigate(`/reset-password/${encodeURIComponent(email)}`);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      setLoading(false);
      dispatch(HideLoading());
      message.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={loginForm.onSubmit(onLogin)}>
      <Stack gap="md">
        <TextInput
          label="Email"
          placeholder="your@email.com"
          leftSection={<IconAt size={16} />}
          {...loginForm.getInputProps('email')}
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          leftSection={<IconLock size={16} />}
          {...loginForm.getInputProps('password')}
        />
        <Group justify="flex-end">
          <Anchor component="button" type="button" size="sm" onClick={() => setForgotPassword(true)}>
            Forgot password?
          </Anchor>
        </Group>
        <Button type="submit" fullWidth loading={loading}>
          Sign in
        </Button>
        <Divider label="New here?" labelPosition="center" />
        <Button component={Link} to="/register" variant="outline" fullWidth>
          Create account
        </Button>
      </Stack>
    </form>
  );

  const renderForgotPasswordForm = () => (
    <form onSubmit={forgotPasswordForm.onSubmit(handleForgotPassword)}>
      <Stack gap="md">
        <Center>
          <ThemeIcon size={56} radius="xl" variant="light">
            <IconKey size={28} />
          </ThemeIcon>
        </Center>
        <Box ta="center">
          <Title order={3}>Reset Password</Title>
          <Text size="sm" c="dimmed">Enter your email to receive a reset code</Text>
        </Box>
        <TextInput
          label="Email"
          placeholder="your@email.com"
          leftSection={<IconAt size={16} />}
          {...forgotPasswordForm.getInputProps('email')}
        />
        <Button type="submit" fullWidth loading={loading}>
          Send Code
        </Button>
        <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => setForgotPassword(false)}>
          Back to login
        </Button>
      </Stack>
    </form>
  );

  const renderOtpForm = () => (
    <form onSubmit={otpForm.onSubmit(handleVerifyOtp)}>
      <Stack gap="md">
        <Center>
          <ThemeIcon size={56} radius="xl" variant="light" color="teal">
            <IconKey size={28} />
          </ThemeIcon>
        </Center>
        <Box ta="center">
          <Title order={3}>Verify Code</Title>
          <Text size="sm" c="dimmed">Enter the code sent to {email}</Text>
        </Box>
        <TextInput
          label="Verification Code"
          placeholder="Enter code"
          leftSection={<IconKey size={16} />}
          styles={{ input: { textAlign: 'center', letterSpacing: '0.2em', fontWeight: 600 } }}
          {...otpForm.getInputProps('otp')}
        />
        <Button type="submit" fullWidth loading={loading} color="teal">
          Verify
        </Button>
        <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => setForgotPassword(false)}>
          Back to login
        </Button>
      </Stack>
    </form>
  );

  return (
    <Box className="min-h-screen flex items-center justify-center p-4 page-muted-bg">
      <Container size={420} w="100%">
        <Paper radius="lg" p="xl" withBorder>
          {!forgotPassword && (
            <Stack gap="sm" mb="lg" align="center">
              <ThemeIcon size={48} radius="md" color="violet">
                <IconClipboardList size={26} />
              </ThemeIcon>
              <Box ta="center">
                <Title order={2}>Welcome back</Title>
                <Text size="sm" c="dimmed">Sign in to your account</Text>
              </Box>
            </Stack>
          )}
          
          {!forgotPassword && renderLoginForm()}
          {forgotPassword && !otpSent && renderForgotPasswordForm()}
          {forgotPassword && otpSent && renderOtpForm()}
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
