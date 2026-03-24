import {
  Box,
  Flex,
  Heading,
  HStack,
  Text,
  Button,
  Badge,
} from "@chakra-ui/react";

const CactusShell = ({ title, subtitle, userName, onLogout, children }) => {
  return (
    <Box px={{ base: 4, md: 8 }} py={{ base: 5, md: 8 }}>
      <Box
        position="relative"
        border="1px solid"
        borderColor="whiteAlpha.300"
        borderRadius="2xl"
        bg="blackAlpha.400"
        overflow="hidden"
      >
        <Box
          aria-hidden
          position="absolute"
          inset="-60px auto auto -40px"
          w="220px"
          h="220px"
          borderRadius="full"
          bgGradient="radial(cactus.300, transparent 70%)"
          opacity={0.4}
          filter="blur(18px)"
        />
        <Flex
          position="relative"
          px={{ base: 4, md: 8 }}
          py={{ base: 4, md: 6 }}
          justify="space-between"
          align={{ base: "start", md: "center" }}
          gap={4}
          direction={{ base: "column", md: "row" }}
        >
          <Box>
            <HStack spacing={3} mb={2}>
              <Badge
                colorScheme="green"
                variant="subtle"
                px={2}
                py={1}
                borderRadius="full"
              >
                CACTUS MODE
              </Badge>
              <Text color="cactus.200" fontWeight="semibold">
                Dark Only
              </Text>
            </HStack>
            <Heading size="lg" mb={1}>
              {title}
            </Heading>
            <Text color="gray.300">{subtitle}</Text>
          </Box>

          <HStack spacing={3}>
            <Text color="gray.300" fontWeight="medium">
              {userName}
            </Text>
            <Button
              size="sm"
              variant="outline"
              color="cactus.200"
              borderColor="cactus.500"
              onClick={onLogout}
            >
              Logout
            </Button>
          </HStack>
        </Flex>
      </Box>
      <Box mt={6}>{children}</Box>
    </Box>
  );
};

export default CactusShell;
