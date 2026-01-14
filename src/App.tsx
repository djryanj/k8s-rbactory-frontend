// src/App.tsx
import { RBACProvider } from "./context/rbac";
import { ConfigProvider } from "./context/config";
import { ConnectionProvider } from "./context/connection";
import { ClusterRBACProvider } from "./context/clusterRBAC";
import { ThemeProvider } from "./context/theme";
import { AppLayout } from "./components/Layout/AppLayout";
import "./index.css";

function App() {
  return (
    <ThemeProvider>
      <ConfigProvider>
        <ConnectionProvider>
          <RBACProvider>
            <ClusterRBACProvider>
              <AppLayout />
            </ClusterRBACProvider>
          </RBACProvider>
        </ConnectionProvider>
      </ConfigProvider>
    </ThemeProvider>
  );
}

export default App;
