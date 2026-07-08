/// <reference types="react" />
import { Filter, FilterOption } from '../FiltersModal/FiltersModal';
type FiltersButtonProps = {
    /**
     * This prop is used to display the available filters
     */
    options: FilterOption[];
    /**
     * This prop is used to display the selected filters
     */
    filters?: Filter[];
    /**
     * This prop is used to apply the selected filters
     */
    onApplyFilters: (filters: Filter[]) => void;
};
/**
 * FiltersButton is a component that displays a button to open a modal with filters.
 *
 * @param options The available filters
 * @param filters The selected filters
 * @param onApplyFilters Apply the selected filters
 */
declare const FiltersButton: ({ options, filters, onApplyFilters }: FiltersButtonProps) => JSX.Element;
export default FiltersButton;
