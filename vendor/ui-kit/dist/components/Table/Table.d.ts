/// <reference types="react" />
import { ColumnsType } from 'antd/es/table';
import EmptyState from 'components/EmptyState/EmptyState';
import type { GetRowKey } from 'rc-table/lib/interface';
import { TableRowSelection, SorterResult } from 'antd/es/table/interface';
import { TablePaginationConfig } from 'antd';
import type { FilterValue } from 'antd/es/table/interface';
export declare const DEFAULT_OUTER_BORDERS = true;
export declare const DEFAULT_SCROLL: {
    scrollToFirstRowOnChange: boolean;
};
type EmptyState = {
    icon?: any;
    text: string;
    description?: string;
};
export interface Item {
    key?: string;
}
type Pagination = {
    current?: number;
    pageSize: number;
    totalItemCount: number;
    getPage: (page: number) => void;
};
type TableProps<T = any> = {
    data: T[];
    columns: ColumnsType<any>;
    classNames?: string;
    isLoading?: boolean;
    emptyState?: EmptyState;
    onClickRow?: (item: T) => void;
    pagination?: Pagination;
    rowKey: string | GetRowKey<any>;
    showHeader?: boolean;
    outerBorders?: boolean;
    scroll?: {
        scrollToFirstRowOnChange?: boolean;
        x?: string | number | true;
        y?: string | number;
    };
    rowSelection?: TableRowSelection<any>;
    conditionalRowClassNames?: {
        condition: (record: any) => boolean;
        className: string;
    }[];
    noHorizontalBorders?: boolean;
    compact?: boolean;
    verticalBorders?: boolean;
    scrollToTopOnPageChange?: boolean;
    onChange?: (pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, sorter: SorterResult<T> | SorterResult<T>[]) => void;
    persistSortKey?: string;
};
/**
 * Uses Antd to display a table
 */
declare const Table: <T = any>({ data, columns, classNames, isLoading, emptyState, onClickRow, pagination, rowKey, showHeader, outerBorders, scroll, rowSelection, conditionalRowClassNames, noHorizontalBorders, compact, verticalBorders, scrollToTopOnPageChange, onChange, persistSortKey, }: TableProps<T>) => JSX.Element;
export default Table;
