/// <reference types="react" />
type TableFilterProps = {
    selectedFilters: string;
    setFilter: (status: string) => void;
    searchable?: boolean;
    items: {
        label: string;
        icon?: JSX.Element;
        key: string;
    }[];
};
declare const TableFilter: ({ selectedFilters, setFilter, items, searchable }: TableFilterProps) => JSX.Element;
export default TableFilter;
