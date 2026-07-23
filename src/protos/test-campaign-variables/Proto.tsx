import { useState } from 'react'
import { Banner, Button, Checkbox, Modal } from '@kapptivate/ui-kit'
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Bug,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flag,
  Gauge,
  Globe,
  GripVertical,
  LineChart,
  ListChecks,
  MonitorDot,
  MonitorPlay,
  PanelLeftClose,
  Play,
  Plus,
  RefreshCw,
  Braces,
  Smartphone,
  Server,
  XCircle,
  Zap,
} from 'lucide-react'
import styles from './styles.module.scss'

const LOGO =
  "data:image/svg+xml,%3csvg%20width='178'%20height='28'%20viewBox='0%200%20178%2028'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M46.6496%2022.9253L40.2032%2015.237L45.816%208.59585H40.62L36.0352%2014.3827L33.979%2017.0282H33.8679L33.9513%2014.3276V5.59691C33.9513%204.36156%2032.9498%203.36011%2031.7145%203.36011C30.4791%203.36011%2029.4777%204.36156%2029.4777%205.5969V22.9253H33.7012L37.5913%2018.3233L41.398%2022.9253H46.6496Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M53.9591%208.1825C49.5689%208.1825%2046.7347%209.31233%2046.8736%2013.0325H50.8471C51.0416%2011.8751%2051.8751%2011.4893%2053.7646%2011.4893C55.8208%2011.4893%2056.6822%2011.9578%2056.6822%2013.3356V14.4378H51.6529C47.8739%2014.4378%2046.1234%2015.8708%2046.1234%2018.7642C46.1234%2021.823%2048.0684%2023.3386%2051.2083%2023.3386C53.5979%2023.3386%2056.2654%2022.4568%2057.488%2020.4176L56.9878%2021.4372L57.3768%2022.9253H61.1558V12.8671C61.1558%209.78079%2058.9606%208.1825%2053.9591%208.1825ZM52.8199%2020.0043C51.2638%2020.0043%2050.6803%2019.4256%2050.6803%2018.5438C50.6803%2017.6344%2051.2638%2017.1384%2052.3753%2017.1384H56.6822V18.8193C55.7374%2019.5909%2054.4315%2020.0043%2053.0144%2020.0043H52.8199Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M72.3795%208.21006C70.1566%208.21006%2068.2949%209.09187%2066.8222%2011.5995L67.628%2010.0839L67.5447%208.59585H63.1544V27.7201H67.628V21.1616C68.795%2022.7324%2070.49%2023.3386%2072.3795%2023.3386C76.7141%2023.3386%2079.4928%2019.9767%2079.4928%2015.7606C79.4928%2011.572%2076.7141%208.21006%2072.3795%208.21006ZM71.3236%2019.4531C69.0173%2019.4531%2067.5724%2017.91%2067.5724%2015.7606C67.5724%2013.6111%2069.0173%2012.068%2071.3236%2012.068C73.6298%2012.068%2075.047%2013.6111%2075.047%2015.7606C75.047%2017.91%2073.6298%2019.4531%2071.3236%2019.4531Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M89.9912%208.21006C87.7683%208.21006%2085.9066%209.09187%2084.4339%2011.5995L85.2397%2010.0839L85.1564%208.59585H80.7662V27.7201H85.2397V21.1616C86.4068%2022.7324%2088.1017%2023.3386%2089.9912%2023.3386C94.3259%2023.3386%2097.1045%2019.9767%2097.1045%2015.7606C97.1045%2011.572%2094.3259%208.21006%2089.9912%208.21006ZM88.9353%2019.4531C86.6291%2019.4531%2085.1842%2017.91%2085.1842%2015.7606C85.1842%2013.6111%2086.6291%2012.068%2088.9353%2012.068C91.2416%2012.068%2092.6587%2013.6111%2092.6587%2015.7606C92.6587%2017.91%2091.2416%2019.4531%2088.9353%2019.4531Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M109.055%2012.3711V8.59585H105.026V3.63567H100.552V8.59585H97.3569V12.3711H100.552V17.8549C100.552%2021.1065%20102.108%2023.063%20106.276%2023.063H109.055V19.0949H107.11C105.721%2019.0949%20105.026%2018.5989%20105.026%2017.1384V12.3711H109.055Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M110.536%2022.9253H115.01V8.59585C113.603%209.30728%20111.942%209.30728%20110.536%208.59585V22.9253Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M121.912%2022.9253H126.691L132.86%208.59585H128.22L124.385%2017.9651H124.218L120.412%208.59585H115.771L121.912%2022.9253Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M139.875%208.1825C135.485%208.1825%20132.651%209.31233%20132.79%2013.0325H136.763C136.958%2011.8751%20137.791%2011.4893%20139.681%2011.4893C141.737%2011.4893%20142.598%2011.9578%20142.598%2013.3356V14.4378H137.569C133.79%2014.4378%20132.039%2015.8708%20132.039%2018.7642C132.039%2021.823%20133.984%2023.3386%20137.124%2023.3386C139.514%2023.3386%20142.181%2022.4568%20143.404%2020.4176L142.904%2021.4372L143.293%2022.9253H147.072V12.8671C147.072%209.78079%20144.877%208.1825%20139.875%208.1825ZM138.736%2020.0043C137.18%2020.0043%20136.596%2019.4256%20136.596%2018.5438C136.596%2017.6344%20137.18%2017.1384%20138.291%2017.1384H142.598V18.8193C141.653%2019.5909%20140.348%2020.0043%20138.93%2020.0043H138.736Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M159.449%2012.3711V8.59585H155.42V3.63567H150.946V8.59585H147.751V12.3711H150.946V17.8549C150.946%2021.1065%20152.503%2023.063%20156.67%2023.063H159.449V19.0949H157.504C156.115%2019.0949%20155.42%2018.5989%20155.42%2017.1384V12.3711H159.449Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M164.573%2017.0833H175.855C176.299%2011.4893%20173.187%208.1825%20168.075%208.1825C162.934%208.1825%20160.072%2011.4893%20160.072%2015.7606C160.072%2020.0318%20163.156%2023.3386%20168.325%2023.3386C171.253%2023.3386%20173.608%2022.2729%20174.993%2020.8479C175.985%2019.8266%20174.987%2018.4887%20173.563%2018.4887C172.645%2018.4887%20171.783%2019.0976%20170.949%2019.4815C170.264%2019.7967%20169.383%2019.9492%20168.575%2019.9492C166.352%2019.9492%20164.935%2018.8744%20164.573%2017.0833ZM168.075%2011.4342C169.936%2011.4342%20171.048%2012.2609%20171.464%2014.4103H164.546C164.879%2012.4538%20166.018%2011.4342%20168.075%2011.4342Z'%20fill='%23FFF9D4'/%3e%3cellipse%20cx='8.35869'%20cy='5.28086'%20rx='3.43657'%20ry='3.39487'%20fill='%23FFF9D4'/%3e%3cellipse%20cx='112.738'%20cy='4.55001'%20rx='3.33041'%20ry='3.29'%20fill='%23ED7846'/%3e%3c/svg%3e"

