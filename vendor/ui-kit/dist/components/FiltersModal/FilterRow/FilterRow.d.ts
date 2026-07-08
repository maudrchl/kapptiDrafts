/// <reference types="react" />
import { Filter, FilterOption } from '../FiltersModal';
import { FieldInputProps, FormikErrors } from 'formik';
type FilterRowProps = {
    /**
     * An array of FilterOption objects representing the available options.
     *
     * @type {FilterOption[]}
     */
    options: FilterOption[];
    /**
     * Represents a filter object used for filtering data.
     * @type Filter
     */
    filter: Filter;
    /**
     * The name of the field.
     * @type {string}
     */
    name: string;
    /**
     * Callback function triggered when an item is removed.
     */
    onRemove: () => void;
    /**
     * Callback function to set the value of a field.
     * @param {string} field
     * @param value
     */
    setFieldValue: (field: string, value: any) => Promise<void | FormikErrors<{
        filters: Filter[];
    }>>;
    /**
     * Callback function to get the field props.
     * @param {string} name
     * @returns {FieldInputProps<string>}
     */
    getFieldProps: (name: string) => FieldInputProps<string>;
};
declare const FilterRow: ({ options, filter, name, onRemove, setFieldValue, getFieldProps }: FilterRowProps) => JSX.Element;
export default FilterRow;
