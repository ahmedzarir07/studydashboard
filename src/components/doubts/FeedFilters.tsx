import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, ArrowUpDown } from "lucide-react";
import { ALL_SUBJECTS } from "@/hooks/useProgressSnapshot";

const SUBJECT_OPTIONS = ALL_SUBJECTS.map(s => ({ id: s.data.id, name: s.displayName }));

interface FeedFiltersProps {
  filterSubject: string;
  setFilterSubject: (v: string) => void;
  sortBy: string;
  setSortBy: (v: "newest" | "most_answers") => void;
}

export function FeedFilters({ filterSubject, setFilterSubject, sortBy, setSortBy }: FeedFiltersProps) {
  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1">
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="bg-muted/30 border-border/30 h-9 text-xs rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3 w-3 text-primary/70" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {SUBJECT_OPTIONS.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[135px]">
        <Select value={sortBy} onValueChange={v => setSortBy(v as "newest" | "most_answers")}>
          <SelectTrigger className="bg-muted/30 border-border/30 h-9 text-xs rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="h-3 w-3 text-primary/70" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="most_answers">Most Answers</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
