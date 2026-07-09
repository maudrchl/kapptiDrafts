import { Fragment, type ReactNode } from 'react'
import { Title, Text, Banner } from '@kapptivate/ui-kit'
import { Page, Demo } from '../primitives'

const Do = ({ children }: { children: ReactNode }) => (
  <div style={{ background: 'var(--color-success-light)', border: '1px solid var(--color-success)', borderLeftWidth: 3, borderRadius: 6, padding: '10px 14px' }}>
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: 'var(--color-success)', marginBottom: 6 }}>Do</div>
    {children}
  </div>
)

const Dont = ({ children }: { children: ReactNode }) => (
  <div style={{ background: 'var(--color-error-light)', border: '1px solid var(--color-error)', borderLeftWidth: 3, borderRadius: 6, padding: '10px 14px' }}>
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: 'var(--color-error)', marginBottom: 6 }}>Don't</div>
    {children}
  </div>
)

const DoDont = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '12px 0' }}>
    {children}
  </div>
)

const Mono = ({ children }: { children: ReactNode }) => (
  <Text mono size="sm" style={{ display: 'block', lineHeight: 1.7 }}>{children}</Text>
)

const Formula = ({ children }: { children: ReactNode }) => (
  <div style={{ background: 'var(--color-surface-grey)', border: '1px solid var(--color-border-grey)', borderRadius: 6, padding: '12px 16px', margin: '12px 0' }}>
    {children}
  </div>
)

const RefTable = ({ rows }: { rows: [string, string][] }) => (
  <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'max-content 1fr', columnGap: 24 }}>
    {rows.map(([label, desc], i, arr) => {
      const cell = {
        padding: '10px 0',
        borderBottom: i < arr.length - 1 ? '1px solid var(--color-border-grey)' : undefined,
      }
      return (
        <Fragment key={label}>
          <div style={cell}><Text weight="semibold">{label}</Text></div>
          <div style={cell}><Text color="secondary" size="sm">{desc}</Text></div>
        </Fragment>
      )
    })}
  </div>
)

