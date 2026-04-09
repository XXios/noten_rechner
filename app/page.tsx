"use client";

import { useState, useMemo } from "react";
import { Instrument_Serif, DM_Sans } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

type Kategorie = "LK" | "GK" | "Hosp" | "Spr";

type Fach = {
  id: string;
  name: string;
  multiplikator: number;
  kategorie: Kategorie;
};

// The 4 subjects the user picks from — 2 become LK, 2 become GK
const WAEHLBAR = [
  { id: "geschichte", name: "Geschichte" },
  { id: "deutsch", name: "Deutsch" },
  { id: "mathematik", name: "Mathematik" },
  { id: "geografie", name: "Geografie" },
];

// Fixed subjects — always the same category and weight
const FIXED_FAECHER: Fach[] = [
  { id: "biologie", name: "Biologie", multiplikator: 4, kategorie: "Hosp" },
  { id: "kunst", name: "Kunst", multiplikator: 4, kategorie: "Hosp" },
  { id: "englisch", name: "Englisch", multiplikator: 3, kategorie: "Spr" },
  { id: "russisch", name: "Russisch", multiplikator: 3, kategorie: "Spr" },
];

const KATEGORIEN: { id: Kategorie; label: string }[] = [
  { id: "LK", label: "Leistungskurse × 13" },
  { id: "GK", label: "Grundkurse × 9" },
  { id: "Hosp", label: "Hospitationsfächer × 4" },
  { id: "Spr", label: "Sprachen × 3" },
];

const GESAMT_GEWICHT = 13 + 13 + 9 + 9 + 4 + 4 + 3 + 3; // 58

function noteColor(note: number): string {
  if (note < 2.0) return "#4ade80";
  if (note < 3.0) return "#fbbf24";
  if (note < 4.0) return "#f97316";
  return "#ef4444";
}

function noteLabel(note: number): string {
  if (note < 2.0) return "Sehr gut";
  if (note < 3.0) return "Gut";
  if (note < 4.0) return "Befriedigend";
  return "Ausreichend";
}

