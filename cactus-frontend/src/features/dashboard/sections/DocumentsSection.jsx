import { useEffect, useMemo, useRef, useState } from "react";
import {
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
  Select,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import {
  createDocument,
  deleteDocument,
  listDocuments,
  updateDocument,
} from "../../../lib/api/documents";
import { getErrorMessage } from "../../../lib/api/client";
import RichTextEditor from "../../../components/editor/RichTextEditor";

const parseTags = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const DocumentsSection = () => {
  const [documents, setDocuments] = useState([]);
  const [activeId, setActiveId] = useState("new");
  const [isEditing, setIsEditing] = useState(true);
  const [model, setModel] = useState({
    title: "",
    language: "plaintext",
    folder: "",
    tags: "",
    isPinned: false,
    content: "<p>Write your cactus notes here...</p>",
  });
  const toast = useToast();
  const tempIdCounterRef = useRef(0);

  const getTempId = () => {
    tempIdCounterRef.current += 1;
    return `tmp-${tempIdCounterRef.current}`;
  };

  const activeDocument = useMemo(
    () => documents.find((item) => item._id === activeId) || null,
    [documents, activeId],
  );

  const groupedDocuments = useMemo(() => {
    const sorted = [...documents].sort((left, right) => {
      if (left.isPinned !== right.isPinned) {
        return left.isPinned ? -1 : 1;
      }

      return new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0);
    });

    return sorted.reduce((groups, document) => {
      const folderName = document.folder?.trim() || "Loose Notes";

      if (!groups[folderName]) {
        groups[folderName] = [];
      }

      groups[folderName].push(document);
      return groups;
    }, {});
  }, [documents]);

  const setModelFromDocument = (document) => {
    setModel({
      title: document.title || "",
      language: document.language || "plaintext",
      folder: document.folder || "",
      tags: (document.tags || []).join(", "),
      isPinned: Boolean(document.isPinned),
      content: document.content || "",
    });
  };

  const selectDocument = (document) => {
    setActiveId(document._id);
    setModelFromDocument(document);
    setIsEditing(false);
  };

  const refresh = async () => {
    try {
      const items = await listDocuments();
      setDocuments(items);

      if (items.length && activeId === "new") {
        setActiveId(items[0]._id);
        setModelFromDocument(items[0]);
        setIsEditing(false);
      }
    } catch (error) {
      toast({ title: getErrorMessage(error), status: "error" });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const items = await listDocuments();

        if (!isMounted) {
          return;
        }

        setDocuments(items);
        if (items.length) {
          setActiveId(items[0]._id);
          setModelFromDocument(items[0]);
          setIsEditing(false);
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

  const save = async () => {
    if (!model.title.trim()) {
      toast({ title: "Title is required", status: "warning" });
      return;
    }

    const payload = {
      title: model.title,
      language: model.language,
      folder: model.folder,
      tags: parseTags(model.tags),
      isPinned: model.isPinned,
      content: model.content,
    };

    try {
      if (activeDocument) {
        setDocuments((prev) =>
          prev.map((document) =>
            document._id === activeDocument._id
              ? {
                  ...document,
                  ...payload,
                  updatedAt: new Date().toISOString(),
                }
              : document,
          ),
        );

        const updated = await updateDocument(activeDocument._id, payload);
        setDocuments((prev) =>
          prev.map((document) =>
            document._id === activeDocument._id ? updated : document,
          ),
        );
        setModelFromDocument(updated);
        setIsEditing(false);
        toast({ title: "Document updated", status: "success" });
      } else {
        const tempId = getTempId();
        const optimisticDocument = {
          _id: tempId,
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setDocuments((prev) => [optimisticDocument, ...prev]);
        setActiveId(tempId);

        const created = await createDocument(payload);
        setDocuments((prev) =>
          prev.map((document) =>
            document._id === tempId ? created : document,
          ),
        );
        setActiveId(created._id);
        setModelFromDocument(created);
        setIsEditing(false);
        toast({ title: "Document created", status: "success" });
      }
    } catch (error) {
      await refresh();
      toast({ title: getErrorMessage(error), status: "error" });
    }
  };

  const createNew = () => {
    setActiveId("new");
    setIsEditing(true);
    setModel({
      title: "",
      language: "plaintext",
      folder: "",
      tags: "",
      isPinned: false,
      content: "<p>Fresh page</p>",
    });
  };

  const onDelete = async () => {
    if (!activeDocument) {
      return;
    }

    const previousDocuments = documents;
    const nextDocuments = documents.filter(
      (document) => document._id !== activeDocument._id,
    );

    setDocuments(nextDocuments);
    if (nextDocuments.length) {
      selectDocument(nextDocuments[0]);
    } else {
      createNew();
    }

    try {
      await deleteDocument(activeDocument._id);
      toast({ title: "Document deleted", status: "info" });
    } catch (error) {
      setDocuments(previousDocuments);
      selectDocument(activeDocument);
      toast({ title: getErrorMessage(error), status: "error" });
    }
  };

  const startEditing = () => {
    if (!activeDocument) {
      createNew();
      return;
    }

    setModelFromDocument(activeDocument);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (activeDocument) {
      setModelFromDocument(activeDocument);
      setIsEditing(false);
      return;
    }

    createNew();
  };

  return (
    <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={5}>
      <Card>
        <CardBody>
          <Heading size="sm" mb={3}>
            Notes Library
          </Heading>
          <Text color="gray.400" fontSize="sm" mb={4}>
            Folders are used as categories here so related notes stay grouped.
          </Text>
          <Stack spacing={4}>
            <Button onClick={createNew}>+ New Document</Button>
            {Object.entries(groupedDocuments).map(([folderName, items]) => (
              <Box key={folderName}>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="semibold" color="cactus.100">
                    {folderName}
                  </Text>
                  <Badge variant="subtle">{items.length}</Badge>
                </HStack>
                <Stack spacing={2}>
                  {items.map((document) => (
                    <Button
                      key={document._id}
                      variant={document._id === activeId ? "solid" : "outline"}
                      justifyContent="space-between"
                      onClick={() => selectDocument(document)}
                    >
                      <Text noOfLines={1}>{document.title}</Text>
                      {document.isPinned ? (
                        <Badge colorScheme="green">Pinned</Badge>
                      ) : null}
                    </Button>
                  ))}
                </Stack>
              </Box>
            ))}
            {!documents.length ? (
              <Text color="gray.400">No documents yet.</Text>
            ) : null}
          </Stack>
        </CardBody>
      </Card>

      <Card gridColumn={{ base: "auto", xl: "span 2" }}>
        <CardBody>
          <HStack justify="space-between" align="start" mb={4}>
            <Box>
              <Heading size="md">
                {activeDocument ? activeDocument.title : "New note"}
              </Heading>
              <Text color="gray.400" mt={1}>
                {activeDocument
                  ? "Open notes in reading mode first, then switch into edit mode when needed."
                  : "Create a fresh note and save it to keep it in your library."}
              </Text>
            </Box>
            <HStack>
              <Button variant="outline" onClick={createNew}>
                New
              </Button>
              {activeDocument && !isEditing ? (
                <Button onClick={startEditing}>Edit</Button>
              ) : null}
            </HStack>
          </HStack>

          {isEditing ? (
            <>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={3}>
                <FormControl>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={model.title}
                    onChange={(event) =>
                      setModel((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Language</FormLabel>
                  <Select
                    value={model.language}
                    onChange={(event) =>
                      setModel((prev) => ({
                        ...prev,
                        language: event.target.value,
                      }))
                    }
                  >
                    <option value="plaintext">plaintext</option>
                    <option value="markdown">markdown</option>
                    <option value="javascript">javascript</option>
                    <option value="python">python</option>
                    <option value="html">html</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Folder</FormLabel>
                  <Input
                    placeholder="For example: DSA, React, Interview Prep"
                    value={model.folder}
                    onChange={(event) =>
                      setModel((prev) => ({
                        ...prev,
                        folder: event.target.value,
                      }))
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Tags (comma separated)</FormLabel>
                  <Input
                    value={model.tags}
                    onChange={(event) =>
                      setModel((prev) => ({
                        ...prev,
                        tags: event.target.value,
                      }))
                    }
                  />
                </FormControl>
              </SimpleGrid>

              <Checkbox
                mb={4}
                isChecked={model.isPinned}
                onChange={(event) =>
                  setModel((prev) => ({
                    ...prev,
                    isPinned: event.target.checked,
                  }))
                }
              >
                Pin this document
              </Checkbox>

              <RichTextEditor
                value={model.content}
                onChange={(nextContent) =>
                  setModel((prev) => ({ ...prev, content: nextContent }))
                }
              />

              <SimpleGrid mt={4} columns={{ base: 1, md: 3 }} spacing={3}>
                <Button onClick={save}>Save Document</Button>
                <Button variant="outline" onClick={cancelEditing}>
                  {activeDocument ? "Cancel" : "Reset"}
                </Button>
                <Button
                  colorScheme="red"
                  variant="outline"
                  onClick={onDelete}
                  isDisabled={!activeDocument}
                >
                  Delete
                </Button>
              </SimpleGrid>
            </>
          ) : (
            <Stack spacing={4}>
              <HStack wrap="wrap">
                <Badge colorScheme="green">
                  {activeDocument?.language || "plaintext"}
                </Badge>
                <Badge variant="outline">
                  {activeDocument?.folder?.trim() || "Loose Notes"}
                </Badge>
                {activeDocument?.isPinned ? (
                  <Badge colorScheme="yellow">Pinned</Badge>
                ) : null}
              </HStack>

              {activeDocument?.tags?.length ? (
                <HStack wrap="wrap">
                  {activeDocument.tags.map((tag) => (
                    <Badge key={tag} variant="subtle">
                      #{tag}
                    </Badge>
                  ))}
                </HStack>
              ) : null}

              <Divider borderColor="whiteAlpha.300" />

              <Box
                className="cactus-editor"
                minH="320px"
                dangerouslySetInnerHTML={{
                  __html:
                    activeDocument?.content || "<p>This note is empty.</p>",
                }}
              />

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                <Button onClick={startEditing}>Edit Document</Button>
                <Button variant="outline" onClick={createNew}>
                  New
                </Button>
                <Button colorScheme="red" variant="outline" onClick={onDelete}>
                  Delete
                </Button>
              </SimpleGrid>
            </Stack>
          )}
        </CardBody>
      </Card>
    </SimpleGrid>
  );
};

export default DocumentsSection;
