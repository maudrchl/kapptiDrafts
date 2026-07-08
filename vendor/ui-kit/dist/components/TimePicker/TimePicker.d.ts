import { ReactNode } from 'react';
type TimePickerProps = {
    classNames?: {
        timePopup?: string;
        meridiemPopup?: string;
    };
    name?: string;
    value?: string;
    onChange?: (value: string) => void;
    hourStep?: number;
    minuteStep?: number;
    minValue?: string;
    mode: '12h' | '24h';
    fullWidth?: boolean;
    /** To override the text displayed inside the input. */
    renderInputText?: (value: string | undefined, renderTimeField: () => ReactNode) => ReactNode;
};
/**
 * @deprecated Do not delete this component, use the one from frontend react
 *
 * This component is a base for the TimePicker component in the frontend react
 *
 * The one in the frontend react uses user preferences to set the time format
 */
declare const TimePicker: ({ classNames, name, value, onChange, hourStep, minuteStep, mode, minValue, fullWidth, renderInputText, }: TimePickerProps) => JSX.Element;
export default TimePicker;
