import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { PublicPortal } from './components/portal/PublicPortal';
import { AuditorApp } from './components/auditor/AuditorApp';
import { ManagerPortal } from './components/manager/ManagerPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { YouthSecretaryPortal } from './components/youth_secretary/YouthSecretaryPortal';
import { StudentHub } from './components/student/StudentHub';

const MainContent: React.FC = () => {
  const { activeView } = useApp();

  return (
    <main className="min-h-[calc(100vh-140px)]">
      {activeView === 'portal' && <PublicPortal />}
      {activeView === 'auditor' && <AuditorApp />}
      {activeView === 'manager' && <ManagerPortal />}
      {activeView === 'admin' && <AdminPortal />}
      {activeView === 'secretary' && <YouthSecretaryPortal />}
      {activeView === 'student' && <StudentHub />}
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-red-600 selection:text-white">
        <div>
          <Header />
          <MainContent />
        </div>
        <Footer />
      </div>
    </AppProvider>
  );
};

export default App;
