import type { LucideIcon } from "lucide-react";

/**
 * Round icon buttons for picking one icon from a fixed allow-list (policy
 * sections, categories). `options` comes from that feature's icon constants,
 * so the stored value is always a name the storefront can resolve.
 */
export default function IconPicker<T extends string>({
  label = "Icon",
  options,
  value,
  onChange,
}: {
  label?: string;
  options: { name: T; Icon: LucideIcon }[];
  value: T;
  onChange: (name: T) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[11.5px] font-semibold text-[#8a8a8e]">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map(({ name, Icon }) => (
          <button
            key={name}
            type="button"
            title={name}
            onClick={() => onChange(name)}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full box-border"
            style={{
              background: value === name ? "#141414" : "#f3f3f1",
              color: value === name ? "#fff" : "#555",
              border: value === name ? "2px solid #141414" : "2px solid transparent",
            }}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>
    </div>
  );
}
