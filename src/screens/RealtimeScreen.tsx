import Cursor from "@/components/Cursor";
import { Button } from "@/components/ui/button";
import { useRealtimeCursors } from "@/hooks/useRealtimeCursors";
import { useAppStore } from "@/store/app";

export default function RealtimeScreen() {
  const { signOut, auth } = useAppStore();

  const { cursors } = useRealtimeCursors({
    roomName: "realtime-cursor",
    username: auth?.user.user_metadata.display_name,
    throttleMs: 50,
  });

  return (
    <div>
      <Button onClick={() => signOut()}>Sign out</Button>
      {Object.keys(cursors).map((id) => (
        <Cursor
          key={id}
          point={[cursors[id].position.x, cursors[id].position.y]}
        />
      ))}
    </div>
  );
}
