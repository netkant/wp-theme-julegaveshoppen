export function Skeleton({ className = "", width, height, style }) {
    return (
        <span
            className={`skeleton ${className}`.trim()}
            style={{ width, height, ...style }}
            aria-hidden="true"
        />
    );
}
