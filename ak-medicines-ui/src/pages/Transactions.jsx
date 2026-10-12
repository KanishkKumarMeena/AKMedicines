import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';

export default function Transactions() {
  const { medicines, transactions, addTransaction } = useInventory();

  // Form State
  const [type, setType] = useState('RECEIVE'); // 'RECEIVE' or 'DISPENSE'
  const [medicineId, setMedicineId] = useState(medicines[0]?.id || '');
  const [quantity, setQuantity] = useState('');
  const [sourceOrDest, setSourceOrDest] = useState('');
  const [message, setMessage] = useState('');

  const selectedMed = medicines.find((m) => m.id === medicineId);
  const currentAvailable = selectedMed?.currentStock || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!medicineId || !quantity || Number(quantity) <= 0) {
      alert('Please select a medicine and enter a valid quantity.');
      return;
    }

    if (type === 'DISPENSE' && Number(quantity) > currentAvailable) {
      const confirmOverdraft = window.confirm(
        `Warning: Dispensing ${quantity} is more than currently available (${currentAvailable}). Do you still want to proceed?`
      );
      if (!confirmOverdraft) return;
    }

    addTransaction({
      medicineId,
      type,
      quantity: Number(quantity),
      sourceOrDest:
        sourceOrDest ||
        (type === 'RECEIVE' ? 'Direct Aid Intake' : 'General Outpatient Clinic'),
    });

    setQuantity('');
    setSourceOrDest('');
    setMessage('Transaction logged successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div>
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-800">Log Transaction</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Form Column */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs">
            <h2 className="text-base font-bold text-gray-800 mb-3 border-b pb-2">
              New Transaction Entry
            </h2>

            {message && (
              <div className="bg-green-100 border border-green-300 text-green-800 text-xs p-2.5 rounded mb-3 font-medium">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Type Switcher */}
              <div>
                <div className="flex gap-2">
                  <label className="flex items-center text-sm gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="txType"
                      value="RECEIVE"
                      checked={type === 'RECEIVE'}
                      onChange={() => setType('RECEIVE')}
                    />
                    <span className="font-medium text-green-700">Receive (Stock In)</span>
                  </label>
                  <label className="flex items-center text-sm gap-1.5 cursor-pointer ml-3">
                    <input
                      type="radio"
                      name="txType"
                      value="DISPENSE"
                      checked={type === 'DISPENSE'}
                      onChange={() => setType('DISPENSE')}
                    />
                    <span className="font-medium text-orange-700">Dispense (Stock Out)</span>
                  </label>
                </div>
              </div>

              {/* Medicine Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Medicine *
                </label>
                <select
                  value={medicineId}
                  onChange={(e) => setMedicineId(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:outline-none focus:border-[#00171f]"
                >
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Current: {m.currentStock} {m.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Quantity ({selectedMed?.unit || 'Units'}) *
                  </label>
                  <span className="text-xs text-gray-500">
                    Available: <strong>{currentAvailable}</strong>
                  </span>
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 50"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#00171f]"
                />
              </div>

              {/* Source or Destination */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {type === 'RECEIVE' ? 'Supplier Name' : 'Clinic / Patient Destination'}
                </label>
                <input
                  type="text"
                  placeholder={type === 'RECEIVE' ? 'e.g. Red Cross Donation' : 'e.g. Mobile Unit Camp #3'}
                  value={sourceOrDest}
                  onChange={(e) => setSourceOrDest(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#00171f]"
                />
              </div>



              <button
                type="submit"
                className={`w-full py-2 px-3 rounded text-white font-medium text-sm shadow-xs cursor-pointer ${type === 'RECEIVE'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-orange-600 hover:bg-orange-700'
                  }`}
              >
                {type === 'RECEIVE' ? 'Record Intake' : 'Record Dispensation'}
              </button>
            </form>
          </div>
        </div>

        {/* History Table Column */}
        <div className="md:col-span-2">
          <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs">
            <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
              <table className="w-full text-left text-sm border-collapse border border-gray-200">
                <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="p-2 border border-gray-200">Date/Time</th>
                    <th className="p-2 border border-gray-200">Type</th>
                    <th className="p-2 border border-gray-200">Medicine</th>
                    <th className="p-2 border border-gray-200 text-right">Qty</th>
                    <th className="p-2 border border-gray-200">Source / Destination</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const med = medicines.find((m) => m.id === tx.medicineId);
                    const isReceive = tx.type === 'RECEIVE';
                    const formattedDate = new Date(tx.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={tx.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-2 border border-gray-200 text-xs text-gray-600">{formattedDate}</td>
                        <td className="p-2 border border-gray-200">
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-medium ${isReceive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                              }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-2 border border-gray-200 font-medium text-gray-900">
                          {med?.name || 'Unknown'}
                        </td>
                        <td
                          className={`p-2 border border-gray-200 text-right font-mono font-bold ${isReceive ? 'text-green-700' : 'text-orange-700'
                            }`}
                        >
                          {isReceive ? '+' : '-'}
                          {tx.quantity}
                        </td>
                        <td className="p-2 border border-gray-200 text-xs text-gray-700">
                          {tx.sourceOrDest}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
