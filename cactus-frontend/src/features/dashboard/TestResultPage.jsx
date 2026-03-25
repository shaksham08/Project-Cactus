import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  SimpleGrid,
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
import { getAttemptDetails } from "../../lib/api/tests";
import { HappyCactus } from "./CactusSVGs";

const TestResultPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuth();

  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatMarksAndPercentage = (correctAnswers, totalQuestions, score) => {
    if (!Number.isFinite(correctAnswers) || !Number.isFinite(totalQuestions)) {
      return `${score}%`;
    }

    return `${correctAnswers}/${totalQuestions} (${score}%)`;
  };

  useEffect(() => {
    let isMounted = true;

    const loadDetails = async () => {
      if (!attemptId) {
        navigate("/", { replace: true });
        return;
      }

      try {
        setIsLoading(true);
        const result = await getAttemptDetails(attemptId);

        if (isMounted) {
          setDetails(result);
        }
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

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [attemptId, navigate, toast]);

  const status = useMemo(() => {
    const score = details?.attempt?.score ?? 0;
    return score >= 70 ? "Passed" : "Review";
  }, [details]);

  return (
    <CactusShell
      title="Test Result Review"
      subtitle="See attempt outcome with full question-by-question analysis."
      userName={user?.fullName || user?.email || "Cactus User"}
      onLogout={logout}
    >
      <Stack spacing={5}>
        <HStack justify="space-between" align="center" wrap="wrap" spacing={8}>
          <Box>
            <Heading size="lg">
              {details?.test?.title || "Attempt Result"}
            </Heading>
            <Text color="gray.400" mt={1}>
              {details?.user?.fullName || details?.user?.email
                ? `Attempted by ${details?.user?.fullName || details?.user?.email}`
                : "Attempt details"}
            </Text>
          </Box>
          <Box display="flex" justifyContent="center">
            <HappyCactus />
          </Box>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back To Dashboard
          </Button>
        </HStack>

        {isLoading ? (
          <HStack spacing={3}>
            <Spinner color="cactus.300" />
            <Text color="gray.400">Loading result details...</Text>
          </HStack>
        ) : null}

        {!isLoading && details?.attempt ? (
          <>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
              <Stat
                p={4}
                border="1px solid"
                borderColor="whiteAlpha.300"
                borderRadius="xl"
                bg="blackAlpha.300"
              >
                <StatLabel>Score</StatLabel>
                <StatNumber color="cactus.100">
                  {formatMarksAndPercentage(
                    details.attempt.correctAnswers,
                    details.attempt.totalQuestions,
                    details.attempt.score,
                  )}
                </StatNumber>
              </Stat>

              <Stat
                p={4}
                border="1px solid"
                borderColor="whiteAlpha.300"
                borderRadius="xl"
                bg="blackAlpha.300"
              >
                <StatLabel>Correct</StatLabel>
                <StatNumber>{details.attempt.correctAnswers}</StatNumber>
              </Stat>

              <Stat
                p={4}
                border="1px solid"
                borderColor="whiteAlpha.300"
                borderRadius="xl"
                bg="blackAlpha.300"
              >
                <StatLabel>Wrong</StatLabel>
                <StatNumber>{details.attempt.incorrectAnswers}</StatNumber>
              </Stat>

              <Stat
                p={4}
                border="1px solid"
                borderColor="whiteAlpha.300"
                borderRadius="xl"
                bg="blackAlpha.300"
              >
                <StatLabel>Status</StatLabel>
                <StatNumber>
                  <Text
                    color={status === "Passed" ? "green.400" : "orange.300"}
                  >
                    {status}
                  </Text>
                </StatNumber>
              </Stat>
            </SimpleGrid>

            <Stack spacing={4}>
              {(details.review || []).map((item) => (
                <Box
                  key={item.questionId}
                  p={4}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={item.isCorrect ? "green.500" : "orange.500"}
                  bg="blackAlpha.300"
                >
                  <HStack justify="space-between" align="start" mb={2}>
                    <Text fontWeight="bold" color="cactus.100">
                      Q{item.questionNumber}. {item.question}
                    </Text>
                    <Badge colorScheme={item.isCorrect ? "green" : "orange"}>
                      {item.isCorrect ? "Correct" : "Incorrect"}
                    </Badge>
                  </HStack>

                  <Stack spacing={2} mt={3}>
                    {item.options.map((option) => {
                      const isSelected = option._id === item.selectedOptionId;
                      const isCorrectOption =
                        option._id === item.correctOptionId;

                      return (
                        <HStack
                          key={option._id}
                          p={2}
                          borderRadius="md"
                          border="1px solid"
                          borderColor={
                            isCorrectOption
                              ? "green.500"
                              : isSelected
                                ? "orange.500"
                                : "whiteAlpha.300"
                          }
                          bg={
                            isCorrectOption
                              ? "rgba(24, 80, 48, 0.35)"
                              : isSelected
                                ? "rgba(154, 52, 18, 0.25)"
                                : "blackAlpha.300"
                          }
                          justify="space-between"
                          align="start"
                        >
                          <Text>{option.text}</Text>
                          <HStack spacing={2}>
                            {isSelected ? (
                              <Badge colorScheme="orange" variant="subtle">
                                Your choice
                              </Badge>
                            ) : null}
                            {isCorrectOption ? (
                              <Badge colorScheme="green" variant="subtle">
                                Right answer
                              </Badge>
                            ) : null}
                          </HStack>
                        </HStack>
                      );
                    })}
                  </Stack>

                  {!item.isCorrect && item.explanation ? (
                    <Text color="gray.300" mt={3} fontSize="sm">
                      Explanation: {item.explanation}
                    </Text>
                  ) : null}
                </Box>
              ))}
            </Stack>
          </>
        ) : null}
      </Stack>
    </CactusShell>
  );
};

export default TestResultPage;
