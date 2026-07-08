import { ReactNode } from 'react';
type DatePickerProps = {
    inputClassName?: string;
    value: Date;
    onChange: (date: Date | null) => void;
    defaultDate?: Date;
    resetMode?: 'today' | 'forever' | 'null';
    minDate?: Date;
    maxDate?: Date;
    dateFormat?: 'DD/MM/YYYY' | 'MM/DD/YYYY';
} & (DateTimePickerType | DatePickerType);
type DateTimePickerType = {
    mode: 'datetime';
    timeMode: '12h' | '24h';
    timePickerBelow?: boolean;
    timePickerLabel?: string;
    noDatePicker?: boolean;
    resetTime?: string;
    renderTimePickerText?: (time: string | undefined, timeTouched: boolean, renderTimeField: () => ReactNode) => ReactNode;
};
type DatePickerType = {
    mode: 'date';
};
/**
 * @deprecated Do not delete this component, use the one from frontend react
 *
 * This component is a base for the DatePicker component in the frontend react
 *
 * The one in the frontend react uses user preferences to set the date format
 */
declare const DatePicker: ({ inputClassName, value, onChange, defaultDate, resetMode, minDate, maxDate, dateFormat, ...props }: DatePickerProps) => JSX.Element;
export default DatePicker;
