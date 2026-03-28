import type {
  ComponentPropsWithoutRef,
  ElementType,
  HTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/cn";

interface TypographyProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  className?: string;
}

type PolymorphicTypographyProps<TElement extends ElementType> = {
  as?: TElement;
  children?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<TElement>, "as" | "children" | "className">;

function createTypographyComponent<TDefault extends ElementType>(
  defaultTag: TDefault,
  className: string,
) {
  return function Typography<TElement extends ElementType = TDefault>({
    as,
    children,
    className: classNameOverride,
    ...props
  }: PolymorphicTypographyProps<TElement>) {
    const Component = (as ?? defaultTag) as ElementType;

    return (
      <Component className={cn(className, classNameOverride)} {...props}>
        {children}
      </Component>
    );
  };
}

const TitlePage = ({ children, className, ...props }: TypographyProps) => {
  return (
    <h2
      className={cn(
        "font-display text-primary text-title-page leading-[0.9] font-semibold tracking-[-0.01em] uppercase",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
};

const DisplayPage = ({ children, className, ...props }: TypographyProps) => {
  return (
    <h2
      className={cn(
        "font-display text-primary text-center text-display-page leading-[0.9] font-semibold tracking-[-0.01em] uppercase",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
};

const SubTitlePage = ({ children, className, ...props }: TypographyProps) => {
  return (
    <p
      className={cn(
        "font-display text-secondary text-center text-subtitle-page leading-[1.15] font-normal tracking-[-0.01em]",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
};

const SectionTitle = ({ children, className, ...props }: TypographyProps) => {
  return (
    <h3
      className={cn(
        "font-display text-primary text-section-title leading-[1.05] font-semibold tracking-[-0.03em]",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

const BodyBase = ({ children, className, ...props }: TypographyProps) => {
  return (
    <p
      className={cn(
        "font-body text-secondary text-body leading-[1.6] tracking-[-0.01em]",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
};

const CodeSnippet = ({ children, className, ...props }: TypographyProps) => {
  return (
    <code
      className={cn("font-code text-secondary rounded px-1 py-0.5 font-semibold", className)}
      {...props}
    >
      {children}
    </code>
  );
};

const Title = createTypographyComponent(
  "h2",
  "font-display text-primary text-section-title leading-[1.05] font-semibold tracking-[-0.03em]",
);

const Body = createTypographyComponent(
  "p",
  "font-body text-secondary text-body leading-[1.6] tracking-[-0.01em]",
);

const BodySmall = createTypographyComponent(
  "p",
  "font-body text-secondary text-body-small leading-[1.55] tracking-[-0.005em]",
);

const Label = createTypographyComponent(
  "label",
  "font-body text-primary text-label leading-[1.4] tracking-[-0.01em] font-medium",
);

const Caption = createTypographyComponent(
  "p",
  "font-body text-tertiary text-caption leading-[1.4] tracking-[0]",
);

export {
  TitlePage,
  SubTitlePage,
  SectionTitle,
  BodyBase,
  CodeSnippet,
  DisplayPage,
  Title,
  Body,
  BodySmall,
  Label,
  Caption,
};
