export default function ProgressBar({ percent, label }) {
  const clamped = Math.min(parseFloat(percent) || 0, 100);
  return (
    <div className="progress-wrapper">
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          <span>{clamped.toFixed(1)}%</span>
        </div>
      )}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
