import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import CactusShell from "../../components/layout/CactusShell";
import { useAuth } from "../../context/AuthContext";
import TodosSection from "./sections/TodosSection";
import ProgressSection from "./sections/ProgressSection";
import ResourcesSection from "./sections/ResourcesSection";
import DocumentsSection from "./sections/DocumentsSection";
import TestsSection from "./sections/TestsSection";

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <CactusShell
      title="Cactus Study HQ"
      subtitle="One dark-mode control center for tasks, notes, tests, progress, and learning resources."
      userName={user?.fullName || user?.email || "Cactus User"}
      onLogout={logout}
    >
      <Tabs variant="enclosed" colorScheme="green" isLazy>
        <TabList overflowX="auto" overflowY="hidden" whiteSpace="nowrap">
          <Tab>Todos</Tab>
          <Tab>Progress</Tab>
          <Tab>Resources</Tab>
          <Tab>Rich Notes</Tab>
          <Tab>Tests</Tab>
        </TabList>
        <TabPanels mt={4}>
          <TabPanel px={0}>
            <TodosSection />
          </TabPanel>
          <TabPanel px={0}>
            <ProgressSection />
          </TabPanel>
          <TabPanel px={0}>
            <ResourcesSection />
          </TabPanel>
          <TabPanel px={0}>
            <DocumentsSection />
          </TabPanel>
          <TabPanel px={0}>
            <TestsSection />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </CactusShell>
  );
};

export default DashboardPage;
