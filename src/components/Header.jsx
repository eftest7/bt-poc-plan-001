import './Header.css';

function Header() {
    return (
        <header className="header">
            <div className="container header-content">
                <div className="logo">
                    <span className="logo-icon">🔐</span>
                    <span className="logo-text">BeyondTrust POC Planner</span>
                </div>
                <p className="header-tagline">Build your proof of concept success plan</p>
            </div>
        </header>
    );
}

export default Header;
