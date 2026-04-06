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
    <div className="w-full overflow-hidden border-y border-[#00FFFF]/15 py-3 bg-black">
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `marquee 30s linear infinite ${reverse ? "reverse" : ""}`,
        }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className="mx-8 text-[10px] tracking-[0.5em] text-[#00FFFF]/50 font-bold uppercase"
          >
            {item} <span className="text-[#00FFFF]/20 mx-3">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}