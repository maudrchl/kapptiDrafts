import { useEffect, useState } from 'react'
import { Bot, Check, Cloud, Monitor, Signal, Smartphone, Globe, Eye } from 'lucide-react'
import { Button, Modal, Toggle, Radio, Tag, IconArrowLeft, IconDownload } from '@kapptivate/ui-kit'
import styles from './locations.module.scss'
import { CONTINENTS, catLabel, type Location, type PrivateCat, type Scope } from './constants'

type Screen = 'options' | 'public' | 'desktop' | 'robot'

type Props = {
  open: boolean
  initialScreen: 'options' | 'public'
  locations: Location[]
  onClose: () => void
  onToggleRegion: (id: string, on: boolean) => void
  onAddRunner: (loc: Location) => string
  onGotoDetail: (id: string) => void
}

const AddLocationModal = ({
  open,
  initialScreen,
  locations,
  onClose,
  onToggleRegion,
  onAddRunner,
  onGotoDetail,
}: Props) => {
  const [screen, setScreen] = useState<Screen>(initialScreen)

  useEffect(() => {
    if (open) setScreen(initialScreen)
  }, [open, initialScreen])

  const title =
    screen === 'public'
      ? 'Public locations'
      : screen === 'desktop'
        ? 'Connect a desktop runner'
        : screen === 'robot'
          ? 'Connect a robot'
          : 'Add a location'

  return (
    <Modal open={open} onCancel={onClose} title={title} width={560} maskClosable>
      {screen === 'options' && <Options onPick={setScreen} onClose={onClose} />}
      {screen === 'public' && (
        <PublicRegions
          locations={locations}
          onToggleRegion={onToggleRegion}
          onBack={() => setScreen('options')}
          onDone={onClose}
        />
      )}
      {screen === 'desktop' && (
        <DesktopWizard
          onBack={() => setScreen('options')}
          onClose={onClose}
          onAddRunner={onAddRunner}
          onGotoDetail={onGotoDetail}
        />
      )}
      {screen === 'robot' && (
        <RobotWizard
          onBack={() => setScreen('options')}
          onClose={onClose}
          onAddRunner={onAddRunner}
          onGotoDetail={onGotoDetail}
        />
      )}
    </Modal>
  )
}

/* ---------- Options ---------- */
const Options = ({ onPick, onClose }: { onPick: (s: Screen) => void; onClose: () => void }) => (
  <>
    <Modal.Content>
      <p className={styles.modalIntro} style={{ marginBottom: 12 }}>
        A location is where your tests run. Pick a managed public location, or connect your own
        private one.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className={styles.opt} onClick={() => onPick('public')}>
          <span className={styles.optIc}>
            <Cloud size={19} />
          </span>
          <span className={styles.optBody}>
            <h5>Use a public location</h5>
            <p>
              Managed by kapptivate, runs on Playwright. Available instantly, enable the regions you
              care about.
            </p>
          </span>
        </button>
        <button className={styles.opt} onClick={() => onPick('desktop')}>
          <span className={styles.optIc}>
            <Monitor size={19} />
          </span>
          <span className={styles.optBody}>
            <h5>Connect a desktop runner</h5>
            <p>
              Install the kapptivate Desktop app on your machine. Register it as a personal or shared
              private location.
            </p>
          </span>
        </button>
        <button className={styles.opt} onClick={() => onPick('robot')}>
          <span className={styles.optIc}>
            <Bot size={19} />
          </span>
          <span className={styles.optBody}>
            <h5>
              Connect a robot <span className={styles.tagSoon}>On-site</span>
            </h5>
            <p>
              A kapptivate robot on the client network (SIM, Smartphone, Web, Passive). Shared with
              the workspace.
            </p>
          </span>
        </button>
      </div>
    </Modal.Content>
    <Modal.Footer>
      <Button color="secondary" onClick={onClose}>
        Cancel
      </Button>
    </Modal.Footer>
  </>
)

