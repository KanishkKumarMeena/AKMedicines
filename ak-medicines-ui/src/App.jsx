import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Transactions from './pages/Transactions';
import Alerts from './pages/Alerts';
import logo from './assets/AK.svg';

function Navbar() {
  const location = useLocation();
  const { alertMedicines } = useInventory();
  const [isOpen, setIsOpen] = useState(false);
  const alertCount = alertMedicines.length;

  const links = [
    { path: '/', label: 'Dashboard' },
    { path: '/inventory', label: 'Inventory' },
    { path: '/transactions', label: 'Log Transaction' },
    { path: '/alerts', label: `Alerts ${alertCount > 0 ? `(${alertCount})` : ''}` },
  ];

  return (
    <nav className="bg-[#00171f] text-white shadow shrink-0 z-20">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-14">
        <Link
          to="/"
          onClick={() => setIsOpen(false)}
          className="font-bold text-lg flex items-center gap-2"
        >
          <img src={logo} alt="AK Medicines" className="h-7 w-7 rounded object-contain" />
          <span>AK Medicines</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#5bf693] text-black'
                    : 'text-blue-100 hover:bg-[#05383b] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded text-gray-200 hover:text-white hover:bg-[#05383b] focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[#05383b] bg-[#00171f] px-4 pt-2 pb-3 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#5bf693] text-black'
                    : 'text-blue-100 hover:bg-[#05383b] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <Router>
        <div className="h-screen bg-gray-100 text-gray-800 flex flex-col font-sans overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-6xl w-full mx-auto p-4 sm:p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/alerts" element={<Alerts />} />
              </Routes>
            </div>
          </main>
          <footer className="bg-white border-t border-gray-200 py-2 text-center text-xs text-gray-400 shrink-0">
            AK Medicines
          </footer>
        </div>
      </Router>
    </InventoryProvider>
  );
}
