import Image from "next/image";

function initials(name: string | null | undefined, email: string | null | undefined) {
  const source = name?.trim() || email?.trim() || "";
  if (!source) return "?";
  const parts = source.includes("@") ? [source[0]] : source.split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Avatar({
  src,
  name,
  email,
  size = 36,
  className = "",
}: {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: number;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 ring-1 ring-border ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`gradient-accent inline-flex items-center justify-center rounded-full text-accent-foreground font-semibold shrink-0 ring-1 ring-border ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.38) }}
    >
      {initials(name, email)}
    </span>
  );
}
