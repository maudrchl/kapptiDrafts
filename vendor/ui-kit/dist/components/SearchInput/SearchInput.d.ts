import React, { ChangeEvent } from 'react';
import { Size } from '../../utils';
export declare const DEFAULT_SIZE = "m";
export declare const DEFAULT_FULL_WIDTH = false;
type SearchInputProps = {
    className?: string;
    placeholder?: string;
    value: string;
    onChange?: (newValue: string, event?: ChangeEvent<HTMLInputElement>) => any;
    fullwidth?: boolean;
    size?: Size;
    width?: string;
    name?: string;
    autofocus?: boolean;
    onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};
declare const SearchInput: ({ className, placeholder, onChange, value, size, width, fullwidth, name, autofocus, onPressEnter, }: SearchInputProps) => JSX.Element;
export default SearchInput;
