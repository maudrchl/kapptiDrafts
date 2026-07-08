import * as React from 'react';
type CheckitemProps = {
    done: boolean;
    title: React.ReactNode | string;
    variant?: 'primary' | 'secondary';
    colored?: 'none' | 'checked' | 'unchecked' | 'both';
    onClick?: () => void;
};
declare const Checkitem: ({ done, title, variant, colored, onClick }: CheckitemProps) => JSX.Element;
export default Checkitem;
