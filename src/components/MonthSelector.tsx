import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addMonths, subMonths } from "date-fns";

interface MonthSelectorProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthSelector({ currentMonth, onMonthChange }: MonthSelectorProps) {
  const handlePrev = () => onMonthChange(subMonths(currentMonth, 1));
  const handleNext = () => onMonthChange(addMonths(currentMonth, 1));

  return (
    <div className="flex items-center justify-between bg-card/60 rounded-xl p-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrev}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        className="h-9 w-9"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
