/// <reference types="react" />
type PaginationProps = {
    current: number;
    itemCount: number;
    pageSize: number;
    onChange: (page: number) => void;
};
declare const Paginator: ({ current, onChange, itemCount, pageSize }: PaginationProps) => JSX.Element;
export default Paginator;
