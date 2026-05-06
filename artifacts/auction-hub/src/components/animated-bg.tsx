export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0d0408 0%, #1a0a0e 40%, #2a0d18 70%, #0a0305 100%)" }} />
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />
      <div className="floating-orb orb-3" />
      <div className="floating-orb orb-4" />
    </div>
  );
}
