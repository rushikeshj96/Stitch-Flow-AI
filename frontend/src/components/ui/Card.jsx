import React from 'react';

/**
 * Primitive Card composite.
 *
 * Usage:
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Title</CardTitle>
 *       <CardDescription>Sub text</CardDescription>
 *     </CardHeader>
 *     <CardContent>…</CardContent>
 *     <CardFooter>…</CardFooter>
 *   </Card>
 */

export function Card({ className = '', hover = false, ...props }) {
    return (
        <div
            className={`${hover ? 'card-hover' : 'card'} p-0 ${className}`}
            {...props}
        />
    );
}

export function CardHeader({ className = '', ...props }) {
    return <div className={`flex flex-col gap-1 p-6 pb-0 ${className}`} {...props} />;
}

export function CardTitle({ className = '', ...props }) {
    return (
        <h3
            className={`text-base font-display font-semibold text-neutral-900 dark:text-white leading-none ${className}`}
            {...props}
        />
    );
}

export function CardDescription({ className = '', ...props }) {
    return (
        <p
            className={`text-sm text-neutral-500 dark:text-neutral-400 ${className}`}
            {...props}
        />
    );
}

export function CardContent({ className = '', ...props }) {
    return <div className={`p-6 pt-4 ${className}`} {...props} />;
}

export function CardFooter({ className = '', ...props }) {
    return (
        <div
            className={`flex items-center p-6 pt-0 ${className}`}
            {...props}
        />
    );
}
