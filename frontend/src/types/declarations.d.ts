declare module '*.jsx' {
    import React from 'react';
    const Component: React.ComponentType<any>;
    export default Component;
}

declare module '*.css' {
    const content: { [className: string]: string };
    export default content;
}

declare module '*.svg' {
    import React from 'react';
    const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
    export default SVG;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif'; 