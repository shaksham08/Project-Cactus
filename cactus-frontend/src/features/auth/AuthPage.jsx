import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
} from "@chakra-ui/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../context/AuthContext";

const CactusIllustration = () => (
  <Box
    mt={6}
    p={5}
    borderRadius="2xl"
    bgGradient="linear(to-br, rgba(29, 54, 39, 0.95), rgba(8, 14, 10, 0.82))"
    border="1px solid"
    borderColor="whiteAlpha.300"
    position="relative"
    overflow="hidden"
  >
    <Box
      as="svg"
      viewBox="0 0 320 200"
      width="100%"
      height="180px"
      role="img"
      aria-label="Cactus illustration"
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
      </defs>
      <circle cx="255" cy="38" r="24" fill="#FFD56A" opacity="0.9" />
      <ellipse cx="160" cy="172" rx="108" ry="18" fill="#000" opacity="0.24" />
      <path
        d="M95 140 C70 140 58 125 58 102 C58 80 72 68 88 68 C98 68 106 73 110 82 L110 56 C110 34 124 20 146 20 C168 20 182 35 182 56 L182 82 C186 72 195 65 208 65 C226 65 240 79 240 100 C240 122 227 138 206 138 L198 138 L198 54 C198 39 188 30 174 30 C160 30 150 39 150 54 L150 152 L128 152 L128 102 C128 86 119 78 107 78 C95 78 88 87 88 99 C88 112 94 120 108 120 L115 120 L115 140 Z"
        fill="url(#cactusBody)"
      />
      <path
        d="M146 48 L146 150"
        stroke="#D8FFE0"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M98 92 L98 132"
        stroke="#D8FFE0"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M205 88 L205 130"
        stroke="#D8FFE0"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path d="M108 152 H212 L200 184 H120 Z" fill="url(#potGlow)" />
      <path
        d="M120 152 H200"
        stroke="#FFD9A3"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.4"
      />
    </Box>
    <Text color="cactus.100" fontSize="sm" mt={3}>
      Study sharp. Stay spiky. Keep every task, note, test, and resource in one
      place.
    </Text>
  </Box>
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
  const toast = useToast();
  const { login, register, getErrorMessage } = useAuth();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const handleLogin = loginForm.handleSubmit(async (values) => {
    setIsLoginLoading(true);
    try {
      await login(values);
      toast({ title: "Welcome back", status: "success" });
    } catch (error) {
      toast({ title: getErrorMessage(error), status: "error" });
    } finally {
      setIsLoginLoading(false);
    }
  });

  const handleRegister = registerForm.handleSubmit(async (values) => {
    setIsRegisterLoading(true);
    try {
      await register(values);
      toast({ title: "Account created", status: "success" });
    } catch (error) {
      toast({ title: getErrorMessage(error), status: "error" });
    } finally {
      setIsRegisterLoading(false);
    }
  });

  return (
    <Container maxW="4xl" py={{ base: 8, md: 16 }}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card>
          <CardBody>
            <Heading size="lg" mb={2}>
              Cactus Control Room
            </Heading>
            <Text color="gray.300" mb={4}>
              A funky dark workspace for tests, progress, tasks, resources, and
              rich notes.
            </Text>
            <CactusIllustration />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Tabs variant="enclosed" isFitted>
              <TabList mb={4}>
                <Tab>Login</Tab>
                <Tab>Register</Tab>
              </TabList>
              <TabPanels>
                <TabPanel px={0}>
                  <form onSubmit={handleLogin}>
                    <SimpleGrid columns={1} spacing={4}>
                      <Field
                        label="Email"
                        error={loginForm.formState.errors.email}
                      >
                        <Input
                          type="email"
                          placeholder="you@domain.com"
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
                          {...loginForm.register("password")}
                        />
                      </Field>
                      <Button
                        type="submit"
                        isLoading={isLoginLoading}
                        loadingText="Logging in"
                      >
                        Enter Cactus
                      </Button>
                    </SimpleGrid>
                  </form>
                </TabPanel>
                <TabPanel px={0}>
                  <form onSubmit={handleRegister}>
                    <SimpleGrid columns={1} spacing={4}>
                      <Field
                        label="Full Name"
                        error={registerForm.formState.errors.fullName}
                      >
                        <Input
                          placeholder="Your name"
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
                          {...registerForm.register("password")}
                        />
                      </Field>
                      <Button
                        type="submit"
                        isLoading={isRegisterLoading}
                        loadingText="Creating account"
                      >
                        Create Account
                      </Button>
                    </SimpleGrid>
                  </form>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Container>
  );
};

export default AuthPage;
