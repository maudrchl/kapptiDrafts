import * as React from 'react';
import { ChangeEventHandler } from 'react';
import { Size } from 'utils';
type CheckboxProps = {
    /**
     * The ID of the checkbox input.
     */
    identifier: string;
    size?: Size;
    border?: boolean;
    label?: string | React.ReactNode;
    checkedLabel?: string;
    description?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    renderRight?: React.ReactNode;
    className?: string;
    expandedContent?: React.ReactNode;
};
declare const Checkbox: ({ identifier, size, border, label, checkedLabel, description, disabled, checked, onChange, renderRight, className, expandedContent, }: CheckboxProps) => JSX.Element;
export default Checkbox;
