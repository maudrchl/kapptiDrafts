/// <reference types="react" />
type TimelineProps = {
    items: any[];
    itemPaddingBottom?: number;
    className?: string;
};
declare const Timeline: ({ items, itemPaddingBottom, className }: TimelineProps) => JSX.Element;
export default Timeline;
