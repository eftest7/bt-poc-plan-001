import { useState } from 'react';
import SolutionSelector from './components/SolutionSelector';
import UseCaseCollector from './components/UseCaseCollector';
import DocumentGenerator from './components/DocumentGenerator';
import Header from './components/Header';
import StepIndicator from './components/StepIndicator';
import './App.css';

const STEPS = [
  { id: 1, label: 'Select Solutions', description: 'Choose BeyondTrust products' },
  { id: 2, label: 'Define Use Cases', description: 'Select your specific needs' },
  { id: 3, label: 'Review & Export', description: 'Generate your POC plan' }
];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSolutions, setSelectedSolutions] = useState([]);
  const [selectedUseCases, setSelectedUseCases] = useState({});
  const [customUseCases, setCustomUseCases] = useState({});
  const [customerInfo, setCustomerInfo] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    seName: '',
    pocStartDate: '',
    pocEndDate: ''
  });

  const handleSolutionSelect = (solutions) => {
    setSelectedSolutions(solutions);
    // Clear use cases for deselected solutions
    const newSelectedUseCases = {};
    const newCustomUseCases = {};
    solutions.forEach(sol => {
      if (selectedUseCases[sol.id]) {
        newSelectedUseCases[sol.id] = selectedUseCases[sol.id];
      }
      if (customUseCases[sol.id]) {
        newCustomUseCases[sol.id] = customUseCases[sol.id];
      }
    });
    setSelectedUseCases(newSelectedUseCases);
    setCustomUseCases(newCustomUseCases);
  };

  const handleUseCaseSelect = (solutionId, useCaseId, isSelected) => {
    setSelectedUseCases(prev => {
      const solutionUseCases = prev[solutionId] || [];
      if (isSelected) {
        return { ...prev, [solutionId]: [...solutionUseCases, useCaseId] };
      } else {
        return { ...prev, [solutionId]: solutionUseCases.filter(id => id !== useCaseId) };
      }
    });
  };

  const handleCustomUseCaseChange = (solutionId, text) => {
    setCustomUseCases(prev => ({ ...prev, [solutionId]: text }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return selectedSolutions.length > 0;
    }
    if (currentStep === 2) {
      // At least one use case selected for any solution
      return Object.values(selectedUseCases).some(cases => cases.length > 0) ||
        Object.values(customUseCases).some(text => text.trim().length > 0);
    }
    return true;
  };

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <div className="container">
          <StepIndicator steps={STEPS} currentStep={currentStep} />

          <div className="step-content fade-in" key={currentStep}>
            {currentStep === 1 && (
              <SolutionSelector
                selectedSolutions={selectedSolutions}
                onSelect={handleSolutionSelect}
              />
            )}

            {currentStep === 2 && (
              <UseCaseCollector
                solutions={selectedSolutions}
                selectedUseCases={selectedUseCases}
                customUseCases={customUseCases}
                onUseCaseSelect={handleUseCaseSelect}
                onCustomUseCaseChange={handleCustomUseCaseChange}
              />
            )}

            {currentStep === 3 && (
              <DocumentGenerator
                solutions={selectedSolutions}
                selectedUseCases={selectedUseCases}
                customUseCases={customUseCases}
                customerInfo={customerInfo}
                onCustomerInfoChange={setCustomerInfo}
              />
            )}
          </div>

          <div className="navigation-buttons">
            {currentStep > 1 && (
              <button className="btn btn-secondary" onClick={handleBack}>
                ← Back
              </button>
            )}
            {currentStep < 3 && (
              <button
                className="btn btn-primary btn-lg"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Continue →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
