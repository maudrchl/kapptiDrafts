import * as React from 'react';
import { Size } from 'utils';
type InputProps = {
    canCopy?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    label?: string;
    maxLength?: number;
    name: string;
    placeholder?: string;
    prefix?: string | React.ReactNode;
    size?: Size;
    suffix?: string | React.ReactNode;
    type?: string;
    borderless?: boolean;
    onChange?: any;
    mono?: boolean;
};
/**
 * ⌨️ An input made to be used in a Formik form
 */
declare const Input: (props: InputProps) => JSX.Element;
export default Input;
