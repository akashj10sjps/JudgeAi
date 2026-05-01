import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const MOCK_DATA = [
  {
    case_number: "WP 45231/2024",
    petitioner: "M/s Bangalore Metro Infrastructure Pvt Ltd",
    department: "BBMP",
    directions: [
      "Issue the pending occupancy certificate within 45 days",
      "Pay compensation of Rs 2.5 lakhs for undue delay",
      "File a compliance report before the Registry by next date"
    ],
    deadline: "2025-05-05",
    approved_at: "2025-04-20"
  },
  {
    case_number: "WP 31082/2024",
    petitioner: "Karnataka State Pollution Control Board",
    department: "KSPCB",
    directions: [
      "Conduct environmental impact assessment within 30 days",
      "Submit water quality test report from NABL-accredited lab"
    ],
    deadline: "2025-05-25",
    approved_at: "2025-04-18"
  },
  {
    case_number: "WP 52910/2024",
    petitioner: "Smt. Lakshmi Devi W/o Late Ramesh",
    department: "Revenue Department",
    directions: [
      "Complete mutation of property records in favour of petitioner",
      "Issue updated RTC extract within 15 days"
    ],
    deadline: "2025-06-15",
    approved_at: "2025-04-22"
  },
  {
    case_number: "WP 10455/2025",
    petitioner: "Namma Bengaluru Foundation",
    department: "BBMP",
    directions: [
      "Repair and restore footpaths on MG Road stretch within 60 days",
      "Remove all unauthorized encroachments from identified stretches",
      "Install tactile paving for visually impaired pedestrians"
    ],
    deadline: "2025-07-20",
    approved_at: "2025-05-01"
  },
  {
    case_number: "WP 78321/2024",
    petitioner: "Association of Private School Managements",
    department: "Education Department",
    directions: [
      "Process pending NOC applications within 21 days"
    ],
    deadline: "2025-05-03",
    approved_at: "2025-04-10"
  }
];