export default function AbiturRechner() {
  const [step, setStep] = useState<"select" | "calc">("select");
  const [lkIds, setLkIds] = useState<string[]>([]);
  const [punkte, setPunkte] = useState<Record<string, number>>(
    Object.fromEntries(
      [...WAEHLBAR, ...FIXED_FAECHER].map((f) => [f.id, 12]),
    ),
  );

  // Build dynamic FAECHER based on LK selection
  const faecher = useMemo<Fach[]>(() => {
    const dynamic = WAEHLBAR.map((s) => ({
      id: s.id,
      name: s.name,
      multiplikator: lkIds.includes(s.id) ? 13 : 9,
      kategorie: (lkIds.includes(s.id) ? "LK" : "GK") as Kategorie,
    }));
    return [...dynamic, ...FIXED_FAECHER];
  }, [lkIds]);

  const { gesamtPunkte, durchschnitt, note } = useMemo(() => {
    const gesamtPunkte = faecher.reduce(
      (s, f) => s + (punkte[f.id] ?? 0) * f.multiplikator,
      0,
    );
    const durchschnitt = gesamtPunkte / GESAMT_GEWICHT;
    const note = Math.max(1.0, Math.min(6.0, (17 - durchschnitt) / 3));
    return { gesamtPunkte, durchschnitt, note };
  }, [punkte, faecher]);

  const setPunkt = (id: string, val: number) => {
    setPunkte((p) => ({ ...p, [id]: Math.max(0, Math.min(15, val)) }));
  };

  const toggleLk = (id: string) => {
    setLkIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length < 2) return [...prev, id];
      return prev; // already 2 selected — ignore
    });
  };

  const color = noteColor(note);

  // ── Selection screen ────────────────────────────────────────────────────────
  if (step === "select") {
    return (
      <div
        className={dmSans.className}
        style={{
          minHeight: "100vh",
          backgroundColor: "#0c0c0e",
          color: "#f2f2f5",
          animation: "fadeIn 0.5s ease both",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            padding:
              "clamp(3rem, 10vw, 5rem) clamp(1rem, 4vw, 1.5rem) 4rem",
          }}
        >
          {/* Header */}
          <header
            style={{
              marginBottom: "2.5rem",
              animation: "fadeUp 0.6s ease both",
            }}
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#3a3a50",
                marginBottom: 8,
              }}
            >
              Waldorfschule Chemnitz
            </p>
            <h1
              className={instrumentSerif.className}
              style={{
                fontSize: "clamp(26px, 7vw, 38px)",
                lineHeight: 1.15,
                color: "#f2f2f5",
                margin: 0,
              }}
            >
              Wähle deine
              <br />
              Leistungskurse
            </h1>
            <p style={{ color: "#3a3a50", fontSize: 13, marginTop: 10 }}>
              Wähle genau 2 Fächer · Die anderen 2 werden Grundkurse
            </p>
          </header>

          {/* Selection cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: "2rem",
            }}
          >
            {WAEHLBAR.map((s, i) => {
              const selected = lkIds.includes(s.id);
              const isGk = lkIds.length === 2 && !selected;
              return (
                <button
                  key={s.id}
                  onClick={() => toggleLk(s.id)}
                  style={{
                    backgroundColor: selected ? "#1a1a2e" : "#13131a",
                    border: selected
                      ? "1px solid #6c63ff60"
                      : "1px solid #1e1e28",
                    borderRadius: 16,
                    padding: "1.5rem 1.25rem",
                    cursor: "pointer",
                    textAlign: "left",
                    transition:
                      "background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.15s",
                    boxShadow: selected
                      ? "0 0 24px #6c63ff25"
                      : "none",
                    transform: selected ? "translateY(-2px)" : "none",
                    animation: `fadeUp 0.5s ${0.1 + i * 0.07}s ease both`,
                    outline: "none",
                  }}
                >
                  {/* LK / GK badge */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: selected
                          ? "#6c63ff"
                          : isGk
                          ? "#3a3a50"
                          : "#3a3a50",
                        transition: "color 0.2s",
                      }}
                    >
                      {selected ? "LK" : isGk ? "GK" : "—"}
                    </span>
                    {selected && (
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          backgroundColor: "#6c63ff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          animation: "fadeIn 0.2s ease",
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: selected ? "#f2f2f5" : isGk ? "#4a4a60" : "#a0a0b5",
                      margin: 0,
                      transition: "color 0.2s",
                    }}
                  >
                    {s.name}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: selected ? "#6c63ff" : "#3a3a50",
                      marginTop: 4,
                      transition: "color 0.2s",
                    }}
                  >
                    {selected ? "× 13" : "× 9"}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Fixed subjects preview */}
          <div
            style={{
              backgroundColor: "#13131a",
              border: "1px solid #1e1e28",
              borderRadius: 14,
              padding: "1rem 1.25rem",
              marginBottom: "2rem",
              animation: "fadeUp 0.5s 0.45s ease both",
            }}
          >
            <p
              style={{
                fontSize: 9,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#3a3a50",
                marginBottom: 10,
              }}
            >
              Feste Fächer
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px 16px",
              }}
            >
              {FIXED_FAECHER.map((f) => (
                <span
                  key={f.id}
                  style={{ fontSize: 13, color: "#4a4a60" }}
                >
                  {f.name}{" "}
                  <span style={{ color: "#2a2a42" }}>× {f.multiplikator}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Continue button */}
          <div
            style={{
              animation: "fadeUp 0.5s 0.55s ease both",
            }}
          >
            <button
              onClick={() => lkIds.length === 2 && setStep("calc")}
              disabled={lkIds.length < 2}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: 14,
                border: "none",
                backgroundColor:
                  lkIds.length === 2 ? "#6c63ff" : "#1e1e28",
                color: lkIds.length === 2 ? "#fff" : "#3a3a50",
                fontSize: 15,
                fontWeight: 600,
                cursor: lkIds.length === 2 ? "pointer" : "default",
                transition:
                  "background 0.3s, color 0.3s, box-shadow 0.3s, transform 0.15s",
                boxShadow:
                  lkIds.length === 2 ? "0 0 24px #6c63ff40" : "none",
                transform:
                  lkIds.length === 2 ? "translateY(0)" : "none",
                fontFamily: "inherit",
              }}
            >
              {lkIds.length === 2
                ? "Weiter zum Rechner →"
                : `Noch ${2 - lkIds.length} ${lkIds.length === 1 ? "Fach" : "Fächer"} wählen`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Calculator screen ────────────────────────────────────────────────────────
  return (
    <div
      className={dmSans.className}
      style={{
        minHeight: "100vh",
        backgroundColor: "#0c0c0e",
        color: "#f2f2f5",
        animation: "fadeIn 0.4s ease both",
      }}
    >
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding:
            "clamp(2rem, 6vw, 4rem) clamp(1rem, 4vw, 1.5rem) 6rem",
        }}
      >
        {/* ── Header ── */}
        <header
          style={{
            marginBottom: "2.5rem",
            animation: "fadeUp 0.6s ease both",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#3a3a50",
                marginBottom: 8,
              }}
            >
              Waldorfschule Chemnitz
            </p>
            <h1
              className={instrumentSerif.className}
              style={{
                fontSize: "clamp(28px, 7vw, 42px)",
                lineHeight: 1.1,
                color: "#f2f2f5",
                margin: 0,
              }}
            >
              Abiturnotenrechner
            </h1>
            <p style={{ color: "#3a3a50", fontSize: 13, marginTop: 8 }}>
              Gewichtetes Punktesystem · Gesamtgewicht {GESAMT_GEWICHT} · Note
              = (17 − Ø) ÷ 3
            </p>
          </div>

          {/* Back button */}
          <button
            onClick={() => setStep("select")}
            style={{
              flexShrink: 0,
              marginTop: 4,
              backgroundColor: "transparent",
              border: "1px solid #1e1e28",
              borderRadius: 10,
              padding: "6px 12px",
              color: "#3a3a50",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#3a3a50";
              (e.currentTarget as HTMLButtonElement).style.color = "#a0a0b5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#1e1e28";
              (e.currentTarget as HTMLButtonElement).style.color = "#3a3a50";
            }}
          >
            ← Kurse ändern
          </button>
        </header>

        {/* ── Result card ── */}
        <div
          className="result-card"
          style={{
            backgroundColor: "#13131a",
            borderRadius: 20,
            padding:
              "clamp(1.25rem, 4vw, 2rem) clamp(1.25rem, 4vw, 2.5rem)",
            marginBottom: "2.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            border: `1px solid ${color}30`,
            boxShadow: `0 0 48px ${color}12, 0 8px 32px rgba(0,0,0,0.5)`,
            animation: "fadeUp 0.6s 0.1s ease both",
          }}
        >
          <div>
            <p
              style={{
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#3a3a50",
                marginBottom: 6,
              }}
            >
              Abiturnote
            </p>
            <div
              className={instrumentSerif.className}
              style={{
                fontSize: "clamp(56px, 14vw, 80px)",
                lineHeight: 1,
                color,
                transition: "color 0.35s ease, text-shadow 0.35s ease",
                textShadow: `0 0 32px ${color}50`,
              }}
            >
              {note.toFixed(1).replace(".", ",")}
            </div>
            <p
              style={{
                color,
                fontSize: 12,
                marginTop: 6,
                transition: "color 0.35s ease",
              }}
            >
              {noteLabel(note)}
            </p>
          </div>

          <div
            className="result-stats"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              textAlign: "right",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#3a3a50",
                  marginBottom: 2,
                }}
              >
                Gesamtpunkte
              </p>
              <p
                style={{
                  color: "#f2f2f5",
                  fontSize: 26,
                  fontWeight: 300,
                  lineHeight: 1,
                }}
              >
                {Math.round(gesamtPunkte)}
              </p>
              <p style={{ color: "#3a3a50", fontSize: 11 }}>
                von {GESAMT_GEWICHT * 15} max.
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#3a3a50",
                  marginBottom: 2,
                }}
              >
                Ø Punkte
              </p>
              <p
                style={{
                  color: "#f2f2f5",
                  fontSize: 26,
                  fontWeight: 300,
                  lineHeight: 1,
                }}
              >
                {durchschnitt.toFixed(2).replace(".", ",")}
              </p>
              <p style={{ color: "#3a3a50", fontSize: 11 }}>
                Ziel für &lt;2,0: ≥ 11,0
              </p>
            </div>
          </div>
        </div>

        {/* ── Subjects ── */}
        {KATEGORIEN.map(({ id: kat, label }, katIdx) => {
          const subjects = faecher.filter((f) => f.kategorie === kat);
          if (subjects.length === 0) return null;
          return (
            <section
              key={kat}
              style={{
                marginBottom: "2rem",
                animation: `fadeUp 0.5s ${0.15 + katIdx * 0.08}s ease both`,
              }}
            >
              {/* Category header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#3a3a50",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
                <div
                  style={{ flex: 1, height: 1, backgroundColor: "#1e1e28" }}
                />
              </div>

              {/* Subject rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {subjects.map((f, fIdx) => {
                  const val = punkte[f.id] ?? 0;
                  const weighted = val * f.multiplikator;
                  const subjectColor = noteColor(
                    Math.max(1, Math.min(6, (17 - val) / 3)),
                  );
                  return (
                    <div
                      key={f.id}
                      className="subject-row"
                      style={{
                        backgroundColor: "#13131a",
                        border: "1px solid #1e1e28",
                        borderRadius: 12,
                        padding: "14px 20px",
                        animation: `fadeUp 0.4s ${0.2 + katIdx * 0.08 + fIdx * 0.05}s ease both`,
                      }}
                    >
                      <div
                        className="subject-row-inner"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                        }}
                      >
                        <span
                          className="subject-name"
                          style={{
                            flex: 1,
                            fontSize: 14,
                            color: "#a0a0b5",
                            minWidth: 80,
                          }}
                        >
                          {f.name}
                        </span>

                        <input
                          type="range"
                          min={0}
                          max={15}
                          step={1}
                          value={val}
                          onChange={(e) =>
                            setPunkt(f.id, Number(e.target.value))
                          }
                          className="slider-col"
                          style={
                            {
                              width: 110,
                              "--thumb-color": subjectColor,
                            } as React.CSSProperties
                          }
                        />

                        <input
                          type="number"
                          min={0}
                          max={15}
                          step={1}
                          value={val}
                          onChange={(e) =>
                            setPunkt(f.id, Number(e.target.value))
                          }
                          style={{
                            width: 44,
                            textAlign: "center",
                            fontSize: 14,
                            fontWeight: 500,
                            border: "1px solid #2a2a35",
                            borderRadius: 8,
                            padding: "4px 0",
                            outline: "none",
                            backgroundColor: "#0c0c0e",
                            color: "#f2f2f5",
                            fontVariantNumeric: "tabular-nums",
                            flexShrink: 0,
                          }}
                        />

                        <span
                          className="weighted-label"
                          style={{
                            fontSize: 12,
                            color: "#2a2a42",
                            width: 52,
                            textAlign: "right",
                            fontVariantNumeric: "tabular-nums",
                            flexShrink: 0,
                          }}
                        >
                          = {weighted}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* ── Footer ── */}
        <p
          style={{
            textAlign: "center",
            color: "#2a2a35",
            fontSize: 11,
            marginTop: "3rem",
          }}
        >
          Punkte: 0 – 15 · Note = (17 − Ø) ÷ 3 · Gesamtgewicht ={" "}
          {GESAMT_GEWICHT}
        </p>
      </div>
    </div>
  );
}
