import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Activity, Package, PlusCircle, AlertTriangle, LayoutDashboard, Settings } from 'lucide-react';

function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/inventory', name: 'Inventory', icon: Package },
    { path: '/transactions', name: 'Log Transaction', icon: PlusCircle },
    { path: '/alerts', name: 'Alerts', icon: AlertTriangle },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Activity className="w-6 h-6 text-indigo-600 mr-2" />
        <span className="text-xl font-bold text-gray-900">AK Medicines</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path}
              to={item.path} 
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </button>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Medicines</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">124</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Low Stock Alerts</p>
              <p className="text-3xl font-semibold text-red-600 mt-1">3</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Transactions Today</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">28</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Package className="w-8 h-8 mx-auto text-gray-400 mb-3" />
            <p>Transactions will appear here once the API is connected.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 md:hidden">
            <Activity className="w-6 h-6 text-indigo-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">AK Medicines</span>
          </header>
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<div className="p-8"><h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1></div>} />
              <Route path="/transactions" element={<div className="p-8"><h1 className="text-2xl font-bold text-gray-900">Log Transaction</h1></div>} />
              <Route path="/alerts" element={<div className="p-8"><h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1></div>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
