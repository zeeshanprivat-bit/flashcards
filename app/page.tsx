import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  RefreshCw,
  CalendarDays,
  Sparkles,
  ChevronRight,
  Database,
  Lock,
  Wifi,
} from "lucide-react";
import DemoWidget from "@/components/landing/DemoWidget";

/* ─── Tiny helpers ────────────────────────────────────────────────────────── */

function ProgressRing({
  pct,
  color,
  size = 48,
}: {
  pct: number;
  color: string;
  size?: number;
}) {
  const sw = 3;
  const r = (size - sw * 2) / 2;
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
        strokeWidth={sw}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

function TimelineDots({ filled }: { filled: boolean[] }) {
  return (
    <div style={{ display: "flex", gap: 3, marginTop: 8 }}>
      {filled.map((f, i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: f ? "#7B9E7B" : "#E8E0D5",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Nav ─────────────────────────────────────────────────────────────────── */

function Nav() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        height: 64,
        background: "rgba(247,244,239,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--rn-linen)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
          color: "var(--rn-charcoal)",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--rn-terracotta)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RefreshCw size={16} color="white" />
        </div>
        <span
          style={{
            fontFamily: "var(--font-lora)",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--rn-charcoal)",
          }}
        >
          ReviNord
        </span>
      </div>

      {/* Nav links */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}
      >
        <a
          href="#how-it-works"
          style={{
            fontSize: 14,
            color: "var(--rn-charcoal-light)",
            textDecoration: "none",
            fontFamily: "var(--font-inter)",
            transition: "color 0.15s",
          }}
        >
          How it works
        </a>
        <a
          href="#pricing"
          style={{
            fontSize: 14,
            color: "var(--rn-charcoal-light)",
            textDecoration: "none",
            fontFamily: "var(--font-inter)",
            transition: "color 0.15s",
          }}
        >
          Pricing
        </a>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/dashboard" className="rn-btn-ghost" style={{ padding: "8px 16px", fontSize: 14 }}>
            Sign in
          </Link>
          <Link href="/dashboard" className="rn-btn-primary" style={{ padding: "8px 16px", fontSize: 14 }}>
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero mock cards ─────────────────────────────────────────────────────── */

const MOCK_CARDS = [
  {
    subject: "Cardiology",
    emoji: "🫀",
    daysAgo: 12,
    status: "Due in 2 days",
    statusColor: "#C4735A",
    statusBg: "#F0E4DF",
    ringPct: 0.85,
    ringColor: "#C4735A",
    Icon: Clock,
    timeline: [true, false, true, true, false, true, true],
    delay: "0s",
    zIndex: 30,
    transform: "translateY(0) scale(1)",
    opacity: 1,
  },
  {
    subject: "Pharmacology",
    emoji: "💊",
    daysAgo: 3,
    status: "On track",
    statusColor: "#5B7FA6",
    statusBg: "#E3ECF4",
    ringPct: 0.45,
    ringColor: "#5B7FA6",
    Icon: CheckCircle2,
    timeline: [true, true, false, true, false, false, true],
    delay: "0.1s",
    zIndex: 20,
    transform: "translateY(-12px) translateX(12px) scale(0.97)",
    opacity: 0.88,
  },
  {
    subject: "Anatomy",
    emoji: "🦴",
    daysAgo: 22,
    status: "Overdue",
    statusColor: "#B85252",
    statusBg: "#F4E3E3",
    ringPct: 1.0,
    ringColor: "#B85252",
    Icon: AlertTriangle,
    timeline: [true, false, false, true, false, false, false],
    delay: "0.2s",
    zIndex: 10,
    transform: "translateY(-24px) translateX(24px) scale(0.94)",
    opacity: 0.7,
  },
];

function HeroMockCards() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 380,
        height: 280,
        margin: "0 auto",
      }}
    >
      {[...MOCK_CARDS].reverse().map((card) => (
        <div
          key={card.subject}
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--rn-cream-light)",
            border: "1.5px solid var(--rn-linen)",
            borderRadius: 18,
            padding: 22,
            boxShadow: "var(--rn-shadow-md)",
            transform: card.transform,
            zIndex: card.zIndex,
            opacity: card.opacity,
            transition: "transform 0.3s ease",
          }}
        >
          {/* Header row */}
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
          >
            <ProgressRing pct={card.ringPct} color={card.ringColor} size={48} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 3,
                }}
              >
                <span style={{ fontSize: 18 }}>{card.emoji}</span>
                <span
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontWeight: 600,
                    fontSize: 15,
                    color: "var(--rn-charcoal)",
                  }}
                >
                  {card.subject}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 12,
                  color: "var(--rn-charcoal-light)",
                }}
              >
                Revised {card.daysAgo} days ago
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="rn-divider" style={{ margin: "16px 0 12px" }} />

          {/* Status + timeline */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              className="rn-pill"
              style={{
                background: card.statusBg,
                color: card.statusColor,
              }}
            >
              <card.Icon size={11} />
              {card.status}
            </span>
            <TimelineDots filled={card.timeline} />
          </div>
        </div>
      ))}

      {/* Floating front card gets subtle float animation */}
      <style>{`
        .hero-card-front {
          animation: rn-card-float 5s ease-in-out infinite;
        }
      `}</style>
      <div
        className="hero-card-front"
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--rn-cream-light)",
          border: "1.5px solid var(--rn-linen)",
          borderRadius: 18,
          padding: 22,
          boxShadow: "var(--rn-shadow-lg)",
          zIndex: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <ProgressRing pct={0.85} color="#C4735A" size={48} />
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 3,
              }}
            >
              <span style={{ fontSize: 18 }}>🫀</span>
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 600,
                  fontSize: 15,
                  color: "var(--rn-charcoal)",
                }}
              >
                Cardiology
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 12,
                color: "var(--rn-charcoal-light)",
              }}
            >
              Revised 12 days ago
            </div>
          </div>
        </div>

        <hr className="rn-divider" style={{ margin: "16px 0 12px" }} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            className="rn-pill"
            style={{ background: "#F0E4DF", color: "#C4735A" }}
          >
            <Clock size={11} />
            Due in 2 days
          </span>
          <TimelineDots filled={[true, false, true, true, false, true, true]} />
        </div>

        {/* Mini timeline bar */}
        <div
          style={{
            marginTop: 14,
            height: 4,
            borderRadius: 2,
            background: "var(--rn-linen)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "85%",
              borderRadius: 2,
              background:
                "linear-gradient(90deg, var(--rn-sage) 0%, var(--rn-terracotta) 100%)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 5,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "var(--rn-charcoal-muted)",
              fontFamily: "var(--font-inter)",
            }}
          >
            Last revised
          </span>
          <span
            style={{
              fontSize: 10,
              color: "var(--rn-terracotta)",
              fontFamily: "var(--font-inter)",
              fontWeight: 500,
            }}
          >
            Due in 2 days →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Hero Section ────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section
      style={{
        padding: "80px 32px 100px",
        maxWidth: 1160,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "center",
        }}
      >
        {/* Left: copy */}
        <div>
          {/* Eyebrow */}
          <div
            className="rn-eyebrow rn-animate-fade-up"
            style={{ marginBottom: 24, animationDelay: "0s" }}
          >
            <Sparkles size={12} />
            For medical students
          </div>

          {/* H1 */}
          <h1
            className="rn-serif rn-animate-fade-up"
            style={{
              fontSize: "clamp(42px, 5vw, 62px)",
              fontWeight: 500,
              lineHeight: 1.12,
              color: "var(--rn-charcoal)",
              marginBottom: 24,
              letterSpacing: "-0.03em",
              animationDelay: "0.06s",
            }}
          >
            Your revision,
            <br />
            <em style={{ fontStyle: "italic", color: "var(--rn-terracotta)" }}>
              finally
            </em>{" "}
            at peace.
          </h1>

          {/* Subtext */}
          <p
            className="rn-sans rn-animate-fade-up"
            style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: "var(--rn-charcoal-light)",
              marginBottom: 40,
              maxWidth: 460,
              animationDelay: "0.12s",
            }}
          >
            Track every topic you study. Log when you revise. ReviNord
            calculates your optimal return window using spaced repetition—so
            nothing slips through the cracks before your exams.
          </p>

          {/* CTAs */}
          <div
            className="rn-animate-fade-up"
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              animationDelay: "0.18s",
            }}
          >
            <Link href="/dashboard" className="rn-btn-primary">
              Start for free
              <ArrowRight size={16} />
            </Link>
            <a href="#how-it-works" className="rn-btn-ghost">
              See how it works
            </a>
          </div>

          {/* Trust row */}
          <div
            className="rn-animate-fade-up"
            style={{
              display: "flex",
              gap: 20,
              marginTop: 28,
              flexWrap: "wrap",
              animationDelay: "0.24s",
            }}
          >
            {[
              "Free forever",
              "No credit card",
              "Private by default",
            ].map((t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "var(--rn-charcoal-light)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                <CheckCircle2 size={14} color="var(--rn-sage)" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Right: hero mock */}
        <div className="rn-animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <HeroMockCards />
        </div>
      </div>
    </section>
  );
}

/* ─── Demo Section ────────────────────────────────────────────────────────── */

function DemoSection() {
  return (
    <section
      style={{
        background: "var(--rn-cream-dark)",
        padding: "96px 32px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(123,158,123,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -40,
          left: -40,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(91,127,166,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 760, margin: "0 auto", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div
            className="rn-eyebrow"
            style={{ justifyContent: "center", marginBottom: 16 }}
          >
            <Sparkles size={12} />
            Live demo
          </div>
          <h2
            className="rn-serif"
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 500,
              color: "var(--rn-charcoal)",
              letterSpacing: "-0.025em",
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            Type a topic. Log a revision.
            <br />
            Watch the magic happen.
          </h2>
          <p
            className="rn-sans"
            style={{
              fontSize: 16,
              color: "var(--rn-charcoal-light)",
              lineHeight: 1.6,
              maxWidth: 440,
              margin: "0 auto",
            }}
          >
            This is exactly what the app feels like. Try adding a topic you're
            currently studying.
          </p>
        </div>

        <DemoWidget />
      </div>
    </section>
  );
}

/* ─── How It Works ────────────────────────────────────────────────────────── */

function HowItWorksSection() {
  const steps = [
    {
      n: "01",
      icon: Layers,
      color: "var(--rn-fjord)",
      bg: "var(--rn-fjord-bg)",
      title: "Add a topic",
      body: "Type any subject you're studying—Cardiology, Pharmacology, Anatomy. Each topic lives in its own quiet space on your timeline.",
    },
    {
      n: "02",
      icon: CheckCircle2,
      color: "var(--rn-sage)",
      bg: "var(--rn-sage-bg)",
      title: "Log a revision",
      body: "Studied it today? Mark it revised. ReviNord records the date and begins calculating your ideal next-review window using SM-2 spaced repetition.",
    },
    {
      n: "03",
      icon: CalendarDays,
      color: "var(--rn-terracotta)",
      bg: "var(--rn-terracotta-bg)",
      title: "Return at the right time",
      body: "See each topic's status at a glance: Fresh, On track, Due soon, Overdue. You always know what needs attention today—and what can wait.",
    },
  ];

  return (
    <section id="how-it-works" className="rn-section">
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div
            className="rn-eyebrow"
            style={{ justifyContent: "center", marginBottom: 16 }}
          >
            <RefreshCw size={12} />
            How it works
          </div>
          <h2
            className="rn-serif"
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 500,
              color: "var(--rn-charcoal)",
              letterSpacing: "-0.025em",
              lineHeight: 1.18,
            }}
          >
            Three steps.
            <br />
            <em style={{ color: "var(--rn-charcoal-light)", fontWeight: 400 }}>
              That&apos;s all it takes.
            </em>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 28,
          }}
        >
          {steps.map((step, i) => (
            <div
              key={step.n}
              style={{
                background: "var(--rn-cream-light)",
                border: "1.5px solid var(--rn-linen)",
                borderRadius: 20,
                padding: 36,
                position: "relative",
                boxShadow: "var(--rn-shadow-sm)",
              }}
            >
              {/* Step number */}
              <div
                className="rn-sans"
                style={{
                  position: "absolute",
                  top: 24,
                  right: 24,
                  fontSize: 40,
                  fontWeight: 700,
                  color: "var(--rn-linen-dark)",
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  userSelect: "none",
                }}
              >
                {step.n}
              </div>

              {/* Icon */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: step.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                <step.icon size={22} color={step.color} />
              </div>

              <h3
                className="rn-serif"
                style={{
                  fontSize: 21,
                  fontWeight: 600,
                  color: "var(--rn-charcoal)",
                  marginBottom: 12,
                  letterSpacing: "-0.02em",
                }}
              >
                {step.title}
              </h3>
              <p
                className="rn-sans"
                style={{
                  fontSize: 15,
                  lineHeight: 1.65,
                  color: "var(--rn-charcoal-light)",
                }}
              >
                {step.body}
              </p>

              {/* Connector arrow (not on last) */}
              {i < 2 && (
                <div
                  style={{
                    position: "absolute",
                    right: -18,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 1,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--rn-cream-dark)",
                    border: "1.5px solid var(--rn-linen)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronRight size={14} color="var(--rn-charcoal-muted)" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features chips ──────────────────────────────────────────────────────── */

function FeaturesSection() {
  const chips = [
    { label: "Add topics", color: "var(--rn-fjord)", bg: "var(--rn-fjord-bg)" },
    { label: "Delete & edit", color: "var(--rn-fjord)", bg: "var(--rn-fjord-bg)" },
    { label: "Revision timeline", color: "var(--rn-sage)", bg: "var(--rn-sage-bg)" },
    { label: "Due dates", color: "var(--rn-sage)", bg: "var(--rn-sage-bg)" },
    { label: "Status labels", color: "var(--rn-terracotta)", bg: "var(--rn-terracotta-bg)" },
    { label: "Spaced repetition", color: "var(--rn-terracotta)", bg: "var(--rn-terracotta-bg)" },
    { label: "Cross-device sync", color: "var(--rn-fjord)", bg: "var(--rn-fjord-bg)" },
    { label: "Private & secure", color: "var(--rn-sage)", bg: "var(--rn-sage-bg)" },
    { label: "CSV export", color: "var(--rn-charcoal-light)", bg: "var(--rn-cream-dark)" },
    { label: "Study streaks ✦", color: "var(--rn-terracotta)", bg: "var(--rn-terracotta-bg)", soon: true },
    { label: "Team sharing ✦", color: "var(--rn-charcoal-light)", bg: "var(--rn-cream-dark)", soon: true },
    { label: "Magic link auth", color: "var(--rn-fjord)", bg: "var(--rn-fjord-bg)" },
  ];

  return (
    <section
      style={{
        background: "var(--rn-cream-dark)",
        padding: "96px 32px",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
        <div
          className="rn-eyebrow"
          style={{ justifyContent: "center", marginBottom: 16 }}
        >
          <Layers size={12} />
          Everything included
        </div>
        <h2
          className="rn-serif"
          style={{
            fontSize: "clamp(26px, 4vw, 40px)",
            fontWeight: 500,
            color: "var(--rn-charcoal)",
            letterSpacing: "-0.025em",
            marginBottom: 16,
          }}
        >
          Designed for how medical students actually study.
        </h2>
        <p
          className="rn-sans"
          style={{
            fontSize: 16,
            color: "var(--rn-charcoal-light)",
            lineHeight: 1.6,
            marginBottom: 48,
            maxWidth: 500,
            margin: "0 auto 48px",
          }}
        >
          No bloat. No AI gimmicks. Just a calm, focused tool for tracking
          what matters.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
          }}
        >
          {chips.map((chip) => (
            <div
              key={chip.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 18px",
                borderRadius: 100,
                background: chip.bg,
                color: chip.color,
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "var(--font-inter)",
                border: chip.soon
                  ? "1px dashed var(--rn-linen-dark)"
                  : "none",
                opacity: chip.soon ? 0.75 : 1,
              }}
            >
              {!chip.soon && <CheckCircle2 size={13} />}
              {chip.label}
              {chip.soon && (
                <span
                  style={{
                    fontSize: 10,
                    background: "var(--rn-linen-dark)",
                    color: "var(--rn-charcoal-muted)",
                    borderRadius: 4,
                    padding: "1px 5px",
                    marginLeft: 2,
                  }}
                >
                  soon
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Trust Section ───────────────────────────────────────────────────────── */

function TrustSection() {
  return (
    <section className="rn-section">
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          {/* Left */}
          <div>
            <div
              className="rn-eyebrow"
              style={{ marginBottom: 20 }}
            >
              <Shield size={12} />
              Built to protect
            </div>
            <h2
              className="rn-serif"
              style={{
                fontSize: "clamp(26px, 3.5vw, 40px)",
                fontWeight: 500,
                color: "var(--rn-charcoal)",
                letterSpacing: "-0.025em",
                lineHeight: 1.2,
                marginBottom: 20,
              }}
            >
              Your study data
              <br />
              <em style={{ color: "var(--rn-fjord)" }}>stays yours.</em>
            </h2>
            <p
              className="rn-sans"
              style={{
                fontSize: 16,
                color: "var(--rn-charcoal-light)",
                lineHeight: 1.7,
                marginBottom: 36,
              }}
            >
              ReviNord is built on Supabase—a battle-tested open-source
              infrastructure trusted by hundreds of thousands of developers.
              Every row you create is protected by row-level security policies
              that ensure only you can access your data.
            </p>

            {/* Supabase badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 20px",
                borderRadius: 12,
                border: "1.5px solid var(--rn-linen)",
                background: "var(--rn-cream-light)",
                boxShadow: "var(--rn-shadow-xs)",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: "#3ECF8E",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Database size={14} color="white" />
              </div>
              <div>
                <div
                  className="rn-sans"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--rn-charcoal)",
                  }}
                >
                  Built on Supabase
                </div>
                <div
                  className="rn-sans"
                  style={{
                    fontSize: 11,
                    color: "var(--rn-charcoal-muted)",
                  }}
                >
                  Open-source · Row-level security · Encrypted
                </div>
              </div>
            </div>
          </div>

          {/* Right: trust pillars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {[
              {
                icon: Lock,
                color: "var(--rn-terracotta)",
                bg: "var(--rn-terracotta-bg)",
                title: "Row-level security",
                body: "PostgreSQL-enforced policies mean only you can read or write your topics—not even our team can see them.",
              },
              {
                icon: Wifi,
                color: "var(--rn-fjord)",
                bg: "var(--rn-fjord-bg)",
                title: "Synced across devices",
                body: "Study on your laptop, check status on your phone. Your revision history follows you everywhere, instantly.",
              },
              {
                icon: Shield,
                color: "var(--rn-sage)",
                bg: "var(--rn-sage-bg)",
                title: "Encrypted at rest",
                body: "All data is stored encrypted. Your medical study notes, revision dates, and history are never exposed.",
              },
            ].map((p) => (
              <div
                key={p.title}
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  padding: 22,
                  background: "var(--rn-cream-light)",
                  border: "1.5px solid var(--rn-linen)",
                  borderRadius: 16,
                  boxShadow: "var(--rn-shadow-xs)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 11,
                    background: p.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <p.icon size={18} color={p.color} />
                </div>
                <div>
                  <div
                    className="rn-sans"
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "var(--rn-charcoal)",
                      marginBottom: 4,
                    }}
                  >
                    {p.title}
                  </div>
                  <div
                    className="rn-sans"
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "var(--rn-charcoal-light)",
                    }}
                  >
                    {p.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            marginTop: 72,
            background: "var(--rn-linen)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {[
            { n: "3,200+", label: "Students tracking revisions" },
            { n: "180k+", label: "Revisions logged" },
            { n: "94%", label: "Study more consistently" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--rn-cream-light)",
                padding: "36px 32px",
                textAlign: "center",
              }}
            >
              <div
                className="rn-serif"
                style={{
                  fontSize: 40,
                  fontWeight: 600,
                  color: "var(--rn-charcoal)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                {s.n}
              </div>
              <div
                className="rn-sans"
                style={{
                  fontSize: 14,
                  color: "var(--rn-charcoal-light)",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─────────────────────────────────────────────────────────────── */

function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "€0",
      per: "forever",
      tagline: "Get started quietly.",
      features: [
        "Up to 10 topics",
        "Full revision history",
        "Status labels & due dates",
        "1 device",
        "Email magic link auth",
      ],
      cta: "Start for free",
      highlight: false,
    },
    {
      name: "Nord",
      price: "€4",
      per: "/ month",
      annual: "€39 billed yearly",
      tagline: "For the serious student.",
      features: [
        "Unlimited topics",
        "Study streaks",
        "CSV export",
        "Up to 3 devices",
        "1-year history",
        "Priority email support",
      ],
      cta: "Start Nord",
      highlight: true,
    },
    {
      name: "Pro",
      price: "€9",
      per: "/ month",
      annual: "€85 billed yearly",
      tagline: "For study groups & teams.",
      features: [
        "Everything in Nord",
        "Team mode (5 members)",
        "Shared topic libraries",
        "Analytics dashboard",
        "API access",
        "Priority support",
      ],
      cta: "Start Pro",
      highlight: false,
    },
  ];

  return (
    <section
      id="pricing"
      style={{ background: "var(--rn-cream-dark)", padding: "96px 32px" }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div
            className="rn-eyebrow"
            style={{ justifyContent: "center", marginBottom: 16 }}
          >
            <Sparkles size={12} />
            Pricing
          </div>
          <h2
            className="rn-serif"
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 500,
              color: "var(--rn-charcoal)",
              letterSpacing: "-0.025em",
              marginBottom: 12,
            }}
          >
            Honest, calm pricing.
          </h2>
          <p
            className="rn-sans"
            style={{
              fontSize: 16,
              color: "var(--rn-charcoal-light)",
            }}
          >
            No dark patterns. No surprise upgrades. Upgrade only when you need more.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            alignItems: "start",
          }}
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                background: plan.highlight
                  ? "var(--rn-charcoal)"
                  : "var(--rn-cream-light)",
                border: plan.highlight
                  ? "1.5px solid var(--rn-charcoal)"
                  : "1.5px solid var(--rn-linen)",
                borderRadius: 20,
                padding: 36,
                boxShadow: plan.highlight
                  ? "var(--rn-shadow-xl)"
                  : "var(--rn-shadow-sm)",
                position: "relative",
              }}
            >
              {plan.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--rn-terracotta)",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    padding: "4px 14px",
                    borderRadius: 20,
                    fontFamily: "var(--font-inter)",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Most popular
                </div>
              )}

              <div
                className="rn-sans"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: plan.highlight
                    ? "rgba(255,255,255,0.5)"
                    : "var(--rn-charcoal-muted)",
                  marginBottom: 12,
                }}
              >
                {plan.name}
              </div>

              <div style={{ marginBottom: 8 }}>
                <span
                  className="rn-serif"
                  style={{
                    fontSize: 44,
                    fontWeight: 600,
                    color: plan.highlight ? "white" : "var(--rn-charcoal)",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  {plan.price}
                </span>
                <span
                  className="rn-sans"
                  style={{
                    fontSize: 14,
                    color: plan.highlight
                      ? "rgba(255,255,255,0.5)"
                      : "var(--rn-charcoal-muted)",
                    marginLeft: 4,
                  }}
                >
                  {plan.per}
                </span>
              </div>

              {plan.annual && (
                <div
                  className="rn-sans"
                  style={{
                    fontSize: 12,
                    color: plan.highlight
                      ? "rgba(255,255,255,0.4)"
                      : "var(--rn-charcoal-muted)",
                    marginBottom: 6,
                  }}
                >
                  {plan.annual}
                </div>
              )}

              <div
                className="rn-sans"
                style={{
                  fontSize: 14,
                  color: plan.highlight
                    ? "rgba(255,255,255,0.65)"
                    : "var(--rn-charcoal-light)",
                  marginBottom: 28,
                  marginTop: 4,
                }}
              >
                {plan.tagline}
              </div>

              <hr
                style={{
                  border: "none",
                  height: 1,
                  background: plan.highlight
                    ? "rgba(255,255,255,0.1)"
                    : "var(--rn-linen)",
                  marginBottom: 24,
                }}
              />

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 11,
                }}
              >
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 9,
                      fontSize: 14,
                      color: plan.highlight ? "rgba(255,255,255,0.8)" : "var(--rn-charcoal-mid)",
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    <CheckCircle2
                      size={15}
                      color={plan.highlight ? "#7B9E7B" : "var(--rn-sage)"}
                      style={{ flexShrink: 0, marginTop: 1 }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  width: "100%",
                  padding: "13px 0",
                  borderRadius: 12,
                  background: plan.highlight
                    ? "var(--rn-terracotta)"
                    : "transparent",
                  border: plan.highlight
                    ? "none"
                    : "1.5px solid var(--rn-linen)",
                  color: plan.highlight ? "white" : "var(--rn-charcoal-mid)",
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: "var(--font-inter)",
                  textDecoration: "none",
                  transition: "all 0.18s ease",
                  boxShadow: plan.highlight
                    ? "0 2px 8px rgba(196,115,90,0.3)"
                    : "none",
                  boxSizing: "border-box",
                }}
              >
                {plan.cta}
                <ArrowRight size={15} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ───────────────────────────────────────────────────────────── */

function CTASection() {
  return (
    <section className="rn-section">
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: 18,
            background: "var(--rn-terracotta-bg)",
            marginBottom: 32,
          }}
        >
          <RefreshCw size={28} color="var(--rn-terracotta)" />
        </div>

        <h2
          className="rn-serif"
          style={{
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 500,
            color: "var(--rn-charcoal)",
            letterSpacing: "-0.03em",
            lineHeight: 1.12,
            marginBottom: 20,
          }}
        >
          Ready to study
          <br />
          with clarity?
        </h2>

        <p
          className="rn-sans"
          style={{
            fontSize: 17,
            color: "var(--rn-charcoal-light)",
            lineHeight: 1.65,
            marginBottom: 40,
            maxWidth: 440,
            margin: "0 auto 40px",
          }}
        >
          Join thousands of medical students who trust ReviNord to keep their
          revision on track—quietly, consistently, and without the noise.
        </p>

        <Link href="/dashboard" className="rn-btn-primary" style={{ fontSize: 16, padding: "15px 36px" }}>
          Start for free today
          <ArrowRight size={18} />
        </Link>

        <p
          className="rn-sans"
          style={{
            fontSize: 13,
            color: "var(--rn-charcoal-muted)",
            marginTop: 16,
          }}
        >
          No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--rn-linen)",
        padding: "48px 32px",
        background: "var(--rn-cream-dark)",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: "var(--rn-terracotta)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RefreshCw size={14} color="white" />
            </div>
            <span
              className="rn-serif"
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--rn-charcoal)",
                letterSpacing: "-0.02em",
              }}
            >
              ReviNord
            </span>
          </div>

          {/* Links */}
          <div
            style={{ display: "flex", gap: 28, flexWrap: "wrap" }}
          >
            {[
              { label: "Features", href: "#how-it-works" },
              { label: "Pricing", href: "#pricing" },
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
              { label: "Contact", href: "mailto:hello@revinord.app" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="rn-sans"
                style={{
                  fontSize: 14,
                  color: "var(--rn-charcoal-light)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <hr className="rn-divider" />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p
            className="rn-sans"
            style={{
              fontSize: 13,
              color: "var(--rn-charcoal-muted)",
            }}
          >
            © 2025 ReviNord. Crafted with care for students.
          </p>

          {/* Supabase badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontSize: 12,
              color: "var(--rn-charcoal-muted)",
              fontFamily: "var(--font-inter)",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                background: "#3ECF8E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Database size={10} color="white" />
            </div>
            Powered by Supabase
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <main
      className="rn-grain"
      style={{
        background: "var(--rn-cream)",
        color: "var(--rn-charcoal)",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <Nav />
      <HeroSection />
      <hr className="rn-divider" />
      <DemoSection />
      <hr className="rn-divider" />
      <HowItWorksSection />
      <hr className="rn-divider" />
      <FeaturesSection />
      <hr className="rn-divider" />
      <TrustSection />
      <hr className="rn-divider" />
      <PricingSection />
      <hr className="rn-divider" />
      <CTASection />
      <Footer />
    </main>
  );
}
