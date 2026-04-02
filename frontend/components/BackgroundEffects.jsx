export default function BackgroundEffects() {
  return (
    <>
      <div className="scanline" aria-hidden="true"></div>
      <div
        className="fixed inset-0 pointer-events-none z-[100] opacity-[0.02] mix-blend-overlay bg-[radial-gradient(circle,transparent_20%,#000_100%)]"
        aria-hidden="true"
      ></div>
    </>
  );
}
