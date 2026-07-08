import { ReactElement } from 'react';
type EmptyStateProps = {
    className?: string;
    icon?: ReactElement;
    text: string;
    description?: string;
    useNoResultFoundText?: boolean;
};
/**
 * 🫙A centered icon with a title and a description.
 * This component is commonly used in tables when there are no items to show.
 */
declare const EmptyState: ({ className, icon, text, description, useNoResultFoundText }: EmptyStateProps) => JSX.Element;
export default EmptyState;
