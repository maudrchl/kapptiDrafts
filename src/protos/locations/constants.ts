/* ============================================================
 *  Locations proto — données & helpers
 *  Migré depuis le mock HTML « Public & private locations V2 »
 * ============================================================ */

export type LocationKind = 'public' | 'private'
export type PrivateCat = 'desktop' | 'cellular' | 'smartphone' | 'web' | 'passive'
export type Runner = 'cloud' | 'desktop' | 'appliance'
export type Scope = 'managed' | 'shared' | 'personal'
export type Status = 'online' | 'offline'

export type Device = { n: string; s: string; u: string }

export type Location = {
  id: string
  name: string
  kind: LocationKind
  runner: Runner
  scope: Scope
  zone: string
  status: Status
  version: string
  cat?: PrivateCat
  region?: string
  cont?: string
  flag?: string
  city?: string
  enabled?: boolean
  default?: boolean
  host?: string
  uuid?: string
  caps?: string
  owner?: string
  browsers?: string[]
  devices?: Device[]
}

/** Ordre + libellés des catégories de locations privées. */
export const CAT: [PrivateCat, string][] = [
  ['desktop', 'Desktop runners'],
  ['cellular', 'Cellular'],
  ['smartphone', 'Smartphone'],
  ['web', 'Web'],
  ['passive', 'Passive'],
]

export const catLabel = (c: string): string =>
  (CAT.find((x) => x[0] === c) || [undefined, c])[1] as string

export const runnerLabel: Record<Runner, string> = {
  cloud: 'Cloud (Playwright)',
  desktop: 'Desktop runner',
  appliance: 'Robot',
}

/** Continents affichés (ordre) pour le groupement des locations publiques. */
export const CONTINENTS = ['Europe', 'Americas', 'Asia-Pacific', 'Africa'] as const

const COUNTRY: Record<string, [string, string]> = {
  France: ['France', '🇫🇷'],
  Guinee: ['Guinée', '🇬🇳'],
  Germany: ['Germany', '🇩🇪'],
  UK: ['UK', '🇬🇧'],
  Sweden: ['Sweden', '🇸🇪'],
}

/** `Guinee/Conakry/Camayenne` -> `Camayenne, Guinée 🇬🇳` */
export function zonePretty(zone: string): string {
  const parts = zone.split('/')
  const city = parts[parts.length - 1]
  let c: [string, string] | null = null
  for (const p of parts) {
    if (COUNTRY[p]) {
      c = COUNTRY[p]
      break
    }
  }
  if (!c) c = [parts[0], '']
  return `${city}, ${c[0]} ${c[1]}`.trim()
}

