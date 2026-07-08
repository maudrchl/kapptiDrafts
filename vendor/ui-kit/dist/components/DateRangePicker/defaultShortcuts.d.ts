import { Shortcut } from './components/ShortcutSelector/ShortcutSelector';
import { DateRange } from 'react-aria';
import { TFunction } from 'i18next';
export declare const TODAY_SHORTCUT = 4;
/**
 * The default predefined date ranges displayed in the ShortcutSelector.
 * They are the options passed to the Select component. It should be a function in order to the time to be updated
 * when re selecting a shortcut.
 */
export declare const defaultShortcuts: (t: TFunction) => Shortcut[];
/**
 * Converts a Select Shortcut to an Aria DateRange that can be used by the DateRangePicker
 */
export declare const shortcutToAriaDateRange: (option: Shortcut) => DateRange | null;
