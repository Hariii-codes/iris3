import { useState, useEffect } from 'react';
import { Store, TrendingUp, DollarSign, CreditCard, LogOut, Search, Filter, Calendar, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/mockDatabase';
import { Transaction, MerchantSettings } from '../types';
import { generateTransactionId } from '../utils/crypto';

export function MerchantDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<MerchantSettings | null>(null);
  const [showPOS, setShowPOS] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    const txns = await db.getTransactionsByUser(user.id);
    const merchantSettings = await db.getMerchantSettings(user.id);

    setTransactions(txns);
    setSettings(merchantSettings);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const unsubscribe = db.subscribe(() => {
      loadData();
      refreshUser();
    });

    return unsubscribe;
  }, [user]);

  const todayTransactions = transactions.filter(
    t => t.status === 'success' && new Date(t.createdAt).toDateString() === new Date().toDateString()
  );

  const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.amount, 0);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'failed':
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400 bg-green-400/10';
      case 'failed':
      case 'rejected':
        return 'text-red-400 bg-red-400/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      default:
        return 'text-slate-400 bg-slate-400/10';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDE2OCw4NSwyNDcsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{settings?.businessName || 'Merchant Dashboard'}</h1>
            <p className="text-slate-400">Process payments and manage transactions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPOS(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <CreditCard className="w-5 h-5" />
              New Transaction
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <p className="text-purple-100 text-sm">Today's Revenue</p>
            </div>
            <p className="text-3xl font-bold text-white">${todayRevenue.toFixed(2)}</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-slate-400 text-sm">Transactions</p>
            </div>
            <p className="text-3xl font-bold text-white">{todayTransactions.length}</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-slate-400 text-sm">Account Balance</p>
            </div>
            <p className="text-3xl font-bold text-white">${user.accountBalance.toFixed(2)}</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-slate-400 text-sm">Pending</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {transactions.filter(t => t.status === 'pending').length}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('success')}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                  filterStatus === 'success'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Success
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Pending
              </button>
              <button
                onClick={loadData}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-2" />
              <p className="text-slate-400">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="text-left py-4 px-6 text-slate-400 font-semibold text-sm">Transaction ID</th>
                    <th className="text-left py-4 px-6 text-slate-400 font-semibold text-sm">Description</th>
                    <th className="text-right py-4 px-6 text-slate-400 font-semibold text-sm">Amount</th>
                    <th className="text-center py-4 px-6 text-slate-400 font-semibold text-sm">Status</th>
                    <th className="text-right py-4 px-6 text-slate-400 font-semibold text-sm">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono text-slate-300 text-sm">{transaction.transactionId}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-300">{transaction.description || '—'}</td>
                      <td className="py-4 px-6 text-right text-white font-semibold">
                        ${transaction.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            {transaction.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right text-slate-400 text-sm">
                        {new Date(transaction.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showPOS && <POSModal merchantId={user.id} onClose={() => setShowPOS(false)} />}
    </div>
  );
}

function POSModal({ merchantId, onClose }: { merchantId: string; onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const allUsers = db.getAllUsers();
    setClients(allUsers.filter(u => u.userType === 'client'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !selectedClient || parseFloat(amount) <= 0) {
      setStatus('error');
      setMessage('Please enter a valid amount and select a client');
      return;
    }

    setStatus('processing');
    setMessage('Processing transaction...');

    const transactionId = generateTransactionId();

    await db.createTransaction({
      transactionId,
      clientId: selectedClient,
      merchantId,
      amount: parseFloat(amount),
      status: 'pending',
      description: description || undefined
    });

    setStatus('success');
    setMessage('Payment request sent to client!');

    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const quickAmounts = [10, 25, 50, 100];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">New Transaction</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-2">Select Client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
              required
            >
              <option value="">Choose a client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.fullName} - ${client.accountBalance.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-2xl font-bold focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
            <div className="grid grid-cols-4 gap-2 mt-3">
              {quickAmounts.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm"
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Coffee and pastry"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-xl ${
              status === 'error' ? 'bg-red-500/10 border border-red-500/30 text-red-400' :
              status === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' :
              'bg-blue-500/10 border border-blue-500/30 text-blue-400'
            }`}>
              {message}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={status === 'processing' || status === 'success'}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {status === 'processing' ? 'Processing...' : status === 'success' ? 'Sent!' : 'Send Payment Request'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={status === 'processing'}
              className="px-6 py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
