import { Skeleton } from "./Skeleton";
import { StepSkeleton } from "./StepSkeleton";

export function PriceGroupsSkeleton({ step, count = 6 }) {
    return (
        <StepSkeleton step={step}>
            <div className="price-groups-options">
                {Array.from({ length: count }, (_, index) => (
                    <div className="price-group-option-skeleton" key={index}>
                        <Skeleton className="skeleton-price-label" />
                        <div className="price-group-option-bottom">
                            <Skeleton className="skeleton-select-button" />
                            <Skeleton className="skeleton-view-button" />
                        </div>
                    </div>
                ))}
            </div>
        </StepSkeleton>
    );
}