/* ---------- Public regions ---------- */
const PublicRegions = ({
  locations,
  onToggleRegion,
  onBack,
  onDone,
}: {
  locations: Location[]
  onToggleRegion: (id: string, on: boolean) => void
  onBack: () => void
  onDone: () => void
}) => {
  const count = locations.filter((l) => l.kind === 'public' && l.enabled).length
  return (
    <>
      <Modal.Content maxHeight="52vh">
        <p className={styles.modalIntro} style={{ marginBottom: 8 }}>
          Turn on the regions your users are in. Managed by kapptivate, ready instantly. One region
          is enabled by default when your workspace is created.
        </p>
        {CONTINENTS.map((c) => (
          <div key={c}>
            <div className={styles.grp}>{c}</div>
            {locations
              .filter((l) => l.kind === 'public' && l.cont === c)
              .map((l) => (
                <div className={styles.regionRow} key={l.id}>
                  <div className={styles.regionFlag}>{l.flag}</div>
                  <div className={styles.regionInfo}>
                    <div className="n">
                      {l.city}
                      {l.default && <Tag color="orange">Default</Tag>}
                    </div>
                    <div className="c">{l.region} · Playwright</div>
                  </div>
                  <Toggle value={!!l.enabled} onChange={(on) => onToggleRegion(l.id, on)} />
                </div>
              ))}
          </div>
        ))}
      </Modal.Content>
      <Modal.Footer>
        <span className={styles.footCount}>
          {count} region{count > 1 ? 's' : ''} enabled
        </span>
        <Button color="secondary" icon={IconArrowLeft} onClick={onBack}>
          Back
        </Button>
        <Button color="primary" onClick={onDone}>
          Done
        </Button>
      </Modal.Footer>
    </>
  )
}

/* ---------- Stepper ---------- */
const Stepper = ({ steps, cur }: { steps: string[]; cur: number }) => (
  <div className={styles.stepper}>
    {steps.map((s, i) => {
      const n = i + 1
      const cls = cur > n ? styles.done : cur === n ? styles.active : ''
      return (
        <div key={s} style={{ display: 'contents' }}>
          <div className={`${styles.step} ${cls}`}>
            <span className="num">{cur > n ? '✓' : n}</span>
            {s}
          </div>
          {i < steps.length - 1 && <span className={styles.stepLine} />}
        </div>
      )
    })}
  </div>
)

const Codebox = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false)
  return (
    <div className={styles.codebox}>
      {code}
      <button onClick={() => setCopied(true)}>{copied ? 'Copied ✓' : 'Copy'}</button>
    </div>
  )
}

/* ---------- Desktop wizard ---------- */
const OS: Record<string, string> = { mac: 'macOS', win: 'Windows', linux: 'Linux' }

