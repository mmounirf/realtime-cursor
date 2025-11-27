import { Navigate, Route, Routes } from "react-router";
import { ProtectedRoute, PublicRoute } from "./Routes";
import WelcomeScreen from "./screens/WelcomeScreen";
import RealtimeScreen from "./screens/RealtimeScreen";
import { useAppStore } from "./store/app";
import { useEffect } from "react";

function App() {
  const { initializeAuth } = useAppStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/welcome" element={<WelcomeScreen />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/realtime" element={<RealtimeScreen />} />
        </Route>

        <Route path="*" element={<Navigate to="/welcome" />} />
      </Routes>
    </div>
  );
}

export default App;
