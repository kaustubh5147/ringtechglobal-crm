import React, { useState, useEffect } from 'react'
import { Layout, LayoutDashboard, Users, CheckSquare, Settings, Bell, Search, Plus, TrendingUp, DollarSign, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './lib/supabase'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setLeads(data)
    setLoading(false)
  }

  const addLead = async () => {
    const name = prompt('Lead Name:')
    const email = prompt('Lead Email:')
    if (!name) return

    const { data, error } = await supabase
      .from('leads')
      .insert([{ name, email, status: 'New', value: 0 }])
      .select()
    
    if (data) fetchLeads()
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard leads={leads} />
      case 'leads':
        return <LeadsView leads={leads} onAdd={addLead} onRefresh={fetchLeads} />
      default:
        return <Dashboard leads={leads} />
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 glass-card m-4 p-6 flex flex-col gap-8 hidden md:flex">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Layout className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">RingTech</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Users size={20} />} label="Leads" active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} />
          <NavItem icon={<CheckSquare size={20} />} label="Tasks" active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
        </nav>

        <div className="mt-auto">
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold capitalize">{activeTab}</h2>
            <p className="text-slate-400">Welcome back, kaustubh5147</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input type="text" placeholder="Search..." className="pl-10 w-64" />
            </div>
            <button className="p-2 glass-card border-none hover:bg-slate-800 transition-all text-slate-300">
              <Bell size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 border-2 border-white/10 shadow-lg" />
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-400/20' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  )
}

function Dashboard({ leads }) {
  const stats = [
    { label: 'Total Leads', value: leads.length, icon: <TrendingUp />, color: 'from-blue-500 to-indigo-500' },
    { label: 'Conversions', value: leads.filter(l => l.status === 'Closed').length, icon: <Target />, color: 'from-emerald-400 to-teal-500' },
    { label: 'Potential Revenue', value: `$${leads.reduce((acc, curr) => acc + (curr.value || 0), 0).toLocaleString()}`, icon: <DollarSign />, color: 'from-orange-400 to-pink-500' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="glass-card p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg shadow-indigo-500/20`}>
            {React.cloneElement(stat.icon, { className: 'text-white' })}
          </div>
        </div>
      ))}
      
      <div className="md:col-span-2 glass-card p-6 min-h-[300px]">
        <h3 className="text-lg font-bold mb-4">Leads Over Time</h3>
        <p className="text-slate-500">Visualization coming soon...</p>
      </div>
      
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
        <div className="flex flex-col gap-4">
          {leads.slice(0, 3).map((lead, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] uppercase font-bold text-indigo-400">
                {lead.name.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium">{lead.name}</p>
                <p className="text-xs text-slate-500">{lead.status} • {new Date(lead.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LeadsView({ leads, onAdd, onRefresh }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
        <h3 className="text-lg font-bold">Manage Leads</h3>
        <div className="flex gap-2">
          <button onClick={onAdd} className="btn btn-primary">
            <Plus size={18} /> New Lead
          </button>
        </div>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-white/5 text-slate-400 text-sm">
            <th className="px-6 py-4 font-medium uppercase tracking-wider">Lead Name</th>
            <th className="px-6 py-4 font-medium uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 font-medium uppercase tracking-wider">Created</th>
            <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
              <td className="px-6 py-4">
                <div className="font-medium text-slate-200">{lead.name}</div>
                <div className="text-xs text-slate-500">{lead.email}</div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  lead.status === 'Closed' ? 'bg-emerald-500/20 text-emerald-400' : 
                  lead.status === 'New' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {lead.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-400">
                {new Date(lead.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right text-emerald-400 font-bold whitespace-nowrap">
                {lead.value > 0 ? `$${lead.value.toLocaleString()}` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App
