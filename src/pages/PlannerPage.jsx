import { useState, useEffect } from 'react';
import { getFullSolutionsData } from '../services/dataService';
import SolutionSelector from '../components/SolutionSelector';
import UseCaseCollector from '../components/UseCaseCollector';
import DocumentGenerator from '../components/DocumentGenerator';

function PlannerPage() {
    const [solutions, setSolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSolutions, setSelectedSolutions] = useState([]);
    const [selectedUseCases, setSelectedUseCases] = useState({});
    const [customUseCases, setCustomUseCases] = useState({});
    const [customerInfo, setCustomerInfo] = useState({
        companyName: '',
        pocStartDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadSolutions();
    }, []);

    const loadSolutions = async () => {
        setLoading(true);
        const result = await getFullSolutionsData();
        if (result.success) {
            setSolutions(result.solutions);
        }
        setLoading(false);
    };

    const handleSolutionSelect = (selected) => {
        setSelectedSolutions(selected);
        // Clear use cases for deselected solutions
        const newSelectedUseCases = {};
        const newCustomUseCases = {};
        selected.forEach(sol => {
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

    if (loading) {
        return (
            <div className="planner-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading solutions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="planner-page">
            <h1 className="page-title">POC Planner</h1>

            {/* Section 1: Solution Selector */}
            <section className="page-section fade-in">
                <SolutionSelector
                    solutions={solutions}
                    selectedSolutions={selectedSolutions}
                    onSelect={handleSolutionSelect}
                />
            </section>

            {/* Section 2: Use Case Collector */}
            <section className="page-section fade-in">
                <UseCaseCollector
                    solutions={selectedSolutions}
                    selectedUseCases={selectedUseCases}
                    customUseCases={customUseCases}
                    onUseCaseSelect={handleUseCaseSelect}
                    onCustomUseCaseChange={handleCustomUseCaseChange}
                />
            </section>

            {/* Section 3: Document Generator */}
            <section className="page-section fade-in">
                <DocumentGenerator
                    solutions={selectedSolutions}
                    selectedUseCases={selectedUseCases}
                    customUseCases={customUseCases}
                    customerInfo={customerInfo}
                    onCustomerInfoChange={setCustomerInfo}
                />
            </section>
        </div>
    );
}

export default PlannerPage;
