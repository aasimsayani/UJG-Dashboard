import { useState } from "react";
import PasswordGate from "./components/PasswordGate";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  return unlocked
    ? <Dashboard />
    : <PasswordGate onUnlock={() => setUnlocked(true)} />;
}
