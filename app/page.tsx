import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Layers,
  RefreshCw,
  CalendarDays,
  Sparkles,
  ChevronRight,
  Database,
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
          href="#slik-fungerer-det"
          style={{
            fontSize: 14,
            color: "var(--rn-charcoal-light)",
            textDecoration: "none",
            fontFamily: "var(--font-inter)",
            transition: "color 0.15s",
          }}
        >
          Slik fungerer det
        </a>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/login" className="rn-btn-ghost" style={{ padding: "8px 16px", fontSize: 14 }}>
            Logg inn
          </Link>
          <Link href="/login" className="rn-btn-primary" style={{ padding: "8px 16px", fontSize: 14 }}>
            Start gratis
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero mock cards ─────────────────────────────────────────────────────── */

const MOCK_CARDS = [
  {
    subject: "Kardiologi",
    emoji: "🫀",
    daysAgo: 12,
    status: "Om 2 dager",
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
    subject: "Farmakologi",
    emoji: "💊",
    daysAgo: 3,
    status: "På sporet",
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
    subject: "Anatomi",
    emoji: "🦴",
    daysAgo: 22,
    status: "Forfalt",
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
                Repetert for {card.daysAgo} dager siden
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
                Kardiologi
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 12,
                color: "var(--rn-charcoal-light)",
              }}
            >
              Repetert for 12 dager siden
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
            Om 2 dager
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
            Sist repetert
          </span>
          <span
            style={{
              fontSize: 10,
              color: "var(--rn-terracotta)",
              fontFamily: "var(--font-inter)",
              fontWeight: 500,
            }}
          >
            Om 2 dager →
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
            For medisinstudenter
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
            Din revisjon,
            <br />
            <em style={{ fontStyle: "italic", color: "var(--rn-terracotta)" }}>
              endelig
            </em>{" "}
            i ro.
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
            Spor hvert emne du studerer. Logg når du repeterer. ReviNord
            beregner ditt optimale returvindu med spredd repetisjon—så ingenting
            faller gjennom sprekkene før eksamen.
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
            <Link href="/login" className="rn-btn-primary">
              Start gratis
              <ArrowRight size={16} />
            </Link>
            <a href="#slik-fungerer-det" className="rn-btn-ghost">
              Se hvordan det fungerer
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
              "Gratis for alltid",
              "Ingen kredittkort",
              "Privat som standard",
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
            Skriv et emne. Logg en revisjon.
            <br />
            Se magien skje.
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
            Dette er nøyaktig slik appen føles. Prøv å legge til et emne du
            studerer for øyeblikket.
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
      title: "Legg til et emne",
      body: "Skriv inn et fag du studerer—Kardiologi, Farmakologi, Anatomi. Hvert emne lever i sitt eget rolige rom på tidslinjen din.",
    },
    {
      n: "02",
      icon: CheckCircle2,
      color: "var(--rn-sage)",
      bg: "var(--rn-sage-bg)",
      title: "Logg en revisjon",
      body: "Studerte du det i dag? Merk det som repetert. ReviNord registrerer datoen og begynner å beregne ditt ideelle neste gjennomgangsvindu med SM-2 spredd repetisjon.",
    },
    {
      n: "03",
      icon: CalendarDays,
      color: "var(--rn-terracotta)",
      bg: "var(--rn-terracotta-bg)",
      title: "Kom tilbake til rett tid",
      body: "Se hvert emnes status med et blikk: Fersk, På sporet, Forfaller snart, Forfalt. Du vet alltid hva som trenger oppmerksomhet i dag—og hva som kan vente.",
    },
  ];

  return (
    <section id="slik-fungerer-det" className="rn-section">
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div
            className="rn-eyebrow"
            style={{ justifyContent: "center", marginBottom: 16 }}
          >
            <RefreshCw size={12} />
            Slik fungerer det
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
            Tre steg.
            <br />
            <em style={{ color: "var(--rn-charcoal-light)", fontWeight: 400 }}>
              Det er alt som trengs.
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
          Klar til å studere
          <br />
          med klarhet?
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
          Bli med tusenvis av medisinstudenter som stoler på ReviNord for å
          holde revisjonen på sporet—stille, konsekvent og uten støy.
        </p>

        <Link href="/login" className="rn-btn-primary" style={{ fontSize: 16, padding: "15px 36px" }}>
          Start gratis i dag
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
          Ingen kredittkort nødvendig · Gratis for alltid
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
              { label: "Funksjoner", href: "#slik-fungerer-det" },
              { label: "Personvern", href: "#" },
              { label: "Vilkår", href: "#" },
              { label: "Kontakt", href: "mailto:hei@revinord.app" },
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
            © 2025 ReviNord. Laget med omsorg for studenter.
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
            Drevet av Supabase
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
      <CTASection />
      <Footer />
    </main>
  );
}
