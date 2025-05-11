import React from "react";
import "./StudyStepper.css";

const StudyStepper = ({
  currentStep,
  totalSteps,
  includeDemographics = true,
}) => {
  // If demographics are included, add one more step to the total
  const adjustedTotalSteps = includeDemographics ? totalSteps + 1 : totalSteps;

  return (
    <div className="study-stepper">
      <div className="stepper-track">
        {Array(adjustedTotalSteps)
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
