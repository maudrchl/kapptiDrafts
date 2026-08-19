import { useEffect, useRef, useState } from 'react'
import styles from './perses.module.scss'
import type { Panel } from './perses'

/* Line chart (SVG): rendu Perses, axes en Geist Mono. Réutilisé par
   l'éditeur, l'aperçu de l'assistant IA et le panel étendu.
   Survol : ligne guide + marqueurs + tooltip valeur au point (tout en SVG,
   pas de dépendance scss pour rester robuste). */
const LineChart = ({ panel, height = 160 }: { panel: Panel; height?: number }) => {
  // Le SVG est étiré à 100% de son conteneur, donc un viewBox plus étroit que le
  // rendu grossit TOUT (texte des axes, épaisseurs). On mesure la largeur réelle
  // pour travailler à l'échelle 1:1 : les axes gardent leur taille voulue.
  const wrapRef = useRef<HTMLDivElement>(null)
  const [measured, setMeasured] = useState<number | null>(null)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    // Mesure immédiate : dans un Drawer ou un panneau qui vient d'être monté,
    // l'observer peut ne rien émettre alors que la largeur est déjà connue. Sans
    // ça, le viewBox reste étroit et le SVG réclame une hauteur énorme (il est
    // dimensionné par son ratio), donc il se fait écraser à zéro par le parent.
    const first = Math.round(el.getBoundingClientRect().width)
    if (first > 0) setMeasured(first)
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0].contentRect.width)
      if (w > 0) setMeasured(w)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const W = measured ?? (panel.span === 3 ? 1040 : 360)
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
  // Nombre de points de la série la plus dense : c'est lui qui définit la grille
  // en X. Les étiquettes gardent leur propre espacement (6 ticks, 24 points…).
  const pointCount = Math.max(1, ...series.map((s) => s.points.length))
  const xFor = (i: number) => padL + (pointCount === 1 ? 0 : (i / (pointCount - 1)) * plotW)
  const xForLabel = (i: number) => padL + (xLabels.length === 1 ? 0 : (i / (xLabels.length - 1)) * plotW)
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
  const hoverLabel =
    hover === null
      ? ''
      : xLabels[Math.round((hover / Math.max(1, pointCount - 1)) * (xLabels.length - 1))] ?? ''
  const suffix = unit && !panel.yFmt ? ` ${unit}` : ''
  const ttLines =
    hover === null
      ? []
      : [
          hoverLabel,
          ...hoverRows.flatMap((r) => {
            const s = series.find((x) => x.name === r.name)
            const lo = s?.band?.lo[hover]
            const hi = s?.band?.hi[hover]
            const head = `${s?.band ? 'avg' : r.name}: ${fmtVal(r.value)}${suffix}`
            return s?.band && lo != null && hi != null
              ? [head, `min: ${fmtVal(lo)}${suffix}`, `max: ${fmtVal(hi)}${suffix}`]
              : [head]
          }),
        ]
  const ttW = Math.max(72, ...ttLines.map((l) => l.length * 5.6 + 16))
  const ttH = ttLines.length * 14 + 10
  const ttX = hover === null ? 0 : Math.min(Math.max(xFor(hover) + 10, padL), W - padR - ttW)
  const ttY = padT + 2

  return (
    <div className={styles.chartWrap} ref={wrapRef}>
      {/* height en pixels + viewBox mesuré à la largeur réelle = échelle 1:1 et
          hauteur garantie. Sans hauteur explicite, le SVG dépend de son ratio et
          peut tomber à zéro ; avec height:100% en CSS il se retrouve letterboxé. */}
      <svg
        className={styles.chartSvg}
        viewBox={`0 0 ${W} ${H}`}
        height={H}
        role="img"
        aria-label={panel.name}
      >
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
          <text key={lbl + i} className={styles.axisText} x={xForLabel(i)} y={H - 7} textAnchor="middle">{lbl}</text>
        ))}
        {/* Enveloppe min/max d'abord, sous la courbe : aire de la couleur de la
            série, très peu opaque. */}
        {series.map((s) =>
          s.band ? (
            <polygon
              key={`band-${s.name}`}
              points={[
                ...s.band.lo.map((v, i) => (v === null ? null : `${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`)),
                ...[...s.band.hi].reverse().map((v, i) => {
                  const idx = s.band!.hi.length - 1 - i
                  return v === null ? null : `${xFor(idx).toFixed(1)},${yFor(v).toFixed(1)}`
                }),
              ]
                .filter(Boolean)
                .join(' ')}
              fill={s.color}
              opacity={0.14}
              stroke="none"
            />
          ) : null,
        )}
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
        {Array.from({ length: pointCount }, (_, i) => i).map((i) => {
          const band = pointCount === 1 ? plotW : plotW / (pointCount - 1)
          return (
            <rect
              key={`hit-${i}`}
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
