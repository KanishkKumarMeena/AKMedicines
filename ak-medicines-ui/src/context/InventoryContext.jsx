import React, { createContext, useContext, useState, useMemo } from 'react';

const InventoryContext = createContext();

const INITIAL_MEDICINES = [
  {
    id: 'med-1',
    name: 'Amoxil 500mg',
    salts: 'Amoxicillin Trihydrate',
    category: 'Antibiotic',
    minThreshold: 100,
    unit: 'Tablets',
    expiryDate: '2027-04-15',
  },
  {
    id: 'med-2',
    name: 'Paracetamol 650mg',
    salts: 'Acetaminophen / Paracetamol',
    category: 'Analgesic / Antipyretic',
    minThreshold: 150,
    unit: 'Tablets',
    expiryDate: '2027-09-30',
  },
  {
    id: 'med-3',
    name: 'ORS Sachet',
    salts: 'Oral Rehydration Salts (WHO Formula)',
    category: 'Electrolytes',
    minThreshold: 80,
    unit: 'Sachets',
    expiryDate: '2028-01-10',
  },
  {
    id: 'med-4',
    name: 'Ventolin Inhaler',
    salts: 'Salbutamol Sulfate',
    category: 'Respiratory',
    minThreshold: 30,
    unit: 'Canisters',
    expiryDate: '2026-12-05',
  },
  {
    id: 'med-5',
    name: 'Ciprogit 500mg',
    salts: 'Ciprofloxacin Hydrochloride',
    category: 'Antibiotic',
    minThreshold: 60,
    unit: 'Tablets',
    expiryDate: '2026-11-20',
  },
  {
    id: 'med-6',
    name: 'Metformin 500mg',
    salts: 'Metformin Hydrochloride',
    category: 'Antidiabetic',
    minThreshold: 120,
    unit: 'Tablets',
    expiryDate: '2027-06-18',
  },
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-1',
    medicineId: 'med-1',
    type: 'RECEIVE',
    quantity: 300,
    sourceOrDest: 'WHO Medical Aid Shipment #104',
    timestamp: '2026-10-08T09:30:00Z',
    notes: 'Bulk donation received in good condition',
  },
  {
    id: 'tx-2',
    medicineId: 'med-1',
    type: 'DISPENSE',
    quantity: 220,
    sourceOrDest: 'Mobile Camp #3 (Flood Relief)',
    timestamp: '2026-10-09T14:15:00Z',
    notes: 'Urgent dispensation for respiratory & bacterial infections',
  },
  {
    id: 'tx-3',
    medicineId: 'med-2',
    type: 'RECEIVE',
    quantity: 500,
    sourceOrDest: 'Red Cross Aid Supply',
    timestamp: '2026-10-07T11:00:00Z',
    notes: 'Initial stock intake',
  },
  {
    id: 'tx-4',
    medicineId: 'med-2',
    type: 'DISPENSE',
    quantity: 120,
    sourceOrDest: 'Community Health Outpost West',
    timestamp: '2026-10-10T16:45:00Z',
    notes: 'Fever clinic weekly distribution',
  },
  {
    id: 'tx-5',
    medicineId: 'med-3',
    type: 'RECEIVE',
    quantity: 250,
    sourceOrDest: 'Local Pharma Consortium Donation',
    timestamp: '2026-10-06T10:00:00Z',
    notes: 'Emergency dehydration packs',
  },
  {
    id: 'tx-6',
    medicineId: 'med-3',
    type: 'DISPENSE',
    quantity: 210,
    sourceOrDest: 'Pediatric Rural Clinic',
    timestamp: '2026-10-10T08:20:00Z',
    notes: 'Summer diarrheal protocol batch',
  },
  {
    id: 'tx-7',
    medicineId: 'med-4',
    type: 'RECEIVE',
    quantity: 25,
    sourceOrDest: 'District Hospital Donation',
    timestamp: '2026-10-05T12:00:00Z',
    notes: 'Intake',
  },
  {
    id: 'tx-8',
    medicineId: 'med-5',
    type: 'RECEIVE',
    quantity: 150,
    sourceOrDest: 'Direct Procurement',
    timestamp: '2026-10-08T15:00:00Z',
    notes: 'Purchased with community grant',
  },
  {
    id: 'tx-9',
    medicineId: 'med-5',
    type: 'DISPENSE',
    quantity: 110,
    sourceOrDest: 'Trauma & Wound Dressing Station',
    timestamp: '2026-10-11T10:15:00Z',
    notes: 'Secondary infection prevention',
  },
  {
    id: 'tx-10',
    medicineId: 'med-6',
    type: 'RECEIVE',
    quantity: 200,
    sourceOrDest: 'National Chronic Care Program',
    timestamp: '2026-10-04T13:30:00Z',
    notes: 'Monthly allocation',
  },
  {
    id: 'tx-11',
    medicineId: 'med-6',
    type: 'DISPENSE',
    quantity: 150,
    sourceOrDest: 'Elderly Outreach Van',
    timestamp: '2026-10-10T12:00:00Z',
    notes: 'Monthly refills for enrolled diabetic patients',
  },
];

