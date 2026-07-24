/* ============================================================
 *  Custom step library — données statiques du proto
 * ============================================================ */

export type LibVar = {
  label: string
  /** brace = variable {} ; arrow = valeur produite → */
  kind: 'brace' | 'arrow'
}

export type LibStep = {
  id: string
  name: string
  description: string
  code: string
  /** Nombre de tests qui réutilisent cette étape (propagation). */
  usedIn: number
  /** Variables consommées / produites, affichées sous la description. */
  vars?: LibVar[]
}

// Code d'exemple pour une étape « Check URL » (assertion sur l'URL courante).
export const CHECK_URL_CODE = `await test.assert("Verify URL contains /petInfo", async () => {
  const currentUrl = await browser.getUrl();

  if (!currentUrl.includes('/petInfo')) {
    throw new Error(\`URL does not contain '/petInfo'.
    Current URL: \${currentUrl}\`);
  }

  return \`URL verification successful: \${currentUrl} contains '/petInfo'\`;
});`

export const RANDOM_NUMBER_CODE = `function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}`

export const IMPORT_PDF_CODE = `const file = await step.getAttachment("invoice.pdf");

if (!file) {
  throw new Error("No file was imported.");
}

// Ensure the document is parsed and stored
const parsed = await parser.read(file);
return parsed.pages.length > 0;`

/**
 * Bibliothèque interne (« In-house steps »).
 * On ne gère pas l'onglet « Kapptivate library » dans ce proto.
 */
export const IN_HOUSE_STEPS: LibStep[] = [
  {
    id: 'random-number',
    name: 'Random number',
    description: 'Generates a random number within a specified range.',
    code: RANDOM_NUMBER_CODE,
    usedIn: 2,
  },
  {
    id: 'import-pdf',
    name: 'Import PDF (custom system)',
    description:
      'Allows you to check parsing rules, ensure the file is recognized and stored.',
    code: IMPORT_PDF_CODE,
    usedIn: 1,
  },
  {
    id: 'check-urls',
    name: 'Check URLs',
    description: 'Allows you to check URL dynamically',
    code: CHECK_URL_CODE,
    usedIn: 1,
  },
]

// Variables insérables dans l'éditeur (bouton « Insert variable »).
export const INSERTABLE_VARS = ['URL', 'Host', 'apiKey', 'userEmail']
