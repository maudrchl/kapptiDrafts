import * as React from 'react';
import { ReactNode } from 'react';
type UptimeGraphProps = {
    periods: UptimePeriod[];
    legendTop?: {
        start: ReactNode;
        end: ReactNode;
    };
    legendBottom?: {
        start?: ReactNode;
        center?: ReactNode;
        end?: ReactNode;
    };
    onClick?: (index: number) => void;
};
export type UptimePeriodStatusType = 'success' | 'warning' | 'alert' | 'failed' | 'neutral' | 'info';
export type UptimePeriodStatus = {
    type: UptimePeriodStatusType;
    label: string;
    percentage?: number;
    percentageForRendering?: number;
    count: number;
};
export type UptimePeriod = {
    date: string;
    status: UptimePeriodStatus[];
};
declare const UptimeGraph: React.MemoExoticComponent<({ periods, legendTop, legendBottom, onClick }: UptimeGraphProps) => JSX.Element>;
export default UptimeGraph;
