import * as React from 'react';
type SectionProps = {
    title: string;
    children: React.ReactNode;
};
declare const Section: ({ title, children }: SectionProps) => JSX.Element;
export default Section;
