"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircle2, Clock, AlertTriangle, Plus, ArrowRight } from "lucide-react";

type StatusType = "fresh" | "on-track" | "due-soon" | "overdue";

interface TopicEntry {
  id: number;
  name: string;
  daysAgo: number;
  status: StatusType;
  dueIn: number | null;
  daysLate?: number;
  isNew?: boolean;
}

const INITIAL_TOPICS: TopicEntry[] = [
  { id: 1, name: "Cardiology", daysAgo: 12, status: "due-soon", dueIn: 2 },
  { id: 2, name: "Pharmacology", daysAgo: 3, status: "on-track", dueIn: 4 },
  {
    id: 3,
    name: "Anatomy & Physiology",
    daysAgo: 22,
    status: "overdue",
    dueIn: null,
    daysLate: 8,
  },
];

const STATUS_CONFIG = {
  fresh: {
    label: "Fresh",
    color: "#7B9E7B",
    bg: "#E8F0E8",
    border: "#C8DFC8",
    icon: CheckCircle2,
    getDueText: (entry: TopicEntry) =>
      `Due in ${entry.dueIn} day${entry.dueIn === 1 ? "" : "s"}`,
  },
  "on-track": {
    label: "On track",
    color: "#5B7FA6",
    bg: "#E3ECF4",
    border: "#BFCFDF",
    icon: CheckCircle2,
    getDueText: (entry: TopicEntry) =>
      `Due in ${entry.dueIn} day${entry.dueIn === 1 ? "" : "s"}`,
  },
  "due-soon": {
    label: "Due soon",
    color: "#C4735A",
    bg: "#F0E4DF",
    border: "#DEC4B8",
    icon: Clock,
    getDueText: (entry: TopicEntry) =>
      `Due in ${entry.dueIn} day${entry.dueIn === 1 ? "" : "s"}`,
  },
  overdue: {
    label: "Overdue",
    color: "#B85252",
    bg: "#F4E3E3",
    border: "#D8B8B8",
    icon: AlertTriangle,
    getDueText: (entry: TopicEntry) =>
      `${entry.daysLate} day${entry.daysLate === 1 ? "" : "s"} late`,
  },
};

function ProgressRing({
  pct,
  color,
  size = 40,
}: {
  pct: number;
  color: string;
  size?: number;
}) {
  const strokeWidth = 2.5;
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(Math.max(pct, 0), 1));
  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#E8E0D5"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