const DesktopWizard = ({
  onBack,
  onClose,
  onAddRunner,
  onGotoDetail,
}: {
  onBack: () => void
  onClose: () => void
  onAddRunner: (loc: Location) => string
  onGotoDetail: (id: string) => void
}) => {
  const [step, setStep] = useState(1)
  const [os, setOs] = useState('mac')
  const [connected, setConnected] = useState(false)
  const [name, setName] = useState('julien-macbook')
  const [scope, setScope] = useState<Scope>('personal')
  const [caps, setCaps] = useState<string[]>(['Web', 'Mobile'])
  const [newId, setNewId] = useState<string | null>(null)
  const zone = 'Europe/France/Rennes'
  const host = 'MacBook Pro · Julien'

  useEffect(() => {
    if (step === 2 && !connected) {
      const t = setTimeout(() => setConnected(true), 1700)
      return () => clearTimeout(t)
    }
  }, [step, connected])

  const toggleCap = (c: string) =>
    setCaps((cur) => (cur.includes(c) ? (cur.length > 1 ? cur.filter((x) => x !== c) : cur) : [...cur, c]))

  const finish = () => {
    const id = onAddRunner({
      id: '', name, kind: 'private', cat: 'desktop', runner: 'desktop', scope,
      zone, status: 'online', version: 'v7.30.0', owner: scope === 'personal' ? 'julien.kapptivate' : '',
      host, uuid: 'gen', caps: caps.join(' · '), devices: [],
    })
    setNewId(id)
    setStep(4)
  }

  return (
    <>
      <Modal.Content>
        {step !== 4 && <Stepper steps={['Install', 'Pair', 'Configure']} cur={step} />}
        {step === 1 && (
          <>
            <p className={styles.modalIntro}>
              Install kapptivate Desktop on the machine that will run your tests. It turns that
              computer into a private location.
            </p>
            <div className={styles.osRow}>
              {Object.keys(OS).map((v) => (
                <button key={v} className={`${styles.osBtn} ${os === v ? styles.sel : ''}`} onClick={() => setOs(v)}>
                  <Monitor size={22} />
                  {OS[v]}
                </button>
              ))}
            </div>
            <Button color="secondary" fullWidth icon={IconDownload}>
              Download for {OS[os]}
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <p className={styles.modalIntro}>Open the app, sign in to kapptivate, and enter this pairing code:</p>
            <Codebox code="KOA-4F2A-9B7C" />
            {connected ? (
              <div className={styles.connected}>
                <Check size={16} /> Runner detected: {host} · {zone}
              </div>
            ) : (
              <div className={styles.wait}>
                <span className={styles.spin} /> Waiting for the runner to connect…
              </div>
            )}
          </>
        )}
        {step === 3 && (
          <>
            <div className={styles.field}>
              <label>Location name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Scope</label>
              <Radio<Scope>
                vertical
                value={scope}
                onChange={setScope}
                options={[
                  { value: 'personal', label: <ScopeOpt title="Personal" desc="Only you can run tests on this runner." /> },
                  { value: 'shared', label: <ScopeOpt title="Shared with workspace" desc="Anyone in kapptivate can run tests on it." /> },
                ]}
              />
            </div>
            <div className={styles.field}>
              <label>Capabilities</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Web', 'Mobile', 'API'].map((c) => (
                  <Tag
                    key={c}
                    color={caps.includes(c) ? 'orange' : 'grey'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleCap(c)}
                  >
                    {c}
                  </Tag>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label>Zone (auto-detected)</label>
              <input value={zone} disabled />
            </div>
          </>
        )}
        {step === 4 && (
          <div className={styles.wizardDone}>
            <div className={styles.doneIcon}>
              <Check size={28} />
            </div>
            <h3>Desktop runner connected</h3>
            <p>
              {name} is now a private location ({scope === 'personal' ? 'Personal' : 'Shared'}).
            </p>
          </div>
        )}
      </Modal.Content>
      <Modal.Footer>
        {step === 1 && (
          <>
            <Button color="secondary" onClick={onBack}>Back</Button>
            <Button color="primary" onClick={() => setStep(2)}>I've installed it</Button>
          </>
        )}
        {step === 2 && (
          <>
            <Button color="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button color="primary" disabled={!connected} onClick={() => setStep(3)}>Next</Button>
          </>
        )}
        {step === 3 && (
          <>
            <Button color="secondary" onClick={() => setStep(2)}>Back</Button>
            <Button color="primary" onClick={finish}>Add location</Button>
          </>
        )}
        {step === 4 && (
          <>
            <Button color="secondary" onClick={onClose}>Done</Button>
            <Button color="primary" onClick={() => newId && onGotoDetail(newId)}>View location</Button>
          </>
        )}
      </Modal.Footer>
    </>
  )
}

const ScopeOpt = ({ title, desc }: { title: string; desc: string }) => (
  <span>
    <b style={{ fontSize: 13.5 }}>{title}</b>
    <div style={{ fontSize: 12, color: 'var(--color-text-secondary, #667085)', marginTop: 2 }}>{desc}</div>
  </span>
)

