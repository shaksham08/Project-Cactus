import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Box, Center, Spinner } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";

const AuthPage = lazy(() => import("../features/auth/AuthPage"));
const DashboardPage = lazy(() => import("../features/dashboard/DashboardPage"));
const TestResultPage = lazy(
  () => import("../features/dashboard/TestResultPage"),
);
const TestAttemptPage = lazy(
  () => import("../features/dashboard/TestAttemptPage"),
);

const PageFallback = () => (
  <Center minH="100vh">
    <Spinner size="xl" color="cactus.300" thickness="4px" />
  </Center>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="cactus.300" thickness="4px" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="cactus.300" thickness="4px" />
      </Center>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <Box minH="100vh">
    <Routes>
      <Route
        path="/auth"
        element={
          <PublicOnlyRoute>
            <Suspense fallback={<PageFallback />}>
              <AuthPage />
            </Suspense>
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <DashboardPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tests/attempts/:attemptId"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <TestResultPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tests/:testId/attempt"
        element={
          <ProtectedRoute>
            <Suspense fallback={<PageFallback />}>
              <TestAttemptPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Box>
);

export default App;
