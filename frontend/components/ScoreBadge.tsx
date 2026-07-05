interface Props {
  label: string;
  value: number;
}

// Color ramps from muted -> accent as the score climbs.
function color(value: number): string {
  if (value >= 70) return "text-accent border-accent/40 bg-accent/10";
  if (value >= 45) return "text-indigo-300 border-indigo-300/30 bg-indigo-300/5";
  return "text-muted border-edge bg-panel";
}

export function ScoreBadge({ label, value }: Props) {
  return (
    <div
      className={`flex flex-col items-center rounded-lg border px-3 py-1.5 ${color(value)}`}
      title={`${label} score`}
    >
      <span className="text-base font-semibold tabular-nums leading-none">
        {value.toFixed(0)}
      </span>
      <span className="mt-0.5 text-[10px] uppercase tracking-wider text-muted">
        {label}
      </span>
    </div>
  );
}
