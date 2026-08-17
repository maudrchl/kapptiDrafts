import { useCallback, useEffect, useState } from 'react'
import { Button, IconArrowLeft, IconArrowRight, IconClose, IconPlay } from '@kapptivate/ui-kit'
import VariablesProto from '../test-editor-variables/Proto'
import styles from './tour.module.scss'
import { TOUR } from './constants'

/**
 * ─────────────────────────────────────────────────────────────
 *  Visite guidée du proto « Variables: inputs vs locals »
 * ─────────────────────────────────────────────────────────────
 *
 * Même écran, à l'identique : le proto est importé tel quel, pas dupliqué, pour
 * qu'il n'y ait jamais deux versions à maintenir. On ajoute par-dessus un
 * pas à pas pour la passation aux devs : chaque étape surligne une zone (via
 * les ancres `data-tour` et les `id` de step du proto) et dit la décision.
 *
 * Le surlignage est un anneau en position fixe, `pointer-events: none` : l'écran
 * reste entièrement manipulable pendant la présentation.
 */
const TourProto = () => {
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(true)
  const [rect, setRect] = useState<DOMRect | null>(null)

  const current = TOUR[step]

  /** Mesure la cible de l'étape courante (et la ramène dans le viewport). */
  const measure = useCallback(() => {
    if (!open || !current?.target) {
      setRect(null)
      return
    }
    const el = document.querySelector(current.target)
    setRect(el ? el.getBoundingClientRect() : null)
  }, [current, open])

  useEffect(() => {
    if (!open || !current?.target) {
      setRect(null)
      return
    }
    const el = document.querySelector(current.target)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // la mesure attend la fin du scroll, puis suit les mouvements
    const t = window.setTimeout(measure, 320)
    return () => window.clearTimeout(t)
  }, [current, open, measure])

  useEffect(() => {
    if (!open) return
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [measure, open])

  const go = useCallback(
    (delta: number) => setStep((s) => Math.min(TOUR.length - 1, Math.max(0, s + delta))),
    [],
  )

  // flèches pour dérouler, Échap pour reprendre la main
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, open])

  return (
    <>
      <VariablesProto />

      {open && rect && (
        <div
          className={styles.ring}
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
        />
      )}

      {open ? (
        <aside className={styles.panel}>
          <div className={styles.head}>
            <span className={styles.count}>
              {step + 1} / {TOUR.length}
            </span>
            <span className={styles.title}>{current.title}</span>
            <button
              type="button"
              className={styles.close}
              aria-label="Close the walkthrough"
              onClick={() => setOpen(false)}
            >
              <IconClose size={15} />
            </button>
          </div>

          <p className={styles.body}>{current.body}</p>

          {current.todo && (
            <p className={styles.todo}>
              <span className={styles.todoTag}>Try it</span>
              {current.todo}
            </p>
          )}

          <div className={styles.dots}>
            {TOUR.map((s, i) => (
              <button
                key={s.title}
                type="button"
                aria-label={`Step ${i + 1}`}
                className={i === step ? styles.dotOn : styles.dot}
                onClick={() => setStep(i)}
              />
            ))}
          </div>

          <div className={styles.foot}>
            <Button color="secondary" size="s" disabled={step === 0} onClick={() => go(-1)}>
              <Button.Icon icon={IconArrowLeft} />
              Back
            </Button>
            <Button
              color="primary"
              size="s"
              disabled={step === TOUR.length - 1}
              onClick={() => go(1)}
            >
              Next
              <Button.Icon icon={IconArrowRight} />
            </Button>
          </div>
        </aside>
      ) : (
        <button type="button" className={styles.restart} onClick={() => setOpen(true)}>
          <IconPlay size={13} />
          Resume the walkthrough
        </button>
      )}
    </>
  )
}

export default TourProto
