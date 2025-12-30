import { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, ArrowRight, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MoveMonthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMonth: Date;
  plansCount: number;
  onMove: (targetMonthYear: string) => Promise<void>;
}

export function MoveMonthDialog({
  open,
  onOpenChange,
  currentMonth,
  plansCount,
  onMove,
}: MoveMonthDialogProps) {
  const [targetMonth, setTargetMonth] = useState(() => addMonths(currentMonth, 1));
  const [isMoving, setIsMoving] = useState(false);

  const handleMove = async () => {
    setIsMoving(true);
    try {
      await onMove(format(targetMonth, "yyyy-MM"));
      onOpenChange(false);
    } finally {
      setIsMoving(false);
    }
  };

  const sourceMonthLabel = format(currentMonth, "MMMM yyyy");
  const targetMonthLabel = format(targetMonth, "MMMM yyyy");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move Plans to Another Month</DialogTitle>
          <DialogDescription>
            Move all {plansCount} planned chapter{plansCount !== 1 ? "s" : ""} from{" "}
            <span className="font-medium text-foreground">{sourceMonthLabel}</span> to a
            different month.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Target Month Selector */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTargetMonth((prev) => subMonths(prev, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="min-w-[140px] text-center">
              <p className="text-lg font-semibold">{targetMonthLabel}</p>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setTargetMonth((prev) => addMonths(prev, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Visual indicator */}
          <div className="flex items-center justify-center gap-3 mt-6 text-sm text-muted-foreground">
            <span className="px-3 py-1.5 bg-muted rounded-lg">{sourceMonthLabel}</span>
            <ArrowRight className="h-4 w-4" />
            <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-medium">
              {targetMonthLabel}
            </span>
          </div>

          {format(targetMonth, "yyyy-MM") === format(currentMonth, "yyyy-MM") && (
            <p className="text-center text-sm text-destructive mt-4">
              Please select a different month
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isMoving}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={
              isMoving || format(targetMonth, "yyyy-MM") === format(currentMonth, "yyyy-MM")
            }
          >
            {isMoving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Moving...
              </>
            ) : (
              <>
                Move {plansCount} Plan{plansCount !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
