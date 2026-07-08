import * as React from 'react';
type CounterCardProps = {
    title: React.ReactNode | string;
    value?: string | number | Date;
    renderValue?: (formatedValue: string) => React.ReactNode;
    trend?: React.ReactNode;
};
declare const CounterCard: ({ title, value, renderValue, trend }: CounterCardProps) => JSX.Element;
export default CounterCard;
