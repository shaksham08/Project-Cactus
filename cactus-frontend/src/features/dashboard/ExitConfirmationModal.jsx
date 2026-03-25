import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";

const SadCactus = () => (
  <svg
    width="120"
    height="140"
    viewBox="0 0 120 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Main body */}
    <ellipse
      cx="60"
      cy="80"
      rx="35"
      ry="45"
      fill="#2E7D32"
      stroke="#1B5E20"
      strokeWidth="2"
    />

    {/* Left arm */}
    <ellipse
      cx="22"
      cy="70"
      rx="15"
      ry="28"
      fill="#2E7D32"
      stroke="#1B5E20"
      strokeWidth="2"
    />

    {/* Right arm */}
    <ellipse
      cx="98"
      cy="70"
      rx="15"
      ry="28"
      fill="#2E7D32"
      stroke="#1B5E20"
      strokeWidth="2"
    />

    {/* Spines on main body */}
    <circle cx="50" cy="50" r="3" fill="#FDD835" />
    <circle cx="70" cy="45" r="3" fill="#FDD835" />
    <circle cx="45" cy="85" r="3" fill="#FDD835" />
    <circle cx="75" cy="90" r="3" fill="#FDD835" />
    <circle cx="50" cy="110" r="3" fill="#FDD835" />
    <circle cx="70" cy="115" r="3" fill="#FDD835" />

    {/* Spines on left arm */}
    <circle cx="15" cy="50" r="2.5" fill="#FDD835" />
    <circle cx="22" cy="90" r="2.5" fill="#FDD835" />

    {/* Spines on right arm */}
    <circle cx="105" cy="50" r="2.5" fill="#FDD835" />
    <circle cx="98" cy="90" r="2.5" fill="#FDD835" />

    {/* Sad left eye */}
    <circle cx="50" cy="65" r="5" fill="#1B5E20" />
    <circle cx="51" cy="64" r="2.5" fill="#fff" />

    {/* Tear from left eye */}
    <circle cx="50" cy="72" r="2" fill="#64B5F6" opacity="0.8" />
    <path
      d="M 50 74 Q 49 80 50 85"
      stroke="#64B5F6"
      strokeWidth="1.5"
      opacity="0.6"
    />

    {/* Sad right eye */}
    <circle cx="70" cy="65" r="5" fill="#1B5E20" />
    <circle cx="71" cy="64" r="2.5" fill="#fff" />

    {/* Tear from right eye */}
    <circle cx="70" cy="72" r="2" fill="#64B5F6" opacity="0.8" />
    <path
      d="M 70 74 Q 69 80 70 85"
      stroke="#64B5F6"
      strokeWidth="1.5"
      opacity="0.6"
    />

    {/* Sad mouth (upside down smile) */}
    <path
      d="M 50 95 Q 60 88 70 95"
      stroke="#1B5E20"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />

    {/* Flower pot */}
    <rect
      x="40"
      y="120"
      width="40"
      height="12"
      fill="#A1887F"
      stroke="#5D4E37"
      strokeWidth="1.5"
    />
    <path d="M 38 120 L 42 118 L 78 118 L 82 120" fill="#8D6E63" />
  </svg>
);

const ExitConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "Don't Leave Please!",
  message = "You have an unfinished attempt. Leaving now will lose your progress.",
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      isCentered
      closeOnEsc={false}
      closeOnOverlayClick={false}
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
      <ModalContent
        bg="blackAlpha.900"
        border="1px solid"
        borderColor="whiteAlpha.300"
        maxW="400px"
      >
        <ModalBody py={8}>
          <VStack spacing={6}>
            <SadCactus />
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color="cactus.100"
              textAlign="center"
            >
              {title}
            </Text>
            <Text color="gray.300" textAlign="center" fontSize="md">
              {message}
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3} width="100%">
            <Button
              flex="1"
              variant="ghost"
              colorScheme="gray"
              onClick={onConfirm}
              borderRadius="lg"
            >
              Leave Anyway
            </Button>
            <Button
              flex="1"
              colorScheme="green"
              onClick={onCancel}
              borderRadius="lg"
            >
              Keep Working
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExitConfirmationModal;
