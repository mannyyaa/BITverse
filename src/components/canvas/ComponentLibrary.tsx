import { useState } from "react";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { COMPONENT_LIBRARY, CATEGORIES, type ComponentMeta } from "@/data/componentLibrary";
import { NodeIcon } from "@/components/ui/NodeIcon";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUIStore } from "@/store/uiStore";
import { generateId } from "@/lib/id";
import type { GraphNode } from "@/domain/types";

export function ComponentLibrary() {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const addNode = useWorkspaceStore((s) => s.addNode);
  const addTimelineEvent = useWorkspaceStore((s) => s.addTimelineEvent);
  const close = useUIStore((s) => s.setComponentLibraryOpen);

  const filtered = query.trim()
    ? COMPONENT_LIBRARY.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase()),
      )
    : COMPONENT_LIBRARY;

  const toggleCategory = (cat: string) => {
    setCollapsed((s) => {
      const n = new Set(s);
      n.has(cat) ? n.delete(cat) : n.add(cat);
      return n;
    });
  };

  const handleAdd = (meta: ComponentMeta) => {
    const node: GraphNode = {
      id: generateId(meta.kind),
      kind: meta.kind,
      label: meta.label,
      status: "healthy",
      position: { x: 400 + Math.random() * 200, y: 300 + Math.random() * 100 },
      meta: { metric: "—", detail: "New component" },
    };
    addNode(node);
    addTimelineEvent({
      kind: "node-added",
      description: `Added ${meta.label} to the architecture`,
      author: "You",
      nodeId: node.id,
    });
  };

  return (
    <div style={{
      width: 220, height: "100%",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ padding: "12px 14px 8px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", letterSpacing: ".06em", textTransform: "uppercase" }}>
            System Components
          </span>
          <button
            onClick={() => close(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 2 }}
            aria-label="Close component library"
          >
            <X size={14} />
          </button>
        </div>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={12} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components..."
            style={{
              width: "100%", padding: "5px 8px 5px 26px",
              background: "var(--surface-2)", border: "1px solid var(--border)",
              borderRadius: 6, color: "var(--text)", fontSize: 11,
              fontFamily: "var(--font-ui)", outline: "none",
            }}
            aria-label="Search components"
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
        {query.trim() ? (
          <CategorySection
            name="Results"
            items={filtered}
            collapsed={false}
            onToggle={() => {}}
            onAdd={handleAdd}
          />
        ) : (
          CATEGORIES.map((cat) => (
            <CategorySection
              key={cat}
              name={cat}
              items={COMPONENT_LIBRARY.filter((c) => c.category === cat)}
              collapsed={collapsed.has(cat)}
              onToggle={() => toggleCategory(cat)}
              onAdd={handleAdd}
            />
          ))
        )}
      </div>

      {/* Footer hint */}
      <div style={{ padding: "8px 14px", borderTop: "1px solid var(--border)", fontSize: 10, color: "var(--text-3)", textAlign: "center" }}>
        Click to add · Drag to position
      </div>
    </div>
  );
}

interface SectionProps {
  name: string;
  items: ComponentMeta[];
  collapsed: boolean;
  onToggle: () => void;
  onAdd: (meta: ComponentMeta) => void;
}

function CategorySection({ name, items, collapsed, onToggle, onAdd }: SectionProps) {
  if (items.length === 0) return null;
  const color = items[0]?.color ?? "#98A6BD";

  return (
    <div>
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 6,
          padding: "5px 14px", background: "none", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        {collapsed
          ? <ChevronRight size={11} color="var(--text-3)" />
          : <ChevronDown size={11} color="var(--text-3)" />}
        <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: ".07em" }}>
          {name}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 9, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
          {items.length}
        </span>
      </button>

      {!collapsed && items.map((item) => (
        <ComponentItem key={item.kind} meta={item} onAdd={onAdd} />
      ))}
    </div>
  );
}

interface ItemProps {
  meta: ComponentMeta;
  onAdd: (meta: ComponentMeta) => void;
}

function ComponentItem({ meta, onAdd }: ItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onAdd(meta)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={meta.description}
      aria-label={`Add ${meta.label}`}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 8,
        padding: "6px 14px 6px 20px",
        background: hovered ? "var(--surface-2)" : "none",
        border: "none", cursor: "pointer", textAlign: "left",
        transition: "background .1s",
      }}
    >
      <div style={{
        width: 26, height: 26, borderRadius: 6,
        background: `${meta.color}15`, border: `1px solid ${meta.color}25`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: meta.color, flexShrink: 0,
      }}>
        <NodeIcon kind={meta.kind} size={14} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text)", lineHeight: 1.3 }}>
          {meta.label}
        </div>
        {hovered && (
          <div style={{ fontSize: 9, color: "var(--text-3)", lineHeight: 1.3, marginTop: 1, maxWidth: 140 }}>
            {meta.description}
          </div>
        )}
      </div>
    </button>
  );
}
