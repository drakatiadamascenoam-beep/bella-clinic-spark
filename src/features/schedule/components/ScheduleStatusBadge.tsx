import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  scheduleStatusLabels,
  scheduleStatusTones,
  type ScheduleStatus,
  type ScheduleStatusTone,
} from "../types/schedule-view";

const TONE_CLASSES: Record<ScheduleStatusTone, string> = {
  planned: "border-border bg-muted text-foreground",
  confirmed: "border-gold/40 bg-gold/10 text-gold-foreground",
  active: "border-marsala/30 bg-marsala/10 text-marsala",
  done: "border-emerald-600/30 bg-emerald-600/10 text-emerald-700",
  void: "border-border bg-muted text-muted-foreground",
  alert: "border-destructive/30 bg-destructive/10 text-destructive",
};

export interface ScheduleStatusBadgeProps {
  status: ScheduleStatus;
  className?: string;
}

export function ScheduleStatusBadge({ status, className }: ScheduleStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", TONE_CLASSES[scheduleStatusTones[status]], className)}
    >
      {scheduleStatusLabels[status]}
    </Badge>
  );
}
