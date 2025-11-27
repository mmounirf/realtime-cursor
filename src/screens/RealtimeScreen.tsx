import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app";

export default function RealtimeScreen() {
  const { signOut } = useAppStore();
  return (
    <div>
      <h1>Realtime Screen</h1>
      <Button onClick={() => signOut()}>Sign out</Button>
    </div>
  );
}