export function InventoryProvider({ children }) {
  const [medicines, setMedicines] = useState(INITIAL_MEDICINES);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  // Dynamic stock calculator: SUM(RECEIVE) - SUM(DISPENSE) for each medicine
  const stockMap = useMemo(() => {
    const map = {};
    medicines.forEach((med) => {
      map[med.id] = 0;
    });

    transactions.forEach((tx) => {
      if (map[tx.medicineId] === undefined) {
        map[tx.medicineId] = 0;
      }
      if (tx.type === 'RECEIVE') {
        map[tx.medicineId] += Number(tx.quantity);
      } else if (tx.type === 'DISPENSE') {
        map[tx.medicineId] -= Number(tx.quantity);
      }
    });

    return map;
  }, [medicines, transactions]);

  // Medicines with current calculated stock & health status
  const medicinesWithStock = useMemo(() => {
    return medicines.map((med) => {
      const currentStock = stockMap[med.id] || 0;
      const isOutOfStock = currentStock <= 0;
      const isLowStock = currentStock <= med.minThreshold && !isOutOfStock;
      
      return {
        ...med,
        currentStock,
        status: isOutOfStock ? 'OUT_OF_STOCK' : isLowStock ? 'LOW_STOCK' : 'AMPLE',
      };
    });
  }, [medicines, stockMap]);

  // Low stock and out-of-stock items for alerts
  const alertMedicines = useMemo(() => {
    return medicinesWithStock.filter(
      (m) => m.status === 'LOW_STOCK' || m.status === 'OUT_OF_STOCK'
    );
  }, [medicinesWithStock]);

  // Add new medicine
  const addMedicine = (newMed) => {
    const id = `med-${Date.now()}`;
    const medicine = {
      ...newMed,
      id,
      minThreshold: newMed.minThreshold && Number(newMed.minThreshold) > 0 ? Number(newMed.minThreshold) : 25,
    };
    setMedicines((prev) => [medicine, ...prev]);

    // If an initial quantity is provided, record it as an initial RECEIVE transaction
    if (newMed.initialQuantity && Number(newMed.initialQuantity) > 0) {
      addTransaction({
        medicineId: id,
        type: 'RECEIVE',
        quantity: Number(newMed.initialQuantity),
        sourceOrDest: 'Initial Stock Ingestion',
        notes: 'Initial inventory baseline',
      });
    }

    return medicine;
  };

  // Add transaction to the immutable ledger
  const addTransaction = (newTx) => {
    const transaction = {
      id: `tx-${Date.now()}`,
      medicineId: newTx.medicineId,
      type: newTx.type, // 'RECEIVE' or 'DISPENSE'
      quantity: Number(newTx.quantity),
      sourceOrDest: newTx.sourceOrDest || 'Unspecified',
      timestamp: new Date().toISOString(),
      notes: newTx.notes || '',
    };
    setTransactions((prev) => [transaction, ...prev]);
    return transaction;
  };

  const value = {
    medicines: medicinesWithStock,
    transactions,
    stockMap,
    alertMedicines,
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
