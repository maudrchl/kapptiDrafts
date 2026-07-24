import { useState } from 'react'
import { Braces, ListChecks } from 'lucide-react'
import CampaignScreen from './CampaignScreen'
import VariableScreen from './VariableScreen'
import styles from './styles.module.scss'

type ScreenKey = 'campaign' | 'variable'

const TABS: { key: ScreenKey; label: string; icon: typeof Braces }[] = [
  { key: 'campaign', label: 'From campaign', icon: ListChecks },
  { key: 'variable', label: 'From variable', icon: Braces },
]

/**
 * Deux entrées vers le même sujet "une variable a changé, on propage la value" :
 *  - From campaign : la variable a changé dans Configurations, on met à jour la campagne.
 *  - From variable : on édite la value dans Configurations, on la propage aux tests/monitors.
 * Le switch vit dans le chrome kapptiDrafts (à côté du nom du proto), pas dans l'UI produit.
 */
const CampaignVariablesProto = () => {
  const [screen, setScreen] = useState<ScreenKey>('campaign')

  return (
    <>
      <div className={styles.switch}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={screen === t.key ? styles.switchTabActive : styles.switchTab}
            onClick={() => setScreen(t.key)}
          >
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {screen === 'campaign' ? <CampaignScreen /> : <VariableScreen />}
    </>
  )
}

export default CampaignVariablesProto
