import type { IdName } from "@/shared/types/api.types";

export default function CategoryPills({
  items,
  activeId,
  onSelect,
}: {
  items: IdName[];
  activeId?: string;
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="relative">
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200"
              style={
                active
                  ? { background: "var(--accent)", color: "var(--on-accent)", borderColor: "var(--accent)" }
                  : { background: "var(--card)", color: "var(--text)", borderColor: "var(--border)" }
              }
            >
              {item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
