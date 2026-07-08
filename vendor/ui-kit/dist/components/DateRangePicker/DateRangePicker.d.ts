/// <reference types="react" />
import { Size } from 'utils';
import { Clearable } from './components/ShortcutSelector/ShortcutSelector';
export declare const DEFAULT_SIZE = "m";
export declare const DEFAULT_DEFAULT_TIMEZONE: string;
type Option = {
    value: any;
    label: string;
};
export type DateRange = {
    start: string;
    end: string;
    timezone: string;
    raw?: {
        start: string;
        end: string;
    };
};
type DateRangerPickerProps = {
    classNames?: {
        popover?: string;
        dateButton?: string;
    };
    options?: Option[];
    size?: Size;
    onChange?: (dateRange: DateRange | null) => void;
    clearable?: Clearable;
    defaultValue?: number | null;
    defaultTimezone?: string;
    dateFormat?: string;
    timeFormat?: '12h' | '24h';
    defaultRange?: DateRange | null;
    hideInputUntilCustom?: boolean;
};
/**
 * 📆 A Date range picker made with React Aria.
 * Prefere using the DateRangePicker from frontend-react instead of this one if possible, because the one from frontend-react automatically uses the user date and time formats. 👤
 * ⚠️ Some timezones are impacted with summer and winter time, so it's completely normal to have one hour lag on certain
 * dates compared to what is indicated in the timezone selector !  ⚠️
 */
declare const DateRangePicker: ({ classNames, options, size, onChange, clearable, defaultValue, defaultTimezone, dateFormat, timeFormat, defaultRange, hideInputUntilCustom, }: DateRangerPickerProps) => JSX.Element;
export default DateRangePicker;
