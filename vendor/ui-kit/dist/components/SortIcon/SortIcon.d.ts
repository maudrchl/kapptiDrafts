/// <reference types="react" />
type SortIconProps = {
    sortOrder: 'ascend' | 'descend' | undefined;
};
declare const SortIcon: ({ sortOrder }: SortIconProps) => JSX.Element;
export default SortIcon;
