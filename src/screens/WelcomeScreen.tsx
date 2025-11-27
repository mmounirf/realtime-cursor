import { AnimatedCursors } from "@/components/AnimatedCursors";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Input } from "@/components/ui/input";
import { NeonGradientCard } from "@/components/ui/neon-gradient-card";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app";
import { LogInIcon } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

export default function WelcomeScreen() {
  const { joinRoom } = useAppStore();
  const nameInput = useRef<HTMLInputElement>(null);

  const onJoin = async () => {
    const inputValue = nameInput.current?.value;

    if (inputValue !== undefined && inputValue.trim().length > 0) {
      toast
        .promise(joinRoom(inputValue), {
          loading: "Joining room...",
          error: "Error joining room",
          success: (name) => {
            return `Welcome ${name}`;
          },
          id: "joinToast",
        })
        .unwrap();
    } else {
      toast.error("Name is reuqired", { id: "joinToast" });
    }
  };

  return (
    <div className="container max-w-2xl">
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className={cn(
          "mask-[linear-gradient(to_bottom_right,white,transparent,transparent)]"
        )}
      />
      <AnimatedCursors />
      <NeonGradientCard>
        <Card className="bg-transparent shadow-none border-none p-0">
          <CardHeader className="p-0">
            <CardTitle>Join Room</CardTitle>
            <CardDescription>
              The name will be visible to all room joiners
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col p-0">
            <Input
              ref={nameInput}
              placeholder="Write your name"
              type="text"
              required
            />
          </CardContent>
          <Button size="lg" variant="outline" onClick={() => onJoin()}>
            Join
            <LogInIcon />
          </Button>
        </Card>
      </NeonGradientCard>
    </div>
  );
}
