import { useState, useEffect } from 'react';
import { getFullSolutionsData } from '../services/dataService';
import SolutionSelector from '../components/SolutionSelector';
import UseCaseCollector from '../components/UseCaseCollector';
import DocumentGenerator from '../components/DocumentGenerator';
import PageHeader from '../components/common/PageHeader';

import './ManagementPage.css';
import './PlannerPage.css';

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

    const handleNewPlan = () => {
        console.log('Start New Plan clicked');
        if (window.confirm('Are you sure you want to start a new plan? This will clear all current selections and entries.')) {
            setSelectedSolutions([]);
            setSelectedUseCases({});
            setCustomUseCases({});
            setCustomerInfo({
                companyName: '',
                pocStartDate: new Date().toISOString().split('T')[0]
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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
            <PageHeader
                icon="📝"
                title="POC Planner"
                description="Plan your POC by selecting solutions and use cases."
            />

            {/* Section 1: Solution Selector */}
            <section className="page-section fade-in">
                <SolutionSelector
                    solutions={solutions}
                    selectedSolutions={selectedSolutions}
                    onSelect={handleSolutionSelect}
                />
            </section>

            <div className="section-divider"></div>

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

            <div className="section-divider"></div>

            {/* Section 3: Document Generator */}
            <section className="page-section fade-in">
                <DocumentGenerator
                    solutions={selectedSolutions}
                    selectedUseCases={selectedUseCases}
                    customUseCases={customUseCases}
                    customerInfo={customerInfo}
                    onCustomerInfoChange={setCustomerInfo}
                    onNewPlan={handleNewPlan}
                />
            </section>


        </div>
    );
}

export default PlannerPage;
