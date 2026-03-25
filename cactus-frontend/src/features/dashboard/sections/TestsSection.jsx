import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  createTest,
  getTest,
  getTestLeaderboard,
  listAttempts,
  listTests,
  submitTest,
  updateTest,
} from "../../../lib/api/tests";
import { getErrorMessage } from "../../../lib/api/client";
import { useAuth } from "../../../context/AuthContext";

const blankOption = () => ({ text: "", isCorrect: false });

const blankQuestion = () => ({
  question: "",
  explanation: "",
  options: [
    { text: "", isCorrect: true },
    blankOption(),
    blankOption(),
    blankOption(),
  ],
});

const TestsSection = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [playTest, setPlayTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [lastResult, setLastResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: "general",
      difficulty: "beginner",
      durationInMinutes: 15,
      isPublished: true,
      questions: [blankQuestion()],
    },
  });

  const questionsArray = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const watchedQuestions = useWatch({
    control: form.control,
    name: "questions",
  });

  const userId = user?._id || user?.id;

  const formatMarksAndPercentage = (correctAnswers, totalQuestions, score) => {
    if (!Number.isFinite(correctAnswers) || !Number.isFinite(totalQuestions)) {
      return `${score}%`;
    }

    return `${correctAnswers}/${totalQuestions} (${score}%)`;
  };

  const refresh = async () => {
    try {
      const [testsData, attemptsData] = await Promise.all([
        listTests(),
        listAttempts(),
      ]);
      setTests(testsData);
      setAttempts(attemptsData);
    } catch (error) {
      toast({ title: getErrorMessage(error), status: "error" });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const [testsData, attemptsData] = await Promise.all([
          listTests(),
          listAttempts(),
        ]);

        if (isMounted) {
          setTests(testsData);
          setAttempts(attemptsData);
        }
      } catch (error) {
        if (isMounted) {
          toast({ title: getErrorMessage(error), status: "error" });
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  // Update leaderboard when test is selected
  useEffect(() => {
    let isMounted = true;

    const loadLeaderboard = async () => {
      if (!selectedTestId) {
        setLeaderboard([]);
        return;
      }

      try {
        const leaderboardData = await getTestLeaderboard(selectedTestId);
        if (isMounted) {
          setLeaderboard(leaderboardData.attempts || []);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to load leaderboard:", error);
          setLeaderboard([]);
        }
      }
    };

    loadLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [selectedTestId]);

  const visibleTests = useMemo(
    () =>
      [...tests].sort((left, right) => {
        if (left.isPublished !== right.isPublished) {
          return left.isPublished ? -1 : 1;
        }

        return new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
      }),
    [tests],
  );

  const selectedTest = useMemo(
    () => visibleTests.find((test) => test._id === selectedTestId) || null,
    [selectedTestId, visibleTests],
  );

  const isSelectedTestOwner =
    (selectedTest?.owner?._id ||
      selectedTest?.owner?.id ||
      selectedTest?.owner) === userId;

  const ownerTests = useMemo(
    () =>
      visibleTests.filter(
        (test) => (test.owner?._id || test.owner?.id || test.owner) === userId,
      ),
    [userId, visibleTests],
  );

  const stats = useMemo(() => {
    const avg = attempts.length
      ? Math.round(
          attempts.reduce((sum, item) => sum + item.score, 0) / attempts.length,
        )
      : 0;

    return { avg };
  }, [attempts]);

  const setCorrectOption = (questionIndex, selectedOptionIndex) => {
    const currentOptions =
      form.getValues(`questions.${questionIndex}.options`) || [];
    const nextOptions = currentOptions.map((option, optionIndex) => ({
      ...option,
      isCorrect: optionIndex === selectedOptionIndex,
    }));

    form.setValue(`questions.${questionIndex}.options`, nextOptions, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const addOption = (questionIndex) => {
    const currentOptions =
      form.getValues(`questions.${questionIndex}.options`) || [];
    form.setValue(
      `questions.${questionIndex}.options`,
      [...currentOptions, blankOption()],
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  const removeOption = (questionIndex, optionIndex) => {
    const currentOptions =
      form.getValues(`questions.${questionIndex}.options`) || [];
    if (currentOptions.length <= 4) {
      return;
    }

    const nextOptions = currentOptions.filter(
      (_, currentIndex) => currentIndex !== optionIndex,
    );
    if (!nextOptions.some((option) => option.isCorrect) && nextOptions.length) {
      nextOptions[0].isCorrect = true;
    }

    form.setValue(`questions.${questionIndex}.options`, nextOptions, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleCreateTest = async (values) => {
    const tempId = `tmp-${crypto.randomUUID()}`;
    const publishNow = values.isPublished !== false;
    const optimisticTest = {
      _id: tempId,
      title: values.title,
      description: values.description,
      category: values.category,
      difficulty: values.difficulty,
      durationInMinutes: values.durationInMinutes,
      questions: values.questions,
      isPublished: publishNow,
      owner: {
        _id: userId,
        fullName: user?.fullName,
        email: user?.email,
      },
      createdAt: new Date().toISOString(),
    };

    setTests((prev) => [optimisticTest, ...prev]);

    try {
      const created = await createTest({
        ...values,
        isPublished: publishNow,
        questions: values.questions.map((question) => ({
          ...question,
          options: question.options.map((option) => ({ ...option })),
        })),
      });
      setTests((prev) =>
        prev.map((test) => (test._id === tempId ? created : test)),
      );
      toast({
        title: publishNow ? "Test created and published" : "Draft test created",
        status: "success",
      });
      form.reset({
        title: "",
        description: "",
        category: "general",
        difficulty: "beginner",
        durationInMinutes: 15,
        isPublished: true,
        questions: [blankQuestion()],
      });
    } catch (error) {
      setTests((prev) => prev.filter((test) => test._id !== tempId));
      toast({ title: getErrorMessage(error), status: "error" });
    }
  };

  const onCreateTest = form.handleSubmit(handleCreateTest);

  const startTest = async () => {
    if (!selectedTestId) {
      return;
    }

    try {
      toast({ title: "Loading test", status: "info", duration: 1200 });
      const [test, leaderboardData] = await Promise.all([
        getTest(selectedTestId),
        getTestLeaderboard(selectedTestId),
      ]);
      setPlayTest(test);
      setLeaderboard(leaderboardData.attempts || []);
      setAnswers({});
      setLastResult(null);
      toast({ title: "Test ready", status: "success" });
    } catch (error) {
      toast({ title: getErrorMessage(error), status: "error" });
    }
  };

  const submitActiveTest = async () => {
    if (!playTest) {
      return;
    }

    const payload = {
      answers: Object.entries(answers).map(([questionId, optionId]) => ({
        questionId,
        optionId,
      })),
    };

    try {
      toast({ title: "Submitting answers", status: "info", duration: 1200 });
      const result = await submitTest(playTest._id, payload);
      setLastResult(result);
      await refresh();
      const leaderboardData = await getTestLeaderboard(playTest._id);
      setLeaderboard(leaderboardData.attempts || []);
      toast({
        title: `Scored ${formatMarksAndPercentage(result.correctAnswers, result.totalQuestions, result.score)}`,
        status: "success",
      });
    } catch (error) {
      toast({ title: getErrorMessage(error), status: "error" });
    }
  };

  const togglePublish = async (test) => {
    const previousTests = tests;
    setTests((prev) =>
      prev.map((item) =>
        item._id === test._id
          ? { ...item, isPublished: !item.isPublished }
          : item,
      ),
    );

    try {
      const updated = await updateTest(test._id, {
        isPublished: !test.isPublished,
      });
      setTests((prev) =>
        prev.map((item) => (item._id === test._id ? updated : item)),
      );
      if (selectedTestId === test._id) {
        setPlayTest((prev) =>
          prev ? { ...prev, isPublished: updated.isPublished } : prev,
        );
      }
      toast({
        title: updated.isPublished ? "Test published" : "Test unpublished",
        status: "success",
      });
    } catch (error) {
      setTests(previousTests);
      toast({ title: getErrorMessage(error), status: "error" });
    }
  };

  const closeTest = () => {
    setPlayTest(null);
    setAnswers({});
    setLastResult(null);
    // Keep leaderboard state visible after closing modal
  };

  return (
    <>
      <Stack spacing={5}>
        <Accordion allowToggle defaultIndex={[]}>
          <AccordionItem border="none">
            <Card>
              <CardBody>
                <AccordionButton px={0} _hover={{ bg: "transparent" }}>
                  <Box flex="1" textAlign="left">
                    <Heading size="md">Test Builder</Heading>
                    <Text color="gray.400" mt={1}>
                      Collapse this when you want the attempt area to take
                      focus.
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel px={0} pb={0} pt={4}>
                  <form onSubmit={onCreateTest}>
                    <Stack spacing={4}>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                        <FormControl>
                          <FormLabel>Title</FormLabel>
                          <Input
                            placeholder="Test title"
                            {...form.register("title", { required: true })}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Category</FormLabel>
                          <Input
                            placeholder="Category"
                            {...form.register("category")}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Duration</FormLabel>
                          <Input
                            type="number"
                            min={1}
                            {...form.register("durationInMinutes", {
                              valueAsNumber: true,
                            })}
                          />
                        </FormControl>
                      </SimpleGrid>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <FormControl>
                          <FormLabel>Difficulty</FormLabel>
                          <Select {...form.register("difficulty")}>
                            <option value="beginner">beginner</option>
                            <option value="intermediate">intermediate</option>
                            <option value="advanced">advanced</option>
                          </Select>
                        </FormControl>
                        <FormControl
                          display="flex"
                          alignItems="center"
                          gap={3}
                          pt={{ base: 0, md: 8 }}
                        >
                          <Controller
                            control={form.control}
                            name="isPublished"
                            render={({ field: { value, onChange } }) => (
                              <Checkbox
                                colorScheme="green"
                                isChecked={Boolean(value)}
                                onChange={(event) =>
                                  onChange(event.target.checked)
                                }
                              >
                                Publish immediately so other users can see this
                                test
                              </Checkbox>
                            )}
                          />
                        </FormControl>
                      </SimpleGrid>

                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                          placeholder="Short description for the test"
                          {...form.register("description")}
                        />
                      </FormControl>

                      {questionsArray.fields.map((field, questionIndex) => {
                        const currentQuestion =
                          watchedQuestions?.[questionIndex] || field;
                        const currentOptions = currentQuestion.options || [];
                        const selectedCorrectIndex = Math.max(
                          currentOptions.findIndex(
                            (option) => option.isCorrect,
                          ),
                          0,
                        );

                        return (
                          <Box
                            key={field.id}
                            p={4}
                            border="1px solid"
                            borderColor="whiteAlpha.300"
                            borderRadius="2xl"
                            bg="blackAlpha.300"
                          >
                            <Stack spacing={3}>
                              <HStack justify="space-between" align="center">
                                <Heading size="sm">
                                  Question {questionIndex + 1}
                                </Heading>
                                {questionsArray.fields.length > 1 ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() =>
                                      questionsArray.remove(questionIndex)
                                    }
                                  >
                                    Remove
                                  </Button>
                                ) : null}
                              </HStack>

                              <Input
                                placeholder={`Question ${questionIndex + 1}`}
                                {...form.register(
                                  `questions.${questionIndex}.question`,
                                  { required: true },
                                )}
                              />
                              <Textarea
                                placeholder="Explanation shown after submission"
                                {...form.register(
                                  `questions.${questionIndex}.explanation`,
                                )}
                              />

                              <FormControl>
                                <FormLabel>Correct option</FormLabel>
                                <Select
                                  value={selectedCorrectIndex}
                                  onChange={(event) =>
                                    setCorrectOption(
                                      questionIndex,
                                      Number(event.target.value),
                                    )
                                  }
                                >
                                  {currentOptions.map((_, optionIndex) => (
                                    <option
                                      key={optionIndex}
                                      value={optionIndex}
                                    >
                                      Option {optionIndex + 1}
                                    </option>
                                  ))}
                                </Select>
                              </FormControl>

                              <Divider borderColor="whiteAlpha.300" />

                              <Stack spacing={3}>
                                {currentOptions.map((option, optionIndex) => (
                                  <HStack
                                    key={`${field.id}-${optionIndex}`}
                                    align="start"
                                    spacing={3}
                                  >
                                    <Radio
                                      isChecked={
                                        selectedCorrectIndex === optionIndex
                                      }
                                      onChange={() =>
                                        setCorrectOption(
                                          questionIndex,
                                          optionIndex,
                                        )
                                      }
                                      mt={2}
                                      colorScheme="green"
                                    >
                                      <Text fontSize="sm">Correct</Text>
                                    </Radio>
                                    <Input
                                      placeholder={`Option ${optionIndex + 1}`}
                                      {...form.register(
                                        `questions.${questionIndex}.options.${optionIndex}.text`,
                                        { required: true },
                                      )}
                                    />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                      onClick={() =>
                                        removeOption(questionIndex, optionIndex)
                                      }
                                      isDisabled={currentOptions.length <= 4}
                                    >
                                      Remove
                                    </Button>
                                  </HStack>
                                ))}
                              </Stack>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addOption(questionIndex)}
                              >
                                Add Option
                              </Button>
                            </Stack>
                          </Box>
                        );
                      })}

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => questionsArray.append(blankQuestion())}
                        >
                          Add Question
                        </Button>
                        <Button
                          type="submit"
                          isLoading={form.formState.isSubmitting}
                        >
                          Create Test
                        </Button>
                      </SimpleGrid>
                    </Stack>
                  </form>
                </AccordionPanel>
              </CardBody>
            </Card>
          </AccordionItem>
        </Accordion>

        <Card>
          <CardBody>
            <Heading size="md" mb={2}>
              Attempt Tests
            </Heading>
            <Text color="gray.400" mb={5}>
              Published tests are visible to everyone. Drafts stay private to
              their author.
            </Text>

            <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={5}>
              <Stack spacing={3}>
                <Select
                  placeholder="Select test"
                  value={selectedTestId}
                  onChange={(event) => setSelectedTestId(event.target.value)}
                >
                  {visibleTests.map((test) => (
                    <option key={test._id} value={test._id}>
                      {test.title}
                    </option>
                  ))}
                </Select>
                <Button onClick={startTest} isDisabled={!selectedTestId}>
                  Load Test
                </Button>
                {selectedTest &&
                (selectedTest.owner?._id ||
                  selectedTest.owner?.id ||
                  selectedTest.owner) === userId ? (
                  <Button
                    variant="outline"
                    onClick={() => togglePublish(selectedTest)}
                  >
                    {selectedTest.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                ) : null}

                <Stack spacing={3}>
                  {visibleTests.map((test) => {
                    const isOwner =
                      (test.owner?._id || test.owner?.id || test.owner) ===
                      userId;

                    return (
                      <Box
                        key={test._id}
                        p={4}
                        borderRadius="xl"
                        border="1px solid"
                        borderColor={
                          selectedTestId === test._id
                            ? "cactus.500"
                            : "whiteAlpha.300"
                        }
                        bg={
                          selectedTestId === test._id
                            ? "rgba(23, 46, 30, 0.75)"
                            : "blackAlpha.300"
                        }
                      >
                        <HStack justify="space-between" align="start" mb={2}>
                          <Box>
                            <Text fontWeight="bold">{test.title}</Text>
                            <Text color="gray.400" fontSize="sm">
                              {test.category || "general"} · {test.difficulty}
                            </Text>
                          </Box>
                          <Badge
                            colorScheme={test.isPublished ? "green" : "orange"}
                          >
                            {test.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </HStack>
                        <Text color="gray.500" fontSize="xs" mb={1}>
                          by{" "}
                          {test.owner?.fullName ||
                            test.owner?.email ||
                            "Unknown author"}
                        </Text>
                        <Text color="gray.400" fontSize="sm" mb={3}>
                          {test.description || "No description provided."}
                        </Text>
                        <HStack>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTestId(test._id)}
                          >
                            Select
                          </Button>
                          {isOwner ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => togglePublish(test)}
                            >
                              {test.isPublished ? "Unpublish" : "Publish"}
                            </Button>
                          ) : null}
                        </HStack>
                      </Box>
                    );
                  })}
                </Stack>
              </Stack>

              <Box gridColumn={{ base: "auto", xl: "span 2" }}>
                <Box
                  p={8}
                  borderRadius="2xl"
                  border="1px dashed"
                  borderColor="whiteAlpha.300"
                  bg="blackAlpha.200"
                >
                  <Heading size="sm" mb={2}>
                    {playTest
                      ? "Test is open in full-screen mode"
                      : "Select a test to begin"}
                  </Heading>
                  <Text color="gray.400">
                    {playTest
                      ? "Focus on your test in the modal above."
                      : "The builder can stay collapsed while this area becomes your main testing surface."}
                  </Text>
                </Box>
              </Box>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mt={6}>
              <Box
                p={4}
                borderRadius="2xl"
                border="1px solid"
                borderColor="whiteAlpha.300"
                bg="blackAlpha.200"
              >
                <Heading size="sm" mb={3}>
                  Leaderboard
                </Heading>
                <List spacing={3}>
                  {leaderboard.slice(0, 10).map((entry) => (
                    <ListItem
                      key={entry._id}
                      p={3}
                      borderRadius="lg"
                      bg="blackAlpha.300"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                    >
                      <HStack justify="space-between" align="start">
                        <Box>
                          <Text fontWeight="semibold">
                            #{entry.rank}{" "}
                            {entry.user?.fullName ||
                              entry.user?.email ||
                              "Unknown user"}
                          </Text>
                          <Text color="gray.500" fontSize="sm">
                            {new Date(entry.createdAt).toLocaleString()}
                          </Text>
                        </Box>
                        <Stack align="end" spacing={2}>
                          <Badge colorScheme="green">
                            {formatMarksAndPercentage(
                              entry.correctAnswers,
                              entry.totalQuestions,
                              entry.score,
                            )}
                          </Badge>
                          {(isSelectedTestOwner ||
                            (entry.user?._id ||
                              entry.user?.id ||
                              entry.user) === userId) && (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                navigate(`/tests/attempts/${entry._id}`)
                              }
                            >
                              View Result
                            </Button>
                          )}
                        </Stack>
                      </HStack>
                    </ListItem>
                  ))}
                  {!leaderboard.length ? (
                    <Text color="gray.500">No attempts yet for this test.</Text>
                  ) : null}
                </List>
              </Box>

              <Box
                p={4}
                borderRadius="2xl"
                border="1px solid"
                borderColor="whiteAlpha.300"
                bg="blackAlpha.200"
              >
                <Heading size="sm" mb={3}>
                  Your Attempt History
                </Heading>
                <List spacing={3}>
                  {attempts.map((attempt) => (
                    <ListItem
                      key={attempt._id}
                      p={3}
                      borderRadius="lg"
                      bg="blackAlpha.300"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                    >
                      <HStack justify="space-between" align="start">
                        <Box>
                          <Text fontWeight="semibold">
                            {attempt.test?.title || "Untitled test"}
                          </Text>
                          <Text color="gray.400" fontSize="sm">
                            {formatMarksAndPercentage(
                              attempt.correctAnswers,
                              attempt.totalQuestions,
                              attempt.score,
                            )}{" "}
                            · {new Date(attempt.createdAt).toLocaleString()}
                          </Text>
                        </Box>
                        <Stack align="end" spacing={2}>
                          <Badge colorScheme="green">
                            {formatMarksAndPercentage(
                              attempt.correctAnswers,
                              attempt.totalQuestions,
                              attempt.score,
                            )}
                          </Badge>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() =>
                              navigate(`/tests/attempts/${attempt._id}`)
                            }
                          >
                            View Result
                          </Button>
                        </Stack>
                      </HStack>
                    </ListItem>
                  ))}
                  {!attempts.length ? (
                    <Text color="gray.500">No attempts yet.</Text>
                  ) : null}
                </List>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Heading size="sm" mb={3}>
              Created By You ({ownerTests.length})
            </Heading>
            <Text color="cactus.100" mb={3}>
              Average score: {stats.avg}%
            </Text>
            <Stack spacing={2}>
              {ownerTests.slice(0, 8).map((test) => (
                <Box
                  key={test._id}
                  p={2}
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  borderRadius="md"
                >
                  <HStack justify="space-between" align="center">
                    <Box>
                      <Text>{test.title}</Text>
                      <Text color="gray.500" fontSize="sm">
                        {test.category || "general"} · {test.difficulty}
                      </Text>
                    </Box>
                    <Badge colorScheme={test.isPublished ? "green" : "orange"}>
                      {test.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </HStack>
                </Box>
              ))}
              {!ownerTests.length ? (
                <Text color="gray.400">
                  You have not created any tests yet.
                </Text>
              ) : null}
            </Stack>
          </CardBody>
        </Card>
      </Stack>

      <Modal
        isOpen={Boolean(playTest)}
        onClose={closeTest}
        size="4xl"
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
        <ModalContent
          bg="blackAlpha.900"
          border="1px solid"
          borderColor="whiteAlpha.300"
          maxH="90vh"
        >
          <ModalHeader
            borderBottom="1px solid"
            borderColor="whiteAlpha.300"
            pb={4}
          >
            <HStack justify="space-between" align="start">
              <Box flex="1">
                <Heading size="lg">{playTest?.title}</Heading>
                <Text color="gray.400" fontSize="sm" mt={2}>
                  {playTest?.description ||
                    "Answer all questions carefully and submit when ready."}
                </Text>
              </Box>
              <Badge colorScheme="green" ml={4}>
                {playTest?.questions.length} Questions
              </Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top={6} right={6} />

          <ModalBody py={6}>
            {playTest ? (
              <Stack spacing={5}>
                {playTest.questions.map((question, questionIndex) => (
                  <Box
                    key={question._id}
                    p={5}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    bg="rgba(6, 12, 8, 0.5)"
                    _hover={{
                      bg: "rgba(6, 12, 8, 0.7)",
                      borderColor: "whiteAlpha.300",
                    }}
                  >
                    <HStack justify="space-between" align="start" mb={3}>
                      <Text fontWeight="bold" fontSize="lg" color="cactus.100">
                        {questionIndex + 1}. {question.question}
                      </Text>
                      {answers[question._id] ? (
                        <Badge colorScheme="green" variant="solid" ml={2}>
                          ✓
                        </Badge>
                      ) : (
                        <Badge variant="outline" ml={2}>
                          Pending
                        </Badge>
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
                            transition="all 0.2s"
                            _hover={{
                              borderColor: "cactus.400",
                              bg: "rgba(23, 46, 30, 0.2)",
                            }}
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
              </Stack>
            ) : null}
          </ModalBody>

          <Box borderTop="1px solid" borderColor="whiteAlpha.300" p={4}>
            {!lastResult ? (
              <HStack
                justify="space-between"
                align="center"
                wrap="wrap"
                spacing={3}
              >
                <Text color="gray.400" fontSize="sm">
                  Answered {Object.keys(answers).length} of{" "}
                  {playTest?.questions.length}
                </Text>
                <HStack spacing={2}>
                  <Button variant="outline" onClick={closeTest}>
                    Close
                  </Button>
                  <Button
                    colorScheme="green"
                    onClick={submitActiveTest}
                    isDisabled={
                      Object.keys(answers).length !== playTest?.questions.length
                    }
                  >
                    Submit Answers
                  </Button>
                </HStack>
              </HStack>
            ) : null}

            {lastResult ? (
              <Stack spacing={4}>
                <Box
                  p={4}
                  borderRadius="lg"
                  bg="rgba(23, 46, 30, 0.3)"
                  border="1px solid"
                  borderColor="cactus.500"
                >
                  <HStack justify="space-between" align="center" mb={3}>
                    <Heading size="sm" color="cactus.100">
                      ✓ Test Submitted Successfully!
                    </Heading>
                    <Badge colorScheme="green" fontSize="md">
                      {formatMarksAndPercentage(
                        lastResult.correctAnswers,
                        lastResult.totalQuestions,
                        lastResult.score,
                      )}
                    </Badge>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                    <Stat>
                      <StatLabel>Your Score</StatLabel>
                      <StatNumber color="cactus.100">
                        {formatMarksAndPercentage(
                          lastResult.correctAnswers,
                          lastResult.totalQuestions,
                          lastResult.score,
                        )}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Correct</StatLabel>
                      <StatNumber>
                        {lastResult.correctAnswers}/{lastResult.totalQuestions}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Status</StatLabel>
                      <StatNumber>
                        {lastResult.score >= 70 ? (
                          <Text color="green.400">Passed</Text>
                        ) : (
                          <Text color="orange.400">Review</Text>
                        )}
                      </StatNumber>
                    </Stat>
                  </SimpleGrid>
                </Box>
                <Button w="full" onClick={closeTest}>
                  Done
                </Button>
              </Stack>
            ) : null}
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TestsSection;
