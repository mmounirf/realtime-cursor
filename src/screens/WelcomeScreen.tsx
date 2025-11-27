import { AnimatedCursors } from "@/components/AnimatedCursors";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

export default function WelcomeScreen() {
  return (
    <div>
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className={cn(
          "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
        )}
      />{" "}
      <AnimatedCursors />
      <h1>Welcome Screen</h1>
    </div>
  );
}
