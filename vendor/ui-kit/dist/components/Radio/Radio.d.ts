import * as React from 'react';
import { Dispatch, SetStateAction } from 'react';
type RadioProps<T extends string | number | null> = {
    value: T;
    onChange: Dispatch<SetStateAction<T>>;
    disabled?: boolean;
    vertical?: boolean;
    options: {
        label: string | React.ReactNode;
        value: T;
    }[];
    className?: string;
};
declare const Radio: <T extends string | number>({ value, onChange, disabled, vertical, options, className }: RadioProps<T>) => JSX.Element;
export default Radio;
