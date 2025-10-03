import { useState } from 'react';
import { Eye, CircleUser as UserCircle, Store, ArrowRight } from 'lucide-react';
import { IrisScanner } from './IrisScanner';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const [showScanner, setShowScanner] = useState(false);
  const [selectedType, setSelectedType] = useState<'client' | 'merchant' | null>(null);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleScanComplete = async (irisPattern: string) => {
    const success = await login(irisPattern);
    if (!success) {
      setError('Authentication failed. Please try again.');
      setShowScanner(false);
      setTimeout(() => setError(''), 3000);
    }
  };

  const startAuthentication = (type: 'client' | 'merchant') => {
    setSelectedType(type);
    setShowScanner(true);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDU5LDEzMCwyNDYsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-20" />

      <div className="max-w-5xl w-full relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl">
            <Eye className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Iris Payment System
          </h1>
          <p className="text-slate-400 text-lg">
            Frictionless payments powered by biometric authentication
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center animate-shake">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => startAuthentication('client')}
            className="group relative bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-300" />
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <UserCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Client Login</h3>
              <p className="text-slate-400 mb-4">
                Access your account, view transactions, and approve payments
              </p>
              <div className="flex items-center text-blue-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                Authenticate with Iris
                <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </div>
          </button>

          <button
            onClick={() => startAuthentication('merchant')}
            className="group relative bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 rounded-2xl transition-all duration-300" />
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Merchant Login</h3>
              <p className="text-slate-400 mb-4">
                Process payments, manage transactions, and track analytics
              </p>
              <div className="flex items-center text-purple-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                Authenticate with Iris
                <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </div>
          </button>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
          <h4 className="text-white font-semibold mb-3">Demo Credentials</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="text-slate-400">
                <span className="text-blue-400 font-semibold">Client 1:</span> Alice Johnson
              </p>
              <p className="text-slate-400">
                <span className="text-blue-400 font-semibold">Client 2:</span> Bob Smith
              </p>
            </div>
            <div>
              <p className="text-slate-400">
                <span className="text-purple-400 font-semibold">Merchant:</span> City Café
              </p>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-4">
            In demo mode, the iris scanner will randomly select one of the available users
          </p>
        </div>
      </div>

      {showScanner && (
        <IrisScanner
          onScanComplete={handleScanComplete}
          onCancel={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
