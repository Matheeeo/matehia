"use client";

export type Tab = "all" | "channels" | "priority" | "pinned";

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
  counts: { all: number; pinned: number };
};

const AllIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h16M4 12h16M4 18h10" />
  </svg>
);

const ChannelsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const PriorityIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const PinnedIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z" />
  </svg>
);

const TABS: { id: Tab; label: string; Icon: React.FC }[] = [
  { id: "all", label: "Tout", Icon: AllIcon },
  { id: "channels", label: "Canaux", Icon: ChannelsIcon },
  { id: "priority", label: "Priorité", Icon: PriorityIcon },
  { id: "pinned", label: "Épinglés", Icon: PinnedIcon },
];

export default function BottomNav({ active, onChange, counts }: Props) {
  return (
    <nav
      className="shrink-0 flex items-center justify-around border-t pb-safe"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        paddingBottom: "max(env(safe-area-inset-bottom), 12px)",
        paddingTop: "10px",
      }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        const badge = id === "all" ? counts.all : id === "pinned" ? counts.pinned : 0;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex flex-col items-center gap-1 min-w-[56px] relative"
            style={{ color: isActive ? "var(--accent)" : "var(--text-muted)" }}
          >
            <span className="relative">
              <Icon />
              {badge > 0 && (
                <span
                  className="absolute -top-1 -right-1.5 text-[9px] font-semibold rounded-full w-4 h-4 flex items-center justify-center"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </span>
            <span
              className="text-[10px] font-medium"
              style={{ color: isActive ? "var(--accent)" : "var(--text-muted)" }}
            >
              {label}
            </span>
            {isActive && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{ background: "var(--accent)" }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