export const ToneOfVoice = () => (
  <Page
    title="Tone of voice & microcopy"
    description="Rules for writing UI text across the Kapptivate product. Every button, empty state, error message, and tooltip should follow these patterns."
  >
    {/* Voice Principles */}
    <section className="dsSection">
      <div className="dsSectionHead">
        <Title size="h5">Voice principles</Title>
        <div style={{ marginTop: 6, maxWidth: 640 }}>
          <Text color="secondary">
            Kapptivate speaks to QA engineers, DevOps teams, and product managers. The voice is a knowledgeable colleague — direct, helpful, and confident without being cold.
          </Text>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {([
          ['Clear over clever', 'Say exactly what happens. Technical users scan — reward them with precision.'],
          ['Friendly, not casual', 'Use contractions (don\'t, can\'t). Second person (your tests). No emoji in UI text.'],
          ['Guide, don\'t gatekeep', 'Empty states and errors are opportunities. Tell the user what to do next.'],
          ['English is the UI language', 'All system-facing text is English. User-generated content can be any language.'],
        ] as const).map(([title, desc]) => (
          <div key={title} style={{ background: 'var(--color-surface-grey)', borderRadius: 10, padding: '16px 18px' }}>
            <Text weight="semibold">{title}</Text>
            <Text color="secondary" size="sm" style={{ marginTop: 4 }}>{desc}</Text>
          </div>
        ))}
      </div>
    </section>

    {/* Capitalization */}
    <Demo title="Capitalization" column>
      <DoDont>
        <Do>
          <Mono>Monitors list</Mono>
          <Mono>Create browser preset</Mono>
          <Mono>Last update</Mono>
        </Do>
        <Dont>
          <Mono>Monitors List</Mono>
          <Mono>Create Browser Preset</Mono>
          <Mono>Last Update</Mono>
        </Dont>
      </DoDont>
      <Text color="secondary" size="sm">
        Exceptions: acronyms stay uppercase (API Keys, CI/CD, DNS, SSL). Product name is always "Kapptivate" with capital K.
      </Text>
      <div className="dsBannerBottom">
        <Banner variant="primary" description="Sentence case everywhere. Capitalize only the first word and proper nouns. Applies to buttons, page titles, table headers, labels, banners, tooltips." />
      </div>
    </Demo>

    {/* Buttons */}
    <Demo title="Buttons & CTAs" column>
      <Formula>
        <Text mono size="sm">"Verb"</Text>
        <Text color="secondary" size="sm"> or </Text>
        <Text mono size="sm">"Verb entity"</Text>
        <Text color="secondary" size="sm"> — sentence case, no trailing punctuation.</Text>
      </Formula>
      <DoDont>
        <Do>
          <Mono>Create monitor</Mono>
          <Mono>Save &amp; run</Mono>
          <Mono>Delete (3)</Mono>
          <Mono>Move to...</Mono>
        </Do>
        <Dont>
          <Mono>Create Monitor</Mono>
          <Mono>Save &amp; Run</Mono>
          <Mono>Delete 3 items</Mono>
          <Mono>Move to</Mono>
        </Dont>
      </DoDont>

      <div style={{ marginTop: 16 }}><Title size="h6">Standard verbs</Title></div>
      <RefTable
        rows={[
          ['Create', 'New entity from scratch'],
          ['Delete', 'Permanent removal'],
          ['Remove', 'Detach from a list — entity still exists'],
          ['Archive', 'Soft-delete, can be restored'],
          ['Pause / Unpause', 'Toggle monitor activity (not Stop/Start)'],
          ['Revoke', 'Invalidate credentials (API keys, tokens)'],
          ['Publish', 'Make reusable component changes live'],
        ]}
      />
    </Demo>

    {/* Empty States */}
    <Demo title="Empty states" column>
      <Formula>
        <Text weight="semibold" size="sm">Title: </Text>
        <Text mono size="sm">"Create your first [entity] to [benefit]"</Text>
        <br />
        <Text weight="semibold" size="sm">Description: </Text>
        <Text color="secondary" size="sm">1–2 sentences, benefit-oriented, second person, ends with period.</Text>
        <br />
        <Text weight="semibold" size="sm">CTA: </Text>
        <Text mono size="sm">"Create [entity]"</Text>
      </Formula>
      <DoDont>
        <Do>
          <Text weight="semibold" size="sm">Create your first monitor to automate your tests</Text>
          <Text color="secondary" size="sm">Stay aware of your tests' status and get notified when something goes wrong.</Text>
          <Text mono size="sm" style={{ marginTop: 4 }}>[Create monitor]</Text>
        </Do>
        <Dont>
          <Text weight="semibold" size="sm">No monitors found</Text>
          <Text color="secondary" size="sm">There are currently no monitors in this workspace.</Text>
          <Text mono size="sm" style={{ marginTop: 4 }}>[+ Add]</Text>
        </Dont>
      </DoDont>
      <Text color="secondary" size="sm">
        For "no issues" states, celebrate: "Well done! No incidents, you're doing a great job."
      </Text>
    </Demo>

    {/* Notifications */}
    <Demo title="Notifications (toasts)" column>
      <Title size="h6">Success</Title>
      <Formula>
        <Text mono size="sm">"[Entity] [past-tense verb] successfully"</Text>
        <br />
        <Text color="secondary" size="sm">Monitor created successfully &middot; Variable "api_key" updated successfully</Text>
      </Formula>
      <div style={{ marginTop: 12 }}><Title size="h6">Error</Title></div>
      <Formula>
        <Text mono size="sm">"We couldn't [verb] the [entity]. Try again."</Text>
        <br />
        <Text color="secondary" size="sm">We couldn't create the monitor. Try again.</Text>
      </Formula>
      <DoDont>
        <Do>
          <Mono>Monitor created successfully</Mono>
          <Mono>We couldn't delete the variable. Try again.</Mono>
        </Do>
        <Dont>
          <Text size="sm" color="secondary" style={{ marginBottom: 4 }}>Deprecated patterns:</Text>
          <Mono>The monitor has been created.</Mono>
          <Mono>An error occurred while deleting the variable.</Mono>
          <Mono>Error while deleting variable</Mono>
        </Dont>
      </DoDont>
    </Demo>

    {/* Confirmation Dialogs */}
    <Demo title="Confirmation dialogs" column>
      <Formula>
        <Text weight="semibold" size="sm">Title: </Text>
        <Text mono size="sm">"Verb entity?"</Text>
        <br />
        <Text weight="semibold" size="sm">Body: </Text>
        <Text mono size="sm">"If you [verb] this [entity], [consequence]."</Text>
        <br />
        <Text weight="semibold" size="sm">Confirm: </Text>
        <Text mono size="sm">"Verb entity"</Text>
        <Text color="secondary" size="sm"> &nbsp;|&nbsp; </Text>
        <Text weight="semibold" size="sm">Cancel: </Text>
        <Text mono size="sm">"Cancel"</Text>
      </Formula>
      <DoDont>
        <Do>
          <Text weight="semibold" size="sm">Delete monitor?</Text>
          <Text color="secondary" size="sm">If you delete this monitor, it will be stopped and you won't be able to restore it.</Text>
          <Text mono size="sm" style={{ marginTop: 4 }}>[Cancel] [Delete monitor]</Text>
        </Do>
        <Dont>
          <Text weight="semibold" size="sm">Delete monitor</Text>
          <Text color="secondary" size="sm">Are you sure you want to delete this monitor?</Text>
          <Text mono size="sm" style={{ marginTop: 4 }}>[No] [Yes]</Text>
        </Dont>
      </DoDont>
      <Text color="secondary" size="sm">
        Irreversibility: always use exactly "This action cannot be undone." High-risk: require typing entity name.
      </Text>
    </Demo>

    {/* Forms */}
    <Demo title="Form copy" column>
      <Title size="h6">Labels</Title>
      <Text color="secondary" size="sm">Sentence case, noun phrase, no colon. Optional fields: append "(optional)" lowercase.</Text>
      <DoDont>
        <Do>
          <Mono>Monitor name</Mono>
          <Mono>Description (optional)</Mono>
        </Do>
        <Dont>
          <Mono>Monitor Name:</Mono>
          <Mono>Description (Optional)</Mono>
        </Dont>
      </DoDont>

      <div style={{ marginTop: 12 }}><Title size="h6">Placeholders</Title></div>
      <Text color="secondary" size="sm">Free text: example values ("My website monitor", "e.g. user_email"). Search: "Search...". Selects: "Select a [entity]...".</Text>

      <div style={{ marginTop: 12 }}><Title size="h6">Validation</Title></div>
      <Text color="secondary" size="sm">Imperative — tell the user what to do, not what's wrong.</Text>
      <DoDont>
        <Do><Mono>Enter a name for your monitor</Mono></Do>
        <Dont><Mono>Monitor name is required.</Mono></Dont>
      </DoDont>
    </Demo>

    {/* Banners */}
    <Demo title="Banners & alerts" column>
      <Text color="secondary" size="sm">
        1–2 sentences max. Declarative or instructional. Second person. Always ends with a period.
        Warning banners state consequence; info banners explain context; archived states: state + next step.
      </Text>
      <DoDont>
        <Do>
          <Mono>You're editing a reusable component. Publish your changes to apply them to all tests using it.</Mono>
        </Do>
        <Dont>
          <Mono>Warning! You are currently in edit mode for a reusable component and modifications need to be published.</Mono>
        </Dont>
      </DoDont>
    </Demo>

    {/* Tooltips */}
    <Demo title="Tooltips" column>
      <Text color="secondary" size="sm">
        1 sentence max, ends with period. Exception: label tooltips ("Pause monitors") skip period. Explain why or what happens — don't just relabel.
      </Text>
      <DoDont>
        <Do>
          <Mono>Set a waiting time between each step execution.</Mono>
          <Mono>This variable can't be deleted because it's used by 3 monitors.</Mono>
        </Do>
        <Dont>
          <Mono>Step delay</Mono>
          <Mono>Cannot delete</Mono>
        </Dont>
      </DoDont>
    </Demo>

    {/* Page titles & Table headers */}
    <Demo title="Page titles & table headers" column>
      <Text color="secondary" size="sm">
        Sentence case. Noun or noun phrase. Count suffix when relevant: "Dashboards (12)". No trailing punctuation.
      </Text>
      <DoDont>
        <Do>
          <Mono>Monitors list</Mono>
          <Mono>Browser presets</Mono>
          <Mono>Dashboards (12)</Mono>
          <Mono>Last update</Mono>
        </Do>
        <Dont>
          <Mono>Monitors List</Mono>
          <Mono>Browser Presets</Mono>
          <Mono>Dashboards: 12</Mono>
          <Mono>Last Update</Mono>
        </Dont>
      </DoDont>
    </Demo>

    {/* French Translation */}
    <Demo title="French translation rules" column>
      <div style={{ marginTop: 0 }}><Title size="h6">Formality</Title></div>
      <Text color="secondary" size="sm">
        Always use <strong>vous</strong> (formal). Never tutoyer. "Voulez-vous quitter la page ?", "Vos tests", "Votre monitor".
      </Text>

      <div style={{ marginTop: 12 }}><Title size="h6">Buttons: infinitive verb</Title></div>
      <Text color="secondary" size="sm">
        English uses bare verbs ("Save", "Delete"). French uses the <strong>infinitive</strong>, never imperative.
      </Text>
      <DoDont>
        <Do>
          <Mono>Enregistrer</Mono>
          <Mono>Supprimer</Mono>
          <Mono>Créer un monitor</Mono>
          <Mono>Modifier le test</Mono>
        </Do>
        <Dont>
          <Mono>Enregistrez</Mono>
          <Mono>Supprimez</Mono>
          <Mono>Créer Monitor</Mono>
          <Mono>Modifier Test</Mono>
        </Dont>
      </DoDont>

      <div style={{ marginTop: 12 }}><Title size="h6">Articles</Title></div>
      <Text color="secondary" size="sm">
        French requires articles. Delete/Edit/Move use <strong>le/la/l'</strong> (definite). Create uses <strong>un/une</strong> (indefinite).
      </Text>
      <DoDont>
        <Do>
          <Mono>Supprimer le test</Mono>
          <Mono>Supprimer la variable</Mono>
          <Mono>Créer un monitor</Mono>
          <Mono>Créer une collection</Mono>
        </Do>
        <Dont>
          <Mono>Supprimer test</Mono>
          <Mono>Supprimer variable</Mono>
          <Mono>Créer monitor</Mono>
          <Mono>Créer collection</Mono>
        </Dont>
      </DoDont>

      <div style={{ marginTop: 12 }}><Title size="h6">Punctuation: space before ? ! : ;</Title></div>
      <Text color="secondary" size="sm">
        French typography requires a space before <code>?</code> <code>!</code> <code>:</code> <code>;</code>. Use regular space (not NNBSP).
      </Text>
      <DoDont>
        <Do>
          <Mono>Supprimer le test ?</Mono>
          <Mono>Bravo ! Aucun incident.</Mono>
          <Mono>Conseil de sécurité :</Mono>
        </Do>
        <Dont>
          <Mono>Supprimer le test?</Mono>
          <Mono>Bravo! Aucun incident.</Mono>
          <Mono>Conseil de sécurité:</Mono>
        </Dont>
      </DoDont>

      <div style={{ marginTop: 12 }}><Title size="h6">Empty states: imperative (vous)</Title></div>
      <Text color="secondary" size="sm">
        Empty state titles are the one place that uses <strong>imperative</strong> (not infinitive) — because they're calls to action in a sentence, not button labels.
      </Text>
      <DoDont>
        <Do>
          <Mono>Créez votre premier monitor pour automatiser vos tests</Mono>
          <Mono>Bravo ! Aucun incident, vous faites du bon travail.</Mono>
        </Do>
        <Dont>
          <Mono>Créer votre premier monitor</Mono>
          <Mono>Aucun incident trouvé</Mono>
        </Dont>
      </DoDont>

      <div style={{ marginTop: 12 }}><Title size="h6">Errors &amp; confirmations</Title></div>
      <Text color="secondary" size="sm">
        Errors: <code>"Nous n'avons pas pu [verbe] [entity]."</code> (never "On"). Confirmations: title = <code>"[Infinitif] [le/la] [entity] ?"</code>, body = <code>"Si vous [verbe], [conséquence]."</code>
      </Text>

      <div style={{ marginTop: 12 }}><Title size="h6">Domain loanwords</Title></div>
      <Text color="secondary" size="sm">
        These terms stay in English and take <strong>masculine</strong> gender: monitor, dashboard, device, agent, run, tag. Native French terms follow their actual gender: la variable, l'exécution, la collection, la campagne.
      </Text>

      <div style={{ marginTop: 12 }}><Title size="h6">Gender reference</Title></div>
      <RefTable
        rows={[
          ['Masculin', 'test, monitor, dashboard, agent, produit, rapport, composant, groupe, lien'],
          ['Féminin', 'variable, exécution, collection, campagne, version, alerte, exclusion, erreur'],
        ]}
      />
      <div className="dsBannerBottom">
        <Banner variant="primary" description="The product is bilingual EN/FR. These rules ensure the French UI stays consistent with the English voice while respecting French typographic conventions." />
      </div>
    </Demo>
  </Page>
)
