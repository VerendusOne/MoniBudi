import { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

const base =
  "px-5 py-2.5 rounded-full text-sm font-medium transition-[transform,opacity,border-color] duration-150 ease-[var(--ease-out)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";
const variants = {
  primary: "bg-accent text-accent-foreground glow-accent hover:opacity-90",
  secondary: "bg-card text-foreground border border-border hover:border-accent",
};

type Variant = keyof typeof variants;

type ButtonAsButton = ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: "button";
  variant?: Variant;
};

type ButtonAsAnchor = AnchorHTMLAttributes<HTMLAnchorElement> & {
  as: "a";
  variant?: Variant;
};

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (props.as === "a") {
    const { as: _as, ...anchorProps } = props;
    return <a className={classes} {...anchorProps} />;
  }

  const { as: _as, ...buttonProps } = props as ButtonAsButton;
  return <button className={classes} {...buttonProps} />;
}