function getDeadlineStatus(deadline) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(deadline);
  dl.setHours(0, 0, 0, 0);
  const diffMs = dl - today;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Overdue', color: 'urgent', days: diffDays };
  if (diffDays <= 7) return { label: 'Urgent', color: 'urgent', days: diffDays };
  if (diffDays <= 30) return { label: 'Due Soon', color: 'soon', days: diffDays };
  return { label: 'On Track', color: 'ontrack', days: diffDays };
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ───────── Detail Modal ───────── */
function DetailModal({ caseData, onClose }) {
  if (!caseData) return null;
  const status = getDeadlineStatus(caseData.deadline);

  const handleExportPDF = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Case Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5 space-y-5 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Case Number</p>
              <p className="font-semibold text-gray-900">{caseData.case_number}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Deadline</p>
              <p className="font-semibold text-gray-900">{formatDate(caseData.deadline)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Petitioner</p>
              <p className="font-medium text-gray-800">{caseData.petitioner}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Department</p>
              <p className="font-medium text-gray-800">{caseData.department}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status</p>
              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full
                ${status.color === 'urgent' ? 'bg-red-100 text-red-700' : status.color === 'soon' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700'}`}>
                {status.label} {status.days >= 0 ? `(${status.days} days)` : `(${Math.abs(status.days)} days overdue)`}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Court Directions</p>
            <ol className="list-decimal pl-5 space-y-2">
              {caseData.directions.map((dir, i) => (
                <li key={i} className="text-gray-800 leading-relaxed">{dir}</li>
              ))}
            </ol>
          </div>

          {caseData.approved_at && (
            <p className="text-xs text-gray-400">Approved on {formatDate(caseData.approved_at)}</p>
          )}
        </div>

        {/* Modal footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Export PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────── Dashboard ───────── */
export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:8000/dashboard');
        setCases(res.data);
      } catch {
        setCases(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* Derived values */
  const departments = useMemo(() => {
    const set = new Set(cases.map(c => c.department));
    return ['All', ...Array.from(set).sort()];
  }, [cases]);

  const filtered = useMemo(() => {
    return cases.filter(c => {
      const matchesDept = departmentFilter === 'All' || c.department === departmentFilter;

      const status = getDeadlineStatus(c.deadline);
      let matchesStatus = true;
      if (statusFilter === 'Urgent') matchesStatus = status.color === 'urgent';
      else if (statusFilter === 'Due Soon') matchesStatus = status.color === 'soon';
      else if (statusFilter === 'On Track') matchesStatus = status.color === 'ontrack';

      const q = searchQuery.toLowerCase();
      const matchesSearch = !q
        || c.case_number.toLowerCase().includes(q)
        || c.petitioner.toLowerCase().includes(q);

      return matchesDept && matchesStatus && matchesSearch;
    });
  }, [cases, departmentFilter, statusFilter, searchQuery]);

  const totalActive = cases.length;
  const urgentCount = cases.filter(c => getDeadlineStatus(c.deadline).color === 'urgent').length;
  const dueThisMonthCount = cases.filter(c => {
    const s = getDeadlineStatus(c.deadline);
    return s.color === 'urgent' || s.color === 'soon';
  }).length;

  const rowBg = (deadline) => {
    const s = getDeadlineStatus(deadline);
    if (s.color === 'urgent') return 'bg-[#FEE2E2]';
    if (s.color === 'soon') return 'bg-[#FEF9C3]';
    return 'bg-[#DCFCE7]';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3">
            {/* Karnataka emblem placeholder */}
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Judge<span className="text-primary-600">AI</span> Dashboard</h1>
              <p className="text-xs text-gray-500 font-medium">Verified court action plans pending compliance</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── Summary cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard label="Total Active Cases" value={totalActive} color="primary" />
          <SummaryCard label="Urgent — Due Within 7 Days" value={urgentCount} color="red" />
          <SummaryCard label="Due This Month" value={dueThisMonthCount} color="yellow" />
        </div>

        {/* ── Filters ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Search</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Case number or petitioner…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          {/* Department */}
          <div className="sm:w-48">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none cursor-pointer"
            >
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Status */}
          <div className="sm:w-44">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none cursor-pointer"
            >
              {['All', 'Urgent', 'Due Soon', 'On Track'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-primary-600 text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-semibold">Case Number</th>
                  <th className="px-4 py-3 font-semibold">Petitioner</th>
                  <th className="px-4 py-3 font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold">Key Direction</th>
                  <th className="px-4 py-3 font-semibold">Deadline</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 font-medium">No cases match your filters.</td>
                  </tr>
                )}
                {filtered.map((c) => {
                  const status = getDeadlineStatus(c.deadline);
                  return (
                    <tr key={c.case_number} className={`${rowBg(c.deadline)} hover:opacity-90 transition-opacity`}>
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{c.case_number}</td>
                      <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">{c.petitioner}</td>
                      <td className="px-4 py-3 text-gray-700">{c.department}</td>
                      <td className="px-4 py-3 text-gray-700 max-w-[250px] truncate">{c.directions[0]}</td>
                      <td className="px-4 py-3 text-gray-800 font-medium whitespace-nowrap">{formatDate(c.deadline)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full
                          ${status.color === 'urgent' ? 'bg-red-600 text-white' : status.color === 'soon' ? 'bg-yellow-500 text-white' : 'bg-green-600 text-white'}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedCase(c)}
                          className="text-xs font-medium text-primary-700 hover:text-primary-900 underline underline-offset-2 cursor-pointer mr-3"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => { setSelectedCase(c); setTimeout(() => window.print(), 300); }}
                          className="text-xs font-medium text-gray-500 hover:text-gray-700 underline underline-offset-2 cursor-pointer"
                        >
                          Export PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filtered.length === 0 && (
              <p className="text-center py-10 text-gray-400 font-medium">No cases match your filters.</p>
            )}
            {filtered.map((c) => {
              const status = getDeadlineStatus(c.deadline);
              return (
                <div key={c.case_number} className={`p-4 ${rowBg(c.deadline)} space-y-2`}>
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-gray-900">{c.case_number}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                      ${status.color === 'urgent' ? 'bg-red-600 text-white' : status.color === 'soon' ? 'bg-yellow-500 text-white' : 'bg-green-600 text-white'}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{c.petitioner}</p>
                  <p className="text-xs text-gray-500">{c.department} · Deadline: {formatDate(c.deadline)}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{c.directions[0]}</p>
                  <div className="flex gap-4 pt-1">
                    <button onClick={() => setSelectedCase(c)} className="text-xs font-medium text-primary-700 underline cursor-pointer">View Details</button>
                    <button onClick={() => { setSelectedCase(c); setTimeout(() => window.print(), 300); }} className="text-xs font-medium text-gray-500 underline cursor-pointer">Export PDF</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center pt-2">Showing {filtered.length} of {totalActive} cases</p>
      </main>

      {/* Detail modal */}
      <DetailModal caseData={selectedCase} onClose={() => setSelectedCase(null)} />
    </div>
  );
}

/* ───────── Summary Card ───────── */
function SummaryCard({ label, value, color }) {
  const styles = {
    primary: 'border-primary-200 bg-primary-50',
    red: 'border-red-200 bg-red-50',
    yellow: 'border-yellow-200 bg-yellow-50',
  };
  const numStyles = {
    primary: 'text-primary-700',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
  };

  return (
    <div className={`rounded-xl border-2 p-5 ${styles[color]}`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${numStyles[color]}`}>{value}</p>
    </div>
  );
}
