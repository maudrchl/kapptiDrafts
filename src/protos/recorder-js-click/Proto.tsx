import { useState } from 'react'
import {
  Toggle,
  IconPlay,
  IconPause,
  IconSquareMousePointer,
  IconMousePointer2,
  IconAlertTriangle,
  IconMinusCircle,
  IconChevronDown,
  IconChevronRight,
} from '@kapptivate/ui-kit'
import styles from './recorder.module.scss'

/**
 * Panneau latéral du web-recorder, version « best » de l'action « click »
 * qui détecte un élément non cliquable normalement (cf. L3-1199 HelloAsso :
 * <input> caché en `visually-hidden`, label enveloppant un <a>).
 *
 * Parti pris (vs la V1 du dev) :
 *  1. On ne raconte PLUS où le clic atterrit (centre / lien), c'est de la
 *     mécanique WebDriver relative qui ne veut rien dire pour l'utilisateur.
 *     On dit juste : l'élément ne se clique pas normalement, on le cible
 *     directement.
 *  2. Le fix est appliqué PAR DÉFAUT (opt-out) → l'enregistrement marche tout
 *     de suite, l'utilisateur peut revenir en arrière en connaissance de cause.
 *  3. Le « pourquoi » technique reste accessible (repli) mais ne crie pas :
 *     dans un outil de test, savoir que l'élément est caché peut révéler un
 *     vrai bug côté app: on le surface, on ne l'enterre pas.
 */

type Action = {
  id: number
  kind: string
  title: string
  selector: string
  /** l'élément ne se clique pas normalement → clic direct requis */
  needsDirectClick?: boolean
}

const ACTIONS: Action[] = [
  {
    id: 1,
    kind: 'Click',
    title: 'My organisation accepts the terms and conditions of use',
    selector: '.registration-user-checkbox__label',
    needsDirectClick: true,
  },
  {
    id: 2,
    kind: 'Click',
    title: 'I confirm that I am acting as a recruiter',
    selector: '(//*[@data-test="ha-label"])[2]',
  },
]

const Proto = () => {
  // action 1 dépliée au départ, action 2 repliée
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 1: true })
  // clic direct ACTIVÉ par défaut sur les actions qui en ont besoin (opt-out)
  const [directClick, setDirectClick] = useState<Record<number, boolean>>({ 1: true })
  // disclosure du message détecté → révèle le toggle pour enlever si besoin
  const [hintOpen, setHintOpen] = useState<Record<number, boolean>>({})

  const toggleExpand = (id: number) =>
    setExpanded((e) => ({ ...e, [id]: !e[id] }))

  return (
    <div className={styles.canvas}>
      <div className={styles.panel}>
        {/* ---------------- bandeau recording ---------------- */}
        <div className={styles.recBar}>
          <div className={styles.recIcon}>
            <IconPlay size={22} />
            <span className={styles.recDot} />
          </div>
          <div className={styles.recText}>
            <div className={styles.recLabel}>Recording live</div>
            <div className={styles.recCount}>
              <b>{ACTIONS.length}</b> actions captured
            </div>
          </div>
          <div className={styles.recCtrls}>
            <button className={styles.ctrlBtn} title="Pick an element" aria-label="Pick an element">
              <IconSquareMousePointer size={20} />
            </button>
            <button className={styles.ctrlBtn} title="Pause recording" aria-label="Pause recording">
              <IconPause size={20} />
            </button>
            <button className={styles.ctrlStop + ' ' + styles.ctrlBtn} title="Stop recording" aria-label="Stop recording">
              <span className={styles.stopGlyph} />
            </button>
          </div>
        </div>

        {/* ---------------- actions capturées ---------------- */}
        {ACTIONS.map((a) => {
          const open = !!expanded[a.id]
          const direct = !!directClick[a.id]

          const selectorField = (
            <div className={styles.selectorField}>
              <label className={styles.fieldLabel}>
                Selector
                <span className={styles.fieldHint}>
                  How the element is found on the page.
                </span>
              </label>
              <div className={styles.selectBox} tabIndex={0} role="button">
                <span className={styles.selectVal}>{a.selector}</span>
                <IconChevronDown size={18} className={styles.selectChevron} />
              </div>
            </div>
          )

          return (
            <div className={styles.card} key={a.id}>
              <div
                className={styles.row}
                onClick={() => toggleExpand(a.id)}
                role="button"
                tabIndex={0}
                aria-expanded={open}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleExpand(a.id)
                  }
                }}
              >
                <div className={styles.thumb}>
                  <span className={styles.badge}>{a.id}</span>
                  <span className={styles.thumbBox}>
                    <IconMousePointer2 size={22} />
                  </span>
                </div>

                <div className={styles.meta}>
                  <div className={styles.kind}>
                    {direct ? 'JS click' : a.kind}
                    {direct && (
                      <IconAlertTriangle
                        size={14}
                        color="var(--color-text-warning, #b87812)"
                      />
                    )}
                  </div>
                  <div className={styles.title}>{a.title}</div>
                  <div className={styles.selectorLine}>{a.selector}</div>
                </div>

                <div
                  className={styles.rowCtrls}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className={styles.iconBtn + ' ' + styles.remove}
                    title="Remove action"
                    aria-label="Remove action"
                  >
                    <IconMinusCircle size={18} />
                  </button>
                  <button
                    className={styles.iconBtn}
                    onClick={() => toggleExpand(a.id)}
                    aria-label={open ? 'Collapse' : 'Expand'}
                    aria-expanded={open}
                  >
                    {open ? (
                      <IconChevronDown size={18} />
                    ) : (
                      <IconChevronRight size={18} />
                    )}
                  </button>
                </div>
              </div>

              {open && (
                <div className={styles.body}>
                  {/* Surfacé uniquement si détecté. Le message porte tout ;
                     le chevron déplie le toggle pour enlever si besoin. */}
                  {a.needsDirectClick && (
                    <div className={styles.hint}>
                      <button
                        className={styles.hintHeader}
                        onClick={() =>
                          setHintOpen((h) => ({ ...h, [a.id]: !h[a.id] }))
                        }
                        aria-expanded={!!hintOpen[a.id]}
                      >
                        <IconAlertTriangle
                          size={15}
                          className={styles.hintIcon}
                        />
                        <span className={styles.hintText}>
                          {direct
                            ? 'This element can’t be clicked normally, so we turned on JS click.'
                            : 'This element can’t be clicked normally. JS click is off, so replay may fail.'}
                        </span>
                        {hintOpen[a.id] ? (
                          <IconChevronDown size={16} className={styles.hintChevron} />
                        ) : (
                          <IconChevronRight size={16} className={styles.hintChevron} />
                        )}
                      </button>

                      {hintOpen[a.id] && (
                        <div className={styles.hintPanel}>
                          <div className={styles.toggleRow}>
                            <Toggle
                              title=""
                              value={direct}
                              onChange={(v) =>
                                setDirectClick((s) => ({ ...s, [a.id]: v }))
                              }
                            />
                            <span className={styles.toggleLabel}>
                              Use JS click
                            </span>
                          </div>
                          <p className={styles.hintWhy}>
                            The center of this element is over a link (
                            <code>&lt;a&gt;</code> “terms and conditions of
                            use”). The runner clicks at the element center, so
                            replay may follow the link instead.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={styles.field}>{selectorField}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Proto
