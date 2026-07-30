function BiasBarSmall({ leftCount = 0, centerCount = 0, rightCount = 0 }) {
  const l = Number(leftCount) || 0;
  const c = Number(centerCount) || 0;
  const r = Number(rightCount) || 0;
  const total = l + c + r;

  let leftPct = 33.3;
  let centerPct = 33.3;
  let rightPct = 33.4;

  if (total > 0) {
    leftPct = (l / total) * 100;
    centerPct = (c / total) * 100;
    rightPct = (r / total) * 100;
  }

  return (
    <div style={{ display: 'flex', height: '6px', width: '70px', borderRadius: '9px', overflow: 'hidden', backgroundColor: '#e4e4e7' }}>
      <div style={{ width: `${leftPct}%`, height: '100%', backgroundColor: '#991b1b' }} />
      <div style={{ width: `${centerPct}%`, height: '100%', backgroundColor: '#f8f8fc' }} />
      <div style={{ width: `${rightPct}%`, height: '100%', backgroundColor: '#1e3a8a' }} />
    </div>
  );
}

export default BiasBarSmall;