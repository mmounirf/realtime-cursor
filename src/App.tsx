import { Navigate, Route, Routes } from "react-router";
import { ProtectedRoute, PublicRoute } from "./Routes";
import WelcomeScreen from "./screens/WelcomeScreen";
import RealtimeScreen from "./screens/RealtimeScreen";
import { useAppStore } from "./store/app";
import { useEffect } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

function App() {
  const { initializeAuth, setCaptchaToken } = useAppStore();

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
      <Turnstile
        siteKey={import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY}
        onSuccess={setCaptchaToken}
      />
    </div>
  );
}

export default App;
