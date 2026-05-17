export function ChartSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="mb-8 text-center text-3xl font-bold text-primary">
        LIVE CHART
      </h2>
      <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-primary/30 bg-card">
        <iframe
          src="https://dexscreener.com/solana?embed=1&theme=dark"
          title="DEX Screener Chart"
          className="h-[500px] w-full border-0"
          loading="lazy"
        />
      </div>
    </section>
  )
}