/* ---------- Robot wizard ---------- */
const HW_TYPES: [PrivateCat, string, typeof Signal][] = [
  ['cellular', 'SIM', Signal],
  ['smartphone', 'Smartphone', Smartphone],
  ['web', 'Web', Globe],
  ['passive', 'Passive', Eye],
]

const RobotWizard = ({
  onBack,
  onClose,
  onAddRunner,
  onGotoDetail,
}: {
  onBack: () => void
  onClose: () => void
  onAddRunner: (loc: Location) => string
  onGotoDetail: (id: string) => void
}) => {
  const [step, setStep] = useState(1)
  const [type, setType] = useState<PrivateCat>('cellular')
  const [connected, setConnected] = useState(false)
  const [name, setName] = useState('')
  const [zone, setZone] = useState('Guinee/Conakry')
  const [newId, setNewId] = useState<string | null>(null)

  useEffect(() => {
    if (step === 2 && !connected) {
      const t = setTimeout(() => setConnected(true), 1700)
      return () => clearTimeout(t)
    }
  }, [step, connected])

  const finish = () => {
    const id = onAddRunner({
      id: '', name: name || `new-${type}`, kind: 'private', cat: type, runner: 'appliance',
      scope: 'shared', zone, status: 'online', version: 'v1.0.0', host: name || `new-${type}`,
      uuid: 'hw', caps: catLabel(type), devices: [],
    })
    setNewId(id)
    setStep(4)
  }

  return (
    <>
      <Modal.Content>
        {step !== 4 && <Stepper steps={['Type', 'Pair', 'Configure']} cur={step} />}
        {step === 1 && (
          <>
            <p className={styles.modalIntro}>What kind of robot are you connecting? This sets its capability.</p>
            <div className={styles.hwTypes}>
              {HW_TYPES.map(([val, label, Icon]) => (
                <button key={val} className={`${styles.osBtn} ${type === val ? styles.sel : ''}`} onClick={() => setType(val)}>
                  <Icon size={22} />
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <p className={styles.modalIntro}>
              Power on the robot, connect it to the network, and enter this enrollment code in its
              setup screen:
            </p>
            <Codebox code="KAP-7C1D-2E9F" />
            {connected ? (
              <div className={styles.connected}>
                <Check size={16} /> Robot detected on the network
              </div>
            ) : (
              <div className={styles.wait}>
                <span className={styles.spin} /> Waiting for the robot to connect…
              </div>
            )}
          </>
        )}
        {step === 3 && (
          <>
            <div className={styles.field}>
              <label>Name</label>
              <input value={name} placeholder="e.g. ogn-4g-05" onChange={(e) => setName(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Capability</label>
              <input value={catLabel(type)} disabled />
            </div>
            <div className={styles.field}>
              <label>Zone</label>
              <input value={zone} onChange={(e) => setZone(e.target.value)} />
            </div>
          </>
        )}
        {step === 4 && (
          <div className={styles.wizardDone}>
            <div className={styles.doneIcon}>
              <Check size={28} />
            </div>
            <h3>Robot connected</h3>
            <p>
              {name || 'New robot'} is now available under Private · {catLabel(type)}.
            </p>
          </div>
        )}
      </Modal.Content>
      <Modal.Footer>
        {step === 1 && (
          <>
            <Button color="secondary" onClick={onBack}>Back</Button>
            <Button color="primary" onClick={() => setStep(2)}>Next</Button>
          </>
        )}
        {step === 2 && (
          <>
            <Button color="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button color="primary" disabled={!connected} onClick={() => setStep(3)}>Next</Button>
          </>
        )}
        {step === 3 && (
          <>
            <Button color="secondary" onClick={() => setStep(2)}>Back</Button>
            <Button color="primary" onClick={finish}>Connect</Button>
          </>
        )}
        {step === 4 && (
          <>
            <Button color="secondary" onClick={onClose}>Done</Button>
            <Button color="primary" onClick={() => newId && onGotoDetail(newId)}>View</Button>
          </>
        )}
      </Modal.Footer>
    </>
  )
}

export default AddLocationModal
