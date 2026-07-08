/// <reference types="react" />
type FiltersModalProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    options: FilterOption[];
    filters?: Filter[];
    onApplyFilters: (filters: Filter[]) => void;
};
export type Filter = {
    entity: string;
    value: string;
    comparator: FilterComparator;
};
export type FilterComparator = 'equal' | 'notEqual' | 'includes' | 'notIncludes';
export type FilterOption = {
    label: string;
    value: string;
    options?: FilterOption[];
};
declare const FiltersModal: ({ open, setOpen, filters, options, onApplyFilters }: FiltersModalProps) => JSX.Element;
export default FiltersModal;
