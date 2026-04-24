import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
  Textarea,
  Tooltip,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProgress,
  deleteProgress,
  listProgress,
  updateProgress,
} from "../../../lib/api/progress";
import { getErrorMessage } from "../../../lib/api/client";
import { HappyCactus } from "../CactusSVGs";

const STATUS_CONFIG = {
  "not-started": { label: "Not Started", colorScheme: "gray" },
  learning: { label: "Learning", colorScheme: "blue" },
  revision: { label: "In Revision", colorScheme: "orange" },
  completed: { label: "Completed", colorScheme: "green" },
};

const getScheme = (pct) => {
  if (pct >= 100) return "green";
  if (pct >= 75) return "blue";
  if (pct >= 50) return "yellow";
  if (pct >= 25) return "orange";
  return "red";
};

const FormSlider = ({ value, onChange }) => {
  const [showTip, setShowTip] = useState(false);
  return (
    <Slider
      min={0}
      max={100}
      step={5}
      value={value}
      onChange={onChange}
      colorScheme={getScheme(value)}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <SliderTrack h={2} borderRadius="full">
        <SliderFilledTrack />
      </SliderTrack>
      <Tooltip hasArrow label={`${value}%`} isOpen={showTip} placement="top">
        <SliderThumb boxSize={5} />
      </Tooltip>
    </Slider>
  );
};

const CardSlider = ({ item, onUpdate }) => {
  const [localVal, setLocalVal] = useState(item.progressPercentage);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    setLocalVal(item.progressPercentage);
  }, [item.progressPercentage]);

  return (
    <Slider
      min={0}
      max={100}
      step={5}
      value={localVal}
      onChange={setLocalVal}
      onChangeEnd={(v) => onUpdate(item, v)}
      colorScheme={getScheme(localVal)}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <SliderTrack h="6px" borderRadius="full">
        <SliderFilledTrack />
      </SliderTrack>
      <Tooltip hasArrow label={`${localVal}%`} isOpen={showTip} placement="top">
        <SliderThumb boxSize={4} />
      </Tooltip>
    </Slider>
  );
};

const schema = z.object({
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  status: z
    .enum(["not-started", "learning", "revision", "completed"])
    .default("learning"),
  progressPercentage: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
});

const editSchema = z.object({
  subject: z.string().min(1, "Required"),
  topic: z.string().min(1, "Required"),
  status: z.enum(["not-started", "learning", "revision", "completed"]),
  progressPercentage: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
});

