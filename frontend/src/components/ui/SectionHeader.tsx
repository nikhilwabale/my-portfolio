export function SectionHeader({ kicker, title, highlight, subtitle }: { kicker: string; title: string; highlight: string; subtitle: string }) {
  return (
    <div>
      <p className="section-kicker">{`// ${kicker}`}</p>
      <h2 className="section-title">{title} <span>{highlight}</span></h2>
      <p className="section-subtitle">{subtitle}</p>
      <div className="divider-dot">●</div>
    </div>
  );
}
