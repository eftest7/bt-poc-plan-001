import { useState } from 'react';
import Header from './components/Header';
import BottomTabs from './components/BottomTabs';
import PlannerPage from './pages/PlannerPage';
import SolutionsPage from './pages/SolutionsPage';
import UseCasesPage from './pages/UseCasesPage';
import PrereqsPage from './pages/PrereqsPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigate = (page) => {
    setCurrentPage(page);
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'planner':
        return <PlannerPage />;
      case 'solutions':
        return <SolutionsPage />;
      case 'usecases':
        return <UseCasesPage />;
      case 'prereqs':
        return <PrereqsPage />;
      case 'dashboard':
        return <DashboardPage />;
      default:
        return <PlannerPage />;
    }
  };

  return (
    <div className="app">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="main-content">
        <div className="container">
          {renderPage()}
        </div>
      </main>
      <BottomTabs currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
