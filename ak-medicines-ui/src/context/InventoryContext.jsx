import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const InventoryContext = createContext();

const STATUS_MAP = {
  ample: 'AMPLE',
  low_stock: 'LOW_STOCK',
  depleted: 'OUT_OF_STOCK',
};

function formatMedicine(m) {
  return {
    id: m.id,
    name: m.name,
    salts: m.salt_ingredients,
    category: m.category,
    unit: m.unit || 'Tablets',
    minThreshold: m.min_threshold,
    currentStock: m.current_stock ?? 0,
    status: STATUS_MAP[m.status] || 'AMPLE',
    vendors: m.vendors || [],
  };
}

function formatTransaction(tx) {
  return {
    id: tx.id,
    medicineId: tx.medicine_id,
    type: tx.transaction_type,
    quantity: tx.quantity,
    sourceOrDest: tx.party,
    timestamp: tx.timestamp,
  };
}

export function InventoryProvider({ token, onLogout, children }) {
  const [medicines, setMedicines] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [alertMedicines, setAlertMedicines] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiFetch = useCallback(
    async (url, options = {}) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });

      if (response.status === 401) {
        if (onLogout) onLogout();
        throw new Error('Session expired. Please sign in again.');
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Request failed.');
      }
      return data;
    },
    [token, onLogout]
  );

  const refreshData = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      const [medsData, txData, alertsData, vendorsData] = await Promise.all([
        apiFetch('/api/medicines'),
        apiFetch('/api/transactions'),
        apiFetch('/api/alerts'),
        apiFetch('/api/vendors'),
      ]);

      setMedicines(medsData.map(formatMedicine));
      setTransactions(txData.map(formatTransaction));
      setAlertMedicines(alertsData.map(formatMedicine));
      setVendors(vendorsData);
    } catch (err) {
      setError(err.message || 'Failed to load data from server.');
    } finally {
      setLoading(false);
    }
  }, [token, apiFetch]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Add new medicine via POST /api/medicines
  const addMedicine = async (newMed) => {
    const payload = {
      name: newMed.name.trim(),
      category: newMed.category,
      salt_ingredients: newMed.salts.trim(),
      unit: newMed.unit || 'Tablets',
      min_threshold:
        newMed.minThreshold && Number(newMed.minThreshold) >= 0
          ? Number(newMed.minThreshold)
          : 25,
      initial_stock:
        newMed.initialQuantity && Number(newMed.initialQuantity) > 0
          ? Number(newMed.initialQuantity)
          : 0,
      party: (newMed.party || '').trim() || 'Initial Stock Ingestion',
    };

    const created = await apiFetch('/api/medicines', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    await refreshData();
    return formatMedicine(created);
  };

  // Add transaction to the immutable ledger via POST /api/transactions
  const addTransaction = async (newTx) => {
    const payload = {
      medicine_id: Number(newTx.medicineId),
      transaction_type: newTx.type,
      quantity: Number(newTx.quantity),
      party: (newTx.sourceOrDest || '').trim() || 'Unspecified',
    };

    const created = await apiFetch('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    await refreshData();
    return formatTransaction(created);
  };

  const value = {
    medicines,
    transactions,
    alertMedicines,
    vendors,
    loading,
    error,
    apiFetch,
    refreshData,
    addMedicine,
    addTransaction,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
