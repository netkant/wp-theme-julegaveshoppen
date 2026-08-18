/**
 * Wrapper for every step fallback. The heading and description come from the
 * static step config, so they render for real while the step data loads and
 * only the content below them is a placeholder.
 */
export function StepSkeleton({ step, className, children }) {
    return (
        <div className={className} aria-busy="true">
            <h2>{step.name}</h2>
            <p className="step-description">{step.description}</p>
            {children}
        </div>
    );
}
