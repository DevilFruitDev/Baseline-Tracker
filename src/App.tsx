import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { SessionEntry } from './components/SessionEntry';
import { seedInitialData } from './utils/seedData';

type View = 'dashboard' | 'new-session' | 'edit-session';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingSessionId, setEditingSessionId] = useState<string | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Seed initial data on first load
    seedInitialData();
  }, []);

  const handleNewSession = () => {
    setEditingSessionId(undefined);
    setCurrentView('new-session');
  };

  const handleEditSession = (sessionId: string) => {
    setEditingSessionId(sessionId);
    setCurrentView('edit-session');
  };

  const handleSaveSession = () => {
    setCurrentView('dashboard');
    setEditingSessionId(undefined);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCancelSession = () => {
    setCurrentView('dashboard');
    setEditingSessionId(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {currentView === 'dashboard' && (
        <Dashboard
          onNewSession={handleNewSession}
          onEditSession={handleEditSession}
          refreshTrigger={refreshTrigger}
        />
      )}

      {(currentView === 'new-session' || currentView === 'edit-session') && (
        <SessionEntry
          sessionId={editingSessionId}
          onCancel={handleCancelSession}
          onSave={handleSaveSession}
        />
      )}
    </div>
  );
}

export default App;
