import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Paper, 
  Modal, 
  Button, 
  Tooltip, 
  Badge, 
  Divider, 
  Group, 
  Alert,
  Progress,
  Text,
  Box,
  Stack
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { getExamById } from "../../../apicalls/exams";
import { addReport } from "../../../apicalls/reports";
import { ShowLoading, HideLoading } from '../../../redux/loaderSlice';
import AuthVerification from './AuthVerification';
import LottiePlayer from '../../../components/LottiePlayer';
import AccessibilitySettings from "../../../components/AccessibilitySettings";
import ColorCustomizer from "../../../components/ColorCustomizer";
import Instructions from "./Instructions";
import { useContext } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import { ColorContext } from "../../../contexts/ColorContext";
import { message } from "../../../utils/notifications";

import {
  IconClock,
  IconCheck,
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconDeviceFloppy,
  IconEye,
  IconSettings,
  IconAlertCircle
} from "@tabler/icons-react";

function WriteExam() {
  const [examData, setExamData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [result, setResult] = useState({});
  const [view, setView] = useState("auth");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [accessibilitySettingsVisible, setAccessibilitySettingsVisible] = useState(false);
  const [saveIndicatorVisible, setSaveIndicatorVisible] = useState(false);
  const [exitConfirmOpened, { open: openExitConfirm, close: closeExitConfirm }] = useDisclosure(false);
  const [submitConfirmOpened, { open: openSubmitConfirm, close: closeSubmitConfirm }] = useDisclosure(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.users);
  
  const getExamData = useCallback(async () => {
    try {
      dispatch(ShowLoading());
      const response = await getExamById({
        examId: params.id,
      });
      dispatch(HideLoading());
      if (response.success) {
        setQuestions(response.data.questions);
        setExamData(response.data);
        setSecondsLeft(response.data.duration);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  }, [dispatch, params.id]);

  const calculateResult = useCallback(async () => {
    try {
      let correctAnswers = [];
      let wrongAnswers = [];

      questions.forEach((question, index) => {
        if (question.correctOption === selectedOptions[index]) {
          correctAnswers.push(question);
        } else {
          wrongAnswers.push(question);
        }
      });

      let verdict = "Pass";
      if (correctAnswers.length < examData.passingMarks) {
        verdict = "Fail";
      }

      const tempResult = {
        correctAnswers,
        wrongAnswers,
        verdict,
      };
      setResult(tempResult);
      dispatch(ShowLoading());
      const response = await addReport({
        exam: params.id,
        result: tempResult,
        user: user._id,
      });
      dispatch(HideLoading());
      if (response.success) {
        setView("result");
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  }, [dispatch, questions, selectedOptions, examData, params.id, user._id]);

  const resetExamState = () => {
    setSelectedQuestionIndex(0);
    setSelectedOptions({});
    setMarkedForReview([]);
    setSecondsLeft(examData.duration);
    setResult({});
    setTimeUp(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const startTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    let totalSeconds = examData.duration;
    const newIntervalId = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds = totalSeconds - 1;
        setSecondsLeft(totalSeconds);
      } else {
        setTimeUp(true);
      }
    }, 1000);
    setIntervalId(newIntervalId);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerStatus = () => {
    const totalDuration = examData.duration;
    const percentRemaining = (secondsLeft / totalDuration) * 100;
    
    if (percentRemaining <= 10) {
      return "critical";
    } else if (percentRemaining <= 25) {
      return "warning";
    }
    return "normal";
  };

  const toggleReviewStatus = (index) => {
    if (markedForReview.includes(index)) {
      setMarkedForReview(markedForReview.filter((item) => item !== index));
    } else {
      setMarkedForReview([...markedForReview, index]);
    }
  };

  const getOptionClassName = (questionIndex, option) => {
    let className = "option";
    if (selectedOptions[questionIndex] === option) {
      className = "selected-option";
    }
    return className;
  };

  const getQuestionStatusClass = (index) => {
    if (markedForReview.includes(index)) {
      return "marked-for-review";
    }
    if (selectedOptions[index]) {
      return "answered";
    }
    return "not-answered";
  };

  const saveExamState = useCallback(() => {
    if (view === 'questions') {
      const examState = {
        examId: params.id,
        selectedOptions,
        markedForReview,
        selectedQuestionIndex,
        secondsLeft,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem(`exam_${params.id}_${user._id}`, JSON.stringify(examState));
      
      setLastSavedTime(new Date());
      setSaveIndicatorVisible(true);
      
      setTimeout(() => {
        setSaveIndicatorVisible(false);
      }, 3000);
      
      return true;
    }
    return false;
  }, [view, params.id, selectedOptions, markedForReview, selectedQuestionIndex, secondsLeft, user._id]);

  const loadExamState = useCallback(() => {
    const savedState = localStorage.getItem(`exam_${params.id}_${user._id}`);
    if (savedState) {
      const examState = JSON.parse(savedState);
      
      if (examState.examId === params.id) {
        const currentTime = new Date().getTime();
        const savedTime = examState.timestamp;
        const hoursDiff = (currentTime - savedTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          setSelectedOptions(examState.selectedOptions || {});
          setMarkedForReview(examState.markedForReview || []);
          setSelectedQuestionIndex(examState.selectedQuestionIndex || 0);
          
          if (examState.secondsLeft && examState.secondsLeft < examData.duration) {
            setSecondsLeft(examState.secondsLeft);
          }
          
          return true;
        }
      }
    }
    return false;
  }, [params.id, user._id, examData]);

  const clearExamState = useCallback(() => {
    localStorage.removeItem(`exam_${params.id}_${user._id}`);
  }, [params.id, user._id]);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveExamState();
    }, 10000); // Save every 10 seconds

    return () => clearInterval(saveInterval);
  }, [saveExamState]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (view === 'questions') {
        saveExamState();
        
        e.preventDefault();
        e.returnValue = 'You have an ongoing exam. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [view, saveExamState]);

  const formatLastSavedTime = () => {
    if (!lastSavedTime) return '';
    
    const now = new Date();
    const diffMs = now - lastSavedTime;
    
    if (diffMs < 60000) { // less than a minute
      return 'just now';
    } else if (diffMs < 3600000) { // less than an hour
      const minutes = Math.floor(diffMs / 60000);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return lastSavedTime.toLocaleTimeString();
    }
  };
  
  const handleExitConfirm = () => {
    openExitConfirm();
  };

  const handleConfirmedExit = () => {
    saveExamState();
    navigate('/user/home');
  };

  useEffect(() => {
    if (view === 'instructions' && examData) {
      const hasRestoredState = loadExamState();
      if (hasRestoredState) {
        message.info(
          "We've restored your previous progress. You can continue from where you left off.",
          5
        );
      }
    }
  }, [view, examData, loadExamState]);

  useEffect(() => {
    if (view === 'result') {
      clearExamState();
    }
  }, [view, clearExamState]);

  useEffect(() => {
    if (timeUp && view === "questions") {
      clearInterval(intervalId);
      calculateResult();
    }
  }, [timeUp, view, intervalId, calculateResult]);

  useEffect(() => {
    if (params.id) {
      getExamData();
    }
  }, [params.id, getExamData]);

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const getQuestionsView = () => {
    // Generate color theme based on primary color
    const primaryColor = '#1890ff'; // Primary blue
    const successColor = '#52c41a';
    const warningColor = '#faad14';
    const dangerColor = '#f5222d';
    const infoColor = '#13c2c2';
    
    return (
      <div className="exam-container">
        {/* Header Card with Exam Info */}
        <Paper 
          className="exam-header-card"
          shadow="sm"
          radius="md"
        >
          <div className="exam-header-content">
            <div className="exam-title-wrapper">
              <h1 className="exam-title-text">{examData?.name}</h1>
              <div className="exam-subtitle">
                <Badge variant="dot" color="blue">{examData?.category}</Badge>
                <span className="exam-info-divider">•</span>
                <span>Total Questions: {questions.length}</span>
                <span className="exam-info-divider">•</span>
                <span>Total Marks: {examData.totalMarks}</span>
                <span className="exam-info-divider">•</span>
                <span>Passing Marks: {examData.passingMarks}</span>
              </div>
            </div>
            
            <div className={`exam-timer ${getTimerStatus()}`}>
              <IconClock className="timer-icon" size={22} />
              <span className="time-display">{formatTime(secondsLeft)}</span>
              <Tooltip label="Accessibility Settings">
                <Button 
                  variant="subtle" 
                  color="white"
                  onClick={() => setAccessibilitySettingsVisible(true)}
                  className="accessibility-button"
                  style={{ marginLeft: '8px', color: 'white' }}
                  p={4}
                >
                  <IconSettings size={18} />
                </Button>
              </Tooltip>
            </div>
          </div>
        </Paper>

        {/* Save Indicator Popup */}
        {saveIndicatorVisible && (
          <div className="save-indicator">
            <IconCheck className="save-icon" size={16} />
            <span>Progress saved</span>
          </div>
        )}
        
        {/* Last Saved Time */}
        {lastSavedTime && (
          <div className="last-saved-info">
            <span>Last saved: {formatLastSavedTime()}</span>
            <Button 
              variant="subtle" 
              size="xs" 
              onClick={saveExamState}
              leftSection={<IconDeviceFloppy size={14} />}
            >
              Save now
            </Button>
          </div>
        )}

        {/* Actions Bar */}
        <div className="exam-actions-bar">
          <Tooltip label="Your progress will be saved">
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => {
                saveExamState();
                handleExitConfirm();
              }}
              className="exit-button"
            >
              Exit Exam
            </Button>
          </Tooltip>
          
          <div className="question-counter">
            <Badge 
              color="blue"
              style={{ marginRight: '8px' }}
            >
              {selectedQuestionIndex + 1}
            </Badge>
            <span>of {questions.length} questions</span>
            <Progress 
              value={Math.round(((selectedQuestionIndex + 1) / questions.length) * 100)} 
              size="sm" 
              color="blue"
              style={{ width: 120, marginLeft: 10 }}
            />
          </div>
        </div>

        {/* Progress Summary */}
        <Paper 
          shadow="sm"
          p="md"
          radius="md"
          className="exam-progress-area"
        >
          <Group justify="space-between" mb="sm">
            <Text fw={500}>Your Progress</Text>
            <Text fw={600} c="blue">{Math.round((Object.keys(selectedOptions).length / questions.length) * 100)}%</Text>
          </Group>
          <Group gap="xl" mb="sm">
            <Group gap="xs">
              <Badge size="xs" color="green" circle />
              <Text size="sm">Answered</Text>
              <Badge color="green" size="sm">{Object.keys(selectedOptions).length}</Badge>
            </Group>
            <Group gap="xs">
              <Badge size="xs" color="yellow" circle />
              <Text size="sm">Marked for Review</Text>
              <Badge color="yellow" size="sm">{markedForReview.length}</Badge>
            </Group>
            <Group gap="xs">
              <Badge size="xs" color="red" circle />
              <Text size="sm">Unanswered</Text>
              <Badge color="red" size="sm">{questions.length - Object.keys(selectedOptions).length}</Badge>
            </Group>
          </Group>
          <Progress 
            value={Math.round((Object.keys(selectedOptions).length / questions.length) * 100)} 
            size="md"
            color="blue"
          />
        </Paper>

        {/* Main Content Area */}
        <div className="exam-main-content">
          {/* Question Navigator Sidebar */}
          <Paper 
            className="question-sidebar" 
            shadow="sm"
            p="md"
            radius="md"
          >
            <Group justify="space-between" mb="md">
              <Text fw={500}>Question Navigator</Text>
              <Badge color="blue">{Object.keys(selectedOptions).length}/{questions.length}</Badge>
            </Group>
            
            <div className="question-status-legend">
              <div className="legend-grid">
                <Group gap="xs"><Badge size="xs" color="gray" circle /><Text size="xs">Not Visited</Text></Group>
                <Group gap="xs"><Badge size="xs" color="blue" circle /><Text size="xs">Current</Text></Group>
                <Group gap="xs"><Badge size="xs" color="green" circle /><Text size="xs">Answered</Text></Group>
                <Group gap="xs"><Badge size="xs" color="yellow" circle /><Text size="xs">Marked for Review</Text></Group>
                <Group gap="xs"><Badge size="xs" color="red" circle /><Text size="xs">Not Answered</Text></Group>
              </div>
            </div>
            
            <Divider my="md" />
            
            <div className="question-nav">
              <div className="question-grid">
                {questions.map((_, index) => {
                  // Determine the status for each question button
                  let badgeColor = "gray";
                  let buttonVariant = "default";
                  
                  if (index === selectedQuestionIndex) {
                    badgeColor = "blue";
                    buttonVariant = "filled";
                  } else if (markedForReview.includes(index)) {
                    badgeColor = "yellow";
                  } else if (selectedOptions[index]) {
                    badgeColor = "green";
                  } else if (index < selectedQuestionIndex) {
                    // If we've passed this question but haven't answered it
                    badgeColor = "red";
                  }
                  
                  return (
                    <Tooltip 
                      key={index}
                      label={
                        markedForReview.includes(index) 
                          ? "Marked for review" 
                          : selectedOptions[index] 
                            ? "Answered" 
                            : index === selectedQuestionIndex 
                              ? "Current question" 
                              : index < selectedQuestionIndex 
                                ? "Not answered" 
                                : "Not visited yet"
                      }
                    >
                      <Box pos="relative" style={{ display: 'inline-block' }}>
                        <Badge 
                          size="xs" 
                          color={badgeColor} 
                          circle 
                          style={{ 
                            position: 'absolute', 
                            top: -2, 
                            right: -2, 
                            zIndex: 1,
                            width: 8,
                            height: 8,
                            padding: 0
                          }} 
                        />
                        <Button
                          className={`question-number-button ${index === selectedQuestionIndex ? 'current' : ''}`}
                          onClick={() => setSelectedQuestionIndex(index)}
                          variant={index === selectedQuestionIndex ? "filled" : "default"}
                          radius="xl"
                          size="sm"
                          w={36}
                          h={36}
                          p={0}
                        >
                          {index + 1}
                        </Button>
                      </Box>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </Paper>
          
          {/* Main Question Card */}
          <Paper 
            className="question-main"
            shadow="sm"
            p="lg"
            radius="md"
          >
            <Group justify="space-between" mb="md">
              <Group gap="md">
                <Text fw={500}>Question {selectedQuestionIndex + 1}</Text>
                {markedForReview.includes(selectedQuestionIndex) && (
                  <Badge color="yellow">Marked for Review</Badge>
                )}
              </Group>
              <Group gap="xs">
                {selectedQuestionIndex > 0 && (
                  <Button
                    variant="subtle"
                    leftSection={<IconArrowLeft size={14} />}
                    onClick={() => setSelectedQuestionIndex(selectedQuestionIndex - 1)}
                    size="sm"
                  >
                    Prev
                  </Button>
                )}
                {selectedQuestionIndex < questions.length - 1 && (
                  <Button
                    variant="subtle"
                    rightSection={<IconArrowRight size={14} />}
                    onClick={() => setSelectedQuestionIndex(selectedQuestionIndex + 1)}
                    size="sm"
                  >
                    Next
                  </Button>
                )}
              </Group>
            </Group>
            
            <div className="question-content">
              <h3 className="question-text">
                {questions[selectedQuestionIndex]?.name}
              </h3>
              
              <div className="options-container">
                {questions[selectedQuestionIndex]?.options &&
                  Object.keys(questions[selectedQuestionIndex].options).map(
                    (option) => {
                      const isSelected = selectedOptions[selectedQuestionIndex] === option;
                      return (
                        <div
                          className={`option-item ${isSelected ? 'selected' : ''}`}
                          key={`${questions[selectedQuestionIndex]._id}_${option}`}
                          onClick={() => {
                            setSelectedOptions({
                              ...selectedOptions,
                              [selectedQuestionIndex]: option,
                            });
                          }}
                        >
                          <div className="option-marker">{option}</div>
                          <div className="option-text">
                            {questions[selectedQuestionIndex].options[option]}
                          </div>
                          {isSelected && <IconCheck className="selected-icon" size={20} />}
                        </div>
                      );
                    }
                  )}
              </div>
            </div>
            
            <div className="question-actions">
              <Button
                variant={markedForReview.includes(selectedQuestionIndex) ? "light" : "outline"}
                color={markedForReview.includes(selectedQuestionIndex) ? "yellow" : "gray"}
                leftSection={<IconEye size={16} />}
                onClick={() => toggleReviewStatus(selectedQuestionIndex)}
                className="review-btn"
              >
                {markedForReview.includes(selectedQuestionIndex) ? 'Unmark' : 'Mark'} for Review
              </Button>

              {selectedQuestionIndex < questions.length - 1 ? (
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  onClick={() => setSelectedQuestionIndex(selectedQuestionIndex + 1)}
                  className="save-next-btn"
                >
                  Save & Next
                </Button>
              ) : (
                <Button
                  color="red"
                  leftSection={<IconCheck size={16} />}
                  onClick={openSubmitConfirm}
                  className="submit-btn"
                >
                  Submit Exam
                </Button>
              )}
            </div>
          </Paper>
        </div>

        {/* Submit Confirmation Modal */}
        <Modal
          opened={submitConfirmOpened}
          onClose={closeSubmitConfirm}
          title={
            <Group gap="xs">
              <IconAlertCircle size={20} color="#faad14" />
              <Text fw={500}>Submit Exam</Text>
            </Group>
          }
          centered
        >
          <Text mb="md">Are you sure you want to submit the exam? Once submitted, you cannot make changes.</Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={closeSubmitConfirm}>
              Cancel
            </Button>
            <Button 
              color="red" 
              onClick={() => {
                closeSubmitConfirm();
                clearInterval(intervalId);
                setTimeUp(true);
              }}
            >
              Submit
            </Button>
          </Group>
        </Modal>

        {/* Exit Confirmation Modal */}
        <Modal
          opened={exitConfirmOpened}
          onClose={closeExitConfirm}
          title={
            <Group gap="xs">
              <IconAlertCircle size={20} color="#faad14" />
              <Text fw={500}>Exit Exam Confirmation</Text>
            </Group>
          }
          centered
        >
          <Alert
            color="blue"
            title="Your progress has been saved"
            icon={<IconCheck size={16} />}
            mb="md"
          >
            You can resume this exam later. Are you sure you want to exit now?
          </Alert>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={closeExitConfirm}>
              Continue Exam
            </Button>
            <Button color="red" onClick={handleConfirmedExit}>
              Exit Exam
            </Button>
          </Group>
        </Modal>
        
        <style jsx="true">{`
          .exam-container {
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            background-color: #f0f5ff;
            min-height: calc(100vh - 120px);
            position: relative;
          }
          
          .exam-header-card {
            margin-bottom: 0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            border: none;
          }
          
          .exam-header-content {
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(120deg, #1890ff, #096dd9);
            color: white;
          }
          
          .exam-title-text {
            margin: 0;
            font-size: 22px;
            color: white;
            font-weight: 600;
          }
          
          .exam-subtitle {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 6px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.85);
            flex-wrap: wrap;
          }
          
          .exam-info-divider {
            color: rgba(255, 255, 255, 0.5);
          }
          
          .exam-timer {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(0, 0, 0, 0.2);
            color: white;
            padding: 10px 16px;
            border-radius: 30px;
            backdrop-filter: blur(4px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
          }

          .exam-timer.warning {
            background: linear-gradient(135deg, #faad14 0%, #d48806 100%);
            animation: pulse-slow 2s infinite;
          }

          .exam-timer.critical {
            background: linear-gradient(135deg, #f5222d 0%, #cf1322 100%);
            animation: pulse 1s infinite;
          }
          
          .timer-icon {
            font-size: 1.4rem;
          }
          
          .time-display {
            font-size: 1.2rem;
            font-weight: 600;
            letter-spacing: 1px;
          }
          
          .save-indicator {
            position: fixed;
            top: 70px;
            right: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
            background-color: #f6ffed;
            border: 1px solid #b7eb8f;
            border-radius: 8px;
            padding: 8px 14px;
            box-shadow: 0 4px 12px rgba(82, 196, 26, 0.15);
            animation: slideIn 0.3s ease-in-out;
            z-index: 100;
          }
          
          .save-icon {
            color: #52c41a;
            font-weight: bold;
          }
          
          .last-saved-info {
            display: flex;
            align-items: center;
            gap: 8px;
            color: rgba(0, 0, 0, 0.45);
            font-size: 13px;
            margin-top: -8px;
            margin-bottom: 4px;
            justify-content: flex-end;
          }
          
          .exam-actions-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0;
          }
          
          .exit-button {
            border-radius: 6px;
            height: 36px;
            border: 1px solid #d9d9d9;
            transition: all 0.3s;
          }
          
          .exit-button:hover {
            color: #ff4d4f;
            border-color: #ff4d4f;
          }
          
          .question-counter {
            display: flex;
            align-items: center;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.65);
            background: white;
            padding: 5px 12px;
            border-radius: 20px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
          }
          
          .exam-progress-area {
            background-color: white;
            border-radius: 12px;
            margin-bottom: 0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            border: none;
          }
          
          .progress-summary-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .progress-percent {
            font-weight: 600;
            color: #1890ff;
            font-size: 16px;
          }
          
          .progress-details {
            display: flex;
            gap: 24px;
            margin-bottom: 12px;
          }
          
          .progress-stat {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .stat-count {
            font-weight: 600;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 12px;
            color: white;
          }
          
          .stat-count.answered {
            background: #52c41a;
          }
          
          .stat-count.review {
            background: #faad14;
          }
          
          .stat-count.unanswered {
            background: #f5222d;
          }
          
          .exam-main-content {
            display: flex;
            gap: 16px;
            flex-grow: 1;
            min-height: 500px;
          }
          
          .question-sidebar {
            width: 320px;
            background: white;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            border: none;
          }
          
          .sidebar-title-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .sidebar-title {
            font-weight: 500;
          }
          
          .sidebar-pill {
            background: #1890ff;
            color: white;
            font-size: 12px;
            font-weight: 500;
            padding: 2px 10px;
            border-radius: 12px;
          }
          
          .legend-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 16px;
          }
          
          .question-status-legend {
            font-size: 14px;
          }
          
          .question-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 12px;
          }
          
          .question-number-button {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 36px !important;
            width: 36px !important;
            min-width: 36px !important;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          
          .question-number-button.current {
            transform: scale(1.05);
            box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
          }
          
          .question-main {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            border-radius: 12px;
            border: none;
          }
          
          .question-card-header {
            display: flex;
            align-items: center;
          }
          
          .question-number-indicator {
            font-weight: 500;
          }
          
          .question-content {
            flex-grow: 1;
          }
          
          .question-text {
            font-size: 18px;
            font-weight: 500;
            line-height: 1.6;
            margin-bottom: 28px;
            color: rgba(0, 0, 0, 0.85);
            padding: 8px 12px;
            background: #f9f9f9;
            border-radius: 8px;
            border-left: 4px solid #1890ff;
          }
          
          .options-container {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-bottom: 24px;
            padding: 0 4px;
          }
          
          .option-item {
            display: flex;
            align-items: center;
            padding: 16px;
            border: 1px solid #f0f0f0;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s;
            background-color: white;
            position: relative;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
          }
          
          .option-item:hover {
            border-color: #1890ff;
            background: #f0f7ff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
          }
          
          .option-item.selected {
            border: 2px solid #1890ff;
            background: #e6f7ff;
            box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
          }
          
          .option-marker {
            width: 35px;
            height: 35px;
            min-width: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: #f5f5f5;
            margin-right: 16px;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.65);
            border: 1px solid #d9d9d9;
          }
          
          .option-item.selected .option-marker {
            background: #1890ff;
            color: white;
            border-color: #1890ff;
          }
          
          .option-text {
            flex-grow: 1;
            font-size: 16px;
            line-height: 1.6;
          }
          
          .selected-icon {
            position: absolute;
            right: 16px;
            font-size: 20px;
            color: #1890ff;
          }
          
          .question-actions {
            display: flex;
            justify-content: space-between;
            padding: 16px 0 0;
            border-top: 1px solid #f0f0f0;
            margin-top: 24px;
          }
          
          .review-btn, .save-next-btn, .submit-btn {
            height: 38px;
            font-weight: 500;
            border-radius: 6px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            min-width: 140px;
            transition: all 0.3s;
          }
          
          .review-btn:hover, .save-next-btn:hover, .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          
          /* Animations */
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(245, 34, 45, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(245, 34, 45, 0); }
            100% { box-shadow: 0 0 0 0 rgba(245, 34, 45, 0); }
          }
          
          @keyframes pulse-slow {
            0% { box-shadow: 0 0 0 0 rgba(250, 173, 20, 0.7); }
            70% { box-shadow: 0 0 0 7px rgba(250, 173, 20, 0); }
            100% { box-shadow: 0 0 0 0 rgba(250, 173, 20, 0); }
          }
          
          /* Responsive adjustments */
          @media (max-width: 992px) {
            .exam-main-content {
              flex-direction: column;
            }
            
            .question-sidebar {
              width: 100%;
              order: 2;
            }
            
            .question-main {
              order: 1;
              margin-bottom: 16px;
            }
            
            .question-grid {
              grid-template-columns: repeat(6, 1fr);
            }
            
            .legend-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
          
          @media (max-width: 768px) {
            .exam-container {
              padding: 12px;
            }
            
            .exam-header-content {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
            }
            
            .exam-timer {
              align-self: flex-end;
            }
            
            .progress-details {
              flex-direction: column;
              gap: 8px;
            }
            
            .question-actions {
              flex-wrap: wrap;
              gap: 10px;
              justify-content: center;
            }
            
            .review-btn {
              order: 3;
              width: 100%;
            }
            
            .question-grid {
              grid-template-columns: repeat(5, 1fr);
            }
          }
          
          @media (max-width: 576px) {
            .question-grid {
              grid-template-columns: repeat(4, 1fr);
              gap: 8px;
            }
            
            .question-text {
              font-size: 16px;
            }
            
            .option-text {
              font-size: 14px;
            }
            
            .legend-grid {
              grid-template-columns: 1fr 1fr;
            }
          }
        `}</style>
      </div>
    );
  };

  return (
    examData && (
      <div className="write-exam-container">
        {view === "auth" && (
          <AuthVerification
            user={user}
            examData={examData}
            setView={setView}
          />
        )}

        {view === "instructions" && (
          <Instructions
            examData={examData}
            setView={setView}
            startTimer={startTimer}
          />
        )}

        {view === "questions" && questions.length > 0 && getQuestionsView()}

        {view === "result" && (
          <div className="result-container">
            <div className="result-card">
              <div className="result-header">
                <h1>Exam Result</h1>
                <h2 className="exam-name">{examData.name}</h2>
              </div>
              
              <div className="result-content">
                <div className="result-summary">
                  <div className="result-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total Questions</span>
                      <span className="stat-value">{questions.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Marks</span>
                      <span className="stat-value">{examData.totalMarks}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Passing Marks</span>
                      <span className="stat-value">{examData.passingMarks}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Correct Answers</span>
                      <span className="stat-value">{result.correctAnswers?.length || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Wrong Answers</span>
                      <span className="stat-value">{result.wrongAnswers?.length || 0}</span>
                    </div>
                    <div className="stat-item verdict">
                      <span className="stat-label">Verdict</span>
                      <span className={`stat-value ${result.verdict === "Pass" ? "pass" : "fail"}`}>
                        {result.verdict}
                      </span>
                    </div>
                  </div>

                  <div className="result-animation">
                    {result.verdict === "Pass" && (
                      <LottiePlayer
                        src="https://assets2.lottiefiles.com/packages/lf20_ya4ycrti.json"
                        background="transparent"
                        speed={1}
                        loop={true}
                        autoplay={true}
                        style={{ height: "300px", width: "300px" }}
                      />
                    )}

                    {result.verdict === "Fail" && (
                      <LottiePlayer
                        src="https://assets4.lottiefiles.com/packages/lf20_qp1spzqv.json"
                        background="transparent"
                        speed={1}
                        loop={true}
                        autoplay={true}
                        style={{ height: "300px", width: "300px" }}
                      />
                    )}
                  </div>
                </div>

                <div className="result-actions">
                  <button
                    className="action-button"
                    onClick={() => {
                      resetExamState();
                      setView("instructions");
                    }}
                  >
                    Take Exam Again
                  </button>
                  <button
                    className="action-button primary"
                    onClick={() => {
                      setView("review");
                    }}
                  >
                    Review Answers
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "review" && (
          <div className="review-container">
            <div className="review-header">
              <h1>Review Answers</h1>
              <h2>{examData.name}</h2>
            </div>
            
            <div className="review-content">
              {questions.map((question, index) => {
                const isCorrect = question.correctOption === selectedOptions[index];
                return (
                  <div
                    key={question._id}
                    className={`review-item ${isCorrect ? "correct" : "incorrect"}`}
                  >
                    <div className="review-question">
                      <div className="question-number">Question {index + 1}:</div>
                      <div className="question-text">{question.name}</div>
                    </div>

                    <div className="review-options">
                      {Object.keys(question.options).map((option) => (
                        <div 
                          key={option} 
                          className={`review-option ${
                            option === question.correctOption 
                              ? "correct-option" 
                              : option === selectedOptions[index] && option !== question.correctOption
                                ? "wrong-option"
                                : ""
                          }`}
                        >
                          <span className="option-marker">{option}:</span>
                          <span className="option-text">{question.options[option]}</span>
                          {option === question.correctOption && (
                            <IconCheck className="correct-icon" size={20} />
                          )}
                          {option === selectedOptions[index] && option !== question.correctOption && (
                            <IconAlertTriangle className="wrong-icon" size={20} />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="review-explanation">
                      <div className="your-answer">
                        Your answer: {selectedOptions[index] || "Not answered"}
                      </div>
                      <div className="correct-answer">
                        Correct answer: {question.correctOption}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="review-actions">
              <button
                className="action-button"
                onClick={() => {
                  navigate("/user/reports");
                }}
              >
                View All Reports
              </button>
              <button
                className="action-button primary"
                onClick={() => {
                  resetExamState();
                  setView("instructions");
                }}
              >
                Take Exam Again
              </button>
            </div>
          </div>
        )}
        
        <AccessibilitySettings
          visible={accessibilitySettingsVisible}
          onClose={() => setAccessibilitySettingsVisible(false)}
        />
        
        <style jsx="true">{`
          .write-exam-container {
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            max-width: 1400px;
            margin: 0 auto;
          }
          
          /* Exam Progress Bar */
          .exam-progress-bar {
            padding: 12px 20px;
            background: white;
            border-bottom: 1px solid var(--border-color);
          }
          
          .progress-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 0.9rem;
            color: var(--text-secondary);
          }
          
          /* Exam UI */
          .exam-ui {
            display: flex;
            flex-direction: column;
            height: calc(100vh - 160px);
            overflow: hidden;
          }
          
          .exam-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 20px;
            background: var(--primary-light);
            border-bottom: 1px solid var(--border-color);
          }
          
          .exam-title {
            font-size: 1.4rem;
            margin: 0;
            color: var(--primary);
          }
          
          .exam-meta {
            display: flex;
            gap: 16px;
            margin-top: 4px;
            font-size: 0.85rem;
            color: var(--text-secondary);
          }
          
          .exam-timer {
            display: flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 30px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
          }

          .exam-timer.warning {
            background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
            animation: pulse-slow 2s infinite;
          }

          .exam-timer.critical {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            animation: pulse 1s infinite;
          }

          .timer-icon {
            font-size: 1.4rem;
          }

          .exam-timer.warning .timer-icon,
          .exam-timer.critical .timer-icon {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) infinite;
          }

          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(231, 76, 60, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
            }
          }

          @keyframes pulse-slow {
            0% {
              box-shadow: 0 0 0 0 rgba(243, 156, 18, 0.7);
            }
            70% {
              box-shadow: 0 0 0 7px rgba(243, 156, 18, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(243, 156, 18, 0);
            }
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
          }

          .timer-icon {
            font-size: 1.4rem;
            animation: pulse 1.5s infinite;
          }
          
          .time-display {
            font-size: 1.2rem;
            font-weight: 600;
            letter-spacing: 1px;
          }
          
          .exam-body {
            display: flex;
            flex-grow: 1;
            overflow: hidden;
          }
          
          /* Sidebar */
          .question-sidebar {
            width: 280px;
            padding: 16px;
            border-right: 1px solid var(--border-color);
            background: #f8f9fa;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          
          .question-status-legend {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border-color);
          }
          
          .status-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
          }
          
          .status-indicator {
            width: 16px;
            height: 16px;
            border-radius: 4px;
          }
          
          .question-nav h3 {
            margin-bottom: 12px;
            font-size: 1rem;
          }
          
          .question-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
          }
          
          .question-number {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
            border: 1px solid #ddd;
          }
          
          .question-number.current {
            border: 2px solid var(--primary);
            background: var(--primary-light);
            transform: scale(1.05);
          }
          
          .not-answered {
            background: white;
          }
          
          .answered {
            background: #d4edda;
            border-color: #c3e6cb;
          }
          
          .marked-for-review {
            background: #fff3cd;
            border-color: #ffeeba;
          }
          
          /* Main question area */
          .question-main {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            padding: 20px;
            overflow-y: auto;
          }
          
          .question-container {
            display: flex;
            flex-direction: column;
            gap: 24px;
            flex-grow: 1;
          }
          
          .question-header {
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border-color);
          }
          
          .question-header h2 {
            margin: 0;
            font-size: 1.2rem;
            color: var(--text-secondary);
          }
          
          .question-content {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
          
          .question-text {
            font-size: 1.2rem;
            font-weight: 500;
            line-height: 1.5;
          }
          
          .options-container {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-bottom: 24px;
          }
          
          .option {
            display: flex;
            padding: 16px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .option:hover {
            border-color: var(--primary);
            background: var(--primary-light);
            transform: translateY(-2px);
          }
          
          .selected-option {
            display: flex;
            padding: 16px;
            border: 2px solid var(--primary);
            border-radius: 8px;
            background: var(--primary-light);
            cursor: pointer;
            position: relative;
          }
          
          .option-marker {
            width: 30px;
            height: 30px;
            min-width: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: var(--light-accent);
            margin-right: 16px;
            font-weight: 600;
          }
          
          .selected-option .option-marker {
            background: var(--primary);
            color: white;
          }
          
          .option-text {
            flex-grow: 1;
            margin-top: 5px;
          }
          
          .question-actions {
            display: flex;
            justify-content: space-between;
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid var(--border-color);
          }
          
          .action-button {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
            background: var(--light-accent);
            color: var(--text-primary);
          }
          
          .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          .action-button.primary {
            background: var(--primary);
            color: white;
          }
          
          .action-button.primary:hover {
            background: var(--primary-dark);
          }
          
          .action-button.submit {
            background: var(--success);
            color: white;
          }
          
          .action-button.submit:hover {
            background: #27ae60;
          }
          
          .action-button.review {
            background: #ffeeba;
            color: #856404;
          }
          
          .action-button.review:hover {
            background: #fff3cd;
          }
          
          .action-button.review.active {
            background: #fff3cd;
            border: 1px solid #ffeeba;
          }
          
          /* Result Page Styling */
          .result-container {
            padding: 24px;
          }
          
          .result-card {
            background: white;
            border-radius: 12px;
            box-shadow: var(--box-shadow);
            overflow: hidden;
          }
          
          .result-header {
            padding: 24px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: white;
            text-align: center;
          }
          
          .result-header h1 {
            margin: 0 0 8px 0;
            font-size: 2rem;
          }
          
          .result-content {
            padding: 32px;
          }
          
          .result-summary {
            display: flex;
            gap: 48px;
          }
          
          .result-stats {
            flex-grow: 1;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
          
          .stat-item {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 16px;
            border-radius: 8px;
            background: var(--light-accent);
          }
          
          .stat-label {
            font-size: 1rem;
            color: var(--text-secondary);
          }
          
          .stat-value {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text-primary);
          }
          
          .stat-item.verdict {
            grid-column: span 2;
            background: var(--primary-light);
          }
          
          .stat-value.pass {
            color: var(--success);
          }
          
          .stat-value.fail {
            color: var(--danger);
          }
          
          .result-actions {
            display: flex;
            justify-content: center;
            gap: 16px;
            margin-top: 32px;
          }
          
          /* Review Page Styling */
          .review-container {
            padding: 24px;
          }
          
          .review-header {
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border-color);
          }
          
          .review-header h1 {
            margin: 0 0 8px 0;
            font-size: 1.8rem;
            color: var(--primary);
          }
          
          .review-header h2 {
            margin: 0;
            color: var(--text-secondary);
            font-size: 1.2rem;
          }
          
          .review-item {
            padding: 24px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border-left: 5px solid transparent;
          }
          
          .review-item.correct {
            border-left-color: var(--success);
            background: var(--success-light);
          }
          
          .review-item.incorrect {
            border-left-color: var(--danger);
            background: var(--danger-light);
          }
          
          .review-question {
            margin-bottom: 16px;
          }
          
          .question-number {
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--text-secondary);
          }
          
          .question-text {
            font-size: 1.1rem;
            line-height: 1.5;
          }
          
          .review-options {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 16px;
          }
          
          .review-option {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            border-radius: 4px;
            background: white;
            border: 1px solid var(--border-color);
          }
          
          .review-option.correct-option {
            border-color: var(--success);
            background: var(--success-light);
          }
          
          .review-option.wrong-option {
            border-color: var(--danger);
            background: var(--danger-light);
          }
          
          .option-marker {
            font-weight: 600;
            margin-right: 12px;
            width: 24px;
          }
          
          .correct-icon {
            margin-left: auto;
            color: var(--success);
            font-size: 1.2rem;
          }
          
          .wrong-icon {
            margin-left: auto;
            color: var(--danger);
            font-size: 1.2rem;
          }
          
          .review-explanation {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px dashed var(--border-color);
            display: flex;
            gap: 32px;
          }
          
          .your-answer,
          .correct-answer {
            font-size: 0.9rem;
          }
          
          .review-actions {
            display: flex;
            justify-content: center;
            gap: 16px;
            margin-top: 32px;
          }
          
          /* Animations */
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }
          
          /* Responsive adjustments */
          @media (max-width: 992px) {
            .exam-body {
              flex-direction: column;
            }
            
            .question-sidebar {
              width: 100%;
              border-right: 0;
              border-bottom: 1px solid var(--border-color);
            }
            
            .question-grid {
              grid-template-columns: repeat(6, 1fr);
            }
            
            .result-summary {
              flex-direction: column;
            }
          }
          
          @media (max-width: 768px) {
            .exam-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
            }
            
            .exam-timer {
              align-self: flex-end;
            }
            
            .question-actions {
              flex-wrap: wrap;
              gap: 10px;
            }
            
            .result-stats {
              grid-template-columns: 1fr;
            }
            
            .stat-item.verdict {
              grid-column: span 1;
            }
            
            .review-explanation {
              flex-direction: column;
              gap: 8px;
            }
          }
          
          .exam-timer.warning {
            background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
            animation: pulse 1.5s infinite;
          }
          
          .exam-timer.critical {
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
            animation: pulse 0.8s infinite;
          }
          
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.4);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(255, 82, 82, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(255, 82, 82, 0);
            }
          }
        `}</style>
      </div>
    )
  );
}

export default WriteExam;
