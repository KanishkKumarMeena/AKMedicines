import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';

export default function Inventory() {
  const { medicines, addMedicine } = useInventory();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    salts: '',
    category: 'Antibiotic',
    minThreshold: '',
    unit: 'Tablets',
    expiryDate: '',
    initialQuantity: '',
  });

  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(search.toLowerCase()) ||
      med.salts.toLowerCase().includes(search.toLowerCase()) ||
      med.category.toLowerCase().includes(search.toLowerCase());

    if (filterStatus === 'ALL') return matchesSearch;
    return matchesSearch && med.status === filterStatus;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.salts) {
      alert('Please fill in Brand Name and Active Salts.');
      return;
    }

    addMedicine(formData);
    setFormData({
      name: '',
      salts: '',
      category: 'Antibiotic',
      minThreshold: '',
      unit: 'Tablets',
      expiryDate: '',
      initialQuantity: '',
    });
    setShowAddForm(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Medicine Inventory</h1>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#00171f] hover:bg-[#05383b] text-white text-sm px-4 py-2 rounded font-medium shadow-xs self-start sm:self-auto cursor-pointer"
        >
          {showAddForm ? 'Close Form' : '+ Add New Medicine'}
        </button>
      </div>

      {/* Add Medicine Inline Box */}
      {showAddForm && (
        <div className="bg-white border-2 border-[#00171f] rounded p-5 mb-6 shadow-xs">
          <h2 className="text-base font-bold text-gray-800 mb-3 border-b pb-2">
            Add New Medicine to System
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Augmentin 625 Duo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Active Salt / Formulation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin + Clavulanic Acid"
                  value={formData.salts}
                  onChange={(e) => setFormData({ ...formData, salts: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <span className="text-[11px] text-gray-500">
                  Used for generic alternative matching when out of stock.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Antibiotic">Antibiotic</option>
                  <option value="Analgesic / Antipyretic">Analgesic / Antipyretic</option>
                  <option value="Respiratory">Respiratory</option>
                  <option value="Antidiabetic">Antidiabetic</option>
                  <option value="Electrolytes">Electrolytes</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Unit Type
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Tablets">Tablets</option>
                  <option value="Capsules">Capsules</option>
                  <option value="Bottles">Bottles</option>
                  <option value="Sachets">Sachets</option>
                  <option value="Canisters">Canisters</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Minimum Safety Threshold (Default: 25)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="25"
                  value={formData.minThreshold}
                  onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Initial Intake Quantity (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 100"
                  value={formData.initialQuantity}
                  onChange={(e) => setFormData({ ...formData, initialQuantity: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-4 py-1.5 rounded font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1.5 rounded font-medium shadow-xs"
              >
                Save Medicine
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white border border-gray-300 rounded p-3 mb-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <input
          type="text"
          placeholder="Search by name, salt, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full sm:w-80 focus:outline-none focus:border-[#00171f]"
        />

        <div className="flex gap-1.5 text-xs font-medium w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'AMPLE', 'LOW_STOCK', 'OUT_OF_STOCK'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded border whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-[#00171f] text-white border-[#00171f] font-semibold'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {status === 'ALL'
                ? 'All'
                : status === 'AMPLE'
                ? 'Ample'
                : status === 'LOW_STOCK'
                ? 'Low Stock'
                : 'Out of Stock'}
            </button>
          ))}
        </div>
      </div>

      {/* Table with Horizontal Scroll */}
      <div className="bg-white border border-gray-300 rounded overflow-x-auto shadow-2xs">
        <table className="w-full text-left text-sm border-collapse min-w-[700px]">
          <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-300 whitespace-nowrap">
            <tr>
              <th className="p-3 border-r border-gray-200">Brand Name</th>
              <th className="p-3 border-r border-gray-200">Active Salt / Formulation</th>
              <th className="p-3 border-r border-gray-200">Category</th>
              <th className="p-3 border-r border-gray-200 text-right">Min Threshold</th>
              <th className="p-3 border-r border-gray-200 text-right">Current Stock</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedicines.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No medicines found matching the search.
                </td>
              </tr>
            ) : (
              filteredMedicines.map((med) => (
                <tr key={med.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 border-r border-gray-200 font-semibold text-gray-900 whitespace-nowrap">{med.name}</td>
                  <td className="p-3 border-r border-gray-200 text-gray-700">{med.salts}</td>
                  <td className="p-3 border-r border-gray-200 text-gray-600 whitespace-nowrap">{med.category}</td>
                  <td className="p-3 border-r border-gray-200 text-right font-mono text-gray-600 whitespace-nowrap">
                    {med.minThreshold} {med.unit}
                  </td>
                  <td className="p-3 border-r border-gray-200 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                    {med.currentStock} {med.unit}
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    {med.status === 'AMPLE' && (
                      <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded font-medium">
                        Ample
                      </span>
                    )}
                    {med.status === 'LOW_STOCK' && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded font-medium">
                        Low Stock
                      </span>
                    )}
                    {med.status === 'OUT_OF_STOCK' && (
                      <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded font-medium">
                        Depleted
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
