function UseCaseCollector({
    solutions,
    selectedUseCases,
    customUseCases,
    onUseCaseSelect,
    onCustomUseCaseChange
}) {
    return (
        <div className="use-case-collector">
            <div className="section-header">
                <h2>Define Your Use Cases & Success Criteria</h2>
                <p>Select the specific use cases you want to validate during the POC. Each selected use case becomes part of your success criteria.</p>
            </div>

            {solutions.length === 0 && (
                <div className="empty-state-message" style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>
                    <p>Please select at least one solution above to see available use cases.</p>
                </div>
            )}

            {solutions.map((solution) => (
                <div key={solution.id} className="use-case-section glass-card">
                    <div className="use-case-header">
                        <span className="solution-icon">{solution.icon}</span>
                        <h3>{solution.name}</h3>
                    </div>

                    <div className="use-case-list">
                        {solution.useCases.map((useCase) => {
                            const isSelected = (selectedUseCases[solution.id] || []).includes(useCase.id);
                            return (
                                <div key={useCase.id} className="use-case-item">
                                    <label className="checkbox-container">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => onUseCaseSelect(solution.id, useCase.id, e.target.checked)}
                                        />
                                        <span className="checkbox-label">{useCase.text}</span>
                                    </label>
                                    {isSelected && useCase.prerequisites && useCase.prerequisites.length > 0 && (
                                        <div className="use-case-prerequisites">
                                            <strong>Prerequisites:</strong>
                                            <ul>
                                                {useCase.prerequisites.map((prereq, index) => (
                                                    <li key={index}>{prereq}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="custom-use-case">
                        <label>Additional use cases or requirements:</label>
                        <textarea
                            placeholder="Describe any additional use cases specific to your environment..."
                            value={customUseCases[solution.id] || ''}
                            onChange={(e) => onCustomUseCaseChange(solution.id, e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default UseCaseCollector;
