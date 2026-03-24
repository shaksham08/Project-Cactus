import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProgress,
  deleteProgress,
  listProgress,
  updateProgress,
} from "../../../lib/api/progress";
import { getErrorMessage } from "../../../lib/api/client";

const schema = z.object({
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  status: z
    .enum(["not-started", "learning", "revision", "completed"])
    .default("learning"),
  progressPercentage: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
});

const ProgressSection = () => {
  const [items, setItems] = useState([]);
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

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const data = await listProgress();
        if (isMounted) {
          setItems(data);
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

  const onQuickProgress = async (item, nextValue) => {
    const previousItem = item;
    setItems((prev) =>
      prev.map((entry) =>
        entry._id === item._id
          ? {
              ...entry,
              progressPercentage: nextValue,
            }
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
      toast({ title: "Progress updated", status: "success" });
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
    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
      <Card>
        <CardBody>
          <Heading size="md" mb={4}>
            Track Progress
          </Heading>
          <form onSubmit={onCreate}>
            <Stack spacing={3}>
              <FormControl>
                <FormLabel>Subject</FormLabel>
                <Input placeholder="Chemistry" {...form.register("subject")} />
              </FormControl>
              <FormControl>
                <FormLabel>Topic</FormLabel>
                <Input
                  placeholder="Organic reactions"
                  {...form.register("topic")}
                />
              </FormControl>
              <SimpleGrid columns={2} spacing={3}>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select {...form.register("status")}>
                    <option value="not-started">not-started</option>
                    <option value="learning">learning</option>
                    <option value="revision">revision</option>
                    <option value="completed">completed</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Progress %</FormLabel>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    {...form.register("progressPercentage")}
                  />
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  placeholder="What still needs work?"
                  {...form.register("notes")}
                />
              </FormControl>
              <Button type="submit" isLoading={form.formState.isSubmitting}>
                Save Progress
              </Button>
            </Stack>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Heading size="md" mb={4}>
            Progress Board ({items.length})
          </Heading>
          <Stack spacing={4}>
            {items.map((item) => (
              <Box
                key={item._id}
                p={3}
                border="1px solid"
                borderColor="whiteAlpha.300"
                borderRadius="lg"
              >
                <Text fontWeight="bold">{item.subject}</Text>
                <Text color="gray.300" mb={2}>
                  {item.topic}
                </Text>
                <Progress
                  value={item.progressPercentage}
                  size="sm"
                  borderRadius="full"
                  mb={2}
                />
                <SimpleGrid columns={2} spacing={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onQuickProgress(
                        item,
                        Math.min(item.progressPercentage + 10, 100),
                      )
                    }
                  >
                    +10%
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => onDelete(item._id)}
                  >
                    Delete
                  </Button>
                </SimpleGrid>
              </Box>
            ))}
            {!items.length ? (
              <Text color="gray.400">No progress items yet.</Text>
            ) : null}
          </Stack>
        </CardBody>
      </Card>
    </SimpleGrid>
  );
};

export default ProgressSection;
