import { useState } from 'react'
import { Banner, Button, Checkbox, Modal } from '@kapptivate/ui-kit'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Flag,
  Globe,
  GripVertical,
  ListChecks,
  Play,
  Plus,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { Sidebar, TitleMark } from './shared'
import styles from './styles.module.scss'

type ChipState = 'default' | 'error' | 'changed'
type Chip = { name: string; value: string; state: ChipState; newValue?: string }
type TestItem = {
  id: string
  name: string
  host: string
  hostOk: boolean
  nameAlert?: boolean
  chips: Chip[]
}

const INITIAL_TESTS: TestItem[] = [
  {
    id: 't1',
    name: 'Plan selection',
    host: 'web-agent-b1',
    hostOk: true,
    chips: [
      { name: 'plan_name', value: 'Premium', state: 'changed', newValue: 'Pro' },
      { name: 'coupon', value: 'WINTER20', state: 'default' },
    ],
  },
  {
    id: 't2',
    name: 'Account creation',
    host: 'web-agent-b1',
    hostOk: true,
    chips: [
      { name: 'name', value: 'Alice Dupont', state: 'default' },
      { name: 'email', value: 'alice.dupont@email.com', state: 'default' },
    ],
  },
  {
    id: 't3',
    name: 'Payment failure handling',
    host: 'web-agent-b1',
    hostOk: true,
    nameAlert: true,
    chips: [{ name: 'card_number', value: 'Missing value', state: 'error' }],
  },
  {
    id: 't4',
    name: 'Payment with valid card',
    host: 'web-agent-b1',
    hostOk: true,
    chips: [
      { name: 'card_number', value: '********************4242', state: 'default' },
      { name: 'card_CVC', value: '***', state: 'default' },
      { name: 'card_date', value: '03/2027', state: 'changed', newValue: '09/2027' },
    ],
  },
  {
    id: 't5',
    name: 'Confirmation and activation',
    host: 'web-agent-b2',
    hostOk: false,
    nameAlert: true,
    chips: [{ name: 'input', value: 'Missing value', state: 'error' }],
  },
]

const VariableTag = ({ chip }: { chip: Chip }) => {
  const cls = chip.state === 'error' ? styles.varTagError : styles.varTag
  return (
    <span className={cls} title={`${chip.name}: ${chip.value}`}>
      <span className={styles.varKey}>{chip.name}:</span>
      <span className={styles.varVal}>{chip.value}</span>
    </span>
  )
}

/**
 * Scénario 1 — depuis la campagne.
 * Une variable a changé dans Configurations : la campagne tourne encore avec ses
 * valeurs sauvegardées, un banner + une modal de review permettent de mettre à jour.
 */
