import { CircleDot } from "lucide-react";

export default function PriorityBadge({ priority }) {
  const colors = { high: "#ef4444", medium: "#eab308", low: "#22c55e" };
  return (
    <span className={`badge badge-${priority}`}>
      <CircleDot size={12} color={colors[priority]} style={{ marginRight: '4px' }} /> {priority}
    </span>
  );
}
