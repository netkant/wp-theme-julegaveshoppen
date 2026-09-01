import { Suspense, useEffect, useRef, useState } from "react";
import "./assets/styles/fonts.css";
import "./assets/styles/options.css";
import "./assets/styles/steps.css";
import "./assets/styles/delivery-methods.css";
import "./assets/styles/delivery-dates.css";
import "./assets/styles/order-summary.css";
import "./assets/styles/price-groups.css";
import "./assets/styles/packing-options.css";
import "./assets/styles/skeleton.css";
import { ContactFormSkeleton } from "./components/skeletons/ContactFormSkeleton";
import { OptionsSkeleton } from "./components/skeletons/OptionsSkeleton";
import { PriceGroupsSkeleton } from "./components/skeletons/PriceGroupsSkeleton";
import { readArtifact, resetArtifact, useArtifact, useArtifactValue } from "./hooks/artifact";
import {
    currentStepArtifact,
    infoArtifact,
    deliveryDatesArtifact,
    deliveryMethodsArtifact,
    packingOptionsArtifact,
    orderObjectArtifact,
    priceGroupsArtifact,
    selectedDeliveryDateArtifact,
    selectedDeliveryMethodArtifact,
    selectedPriceGroupsArtifact,
    selectedPackingOptionArtifact,
    steps,
    jgVars,
} from "./data";

const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateNumber = (number) => {
    return /^[0-9]+$/.test(number);
};

const formatWeekNumber = (weekNumber, deliveryDate) => {
    // eg. 4 - 2027
    return weekNumber + " - " + new Date(deliveryDate * 1000).getFullYear();
};

