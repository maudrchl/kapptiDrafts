/// <reference types="react" />
import { DateRange as AriaDateRange } from 'react-aria';
type HeaderProps = {
    dateRange: AriaDateRange | null;
    changeDateRange: (dateRange: AriaDateRange) => void;
    dateFormat?: string;
    timeFormat?: '12h' | '24h';
};
/**
 * The inputs inside the date range picker : start date, start time, end date and end time ⏰
 * Made for React Aria.
 */
declare const Header: ({ dateRange, changeDateRange, dateFormat: dateFormatProp, timeFormat }: HeaderProps) => JSX.Element;
export default Header;
