import * as React from 'react';
import Checkitem from '../Checkitem/Checkitem';
type ChecklistProps = {
    items: React.ComponentProps<typeof Checkitem>[];
    ghost?: boolean;
};
declare const Checklist: ({ items, ghost }: ChecklistProps) => JSX.Element;
export default Checklist;
