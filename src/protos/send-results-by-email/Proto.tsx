import { useMemo, useState } from 'react'
import {
  Title,
  Text,
  Button,
  ButtonDropdown,
  Modal,
  InputTag,
  StatusTag,
  useNotification,
  IconArrowLeft,
  IconDownload,
  IconMail,
} from '@kapptivate/ui-kit'
import { useReportScreen } from '../../context/ScreenContext'
import styles from './styles.module.scss'

/**
 * Proto: « Send results by email »
 *
 * Sur la page execution details, le bouton Export devient un ButtonDropdown
 * (secondary) : l'action principale exporte l'Excel comme aujourd'hui, et une
 * entrée du menu « Send results by email » ouvre une modal pour envoyer le même
 * rapport par mail à un ou plusieurs destinataires (composant InputTag).
 *
 * KTMAPP-2672
 */

// Mirroir du type interne de InputTag (non exporté par la lib).
type TagColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'blue'
type TagValue = { value: string } & (
  | { type: 'text' }
  | { type: 'tag'; color: TagColor }
)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const tag = (value: string): TagValue => ({ value, type: 'tag', color: 'primary' })

const Proto = () => {
  const { notification } = useNotification()
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  useReportScreen(open ? 'email-modal' : 'main')
  const [recipients, setRecipients] = useState<TagValue[]>([
    tag('alice@kapptivate.com'),
    tag('qa-team@kapptivate.com'),
  ])

  const committed = useMemo(
    () => recipients.filter((r) => r.type === 'tag'),
    [recipients],
  )
  const hasInvalid = useMemo(
    () => committed.some((r) => !EMAIL_RE.test(r.value)),
    [committed],
  )
  const canSend = committed.length > 0 && !hasInvalid

  const exportExcel = () =>
    notification.success('Execution details exported successfully')

  const openMail = () => setOpen(true)

  const send = () => {
    if (!canSend) return
    setSending(true)
    window.setTimeout(() => {
      setSending(false)
      setOpen(false)
      notification.success(
        `Report sent to ${committed.length} recipient${committed.length > 1 ? 's' : ''}.`,
      )
    }, 900)
  }

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* --- Contexte : haut de la page execution details --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Button color="invisible" size="s" icon={IconArrowLeft} />
        <Text size="sm" color="secondary">
          Executions
        </Text>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Title size="h3">Nightly regression · Run #4821</Title>
            <StatusTag variant="filled" color="success">
              Passed
            </StatusTag>
          </div>
          <div style={{ marginTop: 4 }}>
            <Text size="sm" color="secondary">
              Jul 10, 2026 · 02:00 · 4 min 12 s · 128 steps · 0 failures
            </Text>
          </div>
        </div>

        {/* --- Le déclencheur : ButtonDropdown (secondary) --- */}
        <ButtonDropdown
          color="secondary"
          icon={IconDownload}
          onClick={exportExcel}
          menu={{
            onClick: ({ key }: { key: string }) => {
              if (key === 'email') openMail()
            },
            items: [
              {
                key: 'email',
                label: 'Send results by email',
                icon: <IconMail size={14} />,
              },
            ],
          }}
        >
          Export
        </ButtonDropdown>
      </div>

      <div
        style={{
          marginTop: 32,
          padding: '2rem',
          border: '1px dashed var(--color-border, #e6e6ec)',
          borderRadius: 12,
        }}
      >
        <Text color="secondary">
          Le reste de la page execution details (récap, steps, logs…), hors
          scope de ce proto. Ouvre le menu <b>Export</b> ci-dessus →{' '}
          <b>Send results by email</b>.
        </Text>
      </div>

      {/* --- La modal --- */}
      <Modal
        mode="default"
        title="Send results by email"
        open={open}
        width={480}
        onCancel={() => setOpen(false)}
      >
        <Modal.Content>
          <div style={{ marginBottom: 16 }}>
            <Text size="base" color="primary">
              The full report for <b>Run #4821</b> will be sent as an
              attachment to each recipient.
            </Text>
          </div>

          <div className={styles.recipients}>
            <InputTag
              label="Recipients"
              placeholder="Add an email address…"
              value={recipients}
              onChange={setRecipients}
              invalid={hasInvalid}
              fullWidth
            />
          </div>

          <div style={{ marginTop: 7, minHeight: 18 }}>
            {hasInvalid ? (
              <Text size="s" color="error">
                Enter a valid email address.
              </Text>
            ) : (
              <Text size="s" color="secondary">
                Press Enter or comma to add each recipient.
              </Text>
            )}
          </div>
        </Modal.Content>

        <Modal.Footer>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button color="invisible" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              icon={IconMail}
              isLoading={sending}
              disabled={!canSend}
              onClick={send}
            >
              Send report
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Proto
