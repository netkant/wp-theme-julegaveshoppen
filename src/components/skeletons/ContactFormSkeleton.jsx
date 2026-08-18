import { Skeleton } from "./Skeleton";
import { StepSkeleton } from "./StepSkeleton";

function SkeletonField({ className = "input-container", labelWidth }) {
    return (
        <div className={className}>
            <Skeleton className="skeleton-input-label" width={labelWidth} />
            <Skeleton className="skeleton-input-field" />
        </div>
    );
}

/**
 * Mirrors the field layout of the contact step one-for-one so the form does
 * not reflow when the real inputs take over.
 */
export function ContactFormSkeleton({ step }) {
    return (
        <StepSkeleton step={step} className="input-container-column">
            <SkeletonField labelWidth="96px" />
            <SkeletonField labelWidth="74px" />

            <div className="input-container-row">
                <SkeletonField
                    className="input-container input-container-small"
                    labelWidth="94px"
                />
                <SkeletonField labelWidth="34px" />
            </div>

            <div className="input-container-row">
                <SkeletonField labelWidth="38px" />
                <SkeletonField labelWidth="38px" />
            </div>

            <SkeletonField labelWidth="112px" />

            <div className="input-container-row">
                <SkeletonField labelWidth="58px" />
                <SkeletonField labelWidth="108px" />
            </div>
        </StepSkeleton>
    );
}
