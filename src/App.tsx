import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { ClientDashboard } from './components/ClientDashboard';
import { MerchantDashboard } from './components/MerchantDashboard';

function AppContent() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <LoginScreen />;
  }

  if (user.userType === 'client') {
    return <ClientDashboard />;
  }

  return <MerchantDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
