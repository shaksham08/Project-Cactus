import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../context/AuthContext";

const BrandPanel = () => (
  <Flex
    direction="column"
    justify="center"
    align="center"
    px={{ base: 6, lg: 10 }}
    py={8}
    h="100%"
    bgGradient="linear(135deg, #0a1f10 0%, #112b19 50%, #07120c 100%)"
    position="relative"
    overflow="hidden"
  >
    {/* Background glow blobs */}
    <Box
      position="absolute"
      top="-80px"
      right="-80px"
      w="400px"
      h="400px"
      borderRadius="full"
      bg="cactus.700"
      opacity={0.12}
      filter="blur(80px)"
    />
    <Box
      position="absolute"
      bottom="-60px"
      left="-60px"
      w="300px"
      h="300px"
      borderRadius="full"
      bg="cactus.500"
      opacity={0.1}
      filter="blur(60px)"
    />

    <VStack
      spacing={10}
      align="center"
      position="relative"
      zIndex={1}
      maxW="360px"
    >
      {/* Big cactus SVG */}
      <Box
        as="svg"
        viewBox="0 0 320 260"
        w="200px"
        h="auto"
        role="img"
        aria-label="Cactus"
      >
        <defs>
          <linearGradient id="potGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB15E" />
            <stop offset="100%" stopColor="#8C4B1E" />
          </linearGradient>
          <linearGradient id="cactusBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8BFFA8" />
            <stop offset="100%" stopColor="#1E7D3E" />
          </linearGradient>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a1a10" />
            <stop offset="100%" stopColor="#071008" />
          </linearGradient>
        </defs>

        {/* Stars */}
        <circle cx="30" cy="25" r="1.5" fill="#FFD56A" opacity="0.8" />
        <circle cx="270" cy="18" r="2" fill="#FFD56A" opacity="0.7" />
        <circle cx="190" cy="35" r="1.2" fill="#fff" opacity="0.5" />
        <circle cx="55" cy="55" r="1" fill="#fff" opacity="0.4" />
        <circle cx="295" cy="50" r="1.5" fill="#FFD56A" opacity="0.6" />

        {/* Moon */}
        <circle cx="255" cy="38" r="28" fill="#FFD56A" opacity="0.92" />
        <circle cx="243" cy="32" r="20" fill="#112b19" />

        {/* Shadow */}
        <ellipse cx="160" cy="222" rx="110" ry="16" fill="#000" opacity="0.3" />

        {/* Cactus body */}
        <path
          d="M95 190 C70 190 58 175 58 152 C58 130 72 118 88 118 C98 118 106 123 110 132 L110 106 C110 84 124 70 146 70 C168 70 182 85 182 106 L182 132 C186 122 195 115 208 115 C226 115 240 129 240 150 C240 172 227 188 206 188 L198 188 L198 104 C198 89 188 80 174 80 C160 80 150 89 150 104 L150 202 L128 202 L128 152 C128 136 119 128 107 128 C95 128 88 137 88 149 C88 162 94 170 108 170 L115 170 L115 190 Z"
          fill="url(#cactusBody)"
        />

        {/* Shine lines */}
        <path
          d="M146 98 L146 200"
          stroke="#D8FFE0"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M98 142 L98 182"
          stroke="#D8FFE0"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M205 138 L205 180"
          stroke="#D8FFE0"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* Pot */}
        <path d="M108 202 H212 L200 234 H120 Z" fill="url(#potGlow)" />
        <path
          d="M120 202 H200"
          stroke="#FFD9A3"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Happy face */}
        <circle cx="138" cy="155" r="5" fill="#1B5E20" />
        <circle cx="139" cy="154" r="2" fill="#fff" />
        <circle cx="158" cy="155" r="5" fill="#1B5E20" />
        <circle cx="159" cy="154" r="2" fill="#fff" />
        <path
          d="M136 168 Q148 176 160 168"
          stroke="#1B5E20"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </Box>

      {/* Brand text */}
      <VStack spacing={2} textAlign="center">
        <Heading size="xl" color="white" letterSpacing="tight">
          Cactus Control Room
        </Heading>
        <Text color="gray.400" fontSize="md" lineHeight="tall">
          Study sharp. Stay spiky.
        </Text>
      </VStack>

      {/* Feature pills */}
      <VStack spacing={2} align="stretch" w="100%">
        {[
          { icon: "📝", label: "Rich notes & documents" },
          { icon: "✅", label: "Tasks with priority & due dates" },
          { icon: "🎯", label: "Timed tests with leaderboards" },
          { icon: "📈", label: "Subject progress tracking" },
          { icon: "📚", label: "Resource library" },
        ].map(({ icon, label }) => (
          <HStack
            key={label}
            px={3}
            py={2}
            borderRadius="lg"
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.100"
            spacing={2}
          >
            <Text fontSize="md">{icon}</Text>
            <Text color="gray.300" fontSize="xs">
              {label}
            </Text>
          </HStack>
        ))}
      </VStack>
    </VStack>
  </Flex>
);

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is too short"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Field = ({ label, error, children }) => (
  <FormControl isInvalid={Boolean(error)}>
    <FormLabel>{label}</FormLabel>
    {children}
    <FormErrorMessage>{error?.message}</FormErrorMessage>
  </FormControl>
);