function App() {
    const [currentStep, setCurrentStep] = useArtifact(currentStepArtifact);
    const stepContentRef = useRef(null);
    const shouldScrollRef = useRef(false);
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const selectedPriceGroups = useArtifactValue(selectedPriceGroupsArtifact);
    const selectedDeliveryMethod = useArtifactValue(selectedDeliveryMethodArtifact);
    const selectedDeliveryDate = useArtifactValue(selectedDeliveryDateArtifact);
    const selectedPackingOption = useArtifactValue(selectedPackingOptionArtifact);
    const info = useArtifactValue(infoArtifact);

    const handleOrderClick = () => {
        setIsLoading(true);
        const orderObject = readArtifact(orderObjectArtifact);
        setError(null);
        fetch(`${jgVars.apiBase}/create-stores`, {
            method: "POST",
            body: JSON.stringify(orderObject),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((data) => {
                        throw new Error(data.message);
                    });
                }
                return response.json();
            })
            .then((data) => {
                console.log("data", data);
                setSubmitted(true);
                setIsLoading(false);
            })
            .finally(() => setIsLoading(false))
            .catch((error) => setError(error));
    };

    const handleOrderMoreClick = () => {
        resetArtifact(selectedPriceGroupsArtifact);
        resetArtifact(selectedDeliveryMethodArtifact);
        resetArtifact(selectedDeliveryDateArtifact);
        resetArtifact(selectedPackingOptionArtifact);
        resetArtifact(currentStepArtifact);
        resetArtifact(infoArtifact);
        setSubmitted(false);
    };

    const canOrder = selectedPriceGroups.length && selectedDeliveryMethod && selectedDeliveryDate && selectedPackingOption && info.email;

    const canAdvanceFromStep = {
        1: Boolean(selectedPriceGroups.length),
        2: Boolean(selectedPackingOption),
        3: Boolean(selectedDeliveryMethod),
        4: Boolean(selectedDeliveryDate),
        5: Boolean(
            info.email &&
            info.companyName &&
            info.cvr &&
            (info.ean ? validateNumber(info.ean) : true) &&
            info.contactPerson &&
            info.phoneNumber &&
            info.address &&
            info.postalCode &&
            info.city &&
            validateEmail(info.email) &&
            validateNumber(info.phoneNumber) &&
            validateNumber(info.cvr) &&
            validateNumber(info.postalCode) &&
            !validateNumber(info.contactPerson) &&
            !validateNumber(info.address) &&
            !validateNumber(info.city),
        ),
    };

    const canAdvance = Boolean(canAdvanceFromStep[currentStep]);

    const canNavigateToStep = (targetStep) => {
        if (targetStep <= currentStep) {
            return true;
        }
        // for (let stepId = currentStep; stepId < targetStep; stepId++) {
        //     if (!canAdvanceFromStep[stepId]) {
        //         return false;
        //     }
        // }
        return false;
    };

    const handleNextClick = () => {
        shouldScrollRef.current = true;
        setCurrentStep(Math.min(currentStep + 1, steps.length));
    };

    useEffect(() => {
        if (!shouldScrollRef.current) {
            return;
        }
        shouldScrollRef.current = false;
        requestAnimationFrame(() => {
            const element = stepContentRef.current;
            if (!element) {
                return;
            }
            const top = element.getBoundingClientRect().top + window.scrollY - 16;
            window.scrollTo({ top, behavior: "smooth" });
        });
    }, [currentStep]);

    if (submitted) {
        return (
            <div className="wizard-page">
                <div className="confirmation">
                    <h1>{jgVars.confirmationHeader || "Tak!"}</h1>
                    {jgVars.confirmationMessage && jgVars.confirmationMessage.length > 0 && (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: jgVars.confirmationMessage,
                            }}
                        ></div>
                    )}
                    <button onClick={handleOrderMoreClick}>{jgVars.confirmationButtonText || "Bestil mere"}</button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="wizard-page">
                <div className="confirmation">
                    <h1>Fejl ved bestilling</h1>
                    <p>Der opstod en fejl ved bestillingen. Prøv igen senere. Kontakt support hvis fejlen fortsætter.</p>
                    <p>Fejl: {error.message}</p>
                    <button onClick={() => setError(null)}>Prøv igen</button>
                </div>
            </div>
        );
    }

    return (
        <div className="wizard-page">
            <h1>Bestil en julegaveshop</h1>

            <div className={`wizard-container wizard-step-${currentStep}`}>
                {currentStep > 1 && (
                    <button
                        className="wizard-close-button"
                        onClick={() => setCurrentStep(1)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-x-icon lucide-x"
                        >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                )}
                <div className="wizard">
                    <div className="wizard-inner">
                        <aside className="step-list">
                            <ol>
                                {steps.slice(0, steps.length - 1).map((step) => {
                                    const status = currentStep === step.id ? "active" : currentStep > step.id ? "completed" : "upcoming";
                                    const isClickable = step.id !== currentStep && canNavigateToStep(step.id);
                                    const isDisabled = status === "upcoming" && !isClickable;
                                    return (
                                        <li
                                            key={step.id}
                                            className={`step-item ${status} ${isClickable ? "clickable" : ""} ${isDisabled ? "disabled" : ""}`}
                                            onClick={isClickable ? () => setCurrentStep(step.id) : undefined}
                                            aria-disabled={!isClickable}
                                        >
                                            <span className="step-marker">{status === "completed" ? <CheckMark /> : step.id}</span>
                                            <span className="step-label">
                                                <span className="step-kicker">Trin {step.id}</span>
                                                <span className="step-name">{step.name}</span>
                                            </span>
                                        </li>
                                    );
                                })}
                            </ol>
                        </aside>

                        <section
                            ref={stepContentRef}
                            className={`step-content step-${currentStep}`}
                        >
                            <Step step={steps.find((step) => step.id === currentStep)} />

                            <div className="wizard-nav">
                                {currentStep > 1 && (
                                    <button
                                        disabled={currentStep === 1}
                                        onClick={() => setCurrentStep(currentStep - 1)}
                                    >
                                        Forrige
                                    </button>
                                )}

                                {currentStep < steps.length ? (
                                    <button
                                        disabled={!canAdvance}
                                        onClick={handleNextClick}
                                        className="next-button"
                                    >
                                        Næste
                                    </button>
                                ) : (
                                    <button
                                        className="order-button"
                                        disabled={!canOrder || isLoading}
                                        onClick={() => handleOrderClick()}
                                    >
                                        {isLoading ? "Bestiller..." : "Bestil gaveshop"}
                                    </button>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;

function Step({ step }) {
    switch (step.id) {
        case 1:
            return (
                <Suspense fallback={<PriceGroupsSkeleton step={step} />}>
                    <Step1 step={step} />
                </Suspense>
            );
        case 2:
            return (
                <Suspense
                    fallback={
                        <OptionsSkeleton
                            step={step}
                            containerClassName="packing-options"
                            lines={5}
                        />
                    }
                >
                    <Step2 step={step} />
                </Suspense>
            );
        case 3:
            return (
                <Suspense
                    fallback={
                        <OptionsSkeleton
                            step={step}
                            containerClassName="delivery-methods-options"
                            lines={3}
                        />
                    }
                >
                    <Step3 step={step} />
                </Suspense>
            );
        case 4:
            return (
                <Suspense
                    fallback={
                        <OptionsSkeleton
                            step={step}
                            containerClassName="delivery-dates-options"
                            lines={3}
                        />
                    }
                >
                    <Step4 step={step} />
                </Suspense>
            );
        case 5:
            return (
                <Suspense fallback={<ContactFormSkeleton step={step} />}>
                    <Step5 step={step} />
                </Suspense>
            );
        case 6:
            return <Step6 step={step} />;
        default:
            return null;
    }
}

function Step1({ step }) {
    const priceGroups = useArtifactValue(priceGroupsArtifact);
    const [selectedPriceGroups, setSelectedPriceGroups] = useArtifact(selectedPriceGroupsArtifact);

    const handlePriceGroupClick = (priceGroup) => {
        setSelectedPriceGroups((prev) => {
            if (prev.some((pg) => pg.id === priceGroup.id)) {
                return prev.filter((pg) => pg.id !== priceGroup.id);
            }
            return [...prev, { ...priceGroup, quantity: priceGroup.min_quantity }];
        });
    };

    const handlePriceGroupQuantityChange = (priceGroup, delta, minQuantity) => {
        setSelectedPriceGroups((prev) =>
            prev.map((pg) =>
                pg.id === priceGroup.id
                    ? {
                          ...pg,
                          quantity: Math.min(999, Math.max(minQuantity, Number(pg.quantity) + delta)),
                      }
                    : pg,
            ),
        );
    };

    const clampQuantity = (value, minQuantity) => Math.min(999, Math.max(minQuantity, Number(value) || minQuantity));

    const handlePriceGroupQuantityInputChange = (priceGroup, value) => {
        if (value === "") {
            setSelectedPriceGroups((prev) => prev.map((pg) => (pg.id === priceGroup.id ? { ...pg, quantity: "" } : pg)));
            return;
        }

        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 0) {
            return;
        }

        setSelectedPriceGroups((prev) => prev.map((pg) => (pg.id === priceGroup.id ? { ...pg, quantity: Math.min(999, parsed) } : pg)));
    };

    const handlePriceGroupQuantityInputBlur = (priceGroup, minQuantity) => {
        setSelectedPriceGroups((prev) =>
            prev.map((pg) =>
                pg.id === priceGroup.id
                    ? {
                          ...pg,
                          quantity: clampQuantity(pg.quantity, minQuantity),
                      }
                    : pg,
            ),
        );
    };

    return (
        <div>
            <h2>{step.name}</h2>
            <p className="step-description">{step.description}</p>
            <div className="price-groups-options">
                {priceGroups.map((priceGroup) => {
                    const selected = selectedPriceGroups.find((pg) => pg.id === priceGroup.id);

                    return (
                        <div
                            className={`price-group-option ${selected ? "selected" : ""}`}
                            key={priceGroup.id}
                            onClick={() => handlePriceGroupClick(priceGroup)}
                        >
                            {priceGroup.image && (
                                <div className="option-image-container">
                                    <img
                                        className="option-image"
                                        src={priceGroup.image}
                                        alt={`${priceGroup.name} image`}
                                    />
                                </div>
                            )}
                            {selected && (
                                <div className="check-mark">
                                    <CheckMark />
                                </div>
                            )}
                            <p className="price-group-option-name">{priceGroup.name}</p>
                            <div className="price-group-option-bottom">
                                {!selected && <button className="select-button">Vælg gaveshop</button>}
                                {selected && (
                                    <div
                                        className="quantity-stepper"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            type="button"
                                            className="quantity-left"
                                            onClick={() => handlePriceGroupQuantityChange(priceGroup, -1, priceGroup.min_quantity)}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="lucide lucide-minus-icon lucide-minus"
                                            >
                                                <path d="M5 12h14" />
                                            </svg>
                                        </button>
                                        <input
                                            className="quantity-stepper-value"
                                            type="number"
                                            min={priceGroup.min_quantity}
                                            max={999}
                                            value={selected ? selected.quantity : priceGroup.min_quantity}
                                            onChange={(e) => handlePriceGroupQuantityInputChange(priceGroup, e.target.value, priceGroup.min_quantity)}
                                            onBlur={() => handlePriceGroupQuantityInputBlur(priceGroup, priceGroup.min_quantity)}
                                        />
                                        <button
                                            type="button"
                                            className="quantity-right"
                                            onClick={() => handlePriceGroupQuantityChange(priceGroup, 1, priceGroup.min_quantity)}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="lucide lucide-plus-icon lucide-plus"
                                            >
                                                <path d="M5 12h14" />
                                                <path d="M12 5v14" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                                <a
                                    className="view-selection-button"
                                    href={priceGroup.url}
                                    target="_blank"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Se gaverne
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function Step2({ step }) {
    const packingOptions = useArtifactValue(packingOptionsArtifact);
    const [selectedPackingOption, setSelectedPackingOption] = useArtifact(selectedPackingOptionArtifact);

    return (
        <div>
            <h2>{step.name}</h2>
            <p className="step-description">{step.description}</p>
            <div className="packing-options">
                {packingOptions.map((packingOption) => (
                    <div
                        className={`option ${selectedPackingOption?.id === packingOption.id ? "selected" : ""}`}
                        key={packingOption.id}
                        onClick={() => setSelectedPackingOption(packingOption)}
                    >
                        {selectedPackingOption?.id === packingOption.id && (
                            <div className="check-mark">
                                <CheckMark />
                            </div>
                        )}
                        <div>
                            <p className="packing-option-name">{packingOption.name}</p>
                            {packingOption.description && (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: packingOption.description,
                                    }}
                                ></div>
                            )}
                        </div>
                        {packingOption.price_text && <p className="packing-option-price">{packingOption.price_text}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}

function Step3({ step }) {
    const deliveryMethods = useArtifactValue(deliveryMethodsArtifact);
    const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useArtifact(selectedDeliveryMethodArtifact);

    return (
        <div>
            <h2>{step.name}</h2>
            <p className="step-description">{step.description}</p>
            <div className="delivery-methods-options">
                {deliveryMethods.map((deliveryMethod) => (
                    <div
                        className={`option ${selectedDeliveryMethod?.id === deliveryMethod.id ? "selected" : ""}`}
                        key={deliveryMethod.id}
                        onClick={() => setSelectedDeliveryMethod(deliveryMethod)}
                    >
                        {selectedDeliveryMethod?.id === deliveryMethod.id && (
                            <div className="check-mark">
                                <CheckMark />
                            </div>
                        )}
                        <div>
                            <p className="delivery-method-name">{deliveryMethod.name}</p>
                            {deliveryMethod.description && (
                                <div
                                    className="delivery-method-description"
                                    dangerouslySetInnerHTML={{
                                        __html: deliveryMethod.description,
                                    }}
                                ></div>
                            )}
                        </div>
                        <div>{deliveryMethod.price_text && <p className="delivery-method-price">{deliveryMethod.price_text}</p>}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Step4({ step }) {
    const deliverydates = useArtifactValue(deliveryDatesArtifact);
    const [selectedDeliveryDate, setSelectedDeliveryDate] = useArtifact(selectedDeliveryDateArtifact);

    return (
        <div>
            <h2>{step.name}</h2>
            <p className="step-description">{step.description}</p>
            <div className="delivery-dates-options">
                {deliverydates.map((deliverydate) => (
                    <div
                        className={`option ${selectedDeliveryDate?.id === deliverydate.id ? "selected" : ""}`}
                        key={deliverydate.id}
                        onClick={() => setSelectedDeliveryDate(deliverydate)}
                    >
                        {selectedDeliveryDate?.id === deliverydate.id && (
                            <div className="check-mark">
                                <CheckMark />
                            </div>
                        )}
                        <p className="delivery-date-week">Uge {formatWeekNumber(deliverydate.week_number, deliverydate.delivery_date_timestamp)}</p>
                        <p>Vi leverer julegaverne i uge {deliverydate.week_number}.</p>
                        <p>
                            Dine kollegaer skal have valgt julegaver senest den <b>{deliverydate.order_date}</b>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Step5({ step }) {
    const [info, setInfo] = useArtifact(infoArtifact);

    const handleInfoChange = (key, value) => {
        setInfo((prev) => ({ ...prev, [key]: value }));
    };

    const handleBlurTrim = (key) => {
        setInfo((prev) => ({ ...prev, [key]: prev[key].trim() }));
    };

    return (
        <div className="input-container-column">
            <h2>{step.name}</h2>
            <p className="step-description">{step.description}</p>

            <div className="input-container required">
                <label htmlFor="company-name">Firmanavn</label>
                <input
                    id="company-name"
                    value={info.companyName}
                    onChange={(e) => handleInfoChange("companyName", e.target.value)}
                    onBlur={() => handleBlurTrim("companyName")}
                    className={`company-name-input input-field ${info.companyName ? "has-value" : ""}`}
                    type="text"
                    data-1p-ignore="true"
                    required
                />
            </div>

            <div className="input-container required">
                <label htmlFor="address">Adresse</label>
                <input
                    id="address"
                    value={info.address}
                    onChange={(e) => handleInfoChange("address", e.target.value)}
                    onBlur={() => handleBlurTrim("address")}
                    className={`address-input input-field ${info.address ? "has-value" : ""} ${info.address && validateNumber(info.address) ? "invalid" : ""}`}
                    type="text"
                    data-1p-ignore="true"
                    required
                />
            </div>

            <div className="input-container-row">
                <div className="input-container input-container-small required">
                    <label htmlFor="postal-code">Postnummer</label>
                    <input
                        id="postal-code"
                        value={info.postalCode}
                        onChange={(e) => handleInfoChange("postalCode", e.target.value)}
                        onBlur={() => handleBlurTrim("postalCode")}
                        className={`postal-code-input input-field ${info.postalCode ? "has-value" : ""} ${info.postalCode && !validateNumber(info.postalCode) ? "invalid" : ""}`}
                        type="text"
                        data-1p-ignore="true"
                        required
                    />
                </div>

                <div className="input-container required">
                    <label htmlFor="city">By</label>
                    <input
                        id="city"
                        value={info.city}
                        onChange={(e) => handleInfoChange("city", e.target.value)}
                        onBlur={() => handleBlurTrim("city")}
                        className={`city-input input-field ${info.city ? "has-value" : ""} ${info.city && validateNumber(info.city) ? "invalid" : ""}`}
                        type="text"
                        data-1p-ignore="true"
                        required
                    />
                </div>
            </div>

            <div className="input-container-row">
                <div className="input-container required">
                    <label htmlFor="cvr">CVR</label>
                    <input
                        id="cvr"
                        value={info.cvr}
                        onChange={(e) => handleInfoChange("cvr", e.target.value)}
                        onBlur={() => handleBlurTrim("cvr")}
                        className={`cvr-input input-field ${info.cvr ? "has-value" : ""} ${info.cvr && !validateNumber(info.cvr) ? "invalid" : ""}`}
                        type="text"
                        data-1p-ignore="true"
                        required
                    />
                </div>
                <div className="input-container">
                    <label htmlFor="ean">EAN</label>
                    <input
                        id="ean"
                        value={info.ean}
                        onChange={(e) => handleInfoChange("ean", e.target.value)}
                        onBlur={() => handleBlurTrim("ean")}
                        className={`ean-input input-field ${info.ean ? "has-value" : ""} ${info.ean && !validateNumber(info.ean) ? "invalid" : ""}`}
                        type="text"
                        data-1p-ignore="true"
                    />
                </div>
            </div>

            <div className="input-container required">
                <label htmlFor="contact-person">Kontaktperson</label>
                <input
                    id="contact-person"
                    value={info.contactPerson}
                    onChange={(e) => handleInfoChange("contactPerson", e.target.value)}
                    onBlur={() => handleBlurTrim("contactPerson")}
                    className={`contact-person-input input-field ${info.contactPerson ? "has-value" : ""} ${info.contactPerson && validateNumber(info.contactPerson) ? "invalid" : ""}`}
                    type="text"
                    data-1p-ignore="true"
                    required
                />
            </div>

            <div className="input-container-row">
                <div className="input-container required">
                    <label htmlFor="email">E-mail</label>
                    <input
                        id="email"
                        value={info.email}
                        onChange={(e) => handleInfoChange("email", e.target.value)}
                        onBlur={() => handleBlurTrim("email")}
                        className={`email-input input-field ${info.email ? "has-value" : ""} ${info.email && !validateEmail(info.email) ? "invalid" : ""}`}
                        type="email"
                        data-1p-ignore="true"
                        required
                    />
                </div>
                <div className="input-container required">
                    <label htmlFor="phone-number">Telefonnummer</label>
                    <input
                        id="phone-number"
                        value={info.phoneNumber}
                        onChange={(e) => handleInfoChange("phoneNumber", e.target.value)}
                        onBlur={() => handleBlurTrim("phoneNumber")}
                        className={`phone-number-input input-field ${info.phoneNumber ? "has-value" : ""} ${info.phoneNumber && !validateNumber(info.phoneNumber) ? "invalid" : ""}`}
                        type="text"
                        data-1p-ignore="true"
                        required
                    />
                </div>
            </div>
        </div>
    );
}

function Step6({ step }) {
    const selectedPriceGroups = useArtifactValue(selectedPriceGroupsArtifact);
    const selectedDeliveryMethod = useArtifactValue(selectedDeliveryMethodArtifact);
    const selectedDeliveryDate = useArtifactValue(selectedDeliveryDateArtifact);
    const selectedPackingOption = useArtifactValue(selectedPackingOptionArtifact);
    const info = useArtifactValue(infoArtifact);

    const getDeliveryTotal = (totalCards) => {
        const deliveryPrice = Number(selectedDeliveryMethod?.price) || 0;

        if (selectedDeliveryMethod?.price_calc === "fixed") {
            return deliveryPrice;
        }

        if (selectedDeliveryMethod?.price_calc === "each") {
            return deliveryPrice * totalCards;
        }

        return 0;
    };

    const rows = selectedPriceGroups.map((priceGroup) => {
        const unitValue = parsePriceFromName(priceGroup.name);
        return {
            id: priceGroup.id,
            name: priceGroup.name,
            quantity: priceGroup.quantity,
            unitValue,
            lineTotal: unitValue * priceGroup.quantity,
        };
    });

    const calcPrice = (price, x, quantity) => {
        // if x is a percentage, multiply the price by the percentage
        if (x.includes("%")) {
            return Number(price * (Number(x.replace("%", "")) / 100));
        }

        // if x is a fixed price, return the price
        return Number(x) * Number(quantity);
    };

    const totalCards = rows.reduce((sum, row) => sum + row.quantity, 0);
    const giftCardSubtotal = rows.reduce((sum, row) => sum + row.lineTotal, 0);
    const subtotal = giftCardSubtotal + getDeliveryTotal(totalCards);

    let packingOptionPrice = 0;
    if (selectedPackingOption) {
        packingOptionPrice = calcPrice(giftCardSubtotal, selectedPackingOption?.price_calc, totalCards);
    }

    const total = subtotal + packingOptionPrice;

    return (
        <div className="order-summary">
            <h2>{step.name}</h2>
            <p className="step-description">{step.description}</p>

            <table className="summary-table">
                <thead>
                    <tr>
                        <th>Vare</th>
                        <th>Antal</th>
                        <th>Stykpris</th>
                        <th>Pris</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id}>
                            <td>Gavekode {row.name}</td>
                            <td>{row.quantity}</td>
                            <td>{formatPrice(row.unitValue)}</td>
                            <td>{formatPrice(row.lineTotal)}</td>
                        </tr>
                    ))}
                    {selectedPackingOption && (
                        <tr>
                            <td>Gaveindpakning — {selectedPackingOption.name}</td>
                            <td>{totalCards > 0 ? totalCards : "—"}</td>
                            <td>{totalCards > 0 ? formatPrice(packingOptionPrice / totalCards) : "—"}</td>
                            <td>{formatPrice(packingOptionPrice)}</td>
                        </tr>
                    )}
                    {selectedDeliveryMethod && (
                        <tr>
                            <td>Gavekodelevering — {selectedDeliveryMethod.name}</td>
                            <td>{totalCards > 0 ? totalCards : "—"}</td>
                            <td>{formatPrice(selectedDeliveryMethod?.price)}</td>
                            <td>{formatPrice(getDeliveryTotal(totalCards))}</td>
                        </tr>
                    )}
                    <tr>
                        <td>Pakkelevering</td>
                        <td>-</td>
                        <td>-</td>
                        <td>Se note</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={3}>Total</td>
                        <td>{formatPrice(total)}</td>
                    </tr>
                </tfoot>
            </table>

            <div className="summary-details">
                <div className="summary-block">
                    <h3>Leveringstidspunkt</h3>
                    {selectedDeliveryDate ? (
                        <>
                            <p>
                                Vi leverer julegaverne i <b>uge {formatWeekNumber(selectedDeliveryDate.week_number, selectedDeliveryDate.delivery_date_timestamp)}</b>
                            </p>
                            <p>
                                Dine kollegaer skal have valgt julegaver senest den <b>{selectedDeliveryDate.order_date}</b>
                            </p>
                            <div className="delivery-date-note-container">
                                <p className="delivery-date-note-title">Note:</p>
                                <p className="delivery-date-note">{selectedDeliveryDate.note}</p>
                            </div>
                        </>
                    ) : (
                        <p>Ikke valgt</p>
                    )}
                </div>

                <div className="summary-block">
                    <h3>Dine oplysninger</h3>
                    <dl className="summary-list">
                        <div>
                            <dt>E-mail</dt>
                            <dd>{info.email || "—"}</dd>
                        </div>
                        <div>
                            <dt>Firmanavn</dt>
                            <dd>{info.companyName || "—"}</dd>
                        </div>
                        <div>
                            <dt>CVR</dt>
                            <dd>{info.cvr || "—"}</dd>
                        </div>
                        <div>
                            <dt>EAN</dt>
                            <dd>{info.ean || "—"}</dd>
                        </div>
                        <div>
                            <dt>Telefonnummer</dt>
                            <dd>{info.phoneNumber || "—"}</dd>
                        </div>
                        <div>
                            <dt>Adresse</dt>
                            <dd>{info.address || "—"}</dd>
                        </div>
                        <div>
                            <dt>Postnummer</dt>
                            <dd>{info.postalCode || "—"}</dd>
                        </div>
                        <div>
                            <dt>By</dt>
                            <dd>{info.city || "—"}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}

function parsePriceFromName(name) {
    const match = String(name).replace(/\./g, "").match(/\d+/);
    return match ? Number(match[0]) : 0;
}

function formatPrice(value) {
    return `${Number(value).toLocaleString("da-DK")} kr.`;
}

function CheckMark() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-check-icon lucide-check"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}
