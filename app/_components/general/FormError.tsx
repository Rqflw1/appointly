import classNames from "classnames";

interface ComponentProps {
    error: string;
    className?: string;
}

export default function FormError({ error, className }: ComponentProps) {
    if (!error) return null;
    return (
        <div
            className={classNames(
                "text-xs font-semibold text-destructive",
                className
            )}
        >
            {error}
        </div>
    );
}
