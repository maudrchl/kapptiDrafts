/// <reference types="react" />
import { Option, SelectMode } from 'components/Select/Select';
import { Size } from 'utils';
type SelectProps = {
    name: string;
    label?: string;
    size?: Size;
    options: Option[];
    defaultValue?: any;
    searchable?: boolean;
    mode?: SelectMode;
    placeholder?: string;
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    maxSelectedCount?: number;
    value?: any;
    icon?: any;
    clearable?: boolean;
    fullWidth?: boolean;
    withDifferentFullLabel?: boolean;
    onChange?: (value: any) => void;
    onToggleDropdown?: (open: boolean) => void;
    disabled?: boolean;
    borderless?: boolean;
};
declare const Select: (props: SelectProps) => JSX.Element;
export default Select;
