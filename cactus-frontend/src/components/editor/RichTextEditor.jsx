import { useEffect } from "react";
import { Box, Button, HStack } from "@chakra-ui/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const RichTextEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    editorProps: {
      attributes: {
        class: "cactus-editor",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <Box>
      <HStack spacing={2} mb={3} wrap="wrap">
        <Button
          size="xs"
          variant={editor.isActive("bold") ? "solid" : "outline"}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </Button>
        <Button
          size="xs"
          variant={editor.isActive("italic") ? "solid" : "outline"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </Button>
        <Button
          size="xs"
          variant={editor.isActive("bulletList") ? "solid" : "outline"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullets
        </Button>
        <Button
          size="xs"
          variant={editor.isActive("orderedList") ? "solid" : "outline"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numbered
        </Button>
        <Button
          size="xs"
          variant="outline"
          onClick={() => editor.chain().focus().undo().run()}
        >
          Undo
        </Button>
        <Button
          size="xs"
          variant="outline"
          onClick={() => editor.chain().focus().redo().run()}
        >
          Redo
        </Button>
      </HStack>
      <EditorContent editor={editor} />
    </Box>
  );
};

export default RichTextEditor;