const ProgressSection = () => {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const editModal = useDisclosure();
  const toast = useToast();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      subject: "",
      topic: "",
      status: "learning",
      progressPercentage: 30,
      notes: "",
    },
  });

  const editForm = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      subject: "",
      topic: "",
      status: "learning",
      progressPercentage: 0,
      notes: "",
    },
  });

  const watchedPct = form.watch("progressPercentage");
  const editedPct = editForm.watch("progressPercentage");

  const openEdit = (item) => {
    setEditingItem(item);
    editForm.reset({
      subject: item.subject,
      topic: item.topic,
      status: item.status,
      progressPercentage: item.progressPercentage,
      notes: item.notes ?? "",
    });
    editModal.onOpen();
  };

  useEffect(() => {
    let isMounted = true;
    const bootstrap = async () => {
      try {
        const data = await listProgress();
        if (isMounted) setItems(data);
      } catch (error) {
        if (isMounted)
          toast({ title: getErrorMessage(error), status: "error" });
      }
    };
    bootstrap();
    return () => {
      isMounted = false;
    };
  }, [toast]);

  const handleCreate = async (values) => {
    const tempId = `tmp-${crypto.randomUUID()}`;
    const optimisticItem = {
      _id: tempId,
      ...values,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setItems((prev) => [optimisticItem, ...prev]);
    form.reset({
      subject: "",
      topic: "",
      status: "learning",
      progressPercentage: 30,
      notes: "",
    });
    try {
      const created = await createProgress(values);
      setItems((prev) =>
        prev.map((item) => (item._id === tempId ? created : item)),
      );
      toast({ title: "Progress item added", status: "success" });
    } catch (error) {
      setItems((prev) => prev.filter((item) => item._id !== tempId));
      toast({ title: getErrorMessage(error), status: "error" });
    }
  };

  const onCreate = form.handleSubmit(handleCreate);

  const handleEdit = editForm.handleSubmit(async (values) => {
    if (!editingItem) return;
    const previousItem = editingItem;
    setItems((prev) =>
      prev.map((entry) =>
        entry._id === editingItem._id ? { ...entry, ...values } : entry,
      ),
    );
    editModal.onClose();
    try {
      const updated = await updateProgress(editingItem._id, values);
      setItems((prev) =>
        prev.map((entry) => (entry._id === editingItem._id ? updated : entry)),
      );
      toast({ title: "Progress updated", status: "success" });
    } catch (error) {
      setItems((prev) =>
        prev.map((entry) =>
          entry._id === editingItem._id ? previousItem : entry,
        ),
      );
      toast({ title: getErrorMessage(error), status: "error" });
    }
  });

  const onQuickProgress = async (item, nextValue) => {
    const previousItem = item;
    setItems((prev) =>
      prev.map((entry) =>
        entry._id === item._id
          ? { ...entry, progressPercentage: nextValue }
          : entry,
      ),
    );
    try {
      const updated = await updateProgress(item._id, {
        progressPercentage: nextValue,
      });
      setItems((prev) =>
        prev.map((entry) => (entry._id === item._id ? updated : entry)),
      );
    } catch (error) {
      setItems((prev) =>
        prev.map((entry) => (entry._id === item._id ? previousItem : entry)),
      );
      toast({ title: getErrorMessage(error), status: "error" });
    }
  };

  const onDelete = async (progressId) => {
    const previousItems = items;
    setItems((prev) => prev.filter((item) => item._id !== progressId));
    try {
      await deleteProgress(progressId);
      toast({ title: "Progress removed", status: "info" });
    } catch (error) {
      setItems(previousItems);
      toast({ title: getErrorMessage(error), status: "error" });
    }
  };

  return (
    <>
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
        {/* â”€â”€ Add Progress Form â”€â”€ */}
        <Card>
          <CardBody>
            <Heading size="md" mb={5}>
              Track New Progress
            </Heading>
            <form onSubmit={onCreate}>
              <Stack spacing={4}>
                <SimpleGrid columns={2} spacing={3}>
                  <FormControl isInvalid={!!form.formState.errors.subject}>
                    <FormLabel fontSize="sm">Subject</FormLabel>
                    <Input
                      placeholder="e.g. Chemistry"
                      {...form.register("subject")}
                    />
                    {form.formState.errors.subject && (
                      <Text color="red.400" fontSize="xs" mt={1}>
                        {form.formState.errors.subject.message}
                      </Text>
                    )}
                  </FormControl>
                  <FormControl isInvalid={!!form.formState.errors.topic}>
                    <FormLabel fontSize="sm">Topic</FormLabel>
                    <Input
                      placeholder="e.g. Organic reactions"
                      {...form.register("topic")}
                    />
                    {form.formState.errors.topic && (
                      <Text color="red.400" fontSize="xs" mt={1}>
                        {form.formState.errors.topic.message}
                      </Text>
                    )}
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel fontSize="sm">Status</FormLabel>
                  <Select {...form.register("status")}>
                    {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <Flex justify="space-between" align="baseline" mb={3}>
                    <FormLabel fontSize="sm" mb={0}>
                      Current Progress
                    </FormLabel>
                    <HStack spacing={1} align="baseline">
                      <Text
                        fontSize="3xl"
                        fontWeight="bold"
                        lineHeight={1}
                        color={`${getScheme(watchedPct)}.400`}
                      >
                        {watchedPct}
                      </Text>
                      <Text
                        fontSize="lg"
                        color={`${getScheme(watchedPct)}.400`}
                        fontWeight="semibold"
                      >
                        %
                      </Text>
                    </HStack>
                  </Flex>
                  <Controller
                    name="progressPercentage"
                    control={form.control}
                    render={({ field }) => (
                      <FormSlider
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Text fontSize="xs" color="gray.500" mt={3}>
                    {100 - watchedPct > 0
                      ? `${100 - watchedPct}% remaining to complete`
                      : "✓ 100% - Fully completed!"}
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">
                    Notes{" "}
                    <Text as="span" color="gray.500" fontWeight="normal">
                      (optional)
                    </Text>
                  </FormLabel>
                  <Textarea
                    placeholder="What still needs work? Any key points?"
                    rows={3}
                    {...form.register("notes")}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="green"
                  isLoading={form.formState.isSubmitting}
                >
                  Save Progress
                </Button>
              </Stack>
            </form>
          </CardBody>
        </Card>

        {/* â”€â”€ Progress Board â”€â”€ */}
        <Card>
          <CardBody>
            <Flex justify="space-between" align="center" mb={5}>
              <Heading size="md">Progress Board</Heading>
              <Badge
                colorScheme="gray"
                px={2}
                py={1}
                borderRadius="md"
                fontSize="sm"
              >
                {items.length} {items.length === 1 ? "subject" : "subjects"}
              </Badge>
            </Flex>

            <Stack spacing={4} maxH="600px" overflowY="auto" pr={1}>
              {items.map((item) => {
                const pct = Math.round(item.progressPercentage);
                const remaining = 100 - pct;
                const scheme = getScheme(pct);
                const statusCfg =
                  STATUS_CONFIG[item.status] ?? STATUS_CONFIG.learning;
                return (
                  <Box
                    key={item._id}
                    p={4}
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    borderRadius="xl"
                    bg="whiteAlpha.50"
                    position="relative"
                    overflow="hidden"
                    _hover={{ borderColor: "whiteAlpha.400" }}
                    transition="border-color 0.2s"
                  >
                    {/* Top accent stripe */}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      h="3px"
                      bgGradient={`linear(to-r, ${scheme}.500, ${scheme}.300)`}
                    />

                    <Flex justify="space-between" align="flex-start" gap={3}>
                      <VStack align="start" spacing={1} flex={1} minW={0}>
                        <HStack spacing={2} flexWrap="wrap">
                          <Text fontWeight="bold" fontSize="md" noOfLines={1}>
                            {item.subject}
                          </Text>
                          <Badge
                            colorScheme={statusCfg.colorScheme}
                            fontSize="2xs"
                            px={2}
                            borderRadius="full"
                          >
                            {statusCfg.label}
                          </Badge>
                        </HStack>
                        <Text color="gray.400" fontSize="sm" noOfLines={1}>
                          {item.topic}
                        </Text>
                        {item.notes ? (
                          <Text color="gray.500" fontSize="xs" noOfLines={2}>
                            {item.notes}
                          </Text>
                        ) : (
                          <Text
                            color="gray.600"
                            fontSize="xs"
                            fontStyle="italic"
                          >
                            No notes â€” click Edit to add details
                          </Text>
                        )}
                      </VStack>

                      {/* Circular progress */}
                      <CircularProgress
                        value={pct}
                        size="72px"
                        thickness="10px"
                        colorScheme={scheme}
                        trackColor="whiteAlpha.100"
                        flexShrink={0}
                      >
                        <CircularProgressLabel fontSize="xs" fontWeight="bold">
                          {pct}%
                        </CircularProgressLabel>
                      </CircularProgress>
                    </Flex>

                    {/* Stats row */}
                    <Flex justify="space-between" align="center" mt={3} mb={1}>
                      <Text fontSize="xs" color="gray.400">
                        {remaining > 0
                          ? `${remaining}% left to complete`
                          : "âœ… Completed!"}
                      </Text>
                      <Text
                        fontSize="xs"
                        color={`${scheme}.400`}
                        fontWeight="semibold"
                      >
                        {pct}% done
                      </Text>
                    </Flex>

                    {/* Drag slider */}
                    <Box pb={2}>
                      <CardSlider item={item} onUpdate={onQuickProgress} />
                    </Box>

                    <Flex justify="space-between" align="center" mt={2}>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme={scheme}
                        onClick={() => openEdit(item)}
                      >
                        Edit Details
                      </Button>
                      <Button
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => onDelete(item._id)}
                      >
                        Remove
                      </Button>
                    </Flex>
                  </Box>
                );
              })}

              {!items.length && (
                <Box textAlign="center" py={8}>
                  <Box
                    display="flex"
                    justifyContent="center"
                    transform="scale(0.8)"
                  >
                    <HappyCactus />
                  </Box>
                  <Text color="gray.400" mt={2}>
                    No progress items yet. Start tracking!
                  </Text>
                </Box>
              )}
            </Stack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* â”€â”€ Edit Modal â”€â”€ */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.onClose}
        isCentered
        size="md"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="bold">
                Edit Progress
              </Text>
              {editingItem && (
                <Text fontSize="sm" color="gray.400" fontWeight="normal">
                  {editingItem.subject} â€” {editingItem.topic}
                </Text>
              )}
            </VStack>
          </ModalHeader>
          <ModalCloseButton />

          <form onSubmit={handleEdit}>
            <ModalBody>
              <Stack spacing={4}>
                <SimpleGrid columns={2} spacing={3}>
                  <FormControl>
                    <FormLabel fontSize="sm">Subject</FormLabel>
                    <Input {...editForm.register("subject")} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm">Topic</FormLabel>
                    <Input {...editForm.register("topic")} />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel fontSize="sm">Status</FormLabel>
                  <Select {...editForm.register("status")}>
                    {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <Flex justify="space-between" align="baseline" mb={3}>
                    <FormLabel fontSize="sm" mb={0}>
                      Progress
                    </FormLabel>
                    <HStack spacing={1} align="baseline">
                      <Text
                        fontSize="2xl"
                        fontWeight="bold"
                        lineHeight={1}
                        color={`${getScheme(editedPct)}.400`}
                      >
                        {editedPct}
                      </Text>
                      <Text
                        fontSize="md"
                        color={`${getScheme(editedPct)}.400`}
                        fontWeight="semibold"
                      >
                        %
                      </Text>
                    </HStack>
                  </Flex>
                  <Controller
                    name="progressPercentage"
                    control={editForm.control}
                    render={({ field }) => (
                      <FormSlider
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Flex justify="space-between" mt={2}>
                    <Text fontSize="xs" color="gray.500">
                      {100 - editedPct > 0
                        ? `${100 - editedPct}% still remaining`
                        : "✓ Fully completed!"}
                    </Text>
                    <Text fontSize="xs" color={`${getScheme(editedPct)}.400`}>
                      {editedPct}% done
                    </Text>
                  </Flex>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">What&apos;s left / Notes</FormLabel>
                  <Textarea
                    placeholder="Describe what still needs work, key topics remaining, or any blockers..."
                    rows={4}
                    {...editForm.register("notes")}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    This shows on the card so you always know what to tackle
                    next.
                  </Text>
                </FormControl>
              </Stack>
            </ModalBody>

            <ModalFooter gap={2}>
              <Button variant="ghost" onClick={editModal.onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="green"
                isLoading={editForm.formState.isSubmitting}
              >
                Save Changes
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProgressSection;
