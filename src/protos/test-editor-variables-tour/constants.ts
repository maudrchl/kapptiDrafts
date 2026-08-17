/* ============================================================
 *  Visite guidée du proto « Variables: inputs vs locals ».
 *  Support de passation aux devs : chaque étape dit CE QU'ON VOIT,
 *  la décision derrière, et le geste à faire pour la vérifier.
 * ============================================================ */

export type TourStep = {
  title: string
  /** la décision, en une ou deux phrases */
  body: string
  /** sélecteur de la zone à surligner (facultatif) */
  target?: string
  /** geste à faire dans l'écran pour voir l'étape en vrai */
  todo?: string
}

export const TOUR: TourStep[] = [
  {
    title: 'The confusion we are fixing',
    body: 'The editor mixed two natures of variable. An in-test input belongs to the test interface: you give it a value before the run. A local variable is an assignment at runtime, produced by a step. Same look, two very different lifecycles.',
  },
  {
    title: 'A real browser test',
    body: 'The scenario is a browser test in two step groups, log in then place the order. Interface steps and variable steps sit side by side, which is where the confusion happens.',
    target: '[data-tour="canvas"]',
    todo: 'Open and close a group: they behave as an accordion.',
  },
  {
    title: 'An in-test input is consumed in a field',
    body: 'The orange pill is a value declared before the run. Nothing surprising here, and that is the point: an input reads like an input.',
    target: '#tev-step-2',
  },
  {
    title: 'A Set local variable is autonomous',
    body: 'The step carries the name of the variable it assigns, and the value right below. No round trip to a panel to know what a step produces.',
    target: '#tev-step-5',
  },
  {
    title: 'The value is edited in the step panel',
    body: 'Source and value live in the panel of the step, which IS the step. That is not "upstream": the four sources are static value, JSON attribute, response header and script result, and a script gets a real editor.',
    target: '[data-tour="panel"]',
    todo: 'Click step 5, then read the General tab.',
  },
  {
    title: 'The test panel keeps the interface',
    body: 'Environment holds the in-test inputs and the globals from Configurations, both editable. No local variable here: there is nothing to fill in before the run, which is exactly what the old panel got wrong.',
    target: '[data-tour="env-inputs"]',
    todo: 'Click outside a step to get the test panel back.',
  },
  {
    title: 'A local shows up downstream, badged',
    body: 'One list for what the test defines: in-test inputs first, then the locals already assigned, badged with their step. A local does not appear before the step that assigns it.',
    target: '#tev-step-12',
    todo: 'Open the {} picker of the assertion field.',
  },
  {
    title: 'Updating a global is another action',
    body: 'No Update variable verb: Set local variable covers creating and reassigning a local, and Update global variable is its own action. The action decides the family of target, the target picker follows.',
    target: '#tev-step-11',
  },
  {
    title: 'Creating a variable inserts it',
    body: 'Creation happens where the need appears. From the picker, Create in-test variable opens a modal twin of the global one, lighter, and the created variable lands both in the field being edited and in the Environment table.',
    target: '[data-tour="panel"]',
    todo: 'In a {} picker, In-test tab, hit Create in-test variable.',
  },
  {
    title: 'Three tints, one per nature',
    body: 'In-test orange, local light blue, global dark blue, and the Step N badge for a local. Generators from the Random tab stay neutral grey: a generator is not a variable, and a fourth tint would blur the system.',
    target: '[data-tour="env-globals"]',
  },
  {
    title: 'What is still open',
    body: 'Three calls made without arbitration, worth a discussion: no script as the source of an in-test (a script running before the first step is a step in disguise), a masked in-test keeps a plain field so it cannot compose with another variable, and a Set variable whose value cites a variable has nowhere to show it since we removed the Variables tab from those steps.',
  },
]
