import { ReactNode } from 'react';
type MultiselectOption = {
    selected: boolean;
    value: string;
    searchValue: string;
    content: ReactNode;
};
type MultiselectModalProps = {
    title: string;
    open: boolean;
    setOpen: (open: boolean) => void;
    options: MultiselectOption[];
    onChange: (options: MultiselectOption[]) => void;
    emptyState: {
        icon: ReactNode;
        title: string;
    };
    searchEmptyState: {
        icon: ReactNode;
        title: string;
    };
};
declare const MultiSelectModal: (props: MultiselectModalProps) => JSX.Element;
export default MultiSelectModal;
