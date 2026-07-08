import * as React from 'react';
import { UptimePeriodStatus } from '../UptimeGraph';
type StatusProps = {
    status: UptimePeriodStatus;
};
declare const Status: React.MemoExoticComponent<({ status }: StatusProps) => JSX.Element>;
export default Status;
