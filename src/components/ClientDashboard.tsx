import { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/mockDatabase';
import { Transaction } from '../types';

export function ClientDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    const allTxns = await db.getTransactionsByUser(user.id);
    const pending = await db.getPendingTransactionsForClient(user.id);

    setTransactions(allTxns);
    setPendingTransactions(pending);
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

  const handleTransactionAction = async (transactionId: string, action: 'success' | 'rejected') => {
    const transaction = pendingTransactions.find(t => t.id === transactionId);
    if (!transaction || !user) return;

    if (action === 'success') {
      const merchant = await db.getUserById(transaction.merchantId);
      if (merchant) {
        await db.updateUserBalance(user.id, user.accountBalance - transaction.amount);
        await db.updateUserBalance(merchant.id, merchant.accountBalance + transaction.amount);
      }
    }

    await db.updateTransaction(transactionId, { status: action });
  };

  const getMerchantName = async (merchantId: string) => {
    const merchant = await db.getUserById(merchantId);
    return merchant?.fullName || 'Unknown Merchant';
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDU5LDEzMCwyNDYsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user.fullName}</h1>
            <p className="text-slate-400">Manage your payments and transactions</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Available Balance</p>
                  <h2 className="text-4xl font-bold text-white">${user.accountBalance.toFixed(2)}</h2>
                </div>
              </div>
              <button
                onClick={loadData}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="flex gap-4 mt-6">
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 text-white mb-1">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm">Spent Today</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  ${transactions
                    .filter(t => t.status === 'success' && new Date(t.createdAt).toDateString() === new Date().toDateString())
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 text-white mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Transactions</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {transactions.filter(t => t.status === 'success').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">Account Type</p>
                <p className="text-white font-semibold capitalize">{user.userType}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Pending Requests</p>
                <p className="text-white font-semibold">{pendingTransactions.length}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Member Since</p>
                <p className="text-white font-semibold">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {pendingTransactions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Pending Payment Requests</h2>
            <div className="space-y-4">
              {pendingTransactions.map((transaction) => (
                <PendingTransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onApprove={() => handleTransactionAction(transaction.id, 'success')}
                  onReject={() => handleTransactionAction(transaction.id, 'rejected')}
                  getMerchantName={getMerchantName}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Transaction History</h2>
          {loading ? (
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 text-center">
              <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-2" />
              <p className="text-slate-400">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-400">No transactions yet</p>
            </div>
          ) : (
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-left py-4 px-6 text-slate-400 font-semibold text-sm">Transaction ID</th>
                      <th className="text-left py-4 px-6 text-slate-400 font-semibold text-sm">Merchant</th>
                      <th className="text-left py-4 px-6 text-slate-400 font-semibold text-sm">Description</th>
                      <th className="text-right py-4 px-6 text-slate-400 font-semibold text-sm">Amount</th>
                      <th className="text-center py-4 px-6 text-slate-400 font-semibold text-sm">Status</th>
                      <th className="text-right py-4 px-6 text-slate-400 font-semibold text-sm">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {transactions.map((transaction) => (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        getMerchantName={getMerchantName}
                        getStatusIcon={getStatusIcon}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PendingTransactionCard({
  transaction,
  onApprove,
  onReject,
  getMerchantName
}: {
  transaction: Transaction;
  onApprove: () => void;
  onReject: () => void;
  getMerchantName: (id: string) => Promise<string>;
}) {
  const [merchantName, setMerchantName] = useState('Loading...');

  useEffect(() => {
    getMerchantName(transaction.merchantId).then(setMerchantName);
  }, [transaction.merchantId]);

  return (
    <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-6 animate-pulse-slow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">Payment Request</span>
          </div>
          <p className="text-white text-2xl font-bold">${transaction.amount.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-sm">From</p>
          <p className="text-white font-semibold">{merchantName}</p>
        </div>
      </div>
      {transaction.description && (
        <p className="text-slate-300 mb-4">{transaction.description}</p>
      )}
      <div className="flex gap-3">
        <button
          onClick={onApprove}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          Approve Payment
        </button>
        <button
          onClick={onReject}
          className="px-6 py-3 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2"
        >
          <XCircle className="w-5 h-5" />
          Reject
        </button>
      </div>
    </div>
  );
}

function TransactionRow({
  transaction,
  getMerchantName,
  getStatusIcon,
  getStatusColor
}: {
  transaction: Transaction;
  getMerchantName: (id: string) => Promise<string>;
  getStatusIcon: (status: string) => JSX.Element | null;
  getStatusColor: (status: string) => string;
}) {
  const [merchantName, setMerchantName] = useState('Loading...');

  useEffect(() => {
    getMerchantName(transaction.merchantId).then(setMerchantName);
  }, [transaction.merchantId]);

  return (
    <tr className="hover:bg-slate-800/30 transition-colors">
      <td className="py-4 px-6">
        <span className="font-mono text-slate-300 text-sm">{transaction.transactionId}</span>
      </td>
      <td className="py-4 px-6 text-white">{merchantName}</td>
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
  );
}
