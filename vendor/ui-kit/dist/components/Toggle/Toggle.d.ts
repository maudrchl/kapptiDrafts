/// <reference types="react" />
type ToggleProps = {
    title?: string;
    description?: string;
    value?: boolean;
    disabled?: boolean;
    onChange?: (checked: boolean) => void;
};
declare const Toggle: ({ title, description, value, disabled, onChange }: ToggleProps) => JSX.Element;
export default Toggle;
