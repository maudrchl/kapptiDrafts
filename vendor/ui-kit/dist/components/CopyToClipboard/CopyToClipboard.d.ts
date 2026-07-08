import { ReactNode } from 'react';
type CopyToClipboardProps = {
    children: ReactNode;
    value: string;
};
declare const CopyToClipboard: ({ children, value }: CopyToClipboardProps) => JSX.Element;
export default CopyToClipboard;
