import Link from "next/link";
import type { ComponentProps } from "react";
import { cn, isExternal } from "@/lib/utils";

type Variant = "luminous" | "glass" | "ghost";
type Size = "sm" | "md" | "lg" | "icon" | "icon-sm";

const variants: Record<Variant, string> = {
  luminous: "btn-luminous font-medium",
  glass: "glass glass-thin glass-press text-ink",
  ghost:
    "text-ink-2 hover:text-ink hover:bg-white/[0.06] active:bg-white/[0.09] transition-colors duration-200",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13.5px] gap-1.5",
  md: "h-11 px-5 text-[14.5px] gap-2",
  lg: "h-13 px-7 text-[15.5px] gap-2.5",
  icon: "size-10",
  "icon-sm": "size-8",
};

type Common = { variant?: Variant; size?: Size; className?: string };

type AsButton = Common & ComponentProps<"button"> & { href?: undefined };
type AsLink = Common & Omit<ComponentProps<typeof Link>, "className"> & { href: string };

export function buttonClass({ variant = "glass", size = "md", className }: Common) {
  return cn(
    "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full",
    "disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-[1.1em] [&_svg]:shrink-0",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button(props: AsButton | AsLink) {
  const { variant, size, className } = props;
  const cls = buttonClass({ variant, size, className });
  const glass = variant === undefined || variant === "glass";

  if (props.href !== undefined) {
    const { variant: _v, size: _s, className: _c, href, ...rest } = props as AsLink;
    if (isExternal(href)) {
      return (
        <a
          {...(rest as ComponentProps<"a">)}
          href={href}
          className={cls}
          data-glass={glass || undefined}
          target="_blank"
          rel="noopener noreferrer"
        />
      );
    }
    return <Link {...rest} href={href} className={cls} data-glass={glass || undefined} />;
  }

  const { variant: _v, size: _s, className: _c, type = "button", ...rest } = props as AsButton;
  return <button {...rest} type={type} className={cls} data-glass={glass || undefined} />;
}
