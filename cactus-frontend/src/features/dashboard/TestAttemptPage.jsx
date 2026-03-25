import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Radio,
  RadioGroup,
  Spinner,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useToast,
} from "@chakra-ui/react";
import CactusShell from "../../components/layout/CactusShell";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../lib/api/client";
import { getTest, submitTest } from "../../lib/api/tests";
import ExitConfirmationModal from "./ExitConfirmationModal";
import { FocusedCactus, HappyCactus } from "./CactusSVGs";

const TestAttemptPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuth();

  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [lastResult, setLastResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [hasShownFiveMinuteWarning, setHasShownFiveMinuteWarning] =
    useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingExitAction, setPendingExitAction] = useState(null);

  const hasInProgressAttempt = Boolean(test) && !lastResult && !isSubmitting;

  const formatMarksAndPercentage = (correctAnswers, totalQuestions, score) => {
    if (!Number.isFinite(correctAnswers) || !Number.isFinite(totalQuestions)) {
      return `${score}%`;
    }

    return `${correctAnswers}/${totalQuestions} (${score}%)`;
  };

  const formatSeconds = (totalSeconds) => {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
      return "00:00";
    }

    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, "0");

    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    let isMounted = true;

    const loadTest = async () => {
      if (!testId) {
        navigate("/", { replace: true });
        return;
      }

      try {
        setIsLoading(true);
        const loadedTest = await getTest(testId);

        if (!isMounted) {
          return;
        }

        setTest(loadedTest);
        setLastResult(null);
        setAnswers({});
        setRemainingSeconds(
          loadedTest.hasTimer
            ? Math.max(1, Number(loadedTest.durationInMinutes) || 15) * 60
            : null,
        );
        setHasShownFiveMinuteWarning(false);
      } catch (error) {
        if (isMounted) {
          toast({ title: getErrorMessage(error), status: "error" });
          navigate("/", { replace: true });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTest();

    return () => {
      isMounted = false;
    };
  }, [navigate, testId, toast]);

  // Push history entry to prevent back navigation during test
  useEffect(() => {
    if (!test) {
      return;
    }

    window.history.pushState({ testAttempt: true }, "");

    const handlePopState = (event) => {
      if (!hasInProgressAttempt) {
        return;
      }

      event.preventDefault();
      setShowExitConfirm(true);
      setPendingExitAction("back");
      // Push history again to prevent going back
      window.history.pushState({ testAttempt: true }, "");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [test, hasInProgressAttempt]);

  const submitActiveTest = useCallback(
    async (options = {}) => {
      if (!test || isSubmitting || lastResult) {
        return;
      }

      const { isAutoSubmit = false } = options;
      const payload = {
        answers: Object.entries(answers).map(([questionId, optionId]) => ({
          questionId,
          optionId,
        })),
      };

      try {
        setIsSubmitting(true);
        toast({
          title: isAutoSubmit
            ? "Time is up, auto-submitting..."
            : "Submitting answers",
          status: "info",
          duration: 1200,
        });

        const result = await submitTest(test._id, payload);
        setLastResult(result);
        toast({
          title: `Scored ${formatMarksAndPercentage(result.correctAnswers, result.totalQuestions, result.score)}`,
          status: "success",
        });
      } catch (error) {
        toast({ title: getErrorMessage(error), status: "error" });
      } finally {
        setIsSubmitting(false);
      }
    },
    [answers, isSubmitting, lastResult, test, toast],
  );

  useEffect(() => {
    if (!test?.hasTimer || lastResult || remainingSeconds === null) {
      return;
    }

    if (remainingSeconds === 300 && !hasShownFiveMinuteWarning) {
      setHasShownFiveMinuteWarning(true);
      toast({
        title: "5 minutes remaining",
        status: "warning",
        duration: 2000,
      });
    }

    if (remainingSeconds === 0) {
      void submitActiveTest({ isAutoSubmit: true });
      return;
    }

    const intervalId = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) {
          return prev;
        }

        return Math.max(prev - 1, 0);
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [
    hasShownFiveMinuteWarning,
    lastResult,
    remainingSeconds,
    submitActiveTest,
    test?.hasTimer,
    toast,
  ]);

  useEffect(() => {
    if (!hasInProgressAttempt) {
      return;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasInProgressAttempt]);

  const handlePendingExit = () => {
    setShowExitConfirm(false);
    if (pendingExitAction === "logout") {
      logout();
    } else if (pendingExitAction === "dashboard") {
      navigate("/");
    } else if (pendingExitAction === "back") {
      navigate(-1);
    }
    setPendingExitAction(null);
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
    setPendingExitAction(null);
  };

  const goToDashboard = () => {
    if (!hasInProgressAttempt) {
      navigate("/");
      return;
    }

    setShowExitConfirm(true);
    setPendingExitAction("dashboard");
  };

  const handleLogout = () => {
    if (!hasInProgressAttempt) {
      logout();
      return;
    }

    setShowExitConfirm(true);
    setPendingExitAction("logout");
  };

  return (
    <CactusShell
      title="Attempt Test"
      subtitle="Focused test mode with optional timer and auto-submit support."
      userName={user?.fullName || user?.email || "Cactus User"}
      onLogout={handleLogout}
    >
      <Stack spacing={5}>
        <HStack justify="space-between" align="center" wrap="wrap" spacing={8}>
          <Box>
            <Heading size="lg">{test?.title || "Loading test..."}</Heading>
            <Text color="gray.400" mt={1}>
              {test?.description ||
                "Answer all questions and submit when ready."}
            </Text>
          </Box>
          <Box display="flex" justifyContent="center">
            <FocusedCactus />
          </Box>
          <HStack>
            <Button variant="outline" onClick={goToDashboard}>
              Back To Dashboard
            </Button>
            {!test?.hasTimer ? (
              <Badge variant="subtle">Untimed Test</Badge>
            ) : null}
          </HStack>
        </HStack>

        {/* Sticky floating timer — always visible while scrolling */}
        {test?.hasTimer && !lastResult ? (
          <Box
            position="fixed"
            top="80px"
            right="24px"
            zIndex={100}
            px={4}
            py={3}
            borderRadius="xl"
            border="2px solid"
            borderColor={remainingSeconds <= 300 ? "orange.400" : "cactus.500"}
            bg={
              remainingSeconds <= 300
                ? "rgba(60,30,0,0.92)"
                : "rgba(10,30,15,0.92)"
            }
            boxShadow="0 4px 32px rgba(0,0,0,0.5)"
            backdropFilter="blur(8px)"
          >
            <Text fontSize="xs" color="gray.400" textAlign="center" mb={0.5}>
              Time Left
            </Text>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color={remainingSeconds <= 300 ? "orange.300" : "cactus.200"}
              letterSpacing="widest"
              textAlign="center"
            >
              {formatSeconds(remainingSeconds)}
            </Text>
          </Box>
        ) : null}

        {isLoading ? (
          <HStack spacing={3}>
            <Spinner color="cactus.300" />
            <Text color="gray.400">Loading test...</Text>
          </HStack>
        ) : null}

        {!isLoading && test && !lastResult ? (
          <Stack spacing={5}>
            {(test.questions || []).map((question, questionIndex) => (
              <Box
                key={question._id}
                p={5}
                borderRadius="xl"
                border="1px solid"
                borderColor="whiteAlpha.200"
                bg="blackAlpha.300"
              >
                <HStack justify="space-between" align="start" mb={3}>
                  <Text fontWeight="bold" fontSize="lg" color="cactus.100">
                    {questionIndex + 1}. {question.question}
                  </Text>
                  {answers[question._id] ? (
                    <Badge colorScheme="green">Answered</Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </HStack>

                <RadioGroup
                  value={answers[question._id] || ""}
                  onChange={(next) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [question._id]: next,
                    }))
                  }
                >
                  <Stack spacing={2}>
                    {question.options.map((option) => (
                      <Box
                        key={option._id}
                        p={3}
                        borderRadius="lg"
                        border="2px solid"
                        borderColor={
                          answers[question._id] === option._id
                            ? "cactus.500"
                            : "whiteAlpha.200"
                        }
                        bg={
                          answers[question._id] === option._id
                            ? "rgba(23, 46, 30, 0.4)"
                            : "blackAlpha.300"
                        }
                        cursor="pointer"
                      >
                        <Radio value={option._id} colorScheme="green">
                          <Text>{option.text}</Text>
                        </Radio>
                      </Box>
                    ))}
                  </Stack>
                </RadioGroup>
              </Box>
            ))}

            <HStack justify="space-between" align="center" wrap="wrap">
              <Text color="gray.400" fontSize="sm">
                Answered {Object.keys(answers).length} of{" "}
                {test.questions.length}
              </Text>
              <Button
                colorScheme="green"
                onClick={() => void submitActiveTest()}
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
              >
                {test.hasTimer ? "Submit Now" : "Submit Answers"}
              </Button>
            </HStack>
          </Stack>
        ) : null}

        {lastResult ? (
          <Box
            p={5}
            borderRadius="xl"
            border="1px solid"
            borderColor="cactus.500"
            bg="rgba(23, 46, 30, 0.35)"
          >
            <HStack spacing={6} mb={4}>
              <Box>
                <Heading size="md" mb={2} color="cactus.100">
                  Test Submitted
                </Heading>
                <Text color="gray.300">
                  Great work. You can review your detailed result now.
                </Text>
              </Box>
              <Box display="flex" justifyContent="center">
                <HappyCactus />
              </Box>
            </HStack>
            <HStack justify="space-between" align="start" wrap="wrap">
              <Stat maxW="xs">
                <StatLabel>Score</StatLabel>
                <StatNumber>
                  {formatMarksAndPercentage(
                    lastResult.correctAnswers,
                    lastResult.totalQuestions,
                    lastResult.score,
                  )}
                </StatNumber>
              </Stat>
              <HStack>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Back To Dashboard
                </Button>
                {lastResult.attemptId ? (
                  <Button
                    colorScheme="green"
                    onClick={() =>
                      navigate(`/tests/attempts/${lastResult.attemptId}`)
                    }
                  >
                    View Detailed Result
                  </Button>
                ) : null}
              </HStack>
            </HStack>
          </Box>
        ) : null}
      </Stack>

      <ExitConfirmationModal
        isOpen={showExitConfirm}
        onConfirm={handlePendingExit}
        onCancel={handleCancelExit}
      />
    </CactusShell>
  );
};

export default TestAttemptPage;
