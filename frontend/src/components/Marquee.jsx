export default function Marquee({ reverse = false }) {
  const items = [
    "JP NAGAR MADE",
    "ARTISTIC TEES",
    "GENZ ENERGY",
    "LIMITED DROPS",
    "NO RESTOCKS",
    "WEAR YOUR ART",
    "STREETVIBEX",
    "BENGALURU 2026",
  ];
  const repeated = [...items, ...items];

  return (
    <div className="w-full overflow-hidden border-y border-[#00FFFF]/10 py-4 bg-[#020202]">
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `marquee 30s linear infinite ${reverse ? "reverse" : ""}`,
        }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className="mx-10 text-xs tracking-[0.5em] text-[#00FFFF]/30 font-display uppercase"
          >
            {item} <span className="text-[#00FFFF]/15 mx-4">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}