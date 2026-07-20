export type DrawerSetting =
  | { type: 'toggle'; title: string; desc: string; on: boolean }
  | { type: 'select'; title: string; desc?: string; options: string[]; value: string }

export type UsageItem = { name: string; target: string }

export type ManageConfig = {
  accountLabel: string
  account: string
  accountSub: string
  since: string
  /** Réglages globaux — uniquement pertinents pour les assistants IA (modèle, features). */
  settings?: DrawerSetting[]
  /** Canaux : liste des alertes qui routent vers cette intégration (le flow est par alerte). */
  usage?: {
    title: string
    items: UsageItem[]
  }
}

export type IntegrationCategory =
  | 'communication'
  | 'pm'
  | 'cicd'
  | 'device'
  | 'test'
  | 'ai'

export type Integration = {
  id: string
  name: string
  /** clé du logo dans `brands` */
  brand: string
  description: string
  connected: boolean
  /**
   * 'app' (défaut) : vraie intégration connectable (OAuth / API key).
   * 'docs' : pas d'app dispo pour l'instant → setup manuel via snippet + doc.
   */
  setup?: 'app' | 'docs'
  /** Snippet de configuration affiché en mode 'docs'. */
  setupSnippet?: string
  manage?: ManageConfig
}

export type Section = {
  title: string
  items: Integration[]
}

export const SECTIONS: Section[] = [
  {
    title: 'Communication',
    items: [
      {
        id: 'slack',
        name: 'Slack',
        brand: 'slack',
        description: 'Send incident alerts and monitoring digests to your Slack channels.',
        connected: false,
      },
      {
        id: 'teams',
        name: 'Microsoft Teams',
        brand: 'teams',
        description: 'Post alerts and collaborate on incidents directly inside Teams.',
        connected: false,
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp',
        brand: 'whatsapp',
        description:
          'Send incident alerts and monitoring notifications to your team on WhatsApp.',
        connected: false,
      },
    ],
  },
  {
    title: 'Project management',
    items: [
      {
        id: 'jira',
        name: 'Jira',
        brand: 'jira',
        description:
          'Create and sync issues between Kapptivate incidents and your Jira projects.',
        connected: true,
        manage: {
          accountLabel: 'Connected account',
          account: 'rocketcorp.atlassian.net',
          accountSub: 'Connected via OAuth',
          since: 'March 12, 2026',
          settings: [
            {
              type: 'select',
              title: 'Default project',
              options: ['Rocket Web (RKT)', 'Mobile App (MOB)', 'Infrastructure (INF)'],
              value: 'Rocket Web (RKT)',
            },
            {
              type: 'select',
              title: 'Issue type',
              options: ['Bug', 'Task', 'Incident'],
              value: 'Bug',
            },
            {
              type: 'select',
              title: 'Default priority',
              options: ['Highest', 'High', 'Medium', 'Low'],
              value: 'High',
            },
          ],
          usage: {
            title: 'Alerts using Jira',
            items: [
              { name: 'Checkout 5xx spike', target: 'Rocket Web (RKT) · Bug' },
              { name: 'Payment latency > 2s', target: 'Rocket Web (RKT) · Bug' },
              { name: 'Mobile crash rate', target: 'Mobile App (MOB) · Incident' },
              { name: 'Nightly E2E failure', target: 'Infrastructure (INF) · Task' },
            ],
          },
        },
      },
      {
        id: 'linear',
        name: 'Linear',
        brand: 'linear',
        description: 'Sync Kapptivate incidents with your Linear issues and project roadmap.',
        connected: false,
      },
    ],
  },
  {
    title: 'CI/CD',
    items: [
      {
        id: 'github',
        name: 'GitHub',
        brand: 'github',
        description:
          'Trigger Kapptivate tests from your GitHub Actions and report results on commits and PRs.',
        connected: false,
        setup: 'docs',
        setupSnippet: `# .github/workflows/kapptivate.yml
- name: Run Kapptivate tests
  uses: kapptivate/run-tests@v1
  with:
    api-key: \${{ secrets.KAPPTIVATE_API_KEY }}
    campaign: rocket-web-smoke`,
      },
      {
        id: 'gitlab',
        name: 'GitLab',
        brand: 'gitlab',
        description:
          'Run Kapptivate tests in your GitLab CI pipelines and surface results on merge requests.',
        connected: false,
        setup: 'docs',
        setupSnippet: `# .gitlab-ci.yml
kapptivate:
  image: kapptivate/cli:latest
  script:
    - kapptivate run --campaign rocket-web-smoke`,
      },
      {
        id: 'jenkins',
        name: 'Jenkins',
        brand: 'jenkins',
        description:
          'Run Kapptivate campaigns from your Jenkins pipelines and publish results.',
        connected: false,
        setup: 'docs',
        setupSnippet: `// Jenkinsfile
stage('Kapptivate') {
  steps {
    sh 'kapptivate run --campaign rocket-web-smoke'
  }
}`,
      },
      {
        id: 'azure-devops',
        name: 'Azure DevOps',
        brand: 'azuredevops',
        description:
          'Add Kapptivate tests to your Azure Pipelines and gate releases on the results.',
        connected: false,
        setup: 'docs',
        setupSnippet: `# azure-pipelines.yml
- task: Kapptivate@1
  inputs:
    apiKey: $(KAPPTIVATE_API_KEY)
    campaign: rocket-web-smoke`,
      },
    ],
  },
  {
    title: 'Device',
    items: [
      {
        id: 'browserstack',
        name: 'BrowserStack',
        brand: 'browserstack',
        description: 'Run your Kapptivate tests across real browsers and devices in the cloud.',
        connected: false,
      },
    ],
  },
  {
    title: 'Test management',
    items: [
      {
        id: 'xray',
        name: 'Xray',
        brand: 'xray',
        description: 'Link your Xray test cases to their implementation in Kapptivate.',
        connected: false,
      },
    ],
  },
  {
    title: 'AI assistants',
    items: [
      {
        id: 'claude',
        name: 'Claude',
        brand: 'claude',
        description: "Use Anthropic's Claude to summarize incidents and draft test scenarios.",
        connected: true,
        manage: {
          accountLabel: 'Connected account',
          account: 'maud.rochel@kapptivate.com',
          accountSub: 'Connected via API key',
          since: 'April 3, 2026',
          settings: [
            {
              type: 'select',
              title: 'Model',
              options: ['Claude Opus 4.8', 'Claude Sonnet 5', 'Claude Haiku 4.5'],
              value: 'Claude Sonnet 5',
            },
          ],
        },
      },
      {
        id: 'copilot',
        name: 'GitHub Copilot',
        brand: 'copilot',
        description: "Bring Copilot's code suggestions into your automated test authoring.",
        connected: false,
      },
      {
        id: 'mscopilot',
        name: 'Microsoft Copilot',
        brand: 'mscopilot',
        description:
          'Bring Microsoft Copilot into your workflow to draft test plans and summarize monitoring results.',
        connected: false,
      },
    ],
  },
]
