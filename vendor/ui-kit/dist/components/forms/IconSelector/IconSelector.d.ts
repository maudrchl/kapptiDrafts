/// <reference types="react" />
import { IconOption } from 'components/IconSelector/IconSelector';
type IconSelectorProps = {
    name: string;
    icons: IconOption[];
    label?: string;
};
/**
 * A wrapper around the IconSelector component that connects it to Formik.
 */
declare const IconSelector: ({ icons, label, name }: IconSelectorProps) => JSX.Element;
export default IconSelector;
