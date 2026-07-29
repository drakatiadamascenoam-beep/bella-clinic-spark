import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_TONES,
  type AttendanceStatus,
} from "../domain/attendance-status";

const TONE_CLASSES: Record<"open" | "done" | "void", string> = {
  open: "border-marsala/30 bg-marsala/10 text-marsala",
  done: "border-emerald-600/30 bg-emerald-600/10 text-emerald-700",
  void: "border-border bg-muted text-muted-foreground",
};

export interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
  className?: string;
}

export function AttendanceStatusBadge({ status, className }: AttendanceStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", TONE_CLASSES[ATTENDANCE_STATUS_TONES[status]], className)}
    >
      {ATTENDANCE_STATUS_LABELS[status]}
    </Badge>
  );
}
