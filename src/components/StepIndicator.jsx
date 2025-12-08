import './StepIndicator.css';

function StepIndicator({ steps, currentStep }) {
    return (
        <div className="step-indicator">
            {steps.map((step, index) => (
                <div
                    key={step.id}
                    className={`step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                >
                    <div className="step-number">
                        {currentStep > step.id ? '✓' : step.id}
                    </div>
                    <div className="step-info">
                        <span className="step-label">{step.label}</span>
                        <span className="step-description">{step.description}</span>
                    </div>
                    {index < steps.length - 1 && <div className="step-connector" />}
                </div>
            ))}
        </div>
    );
}

export default StepIndicator;
