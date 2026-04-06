const PRIORITY_DOT = { high: "🔴", medium: "🟡", low: "🟢" };

export default function PriorityBadge({ priority }) {
  return (
    <span className={`badge badge-${priority}`}>
      {PRIORITY_DOT[priority]} {priority}
    </span>
  );
}
