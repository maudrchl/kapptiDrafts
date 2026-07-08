/// <reference types="react" />
import { Image as AntdImage, ImageProps as AntdImageProps } from 'antd';
type ImageProps = Omit<AntdImageProps, 'preview'> & {
    enableFullscreen?: boolean;
    className?: string;
    relativeUrl?: boolean;
};
declare const Image: ({ enableFullscreen, className, relativeUrl, src, fallback, ...rest }: ImageProps) => JSX.Element;
type ImagePreviewGroupProps = {
    children: React.ReactNode;
    preview?: React.ComponentProps<typeof AntdImage.PreviewGroup>['preview'];
};
export declare const ImagePreviewGroup: ({ children, preview }: ImagePreviewGroupProps) => JSX.Element;
export default Image;
