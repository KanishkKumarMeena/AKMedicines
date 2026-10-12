import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { medicines, transactions, alertMedicines } = useInventory();

  const totalMedicines = medicines.length;
  const lowStockCount = alertMedicines.length;
  const totalUnits = medicines.reduce((acc, m) => acc + (m.currentStock > 0 ? m.currentStock : 0), 0);
  const totalTransactions = transactions.length;

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Overview of NGO medicine stock and recent ledger activity.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/transactions"
            className="bg-[#00171f] hover:bg-[#05383b] text-white text-sm px-3.5 py-2 rounded font-medium shadow-xs"
          >
            + Log Transaction
          </Link>
          <Link
            to="/inventory"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-3.5 py-2 rounded font-medium"
          >
            View Inventory
          </Link>
        </div>
      </div>

      {/* Warning Box */}
      {lowStockCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-3.5 rounded mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-sm">
          <div>
            <strong>Low Stock Alert:</strong> {lowStockCount} medicine(s) are currently running low or out of stock.
          </div>
          <Link to="/alerts" className="text-[#00171f] hover:text-[#05383b] hover:underline font-semibold shrink-0">
            View Stock Alerts &rarr;
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs">
          <div className="text-gray-500 text-xs font-semibold uppercase">Total Medicines</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{totalMedicines}</div>
          <div className="text-xs text-gray-500 mt-1">Unique brands recorded</div>
        </div>

        <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs">
          <div className="text-gray-500 text-xs font-semibold uppercase">Low Stock Items</div>
          <div className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {lowStockCount}
          </div>
          <div className="text-xs text-gray-500 mt-1">Below minimum threshold</div>
        </div>

        <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs">
          <div className="text-gray-500 text-xs font-semibold uppercase">Total Units in Stock</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{totalUnits}</div>
          <div className="text-xs text-gray-500 mt-1">Net on-hand quantity</div>
        </div>

        <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs">
          <div className="text-gray-500 text-xs font-semibold uppercase">Total Transactions</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{totalTransactions}</div>
          <div className="text-xs text-gray-500 mt-1">Logged in audit ledger</div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-gray-800">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs text-[#05383b] hover:text-[#00171f] hover:underline font-medium">
            View all ({transactions.length})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse border border-gray-200 min-w-[500px]">
            <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200 whitespace-nowrap">
              <tr>
                <th className="p-2.5 border border-gray-200">Date</th>
                <th className="p-2.5 border border-gray-200">Type</th>
                <th className="p-2.5 border border-gray-200">Medicine</th>
                <th className="p-2.5 border border-gray-200 text-right">Quantity</th>
                <th className="p-2.5 border border-gray-200">Donor / Destination</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => {
                const med = medicines.find((m) => m.id === tx.medicineId);
                const isReceive = tx.type === 'RECEIVE';
                const formattedDate = new Date(tx.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <tr key={tx.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-2.5 border border-gray-200 text-gray-600 text-xs">{formattedDate}</td>
                    <td className="p-2.5 border border-gray-200">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          isReceive ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-2.5 border border-gray-200 font-medium text-gray-800">
                      {med?.name || 'Unknown'}
                    </td>
                    <td
                      className={`p-2.5 border border-gray-200 text-right font-mono font-bold ${
                        isReceive ? 'text-green-700' : 'text-orange-700'
                      }`}
                    >
                      {isReceive ? '+' : '-'}
                      {tx.quantity} {med?.unit || ''}
                    </td>
                    <td className="p-2.5 border border-gray-200 text-gray-600">{tx.sourceOrDest}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
