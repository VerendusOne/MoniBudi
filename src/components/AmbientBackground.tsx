// Decorative ambient glow behind the app's content. Purely visual: fixed,
// pointer-events-none, and — on pages with real scroll (the dashboard) —
// nudged by a scroll-linked CSS animation (see .blob-drift in globals.css)
// for a subtle sense of depth/motion. On pages that do not scroll, the
// blobs simply sit at their resting position, which still reads fine.
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="blob-drift absolute -top-24 left-[8%] h-80 w-80 rounded-full blur-[110px]"
        style={{
          background: "radial-gradient(circle, var(--accent-bright), transparent 70%)",
          opacity: "var(--blob-opacity)",
        }}
      />
      <div
        className="blob-drift absolute top-[35%] -right-20 h-[26rem] w-[26rem] rounded-full blur-[130px]"
        style={{
          background: "radial-gradient(circle, var(--accent), transparent 70%)",
          opacity: "var(--blob-opacity)",
          animationDelay: "-3s",
        }}
      />
      <div
        className="blob-drift absolute bottom-[-10%] left-[20%] h-96 w-96 rounded-full blur-[130px]"
        style={{
          background: "radial-gradient(circle, var(--accent-deep), transparent 70%)",
          opacity: "var(--blob-opacity)",
          animationDelay: "-6s",
        }}
      />
    </div>
  );
}