function TimelineDots({ filled }: { filled: boolean[] }) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {filled.map((f, i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: f ? "#7B9E7B" : "#E8E0D5",
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

const TIMELINE_PATTERNS: Record<StatusType, boolean[]> = {
  fresh: [true, false, true, false, true, true, true],
  "on-track": [true, false, true, true, false, true, false],
  "due-soon": [true, true, false, true, false, false, true],
  overdue: [true, false, false, true, false, false, false],
};

const RING_PCT: Record<StatusType, number> = {
  fresh: 0.95,
  "on-track": 0.55,
  "due-soon": 0.85,
  overdue: 1.0,
};

export default function DemoWidget() {
  const [topics, setTopics] = useState<TopicEntry[]>(INITIAL_TOPICS);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [justAdded, setJustAdded] = useState<number | null>(null);

  useEffect(() => {
    if (justAdded !== null) {
      const t = setTimeout(() => setJustAdded(null), 800);
      return () => clearTimeout(t);
    }
  }, [justAdded]);

  const handleLog = () => {
    const name = inputValue.trim();
    if (!name) return;
    const id = Date.now();
    const entry: TopicEntry = {
      id,
      name,
      daysAgo: 0,
      status: "fresh",
      dueIn: 3,
      isNew: true,
    };
    setTopics((prev) => [entry, ...prev]);
    setInputValue("");
    setJustAdded(id);
    inputRef.current?.focus();
  };

  const handleDelete = (id: number) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div
      style={{
        background: "var(--rn-cream-light)",
        border: "1.5px solid var(--rn-linen)",
        borderRadius: 20,
        padding: 28,
        maxWidth: 520,
        margin: "0 auto",
        boxShadow: "var(--rn-shadow-lg)",
        fontFamily: "var(--font-inter)",
      }}
    >
      {/* Window chrome dots */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 22,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#E8C8A0",
          }}
        />
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#D8CFC4",
          }}
        />
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#C8DFC8",
          }}
        />
        <span
          style={{
            marginLeft: 8,
            fontSize: 12,
            color: "var(--rn-charcoal-muted)",
            fontFamily: "var(--font-inter)",
          }}
        >
          ReviNord — My Topics
        </span>
      </div>

      {/* Input row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Plus
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--rn-charcoal-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLog()}
            placeholder="Add a topic, e.g. Cardiac Pharmacology"
            style={{
              width: "100%",
              padding: "10px 14px 10px 34px",
              borderRadius: 10,
              border: "1.5px solid var(--rn-linen)",
              background: "white",
              color: "var(--rn-charcoal)",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "var(--font-inter)",
              transition: "border-color 0.18s ease",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--rn-fjord)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--rn-linen)")
            }
          />
        </div>
        <button
          onClick={handleLog}
          disabled={!inputValue.trim()}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            background: inputValue.trim()
              ? "var(--rn-terracotta)"
              : "var(--rn-linen)",
            color: inputValue.trim() ? "white" : "var(--rn-charcoal-muted)",
            fontSize: 14,
            fontWeight: 500,
            border: "none",
            cursor: inputValue.trim() ? "pointer" : "default",
            transition: "all 0.18s ease",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-inter)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          Log revision
          {inputValue.trim() && <ArrowRight size={14} />}
        </button>
      </div>

      {/* Topics list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {topics.map((topic, idx) => {
          const cfg = STATUS_CONFIG[topic.status];
          const Icon = cfg.icon;
          const ringPct = RING_PCT[topic.status];
          const timeline = TIMELINE_PATTERNS[topic.status];
          const isNew = topic.id === justAdded || (topic.isNew && idx === 0);

          return (
            <div
              key={topic.id}
              style={{
                background: "white",
                border: `1px solid ${isNew ? cfg.border : "#F0EBE5"}`,
                borderRadius: 14,
                padding: "14px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                animation: topic.isNew ? "rn-pop 0.35s cubic-bezier(0.22,1,0.36,1) both" : "none",
                transition: "border-color 0.3s ease",
                boxShadow: isNew
                  ? `0 0 0 3px ${cfg.bg}`
                  : "var(--rn-shadow-xs)",
              }}
            >
              {/* Progress ring */}
              <div style={{ paddingTop: 2 }}>
                <ProgressRing
                  pct={ringPct}
                  color={cfg.color}
                  size={38}
                />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 500,
                    color: "var(--rn-charcoal)",
                    fontSize: 14,
                    marginBottom: 2,
                    fontFamily: "var(--font-inter)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {topic.name}
                </div>
                <div
                  style={{
                    color: "var(--rn-charcoal-light)",
                    fontSize: 12,
                    marginBottom: 8,
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {topic.daysAgo === 0
                    ? "Just revised"
                    : `Revised ${topic.daysAgo} day${topic.daysAgo === 1 ? "" : "s"} ago`}
                </div>
                <TimelineDots filled={timeline} />
              </div>

              {/* Status pill + delete */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <span
                  className="rn-pill"
                  style={{
                    background: cfg.bg,
                    color: cfg.color,
                  }}
                >
                  <Icon size={11} />
                  {cfg.getDueText(topic)}
                </span>
                <button
                  onClick={() => handleDelete(topic.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--rn-charcoal-muted)",
                    fontSize: 11,
                    padding: "2px 4px",
                    borderRadius: 4,
                    fontFamily: "var(--font-inter)",
                    transition: "color 0.15s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--rn-overdue)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--rn-charcoal-muted)")
                  }
                >
                  remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {topics.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "var(--rn-charcoal-muted)",
            fontSize: 13,
            padding: "24px 0",
            fontFamily: "var(--font-inter)",
          }}
        >
          No topics yet. Add one above ↑
        </div>
      )}
    </div>
  );
}
