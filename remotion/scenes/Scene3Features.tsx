import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Sequence } from 'remotion';
import { C } from '../lib/colors';
import { easeOutExpo, easeOutCubic } from '../lib/easing';
import { ArcBackground } from '../components/ArcBackground';

const FONT = "'Inter', 'Helvetica Neue', -apple-system, sans-serif";

// ── Shared helpers ───────────────────────────────────────────────────────────

interface FadeSlideProps {
  startFrame: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  dy?: number;
}
const FadeSlide: React.FC<FadeSlideProps> = ({ startFrame, children, style, dy = 32 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + 24], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const y = interpolate(frame, [startFrame, startFrame + 24], [dy, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutExpo,
  });
  return <div style={{ opacity, transform: `translateY(${y}px)`, ...style }}>{children}</div>;
};

// ── Eyebrow + Number label ────────────────────────────────────────────────────
const Eyebrow: React.FC<{ label: string; num: string; color: string; startFrame: number }> = ({ label, num, color, startFrame }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + 18], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <div style={{ opacity, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: FONT, color, letterSpacing: 3, textTransform: 'uppercase' }}>{num}</span>
      <div style={{ width: 28, height: 1, background: color, opacity: 0.5 }} />
      <span style={{ fontSize: 11, fontWeight: 600, fontFamily: FONT, color: C.muted, letterSpacing: 2.5, textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
};

// ── Left panel: text content ──────────────────────────────────────────────────
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
  const accentWidth = interpolate(frame, [startFrame + 8, startFrame + 36], [0, 48], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  return (
    <div style={{ flex: 1, paddingRight: 80 }}>
      <Eyebrow label={label} num={num} color={color} startFrame={startFrame} />
      <div style={{ width: accentWidth, height: 3, background: color, borderRadius: 2, marginBottom: 28 }} />
      <FadeSlide startFrame={startFrame + 12} dy={24}>
        <div style={{ fontSize: 58, fontWeight: 800, fontFamily: FONT, color: C.white, letterSpacing: -2, lineHeight: 1.05, marginBottom: 24 }}>
          {title}
        </div>
      </FadeSlide>
      <FadeSlide startFrame={startFrame + 22} dy={16}>
        <div style={{ fontSize: 18, fontWeight: 300, fontFamily: FONT, color: C.muted, lineHeight: 1.65, letterSpacing: 0.1, maxWidth: 480, marginBottom: 36 }}>
          {body}
        </div>
      </FadeSlide>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {stats.map((stat, i) => {
          const opacity = interpolate(frame, [startFrame + 30 + i * 8, startFrame + 48 + i * 8], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          return (
            <span key={stat} style={{
              opacity,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: FONT,
              color: color,
              padding: '5px 12px',
              borderRadius: 6,
              border: `1px solid ${color}33`,
              background: `${color}10`,
              letterSpacing: 0.3,
            }}>
              {stat}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ── Mini UI mockups ───────────────────────────────────────────────────────────

// Messageries mockup: conversation list + AI panel hint
const MessageriesMockup: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const items = [
    { name: 'Mathéo SAUDRAIS', tag: 'À répondre', tagColor: C.purple, time: 'Hier', excerpt: 'Comment ça va ?' },
    { name: 'JM Mahé', tag: 'Priorité IA', tagColor: C.orange, time: '17/04', excerpt: 'Bonjour Jean Michel, Merci po...' },
    { name: 'Chayann Caillaud', tag: 'En attente', tagColor: C.muted, time: '22/04', excerpt: 'ok' },
  ];
  return (
    <FadeSlide startFrame={startFrame + 5} dy={24} style={{ width: 520 }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.purple }} />
          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: FONT, color: C.white }}>Messageries</span>
          <span style={{ fontSize: 11, fontWeight: 400, fontFamily: FONT, color: C.dim, marginLeft: 2 }}>· Messages & relances</span>
        </div>
        {/* Conversation list */}
        {items.map((item, i) => {
          const itemOpacity = interpolate(frame, [startFrame + 12 + i * 10, startFrame + 28 + i * 10], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          return (
            <div key={item.name} style={{ opacity: itemOpacity, padding: '13px 18px', borderBottom: `1px solid rgba(255,255,255,0.04)`, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: `1px solid rgba(99,102,241,0.2)`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, fontFamily: FONT, color: C.purple }}>
                {item.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, fontFamily: FONT, color: C.white }}>{item.name}</span>
                  <span style={{ fontSize: 11, fontFamily: FONT, color: C.dim }}>{item.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, fontFamily: FONT, color: item.tagColor, padding: '1px 6px', borderRadius: 4, background: `${item.tagColor}18`, border: `1px solid ${item.tagColor}33` }}>{item.tag}</span>
                  <span style={{ fontSize: 11, fontFamily: FONT, color: C.dim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.excerpt}</span>
                </div>
              </div>
            </div>
          );
        })}
        {/* AI analysis hint */}
        <div style={{ padding: '12px 18px', background: 'rgba(99,102,241,0.05)', borderTop: `1px solid rgba(99,102,241,0.12)` }}>
          <div style={{ fontSize: 10, fontWeight: 700, fontFamily: FONT, color: C.purple, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5 }}>⚡ Analyse IA</div>
          <div style={{ fontSize: 11, fontFamily: FONT, color: C.muted, lineHeight: 1.5 }}>Qualifier le contact et comprendre son besoin métier avant d&apos;engager une conversation.</div>
        </div>
      </div>
    </FadeSlide>
  );
};

// Actions mockup: task queue
const ActionsMockup: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const sections = [
    { label: 'EN RETARD', color: C.orange, tasks: [{ name: 'JM Mahé', tag: 'Vente', desc: 'Demande de rappel à 8h demain matin' }] },
    { label: "AUJOURD'HUI", color: C.purple, tasks: [{ name: 'Mathéo SAUDRAIS', tag: 'Conversation liée', desc: 'Qualifier le besoin commercial' }] },
  ];
  return (
    <FadeSlide startFrame={startFrame + 5} dy={24} style={{ width: 520 }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.orange }} />
          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: FONT, color: C.white }}>Actions</span>
          <div style={{ marginLeft: 'auto', background: C.purple, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, fontFamily: FONT, color: C.white }}>3 en cours</div>
        </div>
        {sections.map((sec, si) => (
          <div key={sec.label}>
            <div style={{ padding: '10px 18px 6px', fontSize: 10, fontWeight: 700, fontFamily: FONT, color: sec.color, letterSpacing: 2 }}>{sec.label}</div>
            {sec.tasks.map((task, ti) => {
              const itemOpacity = interpolate(frame, [startFrame + 14 + si * 12 + ti * 6, startFrame + 30 + si * 12 + ti * 6], [0, 1], {
                extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
              });
              return (
                <div key={task.name} style={{ opacity: itemOpacity, padding: '12px 18px', borderBottom: `1px solid rgba(255,255,255,0.04)`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: sec.color, flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, fontFamily: FONT, color: C.white }}>{task.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, fontFamily: FONT, color: C.purple, padding: '1px 6px', borderRadius: 4, background: `${C.purple}18`, border: `1px solid ${C.purple}33` }}>{task.tag}</span>
                    </div>
                    <div style={{ fontSize: 11, fontFamily: FONT, color: C.muted }}>{task.desc}</div>
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

// Aujourd'hui mockup: executive dashboard
const AujourdhuiMockup: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const stats = [
    { num: '2', label: "Actions prioritaires", color: C.orange },
    { num: '2', label: 'Messages prioritaires', color: C.purple },
    { num: '0', label: "Événements aujourd'hui", color: C.blue },
  ];
  return (
    <FadeSlide startFrame={startFrame + 5} dy={24} style={{ width: 520 }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px 14px' }}>
          <div style={{ fontSize: 11, fontFamily: FONT, color: C.dim, letterSpacing: 1, marginBottom: 6 }}>JEUDI 23 AVRIL</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: FONT, color: C.white, marginBottom: 4 }}>Bonjour, Saudrais.</div>
          <div style={{ fontSize: 12, fontFamily: FONT, color: C.muted }}>Voici l&apos;essentiel de votre journée.</div>
        </div>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, padding: '0 20px 18px' }}>
          {stats.map((stat, i) => {
            const opacity = interpolate(frame, [startFrame + 14 + i * 8, startFrame + 30 + i * 8], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            return (
              <div key={stat.label} style={{ opacity, flex: 1, padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: stat.color }} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: FONT, color: C.white }}>{stat.num}</div>
                <div style={{ fontSize: 10, fontFamily: FONT, color: C.muted, marginTop: 2 }}>{stat.label}</div>
              </div>
            );
          })}
        </div>
        {/* Synthèse IA */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 20px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, fontFamily: FONT, color: C.purple, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 10 }}>⚡ Synthèse IA</div>
          <div style={{ fontSize: 12, fontFamily: FONT, color: C.muted, lineHeight: 1.6 }}>1 action en retard · 2 messages prioritaires · Agenda relié, aucun événement futur programmé.</div>
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

// Each feature spotlight = 60 frames, 3 spotlights = 180 frames total
// 180 frames = 6s
export const Scene3Features: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 16, 164, 180], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Active feature index based on frame: 0=0-59, 1=60-119, 2=120-179
  const activeIdx = Math.min(2, Math.floor(frame / 60));

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: sceneOpacity }}>
      <ArcBackground drawStart={0} drawDuration={40} globalOpacity={0.8} />

      {FEATURES.map((feat, idx) => {
        const { Mockup } = feat;
        const seqStart = idx * 60;
        const seqEnd = seqStart + 60;
        if (frame < seqStart || frame >= seqEnd + 30) return null;

        // Local frame within this spotlight (0-89 including slight bleed)
        const localFrame = frame - seqStart;

        // Overall opacity for this spotlight
        const spotOpacity = interpolate(localFrame, [0, 10, 50, 65], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <Sequence key={feat.num} from={seqStart} durationInFrames={70}>
            <AbsoluteFill style={{ opacity: spotOpacity }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                padding: '0 140px',
                gap: 60,
              }}>
                <TextPanel
                  num={feat.num}
                  label={feat.label}
                  color={feat.color}
                  title={feat.title}
                  body={feat.body}
                  stats={[...feat.stats]}
                  startFrame={8}
                />
                <Mockup startFrame={8} />
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
