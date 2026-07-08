import * as React from 'react';
type InlineMetaProps = {
    items: Array<{
        icon: any;
        text: string | React.ReactNode;
    }>;
};
declare const InlineMeta: ({ items }: InlineMetaProps) => JSX.Element;
export default InlineMeta;
