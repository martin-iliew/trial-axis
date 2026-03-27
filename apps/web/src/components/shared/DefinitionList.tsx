import type { ReactNode } from "react";

type DefinitionItem = {
  label: string;
  value: ReactNode;
};

type DefinitionListProps = {
  items: DefinitionItem[];
};

export function DefinitionList({ items }: DefinitionListProps) {
  return (
    <dl className="space-y-4">
      {items.map((item) => (
        <div className="space-y-1" key={item.label}>
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            {item.label}
          </dt>
          <dd className="break-words text-base font-medium text-primary">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
