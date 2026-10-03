
interface TimelinePoint {
  time?: string;
  day?: string;
  usageKwh?: number;
  energyKwh?: number;
  powerKw?: number;
  peakPowerW?: number;
}

export function AdminAreaChart({
  data,
  height = 180,
  strokeColor = "#0284c7",
  fillStart = "rgba(2, 132, 199, 0.35)",
  fillEnd = "rgba(2, 132, 199, 0.02)",
  dataKey = "usageKwh",
  labelKey = "day",
}: {
  data: TimelinePoint[];
  height?: number;
  strokeColor?: string;
  fillStart?: string;
  fillEnd?: string;
  dataKey?: "usageKwh" | "energyKwh" | "powerKw";
  labelKey?: "day" | "time";
}) {
  if (!data || data.length === 0) {
    return <div style={{ height, display: "grid", placeItems: "center", color: "#94a3b8" }}>No data points available</div>;
  }

  const values = data.map((d) => Number(d[dataKey] || 0));
  const maxVal = Math.max(...values, 10);
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const width = 600;
  const padL = 36;
  const padR = 24;
  const padT = 20;
  const padB = 30;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const points = values.map((val, idx) => {
    const x = padL + (idx / (values.length - 1 || 1)) * chartW;
    const y = padT + chartH - ((val - minVal) / range) * chartH;
    return { x, y, val, label: data[idx][labelKey] || "" };
  });

  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padT + chartH} L ${points[0].x} ${padT + chartH} Z`;
  const gradId = `areaGrad-${strokeColor.replace(/[^a-zA-Z0-9]/g, "")}-${Math.random().toString(36).substring(2, 6)}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height, display: "block" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillStart} />
          <stop offset="100%" stopColor={fillEnd} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 0.33, 0.66, 1].map((ratio, i) => {
        const y = padT + chartH * ratio;
        const gridVal = (maxVal - ratio * range).toFixed(1);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="rgba(226, 232, 240, 0.8)" strokeDasharray="3 3" />
            <text x={padL - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#94a3b8" fontWeight="600">
              {gridVal}
            </text>
          </g>
        );
      })}

      {/* Area & Stroke */}
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />

      {/* Points & Labels */}
      {points.map((pt, i) => (
        <g key={i}>
          <circle cx={pt.x} cy={pt.y} r="3.5" fill="#ffffff" stroke={strokeColor} strokeWidth="2" />
          <text x={pt.x} y={height - 8} textAnchor="middle" fontSize="10.5" fill="#64748b" fontWeight="600">
            {pt.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function AdminDonutChart({
  items,
  size = 170,
  centerTitle = "Total",
  centerValue = "",
}: {
  items: { label: string; value: number; color: string }[];
  size?: number;
  centerTitle?: string;
  centerValue?: string | number;
}) {
  const total = items.reduce((acc, curr) => acc + curr.value, 0) || 1;
  const radius = 64;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
          {items.map((item, i) => {
            const percent = item.value / total;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;

            return (
              <circle
                key={i}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
                style={{ transition: "stroke-dashoffset 400ms ease" }}
              />
            );
          })}
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
            {centerTitle}
          </span>
          <span style={{ fontSize: "1.25rem", color: "#0f172a", fontWeight: 800 }}>
            {centerValue || total}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gap: "8px" }}>
        {items.map((it, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: it.color }} />
            <span style={{ color: "#475569", fontWeight: 500 }}>{it.label}:</span>
            <strong style={{ color: "#0f172a" }}>{it.value}</strong>
            <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
              ({Math.round((it.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminBarComparison({
  data,
}: {
  data: { label: string; current: number; previous: number }[];
}) {
  const max = Math.max(...data.flatMap((d) => [d.current, d.previous]), 1);

  return (
    <div style={{ display: "grid", gap: "14px" }}>
      {data.map((item, idx) => (
        <div key={idx} style={{ display: "grid", gap: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
            <span style={{ fontWeight: 600, color: "#334155" }}>{item.label}</span>
            <span style={{ color: "#0284c7", fontWeight: 700 }}>{item.current} kWh</span>
          </div>
          <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden", display: "flex" }}>
            <div
              style={{
                width: `${Math.min(100, (item.current / max) * 100)}%`,
                background: "linear-gradient(90deg, #0284c7, #38bdf8)",
                borderRadius: "999px",
                transition: "width 500ms ease",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
