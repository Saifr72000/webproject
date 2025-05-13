import React from "react";
import "./StudyStepper.css";

const StudyStepper = ({
  currentStep,
  totalSteps,
  includeDemographics = true,
}) => {
  // The total number of steps includes the questions plus demographics (if enabled)
  // We don't need to add an extra step since demographics should replace step totalSteps + 1
  const adjustedTotalSteps = includeDemographics ? totalSteps + 1 : totalSteps;

  return (
    <div className="study-stepper">
      <div className="stepper-track">
        {/* Create dots for all steps (questions + demographics if enabled) */}
        {Array(totalSteps + (includeDemographics ? 1 : 0))
          .fill()
          .map((_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <React.Fragment key={stepNumber}>
                {index > 0 && (
                  <div
                    className={`stepper-line ${
                      isCompleted || (isActive && index === currentStep - 1)
                        ? "completed"
                        : ""
                    }`}
                  />
                )}
                <div
                  className={`stepper-dot ${
                    isActive ? "active" : isCompleted ? "completed" : ""
                  }`}
                />
              </React.Fragment>
            );
          })}
      </div>
      <div className="stepper-text">
        {currentStep <= totalSteps
          ? `Question ${currentStep} of ${totalSteps}`
          : "Demographics"}
      </div>
    </div>
  );
};

export default StudyStepper;
