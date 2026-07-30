function BiasBar({ leftCount = 0, centerCount = 0, rightCount = 0 }) {
  const l = parseInt(leftCount) || 0;
  const c = parseInt(centerCount) || 0;
  const r = parseInt(rightCount) || 0;
  const total = l + c + r;

  if (total === 0) return null;

  const leftPct = (l / total) * 100;
  const centerPct = (c / total) * 100;
  const rightPct = (r / total) * 100;

  return (
    <div className="w-full flex h-7 text- font-semibold rounded- overflow-hidden">

      {/* LEFT */}
      {l > 0 && (
        <div
          className="bg-[#9e2b25] text-white flex items-center justify-center px-1"
          style={{ width: `${leftPct}%` }}
        >
          <span className="truncate">L {Math.round(leftPct)}%</span>
        </div>
      )}

      {/* CENTER */}
      {c > 0 && (
        <div
          className="bg-[#f1f1f1] text-black border-y border-zinc-200 flex items-center justify-center px-1"
          style={{ width: `${centerPct}%` }}
        >
          <span className="truncate">C {Math.round(centerPct)}%</span>
        </div>
      )}

      {/* RIGHT */}
      {r > 0 && (
        <div
          className="bg-[#1e3a8a] text-white flex items-center justify-center px-1"
          style={{ width: `${rightPct}%` }}
        >
          <span className="truncate">R {Math.round(rightPct)}%</span>
        </div>
      )}
    </div>
  );
}

export default BiasBar;