/** Logo mark kapptivate (custom/default-logo du Figma). */
const TitleMark = () => (
  <svg viewBox="0 0 10.8032 13.6551" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.18393 4.1275C4.3237 4.1275 5.24768 3.20353 5.24768 2.06375C5.24768 0.923972 4.3237 0 3.18393 0C2.04415 0 1.12018 0.923972 1.12018 2.06375C1.12018 3.20353 2.04415 4.1275 3.18393 4.1275ZM1.72693 9.7669C0.95814 9.54489 0.429094 9.20324 0.109128 8.32414C-0.244655 7.35213 0.28074 6.32723 1.40999 5.91621L8.07828 3.48915C9.20753 3.07814 10.2617 3.52815 10.6675 4.6431C11.0707 5.75091 10.5524 6.77322 9.42317 7.18423L8.29392 7.59524C7.93843 7.44134 7.46853 7.15101 6.99667 6.78856C6.88617 6.70737 6.7627 6.67946 6.62691 6.72889C6.44108 6.79652 6.33393 7.01359 6.40416 7.20656C6.44578 7.32092 6.50493 7.37223 6.59332 7.43719C6.9521 7.7113 7.33426 7.96072 7.7242 8.14255L8.6841 8.57829C9.24691 8.8348 9.54071 9.10828 9.70719 9.5657C10.048 10.502 9.50048 11.5106 8.69285 11.8046C8.12822 12.0101 7.68571 12.0174 6.33589 11.4888C6.69136 10.7631 6.69462 10.21 6.6959 9.99284C6.69596 9.98306 6.69601 9.97397 6.69609 9.96557C6.69801 9.85965 6.69993 9.75373 6.67131 9.67511C6.59587 9.46785 6.3788 9.36069 6.17868 9.43353C5.99286 9.50116 5.92727 9.65454 5.93253 9.84688C5.94107 10.1594 5.86781 10.7365 5.68921 11.0686L4.94104 12.4822C4.65529 13.0313 4.16545 13.4201 3.80094 13.5527C2.93614 13.8675 1.97429 13.4486 1.5945 12.4052C1.38639 11.8334 1.59353 11.3128 2.06768 10.6141L2.50936 9.95966C2.78931 9.55019 2.87231 8.97769 2.88847 8.68852C2.89688 8.55595 2.86956 8.4364 2.84614 8.37207C2.77591 8.1791 2.57053 8.0596 2.36326 8.13503C2.156 8.21047 2.12746 8.39893 2.12037 8.57958C2.10292 8.90968 2.04064 9.2723 1.87697 9.53422L1.72693 9.7669Z"
      fill="#24292F"
    />
  </svg>
)

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

