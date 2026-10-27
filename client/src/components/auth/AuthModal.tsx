/**
 * Login / Register modal.
 * Mounts as an overlay — does not redesign any existing screen.
 * The parent controls isOpen/onClose.
 */
import { useState } from "react";
import { X, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Which tab to show first. */
  defaultTab?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: Props) {
  const [tab, setTab]           = useState<"login" | "register">(defaultTab);
  const [email, setEmail]       = useState("");
  const [name, setName]         = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const { login, register, isLoading, authError } = useAuthStore();

  if (!isOpen) return null;

  const reset = () => { setEmail(""); setName(""); setPassword(""); setShowPw(false); };

  const close = () => { reset(); onClose(); };

  const switchTab = (t: "login" | "register") => { reset(); setTab(t); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await register(email, name, password);
      }
      close();
    } catch {
      // error is shown via authError from the store
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(15,17,23,.45)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={tab === "login" ? "Sign in" : "Create account"}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 400,
          background: "var(--surface-0)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          boxShadow: "var(--shadow-xl)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px 12px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            {/* Logo mark */}
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden>
                <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" stroke="var(--accent-violet)" strokeWidth="1.5" fill="none"/>
                <circle cx="11" cy="11" r="2" fill="var(--accent-violet)"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 800, fontFamily: "var(--font-head)" }}>
                <span style={{ color: "var(--accent-violet)" }}>BIT</span>verse
              </span>
            </div>
            {/* Tab titles */}
            <div style={{ display: "flex", gap: 0 }}>
              {(["login", "register"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  style={{
                    padding: "5px 14px",
                    background: "none",
                    border: "none",
                    borderBottom: `2px solid ${tab === t ? "var(--accent-violet)" : "transparent"}`,
                    color: tab === t ? "var(--accent-violet)" : "var(--text-tertiary)",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    fontFamily: "var(--font-ui)",
                    transition: "color var(--t-base), border-color var(--t-base)",
                    marginBottom: -1,
                  }}
                >
                  {t === "login" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={close}
            aria-label="Close dialog"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", display: "flex", padding: 3 }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 11 }}>
          {tab === "register" && (
            <Field label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                style={inputSt}
              />
            </Field>
          )}

          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={tab === "login" ? "aanya@bitverse.dev" : "you@company.com"}
              required
              style={inputSt}
              autoComplete={tab === "login" ? "email" : "new-email"}
            />
          </Field>

          <Field label="Password">
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === "register" ? "At least 8 characters" : "Password"}
                required
                minLength={8}
                style={{ ...inputSt, paddingRight: 34 }}
                autoComplete={tab === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
                style={{
                  position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-tertiary)", display: "flex",
                }}
              >
                {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </Field>

          {/* Error */}
          {authError && (
            <div style={{
              display: "flex", gap: 7, alignItems: "flex-start",
              padding: "7px 10px",
              background: "rgba(214,48,49,.07)",
              border: "1px solid rgba(214,48,49,.25)",
              borderRadius: "var(--r-sm)",
              color: "var(--accent-red)",
              fontSize: 11,
            }}>
              <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: 4,
              padding: "9px 0",
              background: isLoading ? "var(--surface-3)" : "var(--accent-violet)",
              border: "none",
              borderRadius: "var(--r-sm)",
              color: "#fff",
              fontSize: 13, fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-ui)",
              transition: "background var(--t-base)",
            }}
          >
            {isLoading ? "Please wait…" : tab === "login" ? "Sign in" : "Create account"}
          </button>

          {/* Demo shortcut */}
          {tab === "login" && (
            <p style={{ textAlign: "center", fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>
              Demo:&nbsp;
              <button
                type="button"
                onClick={() => { setEmail("aanya@bitverse.dev"); setPassword("password123"); }}
                style={{ background: "none", border: "none", color: "var(--accent-violet)", cursor: "pointer", fontSize: 10, fontFamily: "var(--font-ui)", padding: 0 }}
              >
                aanya@bitverse.dev / password123
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputSt: React.CSSProperties = {
  width: "100%",
  background: "var(--surface-1)",
  border: "1px solid var(--border)",
  borderRadius: "var(--r-sm)",
  color: "var(--text-primary)",
  fontSize: 12,
  padding: "7px 10px",
  fontFamily: "var(--font-ui)",
  outline: "none",
};