export const LOCATIONS: Location[] = [
  // PUBLIC — régions managées kapptivate (enabled = activée pour ce workspace)
  { id: 'pub-par', name: 'Europe · Paris', kind: 'public', runner: 'cloud', scope: 'managed', zone: 'Europe/France/Paris', status: 'online', version: 'pw-1.48', region: 'eu-west-3', cont: 'Europe', flag: '🇫🇷', city: 'Paris, France', enabled: true, default: true },
  { id: 'pub-fra', name: 'Europe · Frankfurt', kind: 'public', runner: 'cloud', scope: 'managed', zone: 'Europe/Germany/Frankfurt', status: 'online', version: 'pw-1.48', region: 'eu-central-1', cont: 'Europe', flag: '🇩🇪', city: 'Frankfurt, Germany', enabled: true },
  { id: 'pub-lon', name: 'Europe · London', kind: 'public', runner: 'cloud', scope: 'managed', zone: 'Europe/UK/London', status: 'online', version: 'pw-1.48', region: 'eu-west-2', cont: 'Europe', flag: '🇬🇧', city: 'London, UK', enabled: false },
  { id: 'pub-vir', name: 'US · N. Virginia', kind: 'public', runner: 'cloud', scope: 'managed', zone: 'US/Virginia', status: 'online', version: 'pw-1.48', region: 'us-east-1', cont: 'Americas', flag: '🇺🇸', city: 'N. Virginia, USA', enabled: true },
  { id: 'pub-ore', name: 'US · Oregon', kind: 'public', runner: 'cloud', scope: 'managed', zone: 'US/Oregon', status: 'online', version: 'pw-1.48', region: 'us-west-2', cont: 'Americas', flag: '🇺🇸', city: 'Oregon, USA', enabled: false },
  { id: 'pub-sao', name: 'South America · São Paulo', kind: 'public', runner: 'cloud', scope: 'managed', zone: 'Americas/Brazil/SaoPaulo', status: 'online', version: 'pw-1.48', region: 'sa-east-1', cont: 'Americas', flag: '🇧🇷', city: 'São Paulo, Brazil', enabled: false },
  { id: 'pub-cpt', name: 'Africa · Cape Town', kind: 'public', runner: 'cloud', scope: 'managed', zone: 'Africa/SouthAfrica/CapeTown', status: 'online', version: 'pw-1.48', region: 'af-south-1', cont: 'Africa', flag: '🇿🇦', city: 'Cape Town, South Africa', enabled: false },
  { id: 'pub-abj', name: 'Africa · Abidjan', kind: 'public', runner: 'cloud', scope: 'managed', zone: 'Africa/IvoryCoast/Abidjan', status: 'online', version: 'pw-1.48', region: 'af-west-2', cont: 'Africa', flag: '🇨🇮', city: 'Abidjan, Cote dIvoire', enabled: false },
  { id: 'pub-dkr', name: 'Africa · Dakar', kind: 'public', runner: 'cloud', scope: 'managed', zone: 'Africa/Senegal/Dakar', status: 'online', version: 'pw-1.48', region: 'af-west-1', cont: 'Africa', flag: '🇸🇳', city: 'Dakar, Senegal', enabled: false },
  { id: 'pub-nbo', name: 'Africa · Nairobi', kind: 'public', runner: 'cloud', scope: 'managed', zone: 'Africa/Kenya/Nairobi', status: 'online', version: 'pw-1.48', region: 'af-east-1', cont: 'Africa', flag: '🇰🇪', city: 'Nairobi, Kenya', enabled: false },
  { id: 'pub-mpm', name: 'Africa · Maputo', kind: 'public', runner: 'cloud', scope: 'managed', zone: 'Africa/Mozambique/Maputo', status: 'online', version: 'pw-1.48', region: 'af-southeast-1', cont: 'Africa', flag: '🇲🇿', city: 'Maputo, Mozambique', enabled: false },
  { id: 'pub-sin', name: 'Asia · Singapore', kind: 'public', runner: 'cloud', scope: 'managed', zone: 'Asia/Singapore', status: 'online', version: 'pw-1.48', region: 'ap-southeast-1', cont: 'Asia-Pacific', flag: '🇸🇬', city: 'Singapore', enabled: true },
  { id: 'pub-tok', name: 'Asia · Tokyo', kind: 'public', runner: 'cloud', scope: 'managed', zone: 'Asia/Japan/Tokyo', status: 'online', version: 'pw-1.48', region: 'ap-northeast-1', cont: 'Asia-Pacific', flag: '🇯🇵', city: 'Tokyo, Japan', enabled: false },
  { id: 'pub-syd', name: 'Asia · Sydney', kind: 'public', runner: 'cloud', scope: 'managed', zone: 'Asia-Pacific/Australia/Sydney', status: 'online', version: 'pw-1.48', region: 'ap-southeast-2', cont: 'Asia-Pacific', flag: '🇦🇺', city: 'Sydney, Australia', enabled: false },
  // PRIVATE — robots (hardware partagé) par capacité + desktop runners
  { id: 'ogn-3g-1', name: 'ogn-3g-1', kind: 'private', cat: 'cellular', runner: 'appliance', scope: 'shared', zone: 'Guinee/Conakry/Camayenne', status: 'online', version: 'v4.21.0', host: 'ogn-3g-1', uuid: 'c1a1-3g1', caps: 'Cellular · 4/4 SIM', devices: [] },
  { id: 'ogn-4g-01', name: 'ogn-4g-01', kind: 'private', cat: 'cellular', runner: 'appliance', scope: 'shared', zone: 'Guinee/Kankan', status: 'online', version: 'v4.21.3', host: 'ogn-4g-01', uuid: 'c1a1-4g01', caps: 'Cellular · 2/2 SIM', devices: [] },
  { id: 'ogn-4g-02', name: 'ogn-4g-02', kind: 'private', cat: 'cellular', runner: 'appliance', scope: 'shared', zone: 'Guinee/Aeroport', status: 'online', version: 'v4.21.3', host: 'ogn-4g-02', uuid: 'c1a1-4g02', caps: 'Cellular · 2/2 SIM', devices: [] },
  { id: 'ogn-4g-04', name: 'ogn-4g-04', kind: 'private', cat: 'cellular', runner: 'appliance', scope: 'shared', zone: 'Guinee/Sonfonia', status: 'online', version: 'v4.21.0', host: 'ogn-4g-04', uuid: 'c1a1-4g04', caps: 'Cellular · 0/2 SIM', devices: [] },
  { id: 'ogn-2', name: 'ogn-2', kind: 'private', cat: 'smartphone', runner: 'appliance', scope: 'shared', zone: 'Guinee/Conakry/Camayenne', status: 'offline', version: 'v2.3.0', host: 'ogn-2', uuid: 's1a1-2', caps: 'Smartphone · 0 devices', devices: [] },
  { id: 'ogn-3', name: 'ogn-3', kind: 'private', cat: 'smartphone', runner: 'appliance', scope: 'shared', zone: 'Guinee/Sonfonia', status: 'online', version: 'v2.8.0', host: 'ogn-3', uuid: 's1a1-3', caps: 'Smartphone', devices: [{ n: 'Pixel 10 #1', s: 'Google (sdk_gphone16k_arm64)', u: 'emulator-5554' }, { n: 'Pixel 10 #2', s: 'Google (sdk_gphone16k_arm64)', u: 'emulator-5556' }] },
  { id: 'ogn-web-1', name: 'ogn-web-1', kind: 'private', cat: 'web', runner: 'appliance', scope: 'shared', zone: 'Guinee/Sonfonia', status: 'online', version: 'v7.23.2', host: 'ogn-web-1', uuid: 'w1a1-1', caps: 'Web · API', devices: [] },
  { id: 'ogn-web-3', name: 'ogn-web-3', kind: 'private', cat: 'web', runner: 'appliance', scope: 'shared', zone: 'Guinee/Koloma', status: 'online', version: 'v7.27.2', host: 'ogn-web-3', uuid: 'w1a1-3', caps: 'Web · API', devices: [] },
  { id: 'pp-api', name: 'preprod-dev-2-api-kagent', kind: 'private', cat: 'web', runner: 'appliance', scope: 'shared', zone: 'Europe/France/Paris', status: 'online', version: 'v2.15.18', host: 'preprod-dev-2-api-kagent', uuid: 'd95d6d14-ca8a-414e', caps: 'Web · API', devices: [] },
  { id: 'koa-web', name: 'MacBook de Alex', kind: 'private', cat: 'desktop', runner: 'desktop', scope: 'personal', zone: 'Europe/France/Rennes', status: 'online', version: 'v7.30.0', owner: 'alex.durand', host: 'MacBook Pro · Alex', uuid: 'd95d6d14-ca8a-414e-963e', caps: 'Web', browsers: ['Chrome 143', 'Firefox 130', 'Safari 17'], devices: [] },
  { id: 'koa-mobile', name: 'MacBook de Sarah', kind: 'private', cat: 'desktop', runner: 'desktop', scope: 'personal', zone: 'Europe/France/Rennes', status: 'online', version: 'v7.28.2', owner: 'sarah.kane', host: 'MacBook Air · Sarah', uuid: 'a1c2e3f4-5678-49ab', caps: 'Mobile', browsers: ['Chrome 143'], devices: [{ n: 'Pixel 10 #1', s: 'Google (sdk_gphone16k_arm64)', u: 'emulator-5554' }, { n: 'Pixel 10 #2', s: 'Google (sdk_gphone16k_arm64)', u: 'emulator-5556' }] },
  { id: 'ci-mac', name: 'Mac Mini · CI', kind: 'private', cat: 'desktop', runner: 'desktop', scope: 'shared', zone: 'Europe/France/Paris', status: 'online', version: 'v7.30.0', owner: 'shared', host: 'Mac Mini · Bureau Paris', uuid: 'cimac-0001-shared', caps: 'Web', browsers: ['Chrome 143', 'Firefox 130', 'Edge 130'], devices: [] },
]
