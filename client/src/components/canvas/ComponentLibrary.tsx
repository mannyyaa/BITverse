import { useState } from "react";
import { Search, ChevronDown, ChevronRight, X } from "lucide-react";
import { COMPONENT_LIBRARY, CATEGORIES, type ComponentMeta } from "@/data/componentLibrary";
import { NodeIcon } from "@/components/ui/NodeIcon";
import { kindColor } from "@/lib/tokens";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUIStore } from "@/store/uiStore";
import { generateId } from "@/lib/id";
import type { GraphNode } from "@/domain/types";

export function ComponentLibrary() {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const addNode = useWorkspaceStore((s) => s.addNode);
  const addTimeline = useWorkspaceStore((s) => s.addTimelineEvent);
  const close = useUIStore((s) => s.setComponentLibraryOpen);

  const filtered = query.trim()
    ? COMPONENT_LIBRARY.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase()),
      )
    : COMPONENT_LIBRARY;

  const toggle = (cat: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  const handleAdd = (meta: ComponentMeta) => {
    const node: GraphNode = {
      id: generateId(meta.kind),
      kind: meta.kind,
      label: meta.label,
      status: "healthy",
      position: { x: 440 + Math.random() * 160, y: 280 + Math.random() * 120 },
      meta: { metric: "—", detail: "New component" },
    };
    addNode(node);
    addTimeline({
      kind: "node-added",
      description: `Added ${meta.label} to architecture`,
      author: "You",
      nodeId: node.id,
    });
  };

  return (
    <div
      className="bv-component-library"
      style={{
        width: 216,
        height: "100%",
        flexShrink: 0,
        background: "var(--surface-0)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "11px 12px 8px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--text-tertiary)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Components
          </span>
          <button
            onClick={() => close(false)}
            aria-label="Close component library"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-tertiary)",
              display: "flex",
              padding: 2,
              borderRadius: "var(--r-xs)",
            }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search
            size={12}
            style={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-tertiary)",
              pointerEvents: "none",
            }}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            aria-label="Search components"
            style={{
              width: "100%",
              padding: "5px 8px 5px 26px",
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-sm)",
              color: "var(--text-primary)",
              fontSize: 11,
              fontFamily: "var(--font-ui)",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
        {query.trim() ? (
          <Section
            name="Results"
            color="var(--accent-violet)"
            items={filtered}
            open
            onToggle={() => {}}
            onAdd={handleAdd}
          />
        ) : (
          CATEGORIES.map((cat) => {
            const catColor = getCategoryColor(cat);
            return (
              <Section
                key={cat}
                name={cat}
                color={catColor}
                items={COMPONENT_LIBRARY.filter((c) => c.category === cat)}
                open={!collapsed.has(cat)}
                onToggle={() => toggle(cat)}
                onAdd={handleAdd}
              />
            );
          })
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "7px 12px",
          borderTop: "1px solid var(--border)",
          fontSize: 10,
          color: "var(--text-tertiary)",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        Click to add · drag to position
      </div>
    </div>
  );
}

function getCategoryColor(cat: string): string {
  switch (cat) {
    case "Application":    return "var(--cat-application)";
    case "Compute":        return "var(--cat-compute)";
    case "Data":           return "var(--cat-data)";
    case "Messaging":      return "var(--cat-messaging)";
    case "Infrastructure": return "var(--cat-infrastructure)";
    default:               return "var(--text-tertiary)";
  }
}

interface SectionProps {
  name: string;
  color: string;
  items: ComponentMeta[];
  open: boolean;
  onToggle: () => void;
  onAdd: (meta: ComponentMeta) => void;
}

function Section({ name, color, items, open, onToggle, onAdd }: SectionProps) {
  if (items.length === 0) return null;
  return (
    <div>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "5px 12px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {open
          ? <ChevronDown size={10} color="var(--text-tertiary)" />
          : <ChevronRight size={10} color="var(--text-tertiary)" />}
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            color,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {name}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 9,
            color: "var(--text-tertiary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {items.length}
        </span>
      </button>

      {open && items.map((item) => (
        <ComponentItem key={item.kind} meta={item} onAdd={onAdd} />
      ))}
    </div>
  );
}

function ComponentItem({ meta, onAdd }: { meta: ComponentMeta; onAdd: (m: ComponentMeta) => void }) {
  const [hovered, setHovered] = useState(false);
  const accent = kindColor(meta.kind);

  return (
    <button
      onClick={() => onAdd(meta)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={meta.description}
      aria-label={`Add ${meta.label}`}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 12px 5px 20px",
        background: hovered ? "var(--surface-2)" : "none",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        transition: "background var(--t-fast)",
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "var(--r-sm)",
          background: `color-mix(in srgb, ${accent} 12%, transparent)`,
          border: `1px solid color-mix(in srgb, ${accent} 22%, transparent)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <NodeIcon kind={meta.kind} size={13} color={accent} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "var(--text-primary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {meta.label}
        </div>
        {hovered && (
          <div
            style={{
              fontSize: 9,
              color: "var(--text-tertiary)",
              lineHeight: 1.4,
              marginTop: 1,
              whiteSpace: "normal",
            }}
          >
            {meta.description}
          </div>
        )}
      </div>
    </button>
  );
}
