import { useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Circle,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
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
  createTodo,
  deleteTodo,
  listTodos,
  updateTodo,
} from "../../../lib/api/todos";
import { getErrorMessage } from "../../../lib/api/client";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["pending", "in-progress", "completed"]).default("pending"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().optional(),
});

const columns = [
  { key: "pending", title: "Backlog", accent: "orange.300" },
  { key: "in-progress", title: "In Progress", accent: "blue.300" },
  { key: "completed", title: "Done", accent: "cactus.300" },
];

const TodosSection = () => {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const tempIdCounterRef = useRef(0);

  const getTempId = () => {
    tempIdCounterRef.current += 1;
    return `tmp-${tempIdCounterRef.current}`;
  };

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      dueDate: "",
    },
  });

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      setIsLoading(true);
      try {
        const items = await listTodos();
        if (isMounted) {
          setTodos(items);
        }
      } catch (error) {
        if (isMounted) {
          toast({ title: getErrorMessage(error), status: "error" });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const onCreate = form.handleSubmit(async (values) => {
    const tempId = getTempId();
    const optimisticTodo = {
      _id: tempId,
      title: values.title,
      description: values.description || "",
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTodos((prev) => [optimisticTodo, ...prev]);
    form.reset();

    try {
      const created = await createTodo({
        ...values,
        dueDate: values.dueDate || undefined,
      });
      setTodos((prev) =>
        prev.map((todo) => (todo._id === tempId ? created : todo)),
      );
      toast({ title: "Todo created", status: "success" });
    } catch (error) {
      setTodos((prev) => prev.filter((todo) => todo._id !== tempId));
      toast({ title: getErrorMessage(error), status: "error" });
    }
  });

  const onStatusChange = async (todoId, status) => {
    const previousTodo = todos.find((todo) => todo._id === todoId);
    if (!previousTodo) {
      return;
    }

    setTodos((prev) =>
      prev.map((todo) =>
        todo._id === todoId
          ? {
              ...todo,
              status,
              completedAt:
                status === "completed" ? new Date().toISOString() : null,
            }
          : todo,
      ),
    );

    try {
      const updated = await updateTodo(todoId, { status });
      setTodos((prev) =>
        prev.map((todo) => (todo._id === todoId ? updated : todo)),
      );
      toast({ title: "Todo updated", status: "success" });
    } catch (error) {
      setTodos((prev) =>
        prev.map((todo) => (todo._id === todoId ? previousTodo : todo)),
      );
      toast({ title: getErrorMessage(error), status: "error" });
    }
  };

  const onDelete = async (todoId) => {
    const previousTodos = todos;
    setTodos((prev) => prev.filter((todo) => todo._id !== todoId));

    try {
      await deleteTodo(todoId);
      toast({ title: "Todo deleted", status: "info" });
    } catch (error) {
      setTodos(previousTodos);
      toast({ title: getErrorMessage(error), status: "error" });
    }
  };

  const groupedTodos = columns.map((column) => ({
    ...column,
    items: todos.filter((todo) => todo.status === column.key),
  }));

  const completedCount = todos.filter(
    (todo) => todo.status === "completed",
  ).length;

  return (
    <Stack spacing={5}>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Card>
          <CardBody>
            <Text
              color="gray.400"
              fontSize="sm"
              textTransform="uppercase"
              letterSpacing="0.14em"
            >
              Total Tasks
            </Text>
            <Heading mt={2}>{todos.length}</Heading>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text
              color="gray.400"
              fontSize="sm"
              textTransform="uppercase"
              letterSpacing="0.14em"
            >
              In Motion
            </Text>
            <Heading mt={2}>
              {todos.filter((todo) => todo.status === "in-progress").length}
            </Heading>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Text
              color="gray.400"
              fontSize="sm"
              textTransform="uppercase"
              letterSpacing="0.14em"
            >
              Completed
            </Text>
            <Heading mt={2}>{completedCount}</Heading>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={5}>
        <Card gridColumn={{ base: "auto", xl: "span 1" }}>
          <CardBody>
            <Heading size="md" mb={4}>
              Create Task
            </Heading>
            <form onSubmit={onCreate}>
              <Stack spacing={3}>
                <FormControl>
                  <FormLabel>Title</FormLabel>
                  <Input
                    placeholder="Finish biology revision"
                    {...form.register("title")}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    placeholder="Optional details"
                    {...form.register("description")}
                  />
                </FormControl>
                <SimpleGrid columns={2} spacing={3}>
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select {...form.register("status")}>
                      <option value="pending">pending</option>
                      <option value="in-progress">in-progress</option>
                      <option value="completed">completed</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Priority</FormLabel>
                    <Select {...form.register("priority")}>
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
                <FormControl>
                  <FormLabel>Due Date</FormLabel>
                  <Input type="datetime-local" {...form.register("dueDate")} />
                </FormControl>
                <Button type="submit" isLoading={form.formState.isSubmitting}>
                  Create Todo
                </Button>
              </Stack>
            </form>
          </CardBody>
        </Card>

        <Card gridColumn={{ base: "auto", xl: "span 2" }}>
          <CardBody>
            <Heading size="md" mb={4}>
              Mission Board
            </Heading>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4}>
              {groupedTodos.map((column) => (
                <Box
                  key={column.key}
                  p={4}
                  minH="380px"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  bg="blackAlpha.300"
                >
                  <HStack justify="space-between" mb={4}>
                    <HStack spacing={3}>
                      <Circle size="10px" bg={column.accent} />
                      <Text fontWeight="semibold">{column.title}</Text>
                    </HStack>
                    <Badge colorScheme="green">{column.items.length}</Badge>
                  </HStack>

                  <Stack spacing={3}>
                    {column.items.map((todo) => (
                      <Box
                        key={todo._id}
                        p={4}
                        borderRadius="xl"
                        bg="rgba(10, 16, 12, 0.94)"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                      >
                        <HStack justify="space-between" align="start" mb={2}>
                          <Box>
                            <Text fontWeight="bold">{todo.title}</Text>
                            {todo.description ? (
                              <Text color="gray.400" fontSize="sm" mt={1}>
                                {todo.description}
                              </Text>
                            ) : null}
                          </Box>
                          <Badge
                            colorScheme={
                              todo.priority === "high"
                                ? "red"
                                : todo.priority === "medium"
                                  ? "yellow"
                                  : "green"
                            }
                          >
                            {todo.priority}
                          </Badge>
                        </HStack>

                        {todo.dueDate ? (
                          <Text color="gray.500" fontSize="xs" mb={3}>
                            Due {new Date(todo.dueDate).toLocaleString()}
                          </Text>
                        ) : null}

                        <Stack spacing={2}>
                          <Select
                            size="sm"
                            value={todo.status}
                            onChange={(event) =>
                              onStatusChange(todo._id, event.target.value)
                            }
                          >
                            <option value="pending">pending</option>
                            <option value="in-progress">in-progress</option>
                            <option value="completed">completed</option>
                          </Select>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => onDelete(todo._id)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Box>
                    ))}

                    {!column.items.length && !isLoading ? (
                      <Box
                        p={4}
                        borderRadius="lg"
                        border="1px dashed"
                        borderColor="whiteAlpha.300"
                      >
                        <Text color="gray.500" fontSize="sm">
                          No tasks in {column.title.toLowerCase()}.
                        </Text>
                      </Box>
                    ) : null}
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Stack>
  );
};

export default TodosSection;
