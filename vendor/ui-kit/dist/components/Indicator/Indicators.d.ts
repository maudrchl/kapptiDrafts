import * as React from 'react';
import { CSSProperties } from 'react';
export type IndicatorProps = {
    color: CSSProperties['color'];
    tooltip?: React.ReactNode;
    onClick?: () => void;
    key: number | string;
};
export type IndicatorsProps = {
    indicators: IndicatorProps[];
};
declare const Indicators: ({ indicators }: IndicatorsProps) => JSX.Element | null;
export default Indicators;
