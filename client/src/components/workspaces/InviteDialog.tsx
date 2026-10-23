import { useState } from "react";
import { X, Copy, Check, Users } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Avatar } from "@/components/ui/Avatar";

export function InviteDialog() {
  const isOpen = useUIStore((s) => s.isInviteDialogOpen);
  const close  = useUIStore((s) => () => s.setInviteDialogOpen(false));
  const workspace = useWorkspaceStore((s) => s.workspace);

  const [email, setEmail]   = useState("");
  const [copied, setCopied] = useState(false);
  const shareLink = `https://bitverse.app/w/${workspace.id}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,17,23,.35)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 440, background: "var(--surface-0)",
          border: "1px solid var(--border)", borderRadius: "var(--r-xl)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Users size={15} color="var(--accent-violet)" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-head)" }}>
                Invite to Workspace
              </div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 1 }}>
                {workspace.name} · {workspace.description}
              </div>
            </div>
          </div>
          <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", display: "flex" }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Email */}
          <div>
            <FieldLabel>Invite by email</FieldLabel>
            <form
              onSubmit={(e) => { e.preventDefault(); setEmail(""); }}
              style={{ display: "flex", gap: 6 }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                style={inputSt}
              />
              <button type="submit" style={primarySt}>Invite</button>
            </form>
          </div>

          {/* Share link */}
          <div>
            <FieldLabel>Share link</FieldLabel>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{
                flex: 1, background: "var(--surface-1)", border: "1px solid var(--border)",
                borderRadius: "var(--r-sm)", padding: "6px 10px", fontSize: 11,
                color: "var(--text-tertiary)", fontFamily: "var(--font-mono)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {shareLink}
              </div>
              <button
                onClick={handleCopy}
                style={{
                  padding: "6px 10px",
                  background: copied ? "rgba(0,184,148,.08)" : "var(--surface-2)",
                  border: `1px solid ${copied ? "var(--accent-green)" : "var(--border)"}`,
                  borderRadius: "var(--r-sm)",
                  color: copied ? "var(--accent-green)" : "var(--text-secondary)",
                  fontSize: 11, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                  fontFamily: "var(--font-ui)",
                  transition: "all var(--t-base)",
                }}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Members */}
          <div>
            <FieldLabel>Members ({workspace.collaborators.length})</FieldLabel>
            {workspace.collaborators.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                <Avatar name={c.name} color={c.color} initials={c.initials} size={26} online={c.online} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{c.online ? "Online now" : "Offline"}</div>
                </div>
                <span style={{ fontSize: 9, color: "var(--text-tertiary)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "2px 6px", fontFamily: "var(--font-mono)" }}>
                  Editor
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
      {children}
    </div>
  );
}

const inputSt: React.CSSProperties = {
  flex: 1, background: "var(--surface-1)", border: "1px solid var(--border)",
  borderRadius: "var(--r-sm)", color: "var(--text-primary)", fontSize: 12,
  padding: "6px 10px", fontFamily: "var(--font-ui)", outline: "none",
};

const primarySt: React.CSSProperties = {
  padding: "6px 14px", background: "var(--accent-violet)", border: "none",
  borderRadius: "var(--r-sm)", color: "#fff", fontSize: 12, fontWeight: 600,
  cursor: "pointer", fontFamily: "var(--font-ui)",
};
