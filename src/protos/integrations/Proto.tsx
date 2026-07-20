import { useEffect, useMemo, useState } from 'react'
import { EmptyState, IconSearchX, SearchInput, Title, useNotification } from '@kapptivate/ui-kit'
import { useReportScreen, useScreenNavigation } from '../../context/ScreenContext'
import styles from './integrations.module.scss'
import SettingsSidebar from './SettingsSidebar'
import IntegrationCard from './IntegrationCard'
import ManageIntegrationDrawer from './ManageIntegrationDrawer'
import {
  SECTIONS,
  type Integration,
  type IntegrationCategory,
} from './constants'

const initialConnected = () =>
  new Set(
    SECTIONS.flatMap((s) => s.items.filter((i) => i.connected).map((i) => i.id)),
  )

const CATEGORY: Record<string, IntegrationCategory> = {
  Communication: 'communication',
  'Project management': 'pm',
  'CI/CD': 'cicd',
  Device: 'device',
  'Test management': 'test',
  'AI assistants': 'ai',
}

const IntegrationsPage = () => {
  const { notification } = useNotification()
  const [query, setQuery] = useState('')
  const [connectedIds, setConnectedIds] = useState<Set<string>>(initialConnected)
  const [active, setActive] = useState<Integration | null>(null)
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory>('communication')
  const [mode, setMode] = useState<'manage' | 'connect' | 'docs'>('manage')
  const [drawerOpen, setDrawerOpen] = useState(false)

  useReportScreen(drawerOpen && active ? `${mode}:${active.id}` : 'main')

  // Clic sur un commentaire de l'historique → rétablit la vue ciblée (drawer
  // manage/connect d'une intégration, ou retour au listing) pour que le pin
  // réapparaisse. Cf. ScreenContext / même pattern que le proto observability.
  const { pendingScreen, clearPendingScreen } = useScreenNavigation()
  useEffect(() => {
    if (!pendingScreen) return
    const p = pendingScreen
    if (p === 'main') {
      setDrawerOpen(false)
    } else {
      const sep = p.indexOf(':')
      const m = p.slice(0, sep)
      const id = p.slice(sep + 1)
      for (const section of SECTIONS) {
        const item = section.items.find((i) => i.id === id)
        if (item) {
          setActive(item)
          setActiveCategory(CATEGORY[section.title] ?? 'communication')
          if (m === 'manage' || m === 'connect' || m === 'docs') setMode(m)
          setDrawerOpen(true)
          break
        }
      }
    }
    clearPendingScreen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingScreen, clearPendingScreen])

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SECTIONS
    return SECTIONS.map((s) => ({
      ...s,
      items: s.items.filter((i) => i.name.toLowerCase().includes(q)),
    })).filter((s) => s.items.length > 0)
  }, [query])

  const openCard = (integration: Integration, category: IntegrationCategory) => {
    setActive(integration)
    setActiveCategory(category)
    setMode(
      integration.setup === 'docs'
        ? 'docs'
        : connectedIds.has(integration.id)
          ? 'manage'
          : 'connect',
    )
    setDrawerOpen(true)
  }

  const handleConnect = (integration: Integration) => {
    setConnectedIds((prev) => new Set(prev).add(integration.id))
    setDrawerOpen(false)
    notification.success(`${integration.name} connected`)
  }

  const handleTestAlert = (integration: Integration, target?: string) => {
    notification.success(
      target
        ? `Test alert sent to ${target} on ${integration.name}`
        : `Test alert sent to ${integration.name}`,
    )
  }

  const handleDisconnect = (integration: Integration) => {
    setConnectedIds((prev) => {
      const next = new Set(prev)
      next.delete(integration.id)
      return next
    })
    setDrawerOpen(false)
    notification.success(`${integration.name} disconnected`)
  }

  return (
    <div style={{ flex: '1 1 auto', minWidth: 0, overflow: 'hidden' }}>
      {/* Topbar */}
      <div className={styles.topbar}>
        <img
          className={styles.brandLogo}
          alt="kapptivate"
          src="data:image/svg+xml,%3csvg%20width='178'%20height='28'%20viewBox='0%200%20178%2028'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='178'%20height='28'%20fill=''/%3e%3cpath%20d='M46.6496%2022.9253L40.2032%2015.237L45.816%208.59585H40.62L36.0352%2014.3827L33.979%2017.0282H33.8679L33.9513%2014.3276V5.59691C33.9513%204.36156%2032.9498%203.36011%2031.7145%203.36011C30.4791%203.36011%2029.4777%204.36156%2029.4777%205.5969V22.9253H33.7012L37.5913%2018.3233L41.398%2022.9253H46.6496Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M53.9591%208.1825C49.5689%208.1825%2046.7347%209.31233%2046.8736%2013.0325H50.8471C51.0416%2011.8751%2051.8751%2011.4893%2053.7646%2011.4893C55.8208%2011.4893%2056.6822%2011.9578%2056.6822%2013.3356V14.4378H51.6529C47.8739%2014.4378%2046.1234%2015.8708%2046.1234%2018.7642C46.1234%2021.823%2048.0684%2023.3386%2051.2083%2023.3386C53.5979%2023.3386%2056.2654%2022.4568%2057.488%2020.4176L56.9878%2021.4372L57.3768%2022.9253H61.1558V12.8671C61.1558%209.78079%2058.9606%208.1825%2053.9591%208.1825ZM52.8199%2020.0043C51.2638%2020.0043%2050.6803%2019.4256%2050.6803%2018.5438C50.6803%2017.6344%2051.2638%2017.1384%2052.3753%2017.1384H56.6822V18.8193C55.7374%2019.5909%2054.4315%2020.0043%2053.0144%2020.0043H52.8199Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M72.3795%208.21006C70.1566%208.21006%2068.2949%209.09187%2066.8222%2011.5995L67.628%2010.0839L67.5447%208.59585H63.1544V27.7201H67.628V21.1616C68.795%2022.7324%2070.49%2023.3386%2072.3795%2023.3386C76.7141%2023.3386%2079.4928%2019.9767%2079.4928%2015.7606C79.4928%2011.572%2076.7141%208.21006%2072.3795%208.21006ZM71.3236%2019.4531C69.0173%2019.4531%2067.5724%2017.91%2067.5724%2015.7606C67.5724%2013.6111%2069.0173%2012.068%2071.3236%2012.068C73.6298%2012.068%2075.047%2013.6111%2075.047%2015.7606C75.047%2017.91%2073.6298%2019.4531%2071.3236%2019.4531Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M89.9912%208.21006C87.7683%208.21006%2085.9066%209.09187%2084.4339%2011.5995L85.2397%2010.0839L85.1564%208.59585H80.7662V27.7201H85.2397V21.1616C86.4068%2022.7324%2088.1017%2023.3386%2089.9912%2023.3386C94.3259%2023.3386%2097.1045%2019.9767%2097.1045%2015.7606C97.1045%2011.572%2094.3259%208.21006%2089.9912%208.21006ZM88.9353%2019.4531C86.6291%2019.4531%2085.1842%2017.91%2085.1842%2015.7606C85.1842%2013.6111%2086.6291%2012.068%2088.9353%2012.068C91.2416%2012.068%2092.6587%2013.6111%2092.6587%2015.7606C92.6587%2017.91%2091.2416%2019.4531%2088.9353%2019.4531Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M109.055%2012.3711V8.59585H105.026V3.63567H100.552V8.59585H97.3569V12.3711H100.552V17.8549C100.552%2021.1065%20102.108%2023.063%20106.276%2023.063H109.055V19.0949H107.11C105.721%2019.0949%20105.026%2018.5989%20105.026%2017.1384V12.3711H109.055Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M110.536%2022.9253H115.01V8.59585C113.603%209.30728%20111.942%209.30728%20110.536%208.59585V22.9253Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M121.912%2022.9253H126.691L132.86%208.59585H128.22L124.385%2017.9651H124.218L120.412%208.59585H115.771L121.912%2022.9253Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M139.875%208.1825C135.485%208.1825%20132.651%209.31233%20132.79%2013.0325H136.763C136.958%2011.8751%20137.791%2011.4893%20139.681%2011.4893C141.737%2011.4893%20142.598%2011.9578%20142.598%2013.3356V14.4378H137.569C133.79%2014.4378%20132.039%2015.8708%20132.039%2018.7642C132.039%2021.823%20133.984%2023.3386%20137.124%2023.3386C139.514%2023.3386%20142.181%2022.4568%20143.404%2020.4176L142.904%2021.4372L143.293%2022.9253H147.072V12.8671C147.072%209.78079%20144.877%208.1825%20139.875%208.1825ZM138.736%2020.0043C137.18%2020.0043%20136.596%2019.4256%20136.596%2018.5438C136.596%2017.6344%20137.18%2017.1384%20138.291%2017.1384H142.598V18.8193C141.653%2019.5909%20140.348%2020.0043%20138.93%2020.0043H138.736Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M159.449%2012.3711V8.59585H155.42V3.63567H150.946V8.59585H147.751V12.3711H150.946V17.8549C150.946%2021.1065%20152.503%2023.063%20156.67%2023.063H159.449V19.0949H157.504C156.115%2019.0949%20155.42%2018.5989%20155.42%2017.1384V12.3711H159.449Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M164.573%2017.0833H175.855C176.299%2011.4893%20173.187%208.1825%20168.075%208.1825C162.934%208.1825%20160.072%2011.4893%20160.072%2015.7606C160.072%2020.0318%20163.156%2023.3386%20168.325%2023.3386C171.253%2023.3386%20173.608%2022.2729%20174.993%2020.8479C175.985%2019.8266%20174.987%2018.4887%20173.563%2018.4887C172.645%2018.4887%20171.783%2019.0976%20170.949%2019.4815C170.264%2019.7967%20169.383%2019.9492%20168.575%2019.9492C166.352%2019.9492%20164.935%2018.8744%20164.573%2017.0833ZM168.075%2011.4342C169.936%2011.4342%20171.048%2012.2609%20171.464%2014.4103H164.546C164.879%2012.4538%20166.018%2011.4342%20168.075%2011.4342Z'%20fill='%23FFF9D4'/%3e%3cpath%20d='M3.23836%2015.5791C3.77117%2017.0253%204.65214%2017.5873%205.93234%2017.9525L6.18218%2017.5697C6.45474%2017.1389%206.55844%2016.5424%206.58749%2015.9993C6.59931%2015.7022%206.64682%2015.3922%206.99197%2015.2681C7.33711%2015.144%207.6791%2015.3405%207.79606%2015.658C7.83505%2015.7638%207.88055%2015.9605%207.86655%2016.1785C7.83964%2016.6542%207.70142%2017.596%207.23525%2018.2696L6.49976%2019.3462C5.71019%2020.4955%205.36527%2021.3519%205.71181%2022.2924C6.34425%2024.009%207.94592%2024.698%209.386%2024.1802C9.99297%2023.9619%2010.8087%2023.3225%2011.2845%2022.4191L12.5304%2020.0938C12.8278%2019.5475%2012.9498%2018.5982%2012.9355%2018.0841C12.9268%2017.7676%2013.036%2017.5153%2013.3454%2017.4041C13.6787%2017.2843%2014.0401%2017.4605%2014.1658%2017.8015C14.2134%2017.9308%2014.2102%2018.1051%2014.207%2018.2793C14.2039%2018.6%2014.2258%2019.5374%2013.6072%2020.7851C15.8549%2021.6545%2016.5918%2021.6426%2017.532%2021.3045C18.8769%2020.8209%2019.7886%2019.1617%2019.2211%2017.6215C18.9439%2016.8691%2018.4547%2016.4192%2017.5175%2015.9972L15.919%2015.2804C15.2697%2014.9813%2014.6333%2014.571%2014.0359%2014.1201C13.8887%2014.0133%2013.7902%2013.9288%2013.7209%2013.7407C13.6039%2013.4233%2013.7824%2013.0662%2014.0918%2012.955C14.3179%2012.8736%2014.5235%2012.9195%2014.7075%2013.0531C15.4933%2013.6494%2016.2758%2014.1269%2016.8677%2014.3801L18.7482%2013.704C20.6286%2013.0279%2021.4916%2011.3462%2020.8202%209.52384C20.1444%207.68974%2018.3891%206.94947%2016.5086%207.62559L5.40457%2011.6181C3.52413%2012.2942%202.64924%2013.9802%203.23836%2015.5791Z'%20fill='%23FFF9D4'/%3e%3cellipse%20cx='8.35869'%20cy='5.28086'%20rx='3.43657'%20ry='3.39487'%20fill='%23FFF9D4'/%3e%3cellipse%20cx='112.738'%20cy='4.55001'%20rx='3.33041'%20ry='3.29'%20fill='%23ED7846'/%3e%3c/svg%3e"
        />
      </div>

      <div className={styles.body}>
        <SettingsSidebar />

        <div className={styles.content}>
          {/* Header */}
          <div className={styles.contentHead}>
            <Title size="h2">Integrations</Title>
          </div>

          <div className={styles.contentBody}>
            <div className={styles.search}>
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search integrations…"
                width="360px"
              />
            </div>

            {sections.map((section) => (
              <div key={section.title} className={styles.secGroup}>
                <div className={styles.secTitle}>
                  {section.title}
                  <span className={styles.secCount}>{section.items.length}</span>
                </div>
                <div className={styles.grid}>
                  {section.items.map((item) => (
                    <IntegrationCard
                      key={item.id}
                      integration={item}
                      connected={connectedIds.has(item.id)}
                      onOpen={(i) => openCard(i, CATEGORY[section.title] ?? 'communication')}
                    />
                  ))}
                </div>
              </div>
            ))}

            {sections.length === 0 && (
              <div className={styles.emptyWrap}>
                <EmptyState
                  icon={<IconSearchX color="var(--color-text-secondary)" />}
                  text="No integration found"
                  description={`No integration matches “${query}”.`}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <ManageIntegrationDrawer
        integration={active}
        category={activeCategory}
        mode={mode}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onTestAlert={handleTestAlert}
      />
    </div>
  )
}

export default IntegrationsPage
