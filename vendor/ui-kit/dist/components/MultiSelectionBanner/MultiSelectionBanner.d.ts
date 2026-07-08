import { ReactNode } from 'react';
type MultiSelectionBannerProps = {
    children: ReactNode;
    selectedItems: any;
    selectedItemsText: string;
    setSelectedItems: (items: any) => void;
};
declare const MultiSelectionBanner: ({ children, selectedItems, selectedItemsText, setSelectedItems }: MultiSelectionBannerProps) => JSX.Element;
export default MultiSelectionBanner;
