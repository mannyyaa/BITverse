import { useState } from "react";
import { X, Copy, Check, Users } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Avatar } from "@/components/ui/Avatar";

export function InviteDialog() {
  const isOpen = useUIStore((s) => s.isInviteDialogOpen);
  const close = useUIStore((s) => () => s.setInviteDialogOpen(false));
  const workspace = useWorkspaceStore((s) => s.workspace);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const shareLink = `https://bitverse.app/w/${workspace.id}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
    // In production: POST /invite with email
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(9,13,22,.8)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}
    onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 440, background: "var(--surface)",
          border: "1px solid var(--border)", borderRadius: 12,
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Users size={16} color="var(--cyan)" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-head)" }}>
                Invite to Workspace
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>
                {workspace.name} · {workspace.description}
              </div>
            </div>
          </div>
          <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Email invite */}
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>
              Invite by email
            </label>
            <form onSubmit={handleInvite} style={{ display: "flex", gap: 6 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                style={{
                  flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)",
                  borderRadius: 6, color: "var(--text)", fontSize: 12, padding: "7px 10px",
                  fontFamily: "var(--font-ui)", outline: "none",
                }}
              />
              <button type="submit" style={{
                padding: "7px 14px", background: "var(--cyan)",
                border: "none", borderRadius: 6, color: "var(--bg)",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                fontFamily: "var(--font-ui)",
              }}>
                Invite
              </button>
            </form>
          </div>

          {/* Share link */}
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>
              Share link
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{
                flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: 6, padding: "7px 10px", fontSize: 11,
                color: "var(--text-3)", fontFamily: "var(--font-mono)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {shareLink}
              </div>
              <button
                onClick={handleCopy}
                style={{
                  padding: "7px 12px", background: copied ? "#57E3A015" : "var(--surface-2)",
                  border: `1px solid ${copied ? "#57E3A0" : "var(--border)"}`,
                  borderRadius: 6, color: copied ? "#57E3A0" : "var(--text-2)",
                  fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                  fontFamily: "var(--font-ui)", transition: "all .15s",
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Members */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>
              Current members ({workspace.collaborators.length})
            </div>
            {workspace.collaborators.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <Avatar name={c.name} color={c.color} initials={c.initials} size={28} online={c.online} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-3)" }}>{c.online ? "Online now" : "Offline"}</div>
                </div>
                <span style={{
                  fontSize: 9, padding: "2px 7px", borderRadius: 10,
                  background: "var(--surface-2)", color: "var(--text-3)",
                  fontFamily: "var(--font-mono)", border: "1px solid var(--border)",
                }}>
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
