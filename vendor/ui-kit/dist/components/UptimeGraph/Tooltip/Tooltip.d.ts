import * as React from 'react';
import { UptimePeriod } from '../UptimeGraph';
type TooltipProps = {
    period: UptimePeriod;
    className?: string;
};
declare const Tooltip: React.MemoExoticComponent<({ className, period }: TooltipProps) => JSX.Element>;
export default Tooltip;