const Sidebar = () => (
  <aside className={styles.sidebar}>
    <div className={styles.brand}>
      <img className={styles.brandLogo} src={LOGO} alt="kapptivate" />
      <button className={styles.collapse} aria-label="Collapse">
        <PanelLeftClose size={18} />
      </button>
    </div>
    <div className={styles.navSep} />

    <div className={styles.wsCard}>
      <div className={styles.wsAvatar}>❋</div>
      <div>
        <div className={styles.wsName}>Kapptivate - Products</div>
        <div className={styles.wsSub}>Workspace</div>
      </div>
    </div>

    <div className={styles.navLabel}>Overview</div>
    <button className={styles.navItem}>
      <MonitorDot size={14} /> Realtime status
    </button>
    <button className={styles.navItem}>
      <Eye size={14} /> Overview
    </button>
    <button className={styles.navItem}>
      <Bell size={14} /> Incidents
    </button>
    <button className={styles.navItem}>
      <LineChart size={14} /> Analytics
    </button>

    <div className={styles.navSep} />
    <div className={styles.navLabel}>By product</div>
    <button className={styles.navItemBoxed}>
      <span className={styles.navLead}>
        <Bug size={14} /> KTM
      </span>
      <ChevronRight size={15} />
    </button>
    <button className={styles.navItem}>
      <MonitorPlay size={14} /> Live session
    </button>
    <button className={styles.navItemActive}>
      <Zap size={14} /> Tests
    </button>
    <button className={styles.navItem}>
      <CheckCircle2 size={14} /> Executions
    </button>
    <button className={styles.navItem}>
      <Gauge size={14} /> Monitors
    </button>
    <button className={styles.navItem}>
      <Braces size={14} /> Configurations
    </button>

    <div className={styles.navSep} />
    <div className={styles.navLabel}>Equipments</div>
    <button className={styles.navItem}>
      <Smartphone size={14} /> Devices lab
    </button>
    <button className={styles.navItem}>
      <Globe size={14} /> Browser presets
    </button>
    <button className={styles.navItem}>
      <Server size={14} /> Agents
    </button>

    <div className={styles.spacer} />
    <div className={styles.navSep} />
    <button className={styles.helpBtn}>?</button>
  </aside>
)

const VariableTag = ({ chip }: { chip: Chip }) => {
  const cls = chip.state === 'error' ? styles.varTagError : styles.varTag
  return (
    <span className={cls} title={`${chip.name}: ${chip.value}`}>
      <span className={styles.varKey}>{chip.name}:</span>
      <span className={styles.varVal}>{chip.value}</span>
    </span>
  )
}

const CampaignVariablesProto = () => {
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
      <Sidebar />

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

export default CampaignVariablesProto