const CampaignScreen = () => {
  const [tests, setTests] = useState<TestItem[]>(INITIAL_TESTS)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Variables diverging from Configurations (changed since the campaign was saved).
  const changed = tests.flatMap((t) =>
    t.chips
      .filter((c) => c.state === 'changed' && c.newValue !== undefined)
      .map((c) => ({
        key: `${t.id}:${c.name}`,
        name: c.name,
        from: c.value,
        to: c.newValue as string,
        testName: t.name,
      })),
  )
  const changedCount = changed.length
  const selectedCount = selected.size

  const openReview = () => {
    setSelected(new Set(changed.map((c) => c.key)))
    setReviewOpen(true)
  }

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const applyUpdate = () => {
    setTests((ts) =>
      ts.map((t) => ({
        ...t,
        chips: t.chips.map((c) =>
          c.state === 'changed' && c.newValue !== undefined && selected.has(`${t.id}:${c.name}`)
            ? { ...c, value: c.newValue, state: 'default' as ChipState, newValue: undefined }
            : c,
        ),
      })),
    )
    setReviewOpen(false)
  }

  return (
    <div className={styles.app}>
      <Sidebar active="tests" />

      <div className={styles.main}>
        {/* Back link bar */}
        <div className={styles.topbar}>
          <div className={styles.crumb}>
            <button className={styles.backBtn}>
              <ChevronLeft size={12} /> Tests campaigns
            </button>
            <span className={styles.crumbSep}>/</span>
            <span className={styles.crumbCur}>My new campaign</span>
          </div>
          <Button color="primary">Save</Button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.pageTitle}>
            <span className={styles.titleMark}>
              <TitleMark />
            </span>
            <span className={styles.titleText}>Create tests campaign</span>
          </div>

          <div className={styles.section}>
            {/* About */}
            <section className={styles.card}>
              <div className={styles.cardTitleRow}>
                <span className={styles.cardTitle}>About</span>
              </div>
              <div className={styles.fields}>
                <div className={`${styles.field} ${styles.narrow}`}>
                  <label className={styles.fieldLabel}>Campaign name</label>
                  <div className={styles.fieldInput}>Subscribe Campaign</div>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Description</label>
                  <div className={styles.fieldInput}>
                    Campaign dedicated to validating the subscription flow end to end.
                  </div>
                </div>
              </div>
            </section>

            {/* Tests */}
            <section className={styles.card}>
              <div className={styles.cardTitleRow}>
                <span className={styles.cardTitle}>Your tests</span>
                <span className={styles.countTag}>{tests.length} tests</span>
              </div>

              <div className={styles.testsBody}>
                {/* Variable-change banner, between the title and Campaign start */}
                {changedCount > 0 && (
                  <div className={styles.bannerWrap}>
                    <Banner
                      variant="primary"
                      description={
                        <div>
                          <div className={styles.bannerDesc}>
                            {changedCount} variable{changedCount > 1 ? 's' : ''} changed in
                            Configurations
                          </div>
                          <div className={styles.bannerSub}>
                            This campaign still runs with your saved values. Review what changed to
                            update.
                          </div>
                        </div>
                      }
                      aside={
                        <Button
                          color="secondary"
                          size="s"
                          icon={ListChecks}
                          onClick={openReview}
                        >
                          Review changes
                        </Button>
                      }
                    />
                  </div>
                )}

                <span className={styles.marker}>
                  <Play size={10} /> Campaign Start
                </span>

                <div className={styles.list}>
                  {tests.map((t) => (
                    <div key={t.id} className={styles.testRow}>
                      <div className={styles.testTop}>
                        <div className={styles.testLead}>
                          <span className={styles.grip}>
                            <GripVertical size={12} />
                          </span>
                          <span className={styles.testName}>{t.name}</span>
                          {t.nameAlert && (
                            <span className={styles.testAlert}>
                              <AlertCircle size={12} />
                            </span>
                          )}
                        </div>
                        <span className={styles.host}>
                          <Globe size={12} /> {t.host}
                          {t.hostOk ? (
                            <span className={styles.hostOk}>
                              <CheckCircle2 size={12} />
                            </span>
                          ) : (
                            <span className={styles.hostDown}>
                              <XCircle size={12} />
                            </span>
                          )}
                        </span>
                      </div>
                      <div className={styles.chipRow}>
                        {t.chips.map((c) => (
                          <VariableTag key={c.name} chip={c} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <span className={styles.marker}>
                  <Flag size={10} /> Campaign End
                </span>
              </div>

              <div>
                <Button color="primary" icon={Plus}>
                  Add test(s)
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Review modal */}
      <Modal
        open={reviewOpen}
        onCancel={() => setReviewOpen(false)}
        title="Review variable changes"
        width={560}
      >
        <Modal.Content>
          <p className={styles.modalIntro}>
            These variables changed in Configurations after you saved the campaign. Pick the ones to
            update, then apply the new values here.
          </p>
          <div className={styles.diffList}>
            {changed.map((c) => (
              <div
                key={c.key}
                role="button"
                tabIndex={0}
                className={`${styles.diffRow} ${selected.has(c.key) ? styles.diffRowOn : ''}`}
                onClick={() => toggle(c.key)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggle(c.key)
                  }
                }}
              >
                <span className={styles.cbWrap} onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    identifier={c.key}
                    checked={selected.has(c.key)}
                    onChange={() => toggle(c.key)}
                  />
                </span>
                <div className={styles.diffMain}>
                  <div className={styles.diffHead}>
                    <span className={styles.diffName}>{c.name}</span>
                    <span className={styles.diffUsage}>Used in {c.testName}</span>
                  </div>
                  <div className={styles.diffValues}>
                    <span className={styles.diffOld} title={c.from}>
                      {c.from}
                    </span>
                    <span className={styles.diffArrow}>
                      <ArrowRight size={15} />
                    </span>
                    <span className={styles.diffNew} title={c.to}>
                      {c.to}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div className={styles.modalFooter}>
            <Button color="invisible" onClick={() => setReviewOpen(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              icon={RefreshCw}
              disabled={selectedCount === 0}
              onClick={applyUpdate}
            >
              Update {selectedCount} variable{selectedCount > 1 ? 's' : ''}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default CampaignScreen
