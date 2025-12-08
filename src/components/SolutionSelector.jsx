import solutionsData from '../data/solutions.json';

function SolutionSelector({ selectedSolutions, onSelect }) {
    const { solutions } = solutionsData;

    const handleCardClick = (solution) => {
        const isSelected = selectedSolutions.some(s => s.id === solution.id);
        if (isSelected) {
            onSelect(selectedSolutions.filter(s => s.id !== solution.id));
        } else {
            onSelect([...selectedSolutions, solution]);
        }
    };

    return (
        <div className="solution-selector">
            <div className="section-header">
                <h2>Select BeyondTrust Solutions</h2>
                <p>Choose the products you want to evaluate in your POC. You can select multiple solutions.</p>
            </div>

            <div className="solutions-grid">
                {solutions.map((solution, index) => {
                    const isSelected = selectedSolutions.some(s => s.id === solution.id);
                    return (
                        <div
                            key={solution.id}
                            className={`glass-card solution-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleCardClick(solution)}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="solution-check">✓</div>
                            <div className="solution-icon">{solution.icon}</div>
                            <h3 className="solution-name">{solution.name}</h3>
                            <p className="solution-description">{solution.description}</p>
                        </div>
                    );
                })}
            </div>

            {selectedSolutions.length > 0 && (
                <div className="selection-summary fade-in">
                    <span className="selection-count">{selectedSolutions.length} solution{selectedSolutions.length > 1 ? 's' : ''} selected</span>
                </div>
            )}
        </div>
    );
}

export default SolutionSelector;
