import React from 'react';

const PageHeader = ({ title, icon, description, actions }) => {
    return (
        <div className="page-header">
            <div className="header-content">
                <h1><span className="page-icon">{icon}</span>{title}</h1>
                {description && <p>{description}</p>}
            </div>
            {actions && (
                <div className="header-actions">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
