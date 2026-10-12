import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { Link } from 'react-router-dom';

export default function Alerts() {
  const { alertMedicines } = useInventory();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Stock Alerts</h1>
      </div>

      {alertMedicines.length === 0 ? (
        <div className="bg-white border border-gray-300 rounded p-8 text-center">
          <h2 className="text-base font-bold text-green-700">All Medicine Stocks are Ample!</h2>
          <p className="text-xs text-gray-500 mt-1">
            No medicine is currently below its predefined threshold.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alertMedicines.map((med) => {
            const isDepleted = med.currentStock <= 0;

            return (
              <div
                key={med.id}
                className="bg-white border border-gray-300 rounded p-4 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-gray-900">{med.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-semibold ${isDepleted
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {isDepleted ? 'Depleted (0 Stock)' : 'Low Stock'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Active Salt: <strong className="text-gray-800">{med.salts}</strong> | Current Stock:{' '}
                      <strong className="text-gray-900">{med.currentStock} {med.unit}</strong> (Min required: {med.minThreshold} {med.unit})
                    </div>
                  </div>

                  <Link
                    to="/transactions"
                    className="bg-[#00171f] hover:bg-[#05383b] text-white text-xs px-3 py-1.5 rounded font-semibold self-start sm:self-auto"
                  >
                    Log Intake &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
