import React from 'react';
type Color = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'blue';
type TagInputValue = {
    value: string;
} & (TagInputText | TagInputTag);
type TagInputText = {
    type: 'text';
};
type TagInputTag = {
    type: 'tag';
    color: Color;
};
type Suggestions = {
    name: string;
    key: string;
    suggestions: {
        id: string;
        label: JSX.Element;
        color: Color;
        value: string;
    }[];
    emptyState?: JSX.Element;
};
type TagInputProps = {
    className?: string;
    disabled?: boolean;
    fullWidth?: boolean;
    label?: string;
    suggestions?: Suggestions[];
    value: TagInputValue[];
    onChange: React.Dispatch<React.SetStateAction<TagInputValue[]>>;
    invalid?: boolean;
    placeholder?: string;
    onBlur?: React.FocusEventHandler<HTMLDivElement>;
    onFocus?: React.FocusEventHandler<HTMLDivElement>;
};
export default function TagInput({ className, disabled, fullWidth, label, suggestions, value, onChange, invalid, placeholder, onBlur, onFocus, }: TagInputProps): JSX.Element;
export {};
