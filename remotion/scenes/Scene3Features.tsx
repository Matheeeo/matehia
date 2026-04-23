import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Sequence } from 'remotion';
import { C } from '../lib/colors';
import { easeOutExpo, easeOutCubic } from '../lib/easing';
import { ArcBackground } from '../components/ArcBackground';

const FONT = "'Inter', 'Helvetica Neue', -apple-system, sans-serif";

// ── Helpers ──────────────────────────────────────────────────────────────────

interface FadeSlideProps {
  startFrame: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  dy?: number;
  duration?: number;
}
const FadeSlide: React.FC<FadeSlideProps> = ({ startFrame, children, style, dy = 32, duration = 30 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const y = interpolate(frame, [startFrame, startFrame + duration], [dy, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutExpo,
  });
  return <div style={{ opacity, transform: `translateY(${y}px)`, ...style }}>{children}</div>;
};

// ── Large background number (luxury detail) ───────────────────────────────────
const BgNumber: React.FC<{ num: string; startFrame: number }> = ({ num, startFrame }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + 40], [0, 0.04], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <div style={{
      position: 'absolute',
      right: 80,
      bottom: -60,
      fontSize: 360,
      fontWeight: 900,
      fontFamily: FONT,
      color: C.white,
      opacity,
      lineHeight: 1,
      userSelect: 'none',
      pointerEvents: 'none',
      letterSpacing: -20,
    }}>
      {num}
    </div>
  );
};

