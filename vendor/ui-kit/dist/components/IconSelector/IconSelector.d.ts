import { ComponentProps, ReactNode } from 'react';
import Tag from 'components/Tag/Tag';
type TagColor = ComponentProps<typeof Tag>['color'];
export type IconOption = {
    label: string;
    icon: ReactNode;
};
export type IconValue = {
    name: string | undefined;
    color: TagColor | undefined;
};
type IconSelectorProps = {
    icons: IconOption[];
    label?: string;
    value?: IconValue;
    onSelect?: (value: IconValue) => void;
};
/**
 * 🎨 A component that allows the user to select an icon and his color from a list of options
 */
declare const IconSelector: ({ icons, label, value, onSelect }: IconSelectorProps) => JSX.Element;
export default IconSelector;
