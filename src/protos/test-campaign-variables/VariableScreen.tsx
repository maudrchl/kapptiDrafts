import { useState, type MouseEvent } from 'react'
import { Banner, Button, Checkbox, Input, Modal } from '@kapptivate/ui-kit'
import {
  ArrowRight,
  Braces,
  ChevronDown,
  Folder,
  Gauge,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import { Sidebar } from './shared'
import styles from './styles.module.scss'

type UsageType = 'test' | 'monitor'
type Usage = { id: string; type: UsageType; name: string }

type Variable = {
  id: string
  name: string
  description: string
  value: string
  usages: Usage[]
}

const TYPE_META: Record<UsageType, { label: string; Icon: typeof Zap }> = {
  test: { label: 'Test', Icon: Zap },
  monitor: { label: 'Monitor', Icon: Gauge },
}

const INITIAL_VARIABLE: Variable = {
  id: 'company',
  name: 'company',
  description: '',
  value: 'kapptivate',
  usages: [
    { id: 'u1', type: 'test', name: 'Log in to workspace' },
    { id: 'u2', type: 'test', name: 'Company profile page' },
    { id: 'u3', type: 'monitor', name: 'Homepage availability' },
  ],
}

/**
 * Scénario 2 — depuis la variable.
 * On édite la value d'une variable de Configurations. Comme elle est utilisée dans
 * des tests et des monitors, le MultiSelectModal du DS propose d'appliquer la nouvelle
 * value aux endroits sélectionnés (ou de garder les valeurs actuelles via Cancel).
 */
const VariableScreen = () => {
  const [variable, setVariable] = useState<Variable>(INITIAL_VARIABLE)
  const [query, setQuery] = useState('')
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; right: number } | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [draft, setDraft] = useState({ name: '', description: '', value: '' })

  const [propOpen, setPropOpen] = useState(false)
  const [changeFrom, setChangeFrom] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const testCount = variable.usages.filter((u) => u.type === 'test').length
  const monitorCount = variable.usages.filter((u) => u.type === 'monitor').length

  const matchesQuery = variable.name.toLowerCase().includes(query.trim().toLowerCase())

  const openMenu = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setMenuAnchor((cur) =>
      cur ? null : { top: r.bottom + 4, right: window.innerWidth - r.right },
    )
  }

  const openEdit = () => {
    setDraft({ name: variable.name, description: variable.description, value: variable.value })
    setMenuAnchor(null)
    setEditOpen(true)
  }

  const saveEdit = () => {
    const nextValue = draft.value.trim()
    const valueChanged = nextValue !== variable.value
    const oldValue = variable.value
    setVariable((v) => ({
      ...v,
      name: draft.name.trim() || v.name,
      description: draft.description,
      value: nextValue || v.value,
    }))
    setEditOpen(false)
    if (valueChanged && nextValue && variable.usages.length > 0) {
      setChangeFrom(oldValue)
      setSelected(new Set(variable.usages.map((u) => u.id)))
      setPropOpen(true)
    }
  }

  const toggleUsage = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const selectedCount = selected.size

  return (
    <div className={styles.app}>
      <Sidebar active="configurations" />

      <div className={styles.main}>
        {/* Product tab bar */}
        <div className={styles.vtabs}>
          <button className={styles.vtabActive}>
            <Braces size={14} /> Variables
          </button>
        </div>

        <div className={styles.vcontent}>
          {/* Tools bar */}
          <div className={styles.vtoolbar}>
            <span className={styles.vtitle}>Variables</span>
            <Button
              color="secondary" size="m"
            >
              <Button.Icon icon={Plus} />
              Create variable group
            </Button>
            <Button
              color="primary" size="m"
            >
              <Button.Icon icon={Plus} />
              Create variable
            </Button>
          </div>

          <div className={styles.vbody}>
            {/* Search */}
            <label className={styles.vsearch}>
              <Search size={12} />
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>

            {/* Collection cards */}
            <div className={styles.vcollections}>
              <div className={styles.vcollection}>
                <span className={styles.vcolBadge}>
                  <Folder size={16} />
                </span>
                <div>
                  <div className={styles.vcolName}>Users</div>
                  <div className={styles.vcolSub}>4 variables</div>
                </div>
              </div>
              <div className={styles.vcollection}>
                <span className={styles.vcolBadge}>
                  <Folder size={16} />
                </span>
                <div>
                  <div className={styles.vcolName}>Credit Cards</div>
                  <div className={styles.vcolSub}>3 variables</div>
                </div>
              </div>
            </div>

            {/* Variables table */}
            <div className={styles.vtable}>
              <div className={styles.vthead}>
                <div className={styles.vthName}>Variables ({matchesQuery ? 1 : 0})</div>
                <div className={styles.vthValues}>Values</div>
                <div className={styles.vthUsage}>Usage</div>
                <div className={styles.vthActions} />
              </div>

              {matchesQuery && (
                <div className={styles.vrow}>
                  <div className={styles.vcellName}>
                    <span className={styles.vBraces}>
                      <Braces size={12} />
                    </span>
                    <span className={styles.vVarName}>{variable.name}</span>
                  </div>
                  <div className={styles.vcellValue}>
                    <span className={styles.vcellValueText} title={variable.value}>
                      {variable.value}
                    </span>
                  </div>
                  <div className={styles.vcellUsage}>
                    <span className={styles.vUsageChip} title={`${testCount} tests`}>
                      <Zap size={12} /> {testCount}
                    </span>
                    {monitorCount > 0 && (
                      <span className={styles.vUsageChip} title={`${monitorCount} monitors`}>
                        <Gauge size={12} /> {monitorCount}
                      </span>
                    )}
                  </div>
                  <div className={styles.vcellActions}>
                    <span className={styles.vActionsWrap}>
                      <button
                        className={styles.vKebab}
                        aria-label="Variable actions"
                        onClick={openMenu}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuAnchor && (
                        <>
                          <div
                            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                            onClick={() => setMenuAnchor(null)}
                          />
                          <div
                            className={styles.vRowMenu}
                            style={{ top: menuAnchor.top, right: menuAnchor.right }}
                          >
                            <button className={styles.vRowMenuItem} onClick={openEdit}>
                              <Pencil size={14} /> Edit variable
                            </button>
                            <button
                              className={styles.vRowMenuItemDanger}
                              onClick={() => setMenuAnchor(null)}
                            >
                              <Trash2 size={14} /> Delete variable
                            </button>
                          </div>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit-variable modal (design "Create variable", repurposed for editing) */}
      <Modal open={editOpen} onCancel={() => setEditOpen(false)} title="Edit variable" width={500}>
        <Modal.Content>
          <div className={styles.modalContent}>
            <div className={styles.formRow}>
              <div className={styles.formCol}>
                <span className={styles.formLabel}>Name</span>
                <div className={styles.nameInput}>
                  <span className={styles.nameAffixPre}>{'{'}</span>
                  <input
                    className={styles.nameField}
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    placeholder="username"
                  />
                  <span className={styles.nameAffixPost}>{'}'}</span>
                </div>
                <span className={styles.formHint}>
                  No spaces or other special characters allowed.
                </span>
              </div>
              <div className={styles.formCol}>
                <span className={styles.formLabel}>Type</span>
                <div className={styles.typeField}>
                  <Braces size={12} /> Single value
                  <ChevronDown size={16} className={styles.typeFieldChevron} />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <span className={styles.formLabel}>Description (optional)</span>
              <Input
                name="description"
                fullWidth
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                placeholder="Variable description"
              />
            </div>

            <div className={styles.formGroup}>
              <span className={styles.formLabel}>Value</span>
              <Input
                name="value"
                fullWidth
                value={draft.value}
                onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))}
                placeholder="Value"
              />
            </div>
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div className={styles.modalFooter}>
            <Button color="invisible" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onClick={saveEdit}>
              Save changes
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Propagation: apply the new value to the selected tests/monitors, or keep current values.
          Same dense look as the DS MultiSelectModal, plus a type filter and update-aware wording. */}
      <Modal mode="headless" open={propOpen} onCancel={() => setPropOpen(false)} width={600}>
        <div className={styles.msHeader}>
          <h4 className={styles.msTitle}>Apply the new value to...</h4>
          <button
            className={styles.msClose}
            aria-label="Close"
            onClick={() => setPropOpen(false)}
          >
            <X size={16} />
          </button>
        </div>
        <Modal.Content hasPadding={false} overflow="hidden">
          <div className={styles.msDiff}>
            <span className={styles.diffOld} title={changeFrom}>
              {changeFrom}
            </span>
            <span className={styles.diffArrow}>
              <ArrowRight size={15} />
            </span>
            <span className={styles.diffNew} title={variable.value}>
              {variable.value}
            </span>
          </div>

          <div className={styles.msBanner}>
            <Banner
              variant="secondary"
            >
              <Banner.Description>
                <div>
                  <div className={styles.bannerDesc}>
                    This variable is used in {testCount} test{testCount > 1 ? 's' : ''} and{' '}
                    {monitorCount} monitor{monitorCount > 1 ? 's' : ''}
                  </div>
                  <div className={styles.bannerSub}>
                    You can keep their current value, or apply the new one to the ones you select
                    below.
                  </div>
                </div>
              </Banner.Description>
            </Banner>
          </div>

          <ol className={styles.msList}>
            {variable.usages.map((u) => {
              const meta = TYPE_META[u.type]
              const on = selected.has(u.id)
              return (
                <li
                  key={u.id}
                  className={`${styles.msItem} ${on ? styles.msItemOn : ''}`}
                  onClick={() => toggleUsage(u.id)}
                >
                  <span className={styles.cbWrap} onClick={(e) => e.stopPropagation()}>
                    <Checkbox identifier={u.id} checked={on} onChange={() => toggleUsage(u.id)} />
                  </span>
                  <div className={styles.usageOpt}>
                    <meta.Icon size={16} />
                    <div className={styles.usageOptMain}>
                      <span className={styles.usageOptName}>{u.name}</span>
                      <span className={styles.countTag}>{meta.label}</span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </Modal.Content>
        <Modal.Footer>
          <div className={styles.modalFooter}>
            <Button color="invisible" onClick={() => setPropOpen(false)}>
              Keep current values
            </Button>
            <Button
              color="primary"
              disabled={selectedCount === 0}
              onClick={() => setPropOpen(false)}
            >
              <Button.Icon icon={RefreshCw} />
              Update {selectedCount} usage{selectedCount > 1 ? 's' : ''}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default VariableScreen
