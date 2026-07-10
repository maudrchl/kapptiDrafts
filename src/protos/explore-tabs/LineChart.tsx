import styles from './perses.module.scss'
import type { Panel } from './perses'

/* Line chart (SVG) — rendu Perses, axes en Geist Mono. Réutilisé par
   l'éditeur, l'aperçu de l'assistant IA et le panel étendu. */
const LineChart = ({ panel, height = 160 }: { panel: Panel; height?: number }) => {
  const W = panel.span === 3 ? 1040 : 360
  const H = height
  const padL = 34
  const padR = 6
  const padT = 8
  const padB = 28
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const { yMin, yMax, yTicks, xLabels, series } = panel

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

  return (
    <div className={styles.chartWrap}>
      <svg className={styles.chartSvg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={panel.name}>
        {ticks.map((t, i) => {
          const y = yFor(t)
          return (
            <g key={i}>
              <line className={styles.gridLine} x1={padL} y1={y} x2={W - padR} y2={y} />
              <text className={styles.axisText} x={padL - 8} y={y + 3.5} textAnchor="end">{t.toFixed(0)}</text>
            </g>
          )
        })}
        {xLabels.map((lbl, i) => (
          <text key={lbl + i} className={styles.axisText} x={xFor(i)} y={H - 7} textAnchor="middle">{lbl}</text>
        ))}
        {series.map((s) =>
          segmentsFor(s.points).map((pts, i) => (
            <polyline key={s.name + i} points={pts} fill="none" stroke={s.color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
          )),
        )}
      </svg>
      {panel.showLegend && (
        <div className={styles.legend}>
          {series.map((s) => (
            <span key={s.name} className={styles.legendItem}>
              <span className={styles.legendDash} style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default LineChart
