declare module '*.jsx' {
    import React from 'react';
    const Component: React.ComponentType<any>;
    export default Component;
}

declare module '*.js' {
    const content: any;
    export default content;
}

declare module '*.css' {
    const content: { [className: string]: string };
    export default content;
}

declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module '*.png' {
    const content: string;
    export default content;
}

declare module '*.jpg' {
    const content: string;
    export default content;
}

declare module '*.jpeg' {
    const content: string;
    export default content;
}

declare module '*.gif' {
    const content: string;
    export default content;
}

declare module '*.svg' {
    const content: string;
    export default content;
} 