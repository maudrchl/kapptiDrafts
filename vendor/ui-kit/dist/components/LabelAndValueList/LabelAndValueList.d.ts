/// <reference types="react" />
import LabelAndValueItem from './LabelAndValueItem/LabelAndValueItem';
type LabelAndValueItem = {
    label: string;
    value: string;
};
type LabelAndValueListProps = {
    list: LabelAndValueItem[];
};
declare const LabelAndValueList: ({ list }: LabelAndValueListProps) => JSX.Element;
export default LabelAndValueList;
