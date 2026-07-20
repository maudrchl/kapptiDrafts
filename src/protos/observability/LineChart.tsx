import { useState } from 'react'
import styles from './perses.module.scss'
import type { Panel } from './perses'

/* Line chart (SVG): rendu Perses, axes en Geist Mono. Réutilisé par
   l'éditeur, l'aperçu de l'assistant IA et le panel étendu.
   Survol : ligne guide + marqueurs + tooltip valeur au point (tout en SVG,
   pas de dépendance scss pour rester robuste). */
const LineChart = ({ panel, height = 160 }: { panel: Panel; height?: number }) => {
  const W = panel.span === 3 ? 1040 : 360
  const H = height
  const padL = panel.yFmt ? 56 : 34
  const padR = 6
  const padT = 8
  const padB = 28
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const { yMin, yMax, yTicks, xLabels, series, unit } = panel

  const [hover, setHover] = useState<number | null>(null)

  const yFor = (v: number) => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH
  const xFor = (i: number) => padL + (xLabels.length === 1 ? 0 : (i / (xLabels.length - 1)) * plotW)
  const ticks = Array.from({ length: yTicks }, (_, i) => yMin + ((yMax - yMin) / (yTicks - 1)) * i)

  const segmentsFor = (points: (number | null)[]) => {
    const segs: string[] = []
    let cur: string[] = []
    points.forEach((p, i) => {
      if (p === null || p === undefined) {
        if (cur.length) segs.push(cur.join(' '))
        cur = []
      } else {
        cur.push(`${xFor(i).toFixed(1)},${yFor(p).toFixed(1)}`)
      }
    })
    if (cur.length) segs.push(cur.join(' '))
    return segs
  }

  // Valeurs présentes à l'index survolé (une par série qui a un point non nul).
  const hoverRows =
    hover === null
      ? []
      : series
          .map((s) => ({ name: s.name, color: s.color, value: s.points[hover] }))
          .filter((r): r is { name: string; color: string; value: number } => r.value !== null && r.value !== undefined)

  const fmtVal = (v: number) => (panel.yFmt ? panel.yFmt(v) : Number.isInteger(v) ? String(v) : v.toFixed(1))

  // Tooltip : dimensions + position clampée dans la zone de tracé.
  const ttLines = hover === null ? [] : [xLabels[hover], ...hoverRows.map((r) => `${r.name}: ${fmtVal(r.value)}${unit && !panel.yFmt ? ` ${unit}` : ''}`)]
  const ttW = Math.max(72, ...ttLines.map((l) => l.length * 5.6 + 16))
  const ttH = ttLines.length * 14 + 10
  const ttX = hover === null ? 0 : Math.min(Math.max(xFor(hover) + 10, padL), W - padR - ttW)
  const ttY = padT + 2

  return (
    <div className={styles.chartWrap}>
      <svg className={styles.chartSvg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={panel.name}>
        {ticks.map((t, i) => {
          const y = yFor(t)
          return (
            <g key={i}>
              <line className={styles.gridLine} x1={padL} y1={y} x2={W - padR} y2={y} />
              <text className={styles.axisText} x={padL - 8} y={y + 3.5} textAnchor="end">{panel.yFmt ? panel.yFmt(t) : t.toFixed(0)}</text>
            </g>
          )
        })}
        {xLabels.map((lbl, i) => (
          <text key={lbl + i} className={styles.axisText} x={xFor(i)} y={H - 7} textAnchor="middle">{lbl}</text>
        ))}
        {series.map((s) =>
          segmentsFor(s.points).map((pts, i) => (
            <polyline key={s.name + i} points={pts} fill="none" stroke={s.color} strokeWidth={1.6} strokeDasharray={s.dash ? '4 4' : undefined} opacity={s.opacity ?? 1} strokeLinejoin="round" strokeLinecap="round" />
          )),
        )}

        {/* Survol : ligne guide + marqueurs + tooltip */}
        {hover !== null && hoverRows.length > 0 && (
          <g pointerEvents="none">
            <line x1={xFor(hover)} y1={padT} x2={xFor(hover)} y2={padT + plotH} stroke="var(--color-border-strong, #d0d5dd)" strokeWidth={1} strokeDasharray="3 3" />
            {hoverRows.map((r) => (
              <circle key={r.name} cx={xFor(hover)} cy={yFor(r.value)} r={3.5} fill="#fff" stroke={r.color} strokeWidth={2} />
            ))}
            <g transform={`translate(${ttX}, ${ttY})`}>
              <rect width={ttW} height={ttH} rx={5} fill="var(--color-text-primary, #101828)" opacity={0.92} />
              {ttLines.map((line, i) => (
                <text
                  key={i}
                  x={8}
                  y={15 + i * 14}
                  fill={i === 0 ? '#fff' : 'rgba(255,255,255,0.85)'}
                  fontSize={10}
                  fontFamily="'Geist Mono', ui-monospace, monospace"
                  fontWeight={i === 0 ? 600 : 400}
                >
                  {line}
                </text>
              ))}
            </g>
          </g>
        )}

        {/* Zones de survol invisibles (une bande par point) */}
        {xLabels.map((lbl, i) => {
          const band = xLabels.length === 1 ? plotW : plotW / (xLabels.length - 1)
          return (
            <rect
              key={`hit-${lbl}-${i}`}
              x={xFor(i) - band / 2}
              y={padT}
              width={band}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          )
        })}
      </svg>
      {panel.showLegend && (
        <div className={styles.legend}>
          {series.map((s) => (
            <span key={s.name} className={styles.legendItem}>
              <span className={styles.legendDash} style={{ background: s.color, opacity: s.opacity ?? 1 }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default LineChart