const AuthPage = () => {
  const { login, register, getErrorMessage } = useAuth();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const handleLogin = loginForm.handleSubmit(async (values) => {
    setIsLoginLoading(true);
    try {
      await login(values);
    } catch (error) {
      loginForm.setError("root", { message: getErrorMessage(error) });
    } finally {
      setIsLoginLoading(false);
    }
  });

  const handleRegister = registerForm.handleSubmit(async (values) => {
    setIsRegisterLoading(true);
    try {
      await register(values);
    } catch (error) {
      registerForm.setError("root", { message: getErrorMessage(error) });
    } finally {
      setIsRegisterLoading(false);
    }
  });

  return (
    <Flex h="100vh" overflow="hidden" direction={{ base: "column", md: "row" }}>
      {/* Left: brand panel */}
      <Box
        display={{ base: "none", md: "block" }}
        flex="1"
        h="100%"
        overflow="hidden"
      >
        <BrandPanel />
      </Box>

      {/* Right: auth form */}
      <Flex
        flex={{ base: "1", md: "0 0 520px" }}
        direction="column"
        justify="center"
        align="center"
        px={{ base: 6, md: 12 }}
        py={12}
        bg="#0d1810"
        h="100%"
        overflowY="auto"
      >
        <Box w="100%" maxW="440px">
          <VStack spacing={1} align="start" mb={8}>
            <Heading size="lg">Welcome</Heading>
            <Text color="gray.400" fontSize="sm">
              Sign in or create your account below.
            </Text>
          </VStack>

          <Tabs variant="enclosed" isFitted>
            <TabList mb={6}>
              <Tab>Login</Tab>
              <Tab>Register</Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0} pb={0}>
                <form onSubmit={handleLogin}>
                  <Stack spacing={4}>
                    <Field
                      label="Email"
                      error={loginForm.formState.errors.email}
                    >
                      <Input
                        type="email"
                        placeholder="you@domain.com"
                        size="lg"
                        {...loginForm.register("email")}
                      />
                    </Field>
                    <Field
                      label="Password"
                      error={loginForm.formState.errors.password}
                    >
                      <Input
                        type="password"
                        placeholder="••••••"
                        size="lg"
                        {...loginForm.register("password")}
                      />
                    </Field>
                    {loginForm.formState.errors.root ? (
                      <Text color="red.400" fontSize="sm">
                        {loginForm.formState.errors.root.message}
                      </Text>
                    ) : null}
                    <Button
                      type="submit"
                      size="lg"
                      colorScheme="green"
                      isLoading={isLoginLoading}
                      loadingText="Logging in"
                      w="100%"
                      mt={2}
                    >
                      Enter Cactus
                    </Button>
                  </Stack>
                </form>
              </TabPanel>

              <TabPanel px={0} pb={0}>
                <form onSubmit={handleRegister}>
                  <Stack spacing={4}>
                    <Field
                      label="Full Name"
                      error={registerForm.formState.errors.fullName}
                    >
                      <Input
                        placeholder="Your name"
                        size="lg"
                        {...registerForm.register("fullName")}
                      />
                    </Field>
                    <Field
                      label="Email"
                      error={registerForm.formState.errors.email}
                    >
                      <Input
                        type="email"
                        placeholder="you@domain.com"
                        size="lg"
                        {...registerForm.register("email")}
                      />
                    </Field>
                    <Field
                      label="Password"
                      error={registerForm.formState.errors.password}
                    >
                      <Input
                        type="password"
                        placeholder="At least 6 characters"
                        size="lg"
                        {...registerForm.register("password")}
                      />
                    </Field>
                    {registerForm.formState.errors.root ? (
                      <Text color="red.400" fontSize="sm">
                        {registerForm.formState.errors.root.message}
                      </Text>
                    ) : null}
                    <Button
                      type="submit"
                      size="lg"
                      colorScheme="green"
                      isLoading={isRegisterLoading}
                      loadingText="Creating account"
                      w="100%"
                      mt={2}
                    >
                      Create Account
                    </Button>
                  </Stack>
                </form>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Flex>
  );
};

export default AuthPage;
