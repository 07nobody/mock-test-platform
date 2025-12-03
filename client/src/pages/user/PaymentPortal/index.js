import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  TextInput,
  Button,
  Card,
  Paper,
  Radio,
  Stepper,
  Divider,
  Alert,
  Grid,
  Title,
  Text,
  Loader,
  Badge,
  Stack,
  Group,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconCreditCard,
  IconBuildingBank,
  IconWallet,
  IconShieldCheck,
  IconCircleCheck,
  IconArrowLeft,
  IconLock,
  IconUser,
  IconCalendar,
  IconCurrencyDollar,
  IconFlask,
  IconGift,
  IconCircleX,
} from "@tabler/icons-react";
import { createPayment, completePayment, checkPaymentStatus } from "../../../apicalls/payments";
import { getExamById } from "../../../apicalls/exams";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { message } from "../../../utils/notifications";
import PageTitle from "../../../components/PageTitle";

function PaymentPortal() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // Card form
  const cardForm = useForm({
    initialValues: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardHolderName: "",
    },
    validate: {
      cardNumber: (value) =>
        !value
          ? "Please enter your card number"
          : !/^\d{16}$/.test(value)
          ? "Card number must be 16 digits"
          : null,
      expiryDate: (value) =>
        !value
          ? "Please enter expiry date"
          : !/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)
          ? "Format: MM/YY"
          : null,
      cvv: (value) =>
        !value
          ? "Please enter CVV"
          : !/^\d{3,4}$/.test(value)
          ? "CVV must be 3 or 4 digits"
          : null,
      cardHolderName: (value) =>
        !value ? "Please enter card holder name" : null,
    },
  });

  // Net banking form
  const bankForm = useForm({
    initialValues: { bank: "" },
    validate: {
      bank: (value) => (!value ? "Please select your bank" : null),
    },
  });

  // UPI form
  const upiForm = useForm({
    initialValues: { upiId: "" },
    validate: {
      upiId: (value) =>
        !value
          ? "Please enter your UPI ID"
          : !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(value)
          ? "Please enter valid UPI ID (example: name@upi)"
          : null,
    },
  });

  // Wallet form
  const walletForm = useForm({
    initialValues: { wallet: "" },
    validate: {
      wallet: (value) => (!value ? "Please select your wallet" : null),
    },
  });

  // Get exam details
  useEffect(() => {
    const getExamData = async () => {
      try {
        dispatch(ShowLoading());
        const response = await getExamById({ examId });
        dispatch(HideLoading());

        if (response.success) {
          if (!response.data.isPaid) {
            message.error("This exam does not require payment");
            navigate("/user/available-exams");
            return;
          }
          setExam(response.data);
          console.log("Exam data:", response.data);
        } else {
          message.error(response.message);
          navigate("/user/available-exams");
        }

        setLoading(false);
      } catch (error) {
        dispatch(HideLoading());
        message.error(error.message);
        navigate("/user/available-exams");
      }
    };

    getExamData();

    // Also check if payment has already been completed
    const checkExistingPayment = async () => {
      try {
        const response = await checkPaymentStatus({
          userId: user._id,
          examId: examId,
        });

        if (
          response.success &&
          response.data &&
          response.data.status === "completed"
        ) {
          message.success("You have already completed payment for this exam");
          navigate(`/user/write-exam/${examId}`);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    };

    checkExistingPayment();
  }, [examId, navigate, dispatch, user._id]);

  const handlePaymentMethodChange = (value) => {
    setPaymentMethod(value);
  };

  const generateTransactionId = () => {
    return "TXN" + Date.now() + Math.floor(Math.random() * 1000);
  };

  // Modify handlePaymentSubmit to store payment response data for later use
  const handlePaymentSubmit = async (values) => {
    const newTransactionId = generateTransactionId();
    setTransactionId(newTransactionId);

    try {
      dispatch(ShowLoading());
      const paymentData = {
        examId: examId,
        userId: user._id,
        amount: exam.price || 0,
        paymentMethod: paymentMethod,
        transactionId: newTransactionId,
        paymentDetails: values,
      };

      const response = await createPayment(paymentData);

      if (response.success) {
        sessionStorage.setItem("currentPaymentId", response.data.paymentId);
        message.success("Payment initiated successfully");
        setCurrentStep(1);
        simulatePaymentProcessing();
      } else {
        message.error(response.message);
      }

      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message || "Failed to process payment. Please try again.");
    }
  };

  const simulatePaymentProcessing = () => {
    setPaymentStatus("processing");
    setTimeout(() => {
      completePaymentProcess();
    }, 3000);
  };

  const completePaymentProcess = async () => {
    try {
      dispatch(ShowLoading());

      const paymentId = sessionStorage.getItem("currentPaymentId");

      const response = await completePayment({
        examId: examId,
        userId: user._id,
        transactionId: transactionId,
        status: "completed",
        paymentId: paymentId,
      });

      if (response.success) {
        sessionStorage.removeItem("currentPaymentId");
        setPaymentStatus("completed");
        setCurrentStep(2);
        message.success("Payment completed successfully!");
      } else {
        setPaymentStatus("failed");
        message.error(response.message);
      }

      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      setPaymentStatus("failed");
      message.error("Payment processing failed. Please try again.");
    }
  };

  const renderPaymentForm = () => {
    if (paymentMethod === "free_test") {
      return (
        <div className="free-payment">
          <Alert
            title="Test Payment (100% OFF)"
            color="blue"
            icon={<IconGift size={16} />}
            mb="lg"
          >
            This is a test option that allows you to bypass the payment process.
            It will generate an invoice and send email notifications for testing
            purposes.
          </Alert>
          <form onSubmit={(e) => { e.preventDefault(); handlePaymentSubmit({}); }}>
            <Button type="submit" fullWidth leftSection={<IconGift size={16} />}>
              Complete Free Test Payment
            </Button>
          </form>
        </div>
      );
    } else if (paymentMethod === "credit_card" || paymentMethod === "debit_card") {
      return (
        <form onSubmit={cardForm.onSubmit(handlePaymentSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              leftSection={<IconCreditCard size={16} />}
              maxLength={16}
              autoComplete="off"
              {...cardForm.getInputProps("cardNumber")}
            />

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Expiry Date"
                  placeholder="MM/YY"
                  leftSection={<IconCalendar size={16} />}
                  maxLength={5}
                  autoComplete="off"
                  {...cardForm.getInputProps("expiryDate")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="CVV"
                  placeholder="123"
                  leftSection={<IconShieldCheck size={16} />}
                  maxLength={4}
                  autoComplete="off"
                  {...cardForm.getInputProps("cvv")}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Card Holder Name"
              placeholder="John Doe"
              leftSection={<IconUser size={16} />}
              autoComplete="off"
              {...cardForm.getInputProps("cardHolderName")}
            />

            <Button type="submit" fullWidth>
              Pay ₹{exam?.price || 0}
            </Button>
          </Stack>
        </form>
      );
    } else if (paymentMethod === "netbanking") {
      return (
        <form onSubmit={bankForm.onSubmit(handlePaymentSubmit)}>
          <Stack gap="md">
            <Radio.Group
              label="Select Bank"
              {...bankForm.getInputProps("bank")}
            >
              <Grid mt="xs">
                <Grid.Col span={6}>
                  <Radio value="sbi" label="SBI Bank" />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Radio value="hdfc" label="HDFC Bank" />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Radio value="icici" label="ICICI Bank" />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Radio value="axis" label="Axis Bank" />
                </Grid.Col>
              </Grid>
            </Radio.Group>

            <Button type="submit" fullWidth>
              Proceed to Net Banking ₹{exam?.price || 0}
            </Button>
          </Stack>
        </form>
      );
    } else if (paymentMethod === "upi") {
      return (
        <form onSubmit={upiForm.onSubmit(handlePaymentSubmit)}>
          <Stack gap="md">
            <TextInput
              label="UPI ID"
              placeholder="yourname@upi"
              autoComplete="off"
              {...upiForm.getInputProps("upiId")}
            />

            <Button type="submit" fullWidth>
              Pay using UPI ₹{exam?.price || 0}
            </Button>
          </Stack>
        </form>
      );
    } else if (paymentMethod === "wallet") {
      return (
        <form onSubmit={walletForm.onSubmit(handlePaymentSubmit)}>
          <Stack gap="md">
            <Radio.Group
              label="Select Wallet"
              {...walletForm.getInputProps("wallet")}
            >
              <Grid mt="xs">
                <Grid.Col span={6}>
                  <Radio value="paytm" label="Paytm" />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Radio value="phonepe" label="PhonePe" />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Radio value="amazonpay" label="Amazon Pay" />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Radio value="gpay" label="Google Pay" />
                </Grid.Col>
              </Grid>
            </Radio.Group>

            <Button type="submit" fullWidth>
              Pay using Wallet ₹{exam?.price || 0}
            </Button>
          </Stack>
        </form>
      );
    }
  };

  const renderPaymentProcessing = () => {
    return (
      <Stack align="center" justify="center" py={60} w="100%">
        <Loader size="lg" />
        <Title order={4} mt="lg">
          Processing Your Payment
        </Title>
        <Text c="dimmed">Please do not refresh or close this window.</Text>
        <Text c="dimmed">Transaction ID: {transactionId}</Text>
      </Stack>
    );
  };

  const renderPaymentComplete = () => {
    return (
      <Paper p="xl" withBorder>
        <Stack align="center" gap="md">
          <IconCircleCheck size={64} color="var(--mantine-color-green-6)" />
          <Title order={2}>Payment Successful!</Title>
          <Stack gap="xs" align="center">
            <Text>Transaction ID: {transactionId}</Text>
            <Text>Amount: ₹{exam?.price || 0}</Text>
            <Text>A receipt has been sent to your email address.</Text>
          </Stack>
          <Group mt="lg">
            <Button onClick={() => navigate(`/user/write-exam/${examId}`)}>
              Go to Exam
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/user/available-exams")}
            >
              Back to Available Exams
            </Button>
          </Group>
        </Stack>
      </Paper>
    );
  };

  const renderPaymentFailed = () => {
    return (
      <Paper p="xl" withBorder>
        <Stack align="center" gap="md">
          <IconCircleX size={64} color="var(--mantine-color-red-6)" />
          <Title order={2}>Payment Failed</Title>
          <Text c="dimmed">
            We couldn't process your payment. Please try again.
          </Text>
          <Group mt="lg">
            <Button onClick={() => setCurrentStep(0)}>Try Again</Button>
            <Button
              variant="outline"
              onClick={() => navigate("/user/available-exams")}
            >
              Back to Available Exams
            </Button>
          </Group>
        </Stack>
      </Paper>
    );
  };

  const renderCurrentStep = () => {
    if (currentStep === 0) {
      return (
        <div className="payment-step payment-methods">
          <div className="payment-summary">
            <Card withBorder>
              <Title order={5} mb="md">
                Payment Summary
              </Title>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text>Exam Name:</Text>
                  <Text fw={500}>{exam?.name}</Text>
                </Group>
                <Group justify="space-between">
                  <Text>Category:</Text>
                  <Text>{exam?.category}</Text>
                </Group>
                <Group justify="space-between">
                  <Text>Duration:</Text>
                  <Text>{Math.floor((exam?.duration || 0) / 60)} minutes</Text>
                </Group>
                <Divider my="sm" />
                <Group justify="space-between">
                  <Text fw={700} size="lg">
                    Total Amount:
                  </Text>
                  <Text fw={700} size="lg">
                    ₹{exam?.price || 0}
                  </Text>
                </Group>
              </Stack>
            </Card>
          </div>

          <div className="payment-form">
            <Title order={4}>Select Payment Method</Title>

            <Radio.Group
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
              mt="md"
            >
              <Stack gap="sm" className="payment-method-selector">
                <Radio
                  value="credit_card"
                  label={
                    <Group gap="xs">
                      <IconCreditCard size={16} /> Credit Card
                    </Group>
                  }
                />
                <Radio
                  value="debit_card"
                  label={
                    <Group gap="xs">
                      <IconCreditCard size={16} /> Debit Card
                    </Group>
                  }
                />
                <Radio
                  value="netbanking"
                  label={
                    <Group gap="xs">
                      <IconBuildingBank size={16} /> Net Banking
                    </Group>
                  }
                />
                <Radio
                  value="upi"
                  label={
                    <Group gap="xs">
                      <IconWallet size={16} /> UPI
                    </Group>
                  }
                />
                <Radio
                  value="wallet"
                  label={
                    <Group gap="xs">
                      <IconWallet size={16} /> Wallet
                    </Group>
                  }
                />
                <Radio
                  value="free_test"
                  label={
                    <Group gap="xs">
                      <IconGift size={16} /> 100% OFF (Testing)
                    </Group>
                  }
                />
              </Stack>
            </Radio.Group>

            <Box className="payment-form-container" mt="lg">
              {renderPaymentForm()}
            </Box>

            <Alert
              title="Secure Transaction"
              color="blue"
              icon={<IconLock size={16} />}
              mt="lg"
            >
              Your payment information is secure. We use encryption and follow
              security best practices to protect your data.
            </Alert>
          </div>
        </div>
      );
    } else if (currentStep === 1) {
      return (
        <div className="payment-step">
          {paymentStatus === "processing" && renderPaymentProcessing()}
          {paymentStatus === "failed" && renderPaymentFailed()}
        </div>
      );
    } else if (currentStep === 2) {
      return <div className="payment-step">{renderPaymentComplete()}</div>;
    }
  };

  if (loading) {
    return (
      <Stack align="center" justify="center" h={500}>
        <Loader size="lg" />
        <Text>Loading payment details...</Text>
      </Stack>
    );
  }

  return (
    <div className="payment-portal-container">
      <Group className="payment-portal-header" mb="lg">
        <Button
          leftSection={<IconArrowLeft size={16} />}
          variant="outline"
          onClick={() => navigate("/user/available-exams")}
          mr="md"
        >
          Back
        </Button>
        <Group className="header-title" gap="sm">
          <PageTitle title="Exam Payment" />
          <Badge color="violet" leftSection={<IconFlask size={12} />}>
            BETA
          </Badge>
        </Group>
      </Group>

      <Alert
        title="Beta Test Mode"
        color="yellow"
        icon={<IconFlask size={16} />}
        mb="lg"
      >
        This payment system is currently in beta testing. No real payments are
        processed, and all transactions are simulated for testing purposes.
      </Alert>

      <div className="payment-process-steps">
        <Stepper active={currentStep} mb="xl">
          <Stepper.Step
            label="Payment Details"
            icon={<IconCurrencyDollar size={18} />}
          />
          <Stepper.Step
            label="Processing"
            icon={
              paymentStatus === "processing" ? (
                <Loader size="xs" />
              ) : (
                <IconCurrencyDollar size={18} />
              )
            }
          />
          <Stepper.Step
            label="Confirmation"
            icon={<IconCircleCheck size={18} />}
          />
        </Stepper>
      </div>

      <div className="payment-content">{renderCurrentStep()}</div>
    </div>
  );
}

export default PaymentPortal;