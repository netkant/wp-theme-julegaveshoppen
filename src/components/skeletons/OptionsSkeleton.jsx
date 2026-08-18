import { Skeleton } from "./Skeleton";
import { StepSkeleton } from "./StepSkeleton";

const LINE_WIDTHS = ["100%", "92%", "78%", "96%", "64%"];

/**
 * Fallback for the three steps built on .option cards: packing options,
 * delivery methods and delivery dates. The grid class is passed in so the
 * placeholder inherits the same columns and gaps as the loaded step.
 */
export function OptionsSkeleton({
    step,
    containerClassName,
    count = 2,
    lines = 4,
    showPrice = true,
}) {
    return (
        <StepSkeleton step={step}>
            <div className={containerClassName}>
                {Array.from({ length: count }, (_, cardIndex) => (
                    <div className="option option-skeleton" key={cardIndex}>
                        <div className="option-skeleton-body">
                            <Skeleton className="skeleton-option-title" />
                            {Array.from({ length: lines }, (_, lineIndex) => (
                                <Skeleton
                                    className="skeleton-option-line"
                                    key={lineIndex}
                                    width={
                                        LINE_WIDTHS[
                                            lineIndex % LINE_WIDTHS.length
                                        ]
                                    }
                                />
                            ))}
                        </div>
                        {showPrice && (
                            <Skeleton className="skeleton-option-price" />
                        )}
                    </div>
                ))}
            </div>
        </StepSkeleton>
    );
}
