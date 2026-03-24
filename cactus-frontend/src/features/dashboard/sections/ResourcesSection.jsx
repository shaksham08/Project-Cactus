import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createResource,
  deleteResource,
  listResources,
  updateResource,
} from "../../../lib/api/resources";
import { getErrorMessage } from "../../../lib/api/client";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Enter a valid URL"),
  type: z
    .enum(["youtube", "blog", "article", "course", "documentation", "other"])
    .default("other"),
  description: z.string().optional(),
});

const ResourcesSection = () => {
  const [resources, setResources] = useState([]);
  const toast = useToast();
  const sortedResources = useMemo(
    () =>
      [...resources].sort((left, right) => {
        if (left.isFavorite !== right.isFavorite) {
          return left.isFavorite ? -1 : 1;
        }

        return (
          new Date(right.updatedAt || right.createdAt || 0) -
          new Date(left.updatedAt || left.createdAt || 0)
        );
      }),
    [resources],
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      url: "",
      type: "other",
      description: "",
    },
  });

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const data = await listResources();
        if (isMounted) {
          setResources(data);
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
    const optimisticResource = {
      _id: tempId,
      ...values,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setResources((prev) => [optimisticResource, ...prev]);
    form.reset({ title: "", url: "", type: "other", description: "" });

    try {
      const created = await createResource(values);
      setResources((prev) =>
        prev.map((resource) => (resource._id === tempId ? created : resource)),
      );
      toast({ title: "Resource added", status: "success" });
    } catch (error) {
      setResources((prev) =>
        prev.filter((resource) => resource._id !== tempId),
      );
      toast({ title: getErrorMessage(error), status: "error" });
    }
  };

  const onCreate = form.handleSubmit(handleCreate);

  const onFavorite = async (resource) => {
    const previousResource = resource;
    setResources((prev) =>
      prev.map((item) =>
        item._id === resource._id
          ? {
              ...item,
              isFavorite: !item.isFavorite,
            }
          : item,
      ),
    );

    try {
      const updated = await updateResource(resource._id, {
        isFavorite: !resource.isFavorite,
      });
      setResources((prev) =>
        prev.map((item) => (item._id === resource._id ? updated : item)),
      );
      toast({ title: "Resource updated", status: "success" });
    } catch (error) {
      setResources((prev) =>
        prev.map((item) =>
          item._id === resource._id ? previousResource : item,
        ),
      );
      toast({ title: getErrorMessage(error), status: "error" });
    }
  };

  const onDelete = async (resourceId) => {
    const previousResources = resources;
    setResources((prev) =>
      prev.filter((resource) => resource._id !== resourceId),
    );

    try {
      await deleteResource(resourceId);
      toast({ title: "Resource removed", status: "info" });
    } catch (error) {
      setResources(previousResources);
      toast({ title: getErrorMessage(error), status: "error" });
    }
  };

  return (
    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
      <Card>
        <CardBody>
          <Heading size="md" mb={4}>
            Add Resource
          </Heading>
          <form onSubmit={onCreate}>
            <Stack spacing={3}>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  placeholder="Amazing tutorial"
                  {...form.register("title")}
                />
              </FormControl>
              <FormControl>
                <FormLabel>URL</FormLabel>
                <Input placeholder="https://..." {...form.register("url")} />
              </FormControl>
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Select {...form.register("type")}>
                  <option value="youtube">youtube</option>
                  <option value="blog">blog</option>
                  <option value="article">article</option>
                  <option value="course">course</option>
                  <option value="documentation">documentation</option>
                  <option value="other">other</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Why this resource matters"
                  {...form.register("description")}
                />
              </FormControl>
              <Button type="submit" isLoading={form.formState.isSubmitting}>
                Save Resource
              </Button>
            </Stack>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Heading size="md" mb={4}>
            Resource Vault ({resources.length})
          </Heading>
          <Text color="gray.400" mb={4}>
            Favorites stay pinned at the top for quick access.
          </Text>
          <Stack spacing={3}>
            {sortedResources.map((resource) => (
              <Box
                key={resource._id}
                p={3}
                border="1px solid"
                borderColor={
                  resource.isFavorite ? "cactus.400" : "whiteAlpha.300"
                }
                borderRadius="lg"
                bg={
                  resource.isFavorite ? "rgba(33, 74, 45, 0.45)" : "transparent"
                }
                boxShadow={
                  resource.isFavorite
                    ? "0 0 0 1px rgba(122, 219, 140, 0.2), 0 16px 32px rgba(0, 0, 0, 0.18)"
                    : "none"
                }
              >
                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  spacing={3}
                  alignItems="start"
                >
                  <Box>
                    <Text fontWeight="bold">{resource.title}</Text>
                    {resource.isFavorite ? (
                      <Text
                        color="cactus.200"
                        fontSize="xs"
                        mt={1}
                        textTransform="uppercase"
                        letterSpacing="0.12em"
                      >
                        Favorite resource
                      </Text>
                    ) : null}
                  </Box>
                  <Text
                    textAlign={{ base: "left", md: "right" }}
                    color="gray.500"
                    fontSize="sm"
                  >
                    {resource.type}
                  </Text>
                </SimpleGrid>
                <Link href={resource.url} isExternal color="cactus.200">
                  {resource.url}
                </Link>
                {resource.description ? (
                  <Text fontSize="sm" color="gray.400" mt={2} mb={2}>
                    {resource.description}
                  </Text>
                ) : null}
                <SimpleGrid columns={2} spacing={2}>
                  <FormControl display="flex" alignItems="center" gap={2}>
                    <Switch
                      isChecked={resource.isFavorite}
                      onChange={() => onFavorite(resource)}
                    />
                    <FormLabel m={0}>
                      {resource.isFavorite ? "Pinned" : "Favorite"}
                    </FormLabel>
                  </FormControl>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => onDelete(resource._id)}
                  >
                    Delete
                  </Button>
                </SimpleGrid>
              </Box>
            ))}
            {!resources.length ? (
              <Text color="gray.400">No resources yet.</Text>
            ) : null}
          </Stack>
        </CardBody>
      </Card>
    </SimpleGrid>
  );
};

export default ResourcesSection;