// ── Text panel ───────────────────────────────────────────────────────────────
interface TextPanelProps {
  num: string;
  label: string;
  color: string;
  title: string;
  body: string;
  stats: string[];
  startFrame: number;
}
const TextPanel: React.FC<TextPanelProps> = ({ num, label, color, title, body, stats, startFrame }) => {
  const frame = useCurrentFrame();
  const accentW = interpolate(frame, [startFrame + 10, startFrame + 48], [0, 56], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  const eyebrowOpacity = interpolate(frame, [startFrame, startFrame + 22], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <div style={{ flex: 1, paddingRight: 90 }}>
      {/* Eyebrow */}
      <div style={{ opacity: eyebrowOpacity, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: FONT, color, letterSpacing: 3.5, textTransform: 'uppercase' }}>{num}</span>
        <div style={{ width: 28, height: 1, background: color, opacity: 0.4 }} />
        <span style={{ fontSize: 11, fontWeight: 600, fontFamily: FONT, color: C.muted, letterSpacing: 2.5, textTransform: 'uppercase' }}>{label}</span>
      </div>

      {/* Accent bar */}
      <div style={{ width: accentW, height: 3, background: color, borderRadius: 2, marginBottom: 30 }} />

      {/* Title */}
      <FadeSlide startFrame={startFrame + 14} dy={28} duration={32}>
        <div style={{
          fontSize: 64,
          fontWeight: 800,
          fontFamily: FONT,
          color: C.white,
          letterSpacing: -2.5,
          lineHeight: 1.05,
          marginBottom: 28,
          whiteSpace: 'pre-line',
        }}>
          {title}
        </div>
      </FadeSlide>

      {/* Body */}
      <FadeSlide startFrame={startFrame + 36} dy={20} duration={30}>
        <div style={{
          fontSize: 19,
          fontWeight: 300,
          fontFamily: FONT,
          color: C.muted,
          lineHeight: 1.72,
          letterSpacing: 0.1,
          maxWidth: 500,
          marginBottom: 40,
        }}>
          {body}
        </div>
      </FadeSlide>

      {/* Stats tags */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {stats.map((stat, i) => {
          const tagOpacity = interpolate(frame, [startFrame + 50 + i * 10, startFrame + 72 + i * 10], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          return (
            <span key={stat} style={{
              opacity: tagOpacity,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: FONT,
              color,
              padding: '6px 14px',
              borderRadius: 7,
              border: `1px solid ${color}33`,
              background: `${color}0d`,
              letterSpacing: 0.4,
            }}>
              {stat}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ── Mockups ───────────────────────────────────────────────────────────────────

const MessageriesMockup: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const items = [
    { name: 'Mathéo SAUDRAIS', tag: 'À répondre', tagColor: C.purple, time: 'Hier', excerpt: 'Comment ça va ?' },
    { name: 'JM Mahé', tag: 'Priorité IA', tagColor: C.orange, time: '17/04', excerpt: 'Bonjour, merci de me rappeler...' },
    { name: 'Chayann Caillaud', tag: 'En attente', tagColor: C.dim, time: '22/04', excerpt: 'ok' },
  ];
  return (
    <FadeSlide startFrame={startFrame + 8} dy={28} duration={32} style={{ width: 540 }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.purple }} />
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: FONT, color: C.white }}>Messageries</span>
          <span style={{ fontSize: 12, fontFamily: FONT, color: C.dim, marginLeft: 2 }}>· Messages & relances</span>
        </div>
        {items.map((item, i) => {
          const op = interpolate(frame, [startFrame + 18 + i * 14, startFrame + 38 + i * 14], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          return (
            <div key={item.name} style={{ opacity: op, padding: '15px 20px', borderBottom: `1px solid rgba(255,255,255,0.04)`, display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: `1px solid rgba(99,102,241,0.2)`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, fontFamily: FONT, color: C.purple }}>
                {item.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, fontFamily: FONT, color: C.white }}>{item.name}</span>
                  <span style={{ fontSize: 12, fontFamily: FONT, color: C.dim }}>{item.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, fontFamily: FONT, color: item.tagColor, padding: '2px 7px', borderRadius: 4, background: `${item.tagColor}18`, border: `1px solid ${item.tagColor}33` }}>{item.tag}</span>
                  <span style={{ fontSize: 12, fontFamily: FONT, color: C.dim }}>{item.excerpt}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ padding: '14px 20px', background: 'rgba(99,102,241,0.05)', borderTop: `1px solid rgba(99,102,241,0.12)` }}>
          <div style={{ fontSize: 10, fontWeight: 700, fontFamily: FONT, color: C.purple, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 6 }}>⚡ Analyse IA</div>
          <div style={{ fontSize: 12, fontFamily: FONT, color: C.muted, lineHeight: 1.6 }}>Qualifier le contact et comprendre son besoin métier avant d&apos;engager.</div>
        </div>
      </div>
    </FadeSlide>
  );
};

const ActionsMockup: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const sections = [
    { label: 'EN RETARD', color: C.orange, tasks: [{ name: 'JM Mahé', tag: 'Vente', desc: 'Demande de rappel à 8h demain matin' }] },
    { label: "AUJOURD'HUI", color: C.purple, tasks: [{ name: 'Mathéo SAUDRAIS', tag: 'Conv. liée', desc: 'Qualifier le besoin commercial' }] },
  ];
  return (
    <FadeSlide startFrame={startFrame + 8} dy={28} duration={32} style={{ width: 540 }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.orange }} />
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: FONT, color: C.white }}>Actions</span>
          <div style={{ marginLeft: 'auto', background: C.purple, borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, fontFamily: FONT, color: C.white }}>3 en cours</div>
        </div>
        {sections.map((sec, si) => (
          <div key={sec.label}>
            <div style={{ padding: '12px 20px 6px', fontSize: 10, fontWeight: 700, fontFamily: FONT, color: sec.color, letterSpacing: 2.5 }}>{sec.label}</div>
            {sec.tasks.map((task, ti) => {
              const op = interpolate(frame, [startFrame + 20 + si * 16 + ti * 8, startFrame + 40 + si * 16 + ti * 8], [0, 1], {
                extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
              });
              return (
                <div key={task.name} style={{ opacity: op, padding: '14px 20px', borderBottom: `1px solid rgba(255,255,255,0.04)`, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: sec.color, flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <div style={{ display: 'flex', gap: 9, alignItems: 'center', marginBottom: 5 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, fontFamily: FONT, color: C.white }}>{task.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, fontFamily: FONT, color: C.purple, padding: '2px 7px', borderRadius: 4, background: `${C.purple}18`, border: `1px solid ${C.purple}33` }}>{task.tag}</span>
                    </div>
                    <div style={{ fontSize: 12, fontFamily: FONT, color: C.muted }}>{task.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </FadeSlide>
  );
};

const AujourdhuiMockup: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const stats = [
    { num: '2', label: 'Actions prioritaires', color: C.orange },
    { num: '2', label: 'Messages prioritaires', color: C.purple },
    { num: '0', label: "Événements aujourd'hui", color: C.blue },
  ];
  return (
    <FadeSlide startFrame={startFrame + 8} dy={28} duration={32} style={{ width: 540 }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden' }}>
        <div style={{ padding: '20px 22px 16px' }}>
          <div style={{ fontSize: 11, fontFamily: FONT, color: C.dim, letterSpacing: 1, marginBottom: 7 }}>JEUDI 23 AVRIL</div>
          <div style={{ fontSize: 30, fontWeight: 700, fontFamily: FONT, color: C.white, letterSpacing: -0.5, marginBottom: 5 }}>Bonjour, Saudrais.</div>
          <div style={{ fontSize: 13, fontFamily: FONT, color: C.muted }}>Voici l&apos;essentiel de votre journée.</div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '0 22px 20px' }}>
          {stats.map((stat, i) => {
            const op = interpolate(frame, [startFrame + 18 + i * 12, startFrame + 36 + i * 12], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            return (
              <div key={stat.label} style={{ opacity: op, flex: 1, padding: '14px 16px', borderRadius: 12, border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: stat.color, marginBottom: 8 }} />
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: FONT, color: C.white }}>{stat.num}</div>
                <div style={{ fontSize: 11, fontFamily: FONT, color: C.muted, marginTop: 3, lineHeight: 1.4 }}>{stat.label}</div>
              </div>
            );
          })}
        </div>
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '16px 22px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, fontFamily: FONT, color: C.purple, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 10 }}>⚡ Synthèse IA</div>
          <div style={{ fontSize: 13, fontFamily: FONT, color: C.muted, lineHeight: 1.65 }}>1 action en retard · 2 messages prioritaires · Agenda relié, aucun événement futur programmé.</div>
        </div>
      </div>
    </FadeSlide>
  );
};

// ── Feature data ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    num: '01', label: 'Messageries', color: C.purple,
    title: "Inbox IA\nmulti-canal",
    body: "Email, SMS, WhatsApp, LinkedIn — centralisés avec analyse IA, résumé automatique et action suggérée.",
    stats: ['Analyse IA', 'Multi-canal', 'Résumé auto'],
    Mockup: MessageriesMockup,
  },
  {
    num: '02', label: 'Actions', color: C.orange,
    title: "File\nd'exécution",
    body: "Vos priorités classifiées par l'IA. En retard, urgences, suivi — orchestrés en temps réel.",
    stats: ['En retard', 'Urgences', 'Suivi'],
    Mockup: ActionsMockup,
  },
  {
    num: '03', label: "Aujourd'hui", color: C.blue,
    title: "Vue\nexécutive",
    body: "Bonjour. Voici l'essentiel de votre journée. Synthèse IA, agenda et statistiques en un coup d'œil.",
    stats: ['Synthèse IA', 'Agenda', 'Stats jour'],
    Mockup: AujourdhuiMockup,
  },
] as const;

// 3 spotlights × 120 frames = 360 frames = 12s
export const Scene3Features: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 20, 340, 360], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>
      <ArcBackground drawStart={0} drawDuration={50} globalOpacity={0.75} />

      {FEATURES.map((feat, idx) => {
        const { Mockup } = feat;
        const seqStart = idx * 120;
        if (frame < seqStart || frame >= seqStart + 145) return null;

        const localFrame = frame - seqStart;
        const spotOpacity = interpolate(localFrame, [0, 18, 100, 120], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <Sequence key={feat.num} from={seqStart} durationInFrames={130}>
            <AbsoluteFill style={{ opacity: spotOpacity }}>
              {/* Large background number */}
              <BgNumber num={feat.num} startFrame={10} />

              <div style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                padding: '0 140px',
                gap: 70,
              }}>
                <TextPanel
                  num={feat.num}
                  label={feat.label}
                  color={feat.color}
                  title={feat.title}
                  body={feat.body}
                  stats={[...feat.stats]}
                  startFrame={14}
                />
                <Mockup startFrame={14} />
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
