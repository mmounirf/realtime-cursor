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

export default function WelcomeScreen() {
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
            <Input placeholder="Write your name" type="text" />
          </CardContent>
          <Button size="lg" variant="outline">
            Join
          </Button>
        </Card>
      </NeonGradientCard>
    </div>
  );
}
