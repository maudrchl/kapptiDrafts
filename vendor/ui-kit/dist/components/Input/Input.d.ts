import * as React from 'react';
import { ChangeEventHandler, FocusEventHandler, KeyboardEvent } from 'react';
import { Size } from 'utils';
type InputProps = {
    className?: string;
    canCopy?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    invalid?: boolean;
    label?: string;
    maxLength?: number;
    name?: string;
    width?: string;
    maxWidth?: string;
    onBlur?: FocusEventHandler<HTMLInputElement>;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    onPressEnter?: (e: KeyboardEvent<HTMLInputElement>) => void;
    placeholder?: string;
    prefix?: string | React.ReactNode;
    size?: Size;
    suffix?: string | React.ReactNode;
    type?: string;
    value?: string;
    icon?: React.ReactNode;
    iconRight?: React.ReactNode;
    autoComplete?: string[];
    invalidMessage?: string;
    autofocus?: boolean;
    borderless?: boolean;
    mono?: boolean;
};
export declare const DEFAULT_FULL_WIDTH = false;
export declare const DEFAULT_INVALID = false;
export declare const DEFAULT_SIZE = "l";
export declare const DEFAULT_AUTOFOCUS = false;
export declare const DEFAULT_BORDERLESS = false;
/**
 * ⌨️ A simple input with an optional label, that can be used outside a form
 */
declare const Input: ({ className, canCopy, disabled, fullWidth, invalid, label, maxLength, name, width, maxWidth, onBlur, onChange, onPressEnter, placeholder, prefix, size, suffix, type, value, icon, iconRight, autoComplete, invalidMessage, autofocus, borderless, mono, }: InputProps) => JSX.Element;
export default Input;
