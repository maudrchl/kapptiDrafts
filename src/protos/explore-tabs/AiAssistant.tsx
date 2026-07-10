import { useState, useRef, useEffect, Fragment } from 'react'
import { Drawer, Button, Input, StatusTag } from '@kapptivate/ui-kit'
import { Sparkles, Send, Plus, Check } from 'lucide-react'
import LineChart from './LineChart'
import { toast } from './toast'
import { interpretPrompt, makePanel } from './perses'
import type { AiProposal, Panel } from './perses'
import { dashboardStore } from './dashboardStore'
import styles from './ai.module.scss'

type Msg =
  | { role: 'user'; text: string }
  | { role: 'ai'; text: string; proposal?: AiProposal; added?: boolean }

const SUGGESTIONS = [
  'p95 duration by service',
  'Error rate last 1h',
  'Draft a dashboard for rocket-app',
]

/* Rend le **gras** minimal des réponses simulées. */
const RichText = ({ text }: { text: string }) => (
  <>
    {text.split('**').map((chunk, i) =>
      i % 2 === 1 ? <strong key={i}>{chunk}</strong> : <Fragment key={i}>{chunk}</Fragment>,
    )}
  </>
)

const previewPanel = (spec: Parameters<typeof makePanel>[0]): Panel => ({ id: 'preview', ...makePanel(spec) })

const AiAssistant = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'ai',
      text:
        "Hi — I'm Kappti AI. Describe the data you want and I'll write the ClickHouse query and build the panel for you. No SQL required.",
    },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  const submit = (raw: string) => {
    const text = raw.trim()
    if (!text || thinking) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text }])
    setThinking(true)
    // petite latence pour simuler la génération
    window.setTimeout(() => {
      const proposal = interpretPrompt(text)
      setMessages((m) => [...m, { role: 'ai', text: proposal.reply, proposal }])
      setThinking(false)
    }, 650)
  }

  const addProposal = (idx: number, proposal: AiProposal) => {
    if (proposal.panels.length > 1) {
      dashboardStore.addGroupWithPanels('AI · drafted', proposal.panels)
      toast.success(`Added ${proposal.panels.length} panels to the dashboard`)
    } else {
      dashboardStore.addPanel(proposal.panels[0])
      toast.success('Panel added to the dashboard')
    }
    setMessages((m) => m.map((msg, i) => (i === idx ? { ...msg, added: true } as Msg : msg)))
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={460}
      title={
        <span className={styles.title}>
          <span className={styles.titleIcon}><Sparkles size={15} /></span>
          Kappti AI
          <StatusTag variant="ghost" color="warning">Beta</StatusTag>
        </span>
      }
    >
      <div className={styles.assistant}>
        <div className={styles.thread} ref={bodyRef}>
          {messages.map((msg, i) =>
            msg.role === 'user' ? (
              <div key={i} className={styles.userRow}>
                <div className={styles.userBubble}>{msg.text}</div>
              </div>
            ) : (
              <div key={i} className={styles.aiRow}>
                <span className={styles.aiAvatar}><Sparkles size={13} /></span>
                <div className={styles.aiCol}>
                  <div className={styles.aiBubble}><RichText text={msg.text} /></div>
                  {msg.proposal && (
                    <div className={styles.proposal}>
                      {msg.proposal.panels.map((spec, k) => {
                        const p = previewPanel(spec)
                        return (
                          <div key={k} className={styles.proposalCard}>
                            <div className={styles.proposalHead}>
                              <span className={styles.proposalName}>{p.name}</span>
                              <span className={styles.proposalUnit}>{p.unit}</span>
                            </div>
                            <LineChart panel={{ ...p, span: 1 }} height={116} />
                            <code className={styles.proposalSql}>{p.sql.split('\n')[0]}…</code>
                          </div>
                        )
                      })}
                      <Button
                        color={msg.added ? 'secondary' : 'primary'}
                        icon={msg.added ? Check : Plus}
                        disabled={msg.added}
                        onClick={() => addProposal(i, msg.proposal!)}
                      >
                        {msg.added
                          ? 'Added'
                          : msg.proposal.panels.length > 1
                            ? `Add board (${msg.proposal.panels.length} panels)`
                            : 'Add to dashboard'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ),
          )}
          {thinking && (
            <div className={styles.aiRow}>
              <span className={styles.aiAvatar}><Sparkles size={13} /></span>
              <div className={styles.typing}><span /><span /><span /></div>
            </div>
          )}
        </div>

        <div className={styles.composer}>
          <div className={styles.chips}>
            {SUGGESTIONS.map((s) => (
              <button key={s} className={styles.chip} onClick={() => submit(s)} disabled={thinking}>{s}</button>
            ))}
          </div>
          <form className={styles.inputRow} onSubmit={(e) => { e.preventDefault(); submit(input) }}>
            <Input
              value={input}
              size="m"
              fullWidth
              placeholder="Describe a panel… e.g. error rate by service"
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit" color="primary" icon={Send} disabled={!input.trim() || thinking} />
          </form>
        </div>
      </div>
    </Drawer>
  )
}

export default AiAssistant
