'use client';

export default function SeniorRexBanner() {
  return (
    <div className="w-full rounded-2xl overflow-hidden bg-gradient-to-br from-green-50 to-white shadow-md mb-6 relative group">
      <video
        src="/videos/rex-trabajo-bolsa.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto max-h-[280px] object-cover mx-auto transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
        🦖 Senior Rex currando duro
      </div>
    </div>
  );
}
