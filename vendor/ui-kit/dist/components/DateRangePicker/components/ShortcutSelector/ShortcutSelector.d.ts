/// <reference types="react" />
import { DateRange as AriaDateRange } from 'react-aria';
import { Size } from 'utils';
type DateRange = {
    start: string;
    end: string;
    raw?: {
        start: string;
        end: string;
    };
};
export type Clearable = {
    isClearable: boolean;
    clearedValue?: DateRange | null;
};
export type Shortcut = {
    label: string;
    value: DateRange | 'custom';
};
type ShortcutSelectorProps = {
    size: Size;
    value?: number | null;
    onChange?: any;
    defaultValueIndex?: number | null;
    shortcuts?: Shortcut[];
    changeRange: (value: AriaDateRange | null) => void;
    clearable?: Clearable;
};
/**
 * A Select to choose a predefined date range to use in the DateRangePicker. Works with Aria Date Range Picker
 */
declare const ShortcutSelector: ({ size, value, onChange, defaultValueIndex, shortcuts, changeRange, clearable, }: ShortcutSelectorProps) => JSX.Element;
export default ShortcutSelector;
