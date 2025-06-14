import React from "react";
import "./CheckoutStepper.css";

interface CheckoutStepperProps {
  step: 1 | 2;
  onGoToStep1?: () => void;
}

const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ step, onGoToStep1 }) => {
  return (
    <div className="checkout-stepper">
      <div className={`stepper-step${step === 1 ? " active" : step > 1 ? " completed" : ""}`}
        onClick={step === 2 && onGoToStep1 ? onGoToStep1 : undefined}
        style={step === 2 && onGoToStep1 ? { cursor: "pointer" } : {}}>
        <span className="stepper-circle">1</span>
        <span className="stepper-label">Método de pago</span>
      </div>
      <div className={`stepper-line${step === 2 ? " active" : ""}`}></div>
      <div className={`stepper-step${step === 2 ? " active" : ""}`}>
        <span className="stepper-circle">2</span>
        <span className="stepper-label">Resumen</span>
      </div>
    </div>
  );
};

export default CheckoutStepper;
