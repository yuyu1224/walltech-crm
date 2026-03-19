import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Clock, MapPin, Phone, Video, Mail, ChevronRight, ArrowLeft, X, AlertCircle, CheckCircle, Megaphone, LifeBuoy, PieChart, Settings, Menu } from 'lucide-react';

// --- MESSAGE TOAST SYSTEM ---
const toastStore = {
  listeners: [],
  notify: (msg, type) => toastStore.listeners.forEach(l => l(msg, type)),
  subscribe: (l) => { toastStore.listeners.push(l); return () => toastStore.listeners = toastStore.listeners.filter(i => i !== l); }
};
export const toast = {
  success: (msg) => toastStore.notify(msg, 'success'),
  error: (msg) => toastStore.notify(msg, 'error'),
  warning: (msg) => toastStore.notify(msg, 'warning')
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    return toastStore.subscribe((msg, type) => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, msg, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    });
  }, []);
  
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center space-y-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-in slide-in-from-top-5 fade-in duration-300 ${
          t.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' :
          t.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700' :
          'bg-emerald-50 border-emerald-100 text-emerald-700'
        }`}>
          {t.type === 'error' ? <AlertCircle size={18} /> : t.type === 'warning' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
};

// --- MOCK DATA ---
const INITIAL_CUSTOMERS = [
  { id: '1', name: '上海华运国际货运代理有限公司', industry: '国际海运', owner: '张三', lastContact: '2026-03-15' },
  { id: '2', name: '深圳市顺达进出口报关行', industry: '报关清关', owner: '李四', lastContact: '2026-03-10' },
  { id: '3', name: '宁波港畅供应链管理有限公司', industry: '仓储物流', owner: '王五', lastContact: '2026-03-18' },
  { id: '4', name: '广州越洋空运代理服务公司', industry: '国际空运', owner: '张三', lastContact: '2026-03-01' },
];

const INITIAL_FOLLOW_UPS = [
  { id: '101', customerId: '1', method: '上门拜访', date: '2026-03-15', content: '拜访客户张总，沟通了下季度的欧洲海运长协价格体系。客户表示需要继续讨论附加费的减免。', nextDate: '2026-03-25' },
  { id: '102', customerId: '2', method: '电话沟通', date: '2026-03-10', content: '确认了上周几单华南出口的报关单状态，均已放行。提醒对方留意海关新政策。', nextDate: '2026-04-10' },
  { id: '103', customerId: '3', method: '线上会议', date: '2026-03-18', content: '线上向宁波仓的吴经理演示了最新的WMS系统操作。', nextDate: '2026-04-01' },
];

// --- COMPONENTS ---

// 1. KPI Dashboard View
const KPIDashboard = ({ followUps, customers }) => {
  // 可动态配置的 KPI 目标
  const [targetTotal, setTargetTotal] = useState(() => Number(localStorage.getItem('crm_targetTotal')) || 30);
  const [targetVisits, setTargetVisits] = useState(() => Number(localStorage.getItem('crm_targetVisits')) || 10);
  const [isEditingKPI, setIsEditingKPI] = useState(false);

  useEffect(() => { localStorage.setItem('crm_targetTotal', targetTotal); }, [targetTotal]);
  useEffect(() => { localStorage.setItem('crm_targetVisits', targetVisits); }, [targetVisits]);

  // 提取当前年月用于计算当月 KPI
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthFollowUps = followUps.filter(f => f.date.startsWith(currentMonth));
  const total = monthFollowUps.length;
  
  const totalCompletion = Math.min(Math.round((total / targetTotal) * 100), 100);

  const visits = monthFollowUps.filter(f => f.method === '上门拜访').length;
  const visitsCompletion = Math.min(Math.round((visits / targetVisits) * 100), 100);
  
  const methodCounts = monthFollowUps.reduce((acc, f) => {
    acc[f.method] = (acc[f.method] || 0) + 1;
    return acc;
  }, {});

  // 生成销售人员 KPI 排行榜 (针对笔试要求：形成对销售人员的 KPI 考核)
  const salesStats = {};
  customers.forEach(c => {
    if(!salesStats[c.owner]) salesStats[c.owner] = { owner: c.owner, clientCount: 0, followCount: 0, visitCount: 0 };
    salesStats[c.owner].clientCount += 1;
  });
  monthFollowUps.forEach(f => {
    const cust = customers.find(c => c.id === f.customerId);
    if (cust && salesStats[cust.owner]) {
      salesStats[cust.owner].followCount += 1;
      if (f.method === '上门拜访') salesStats[cust.owner].visitCount += 1;
    }
  });
  const leaderboard = Object.values(salesStats).sort((a, b) => b.followCount - a.followCount);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">月度销售效能考核 (KPI)</h2>
        <button 
          onClick={() => {
            if(isEditingKPI) toast.success('考核指标已更新！');
            setIsEditingKPI(!isEditingKPI);
          }} 
          className={`text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-sm ${isEditingKPI ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          {isEditingKPI ? '保存参数' : '⚙️ 主管视角: 设定指标'}
        </button>
      </div>

      {isEditingKPI && (
        <div className="bg-indigo-50/50 p-6 border-2 border-indigo-100 rounded-2xl animate-in slide-in-from-top-2 flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-8">
          <div className="flex items-center">
            <label className="text-sm font-bold text-slate-700 w-32">月度总跟进下限:</label>
            <input type="number" min="1" value={targetTotal} onChange={e=>setTargetTotal(Number(e.target.value))} className="w-24 px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-center font-bold text-indigo-600" />
            <span className="ml-2 text-sm text-slate-500">次</span>
          </div>
          <div className="flex items-center">
            <label className="text-sm font-bold text-slate-700 w-32">其中上门拜访须占:</label>
            <input type="number" min="1" value={targetVisits} onChange={e=>setTargetVisits(Number(e.target.value))} className="w-24 px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-center font-bold text-indigo-600" />
            <span className="ml-2 text-sm text-slate-500">次</span>
          </div>
          <div className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
            提示：修改后下方进度条将实时重新计算
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Total KPI */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 rounded-xl ring-1 ring-indigo-100/50">
                <LayoutDashboard size={24} />
              </div>
              <h3 className="font-bold text-slate-700">总发拓跟进次数</h3>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-slate-400">考核目标</span>
              <p className="font-bold text-slate-800">{total} <span className="text-slate-400 font-normal">/ {targetTotal}</span></p>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-2">
            <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${totalCompletion}%` }}></div>
          </div>
          <p className="text-xs text-slate-500 text-right">达成率：<span className="font-bold text-indigo-600">{totalCompletion}%</span></p>
        </div>

        {/* Card 2: Visits KPI */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 rounded-xl ring-1 ring-blue-100/50">
                <MapPin size={24} />
              </div>
              <h3 className="font-bold text-slate-700">高价值上门拜访</h3>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-slate-400">考核目标</span>
              <p className="font-bold text-slate-800">{visits} <span className="text-slate-400 font-normal">/ {targetVisits}</span></p>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-2">
            <div className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${visitsCompletion >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${visitsCompletion}%` }}></div>
          </div>
          <p className="text-xs text-slate-500 text-right">达成率：<span className={`font-bold ${visitsCompletion >= 100 ? 'text-emerald-600' : 'text-blue-600'}`}>{visitsCompletion}%</span></p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-8 flex items-center"><Clock className="w-5 h-5 mr-2 text-slate-400" /> 各跟进方式占比</h3>
        <div className="space-y-6">
          {Object.entries(methodCounts).map(([method, count]) => {
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={method} className="group">
                <div className="flex justify-between text-sm mb-2.5">
                  <span className="text-slate-700 font-medium">{method}</span>
                  <span className="text-slate-600 font-medium">{count} 次 <span className="text-slate-400 font-normal ml-1">({percentage}%)</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${percentage}%` }}>
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            );
          })}
          {Object.keys(methodCounts).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-slate-300"><Users size={24} /></div>
               <span className="text-slate-400 text-sm font-medium">本月暂无跟进数据</span>
            </div>
          )}
        </div>
      </div>

      {/* 销售人员 KPI 排行榜 (完全贴合"对销售人员的 KPI 考核"需求) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center"><Users size={18} className="mr-2 text-indigo-600" /> 本月销售绩效排行榜</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-slate-500 text-xs tracking-wider border-b border-slate-100">
                <th className="px-6 py-4 font-medium">排名</th>
                <th className="px-6 py-4 font-medium">销售人员</th>
                <th className="px-6 py-4 font-medium text-right">负责客户数</th>
                <th className="px-6 py-4 font-medium text-right">本月高价值拜访</th>
                <th className="px-6 py-4 font-medium text-right font-bold text-indigo-600">本月总跟进行动</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((stat, idx) => (
                <tr key={stat.owner} className="border-b border-slate-50 hover:bg-slate-50/50 transition duration-150">
                  <td className="px-6 py-3">
                    {idx === 0 ? <span className="flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-600 font-bold rounded text-xs">1</span> : 
                     idx === 1 ? <span className="flex items-center justify-center w-6 h-6 bg-slate-200 text-slate-600 font-bold rounded text-xs">2</span> : 
                     idx === 2 ? <span className="flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-700 font-bold rounded text-xs">3</span> : 
                     <span className="flex items-center justify-center w-6 h-6 text-slate-400 font-medium text-xs">{idx + 1}</span>}
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-800">{stat.owner}</td>
                  <td className="px-6 py-3 text-right text-slate-600">{stat.clientCount}</td>
                  <td className="px-6 py-3 text-right text-slate-600">
                    {stat.visitCount}
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-indigo-600 text-lg">{stat.followCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 2. Customer List View
const CustomerList = ({ customers, followUps, onViewDetail, onAddCustomer, onDeleteCustomer }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', owner: '当前用户', industry: '海运出口 (FCL)' });
  
  // 过滤与排序状态
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('全部');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' or 'asc' 按跟进时间

  // 计算今日待跟进与逾期
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingFollowUps = followUps.filter(f => f.nextDate);
  const todayCount = pendingFollowUps.filter(f => f.nextDate === todayStr).length;
  const overdueCount = pendingFollowUps.filter(f => new Date(f.nextDate) < new Date(todayStr)).length;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCust.name.trim()) return toast.error('请输入企业名称');
    
    // 校验名称是否重复
    if (customers.some(c => c.name.trim() === newCust.name.trim())) {
      return toast.warning('该客户已存在，请勿重复添加！');
    }

    onAddCustomer({ 
      id: Date.now().toString(), 
      lastContact: '无', 
      status: '新客',
      ...newCust 
    });
    toast.success('客户新增成功！');
    setShowAddModal(false);
    setNewCust({ name: '', owner: '当前用户', industry: '海运出口 (FCL)' });
  };

  const filteredCustomers = customers
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.owner.includes(searchTerm))
    .filter(c => filterIndustry === '全部' || c.industry === filterIndustry)
    .sort((a, b) => {
      if (a.lastContact === '无') return 1;
      if (b.lastContact === '无') return -1;
      return sortOrder === 'desc' 
        ? new Date(b.lastContact) - new Date(a.lastContact)
        : new Date(a.lastContact) - new Date(b.lastContact);
    });

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">客户资源池</h2>
          <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg flex items-center shadow-sm hover:bg-indigo-100 transition-colors">
            <LayoutDashboard size={12} className="mr-1" /> 预连 CargoWare 数据
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex space-x-3 mr-2">
            <div className="flex flex-col items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">今日待跟进</span>
              <span className="text-indigo-600 font-black text-sm">{todayCount}</span>
            </div>
            <div className="flex flex-col items-center bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 shadow-sm">
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">已逾期</span>
              <span className="text-red-600 font-black text-sm">{overdueCount}</span>
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(!showAddModal)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-slate-800 hover:shadow transition-all focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 active:scale-95">
            {showAddModal ? '收起面板' : '+ 新增企客'}
          </button>
        </div>
      </div>

      {/* Toolbar: Search & Filter */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
        <div className="flex-1 w-full max-w-sm relative">
          <input 
            type="text" 
            placeholder="搜索客户名称或负责人..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <select 
          value={filterIndustry} 
          onChange={(e) => setFilterIndustry(e.target.value)}
          className="py-2 px-4 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
        >
          <option value="全部">所有业务</option>
          <option value="海运出口 (FCL)">海运出口 (FCL)</option>
          <option value="国际空运">国际空运</option>
          <option value="跨境电商 (eTower)">跨境电商 (eTower)</option>
          <option value="仓储物流">仓储物流</option>
          <option value="报关清关">报关清关</option>
        </select>
      </div>

      {showAddModal && (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-indigo-100/80 mb-6 overflow-hidden animate-in slide-in-from-top-2 duration-200 relative">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm">快速企业建档 (自动同步公海池)</h3>
          </div>
          <form onSubmit={handleAddSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">企业名称* (支持中英混输)</label>
                <input required value={newCust.name} onChange={e => setNewCust({...newCust, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="例如：WallTech Logistics / 某某货运" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">主营跟进业务</label>
                <select value={newCust.industry} onChange={e => setNewCust({...newCust, industry: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700">
                  <option>海运出口 (FCL)</option><option>国际空运</option><option>跨境电商 (eTower)</option><option>报关清关等</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">责任人</label>
                <input value={newCust.owner} onChange={e => setNewCust({...newCust, owner: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="张三" />
              </div>
            </div>
            <div className="pt-5 mt-5 border-t border-slate-100 flex justify-end space-x-3">
              <button type="submit" className="px-6 py-2.5 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 font-medium shadow-md shadow-indigo-200 transition-all active:scale-95">确认保存</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs tracking-wider uppercase border-b border-slate-200/80">
                <th className="px-6 py-4 font-semibold">客户名称</th>
                <th className="px-6 py-4 font-semibold">所属业务</th>
                <th className="px-6 py-4 font-semibold">负责人</th>
                <th className="px-6 py-4 font-semibold cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>
                  最后跟进时间 {sortOrder === 'desc' ? '↓' : '↑'}
                </th>
                <th className="px-6 py-4 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm">未找到匹配的客户</td>
                </tr>
              ) : filteredCustomers.map(c => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition duration-200 group">
                  <td className="px-6 py-4 text-slate-800 font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <span className="bg-white text-slate-700 px-3 py-1 rounded-full text-xs font-medium border border-slate-200/80 shadow-sm">{c.industry}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold ring-1 ring-indigo-100/50">
                        {c.owner.charAt(0)}
                      </div>
                      <span className="font-medium">{c.owner}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{c.lastContact || <span className="text-slate-300">-</span>}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => onViewDetail(c)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center justify-center group-hover:translate-x-1 transition-transform"
                      >
                        详情 <ChevronRight size={16} className="ml-1 opacity-70" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteCustomer(c.id); }}
                        className="text-slate-400 hover:text-red-500 text-sm font-medium transition-colors"
                        title="移出/归档"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 3. Customer Detail & Follow-up View
const CustomerDetail = ({ customer, followUps, onBack, onAddFollowUp, onDeleteFollowUp }) => {
  const [formData, setFormData] = useState({
    method: '电话沟通',
    date: new Date().toISOString().split('T')[0],
    content: '',
    nextDate: ''
  });

  const customerHistory = followUps
    .filter(f => f.customerId === customer.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.content.trim()) return toast.warning('请填写具体的跟进记录内容');
    
    // 日期逻辑校验：下次跟进日期 ≥ 当前跟进日期
    if (formData.nextDate && new Date(formData.nextDate) < new Date(formData.date)) {
      return toast.error('下次跟进日期不能早于本次发生日期！');
    }
    
    onAddFollowUp({
      ...formData,
      customerId: customer.id,
      id: Date.now().toString(),
    });
    
    toast.success('跟进记录已保存！');
    setFormData({ ...formData, content: '', nextDate: '' });
  };

  const methodIcons = {
    '电话沟通': <Phone size={14} />,
    '线上会议': <Video size={14} />,
    '上门拜访': <MapPin size={14} />,
    '邮件询价': <Mail size={14} />
  };

  // 提升质感的 input class
  const inputBaseClass = "w-full border border-slate-200 bg-slate-50 hover:bg-slate-100/60 transition-colors rounded-xl p-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none";

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="animate-in fade-in duration-500">
      <button onClick={onBack} className="text-slate-500 hover:text-indigo-600 flex items-center space-x-1.5 text-sm mb-6 transition-colors font-medium">
        <ArrowLeft size={16} /> <span>返回列表资源</span>
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/60 mb-8 flex justify-between items-center relative overflow-hidden">
        {/* 装饰性背景 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-50/80 to-transparent rounded-bl-full opacity-60 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">{customer.name}</h2>
          <div className="flex space-x-8 text-sm text-slate-600">
            <span className="flex items-center"><Users size={16} className="mr-2 text-indigo-400"/> 业务: {customer.industry}</span>
            <span className="flex items-center"><Clock size={16} className="mr-2 text-indigo-400"/> 负责人: <span className="font-medium ml-1 text-slate-700">{customer.owner}</span></span>
            <span className="flex items-center text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 font-medium shadow-sm"><LayoutDashboard size={14} className="mr-1.5"/> CargoWare ID: CW-{customer.id.padStart(4, '0')}</span>
          </div>
        </div>
        <div className="text-right bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative z-10 min-w-[140px]">
          <div className="text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wider">最后跟进</div>
          <div className="font-bold text-indigo-600 text-lg">{customer.lastContact || '暂无数据'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Add Follow-up Form */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 sticky top-24">
            <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center">新增跟进</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">动作类型</label>
                <select 
                  className={inputBaseClass}
                  value={formData.method}
                  onChange={e => setFormData({...formData, method: e.target.value})}
                >
                  <option>电话沟通</option>
                  <option>线上会议</option>
                  <option>上门拜访</option>
                  <option>邮件询价</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">发生日期</label>
                <input 
                  type="date" 
                  className={inputBaseClass}
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">核心纪要</label>
                <textarea 
                  className={`${inputBaseClass} h-32 resize-none`}
                  placeholder="记录关键痛点与下一步动作..."
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex justify-between">
                  <span>下次计划提醒</span>
                  <span className="text-slate-400 font-normal border border-slate-200 px-1.5 rounded text-xs bg-slate-50">可选</span>
                </label>
                <input 
                  type="date" 
                  className={inputBaseClass}
                  value={formData.nextDate}
                  onChange={e => setFormData({...formData, nextDate: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white rounded-xl py-3 mt-4 text-sm font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                + 提交记录
              </button>
            </form>
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="lg:col-span-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/60 h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-8 border-b border-slate-100 pb-4">历史交互轴</h3>
            
            {customerHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-slate-300">
                  <Clock size={32} />
                </div>
                <span className="text-slate-500 font-medium text-sm">暂无跟进记录，现在开始第一条吧！</span>
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-100 ml-5 space-y-10 pb-6">
                {customerHistory.map((record, index) => (
                  <div key={record.id} className="relative pl-8">
                    {/* Timeline dot */}
                    <div className="absolute w-8 h-8 bg-white rounded-full flex items-center justify-center -left-[17px] top-0 border-[4px] border-slate-50 text-indigo-600 shadow-sm ring-1 ring-slate-200">
                       {methodIcons[record.method] || <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                    </div>
                    
                    <div className={`bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group/item ${index === 0 ? 'shadow-sm ring-1 ring-black/[0.03]' : ''}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-slate-700 text-sm bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/50">{record.method}</span>
                          <span className="text-sm text-slate-400 font-medium">{record.date}</span>
                        </div>
                        <button 
                          onClick={() => onDeleteFollowUp(record.id)}
                          className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1"
                          title="删除此条记录"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p className="text-slate-700 text-[15px] leading-relaxed whitespace-pre-wrap">
                        {record.content}
                      </p>
                      {record.nextDate && (
                        <div className={`mt-5 pt-4 border-t text-[13px] font-medium flex items-center -mx-6 -mb-6 p-4 rounded-b-2xl ${
                          new Date(record.nextDate) < new Date(today)
                            ? 'bg-red-50/50 border-red-100 text-red-600'
                            : 'bg-indigo-50/30 border-slate-100 text-indigo-600'
                        }`}>
                          <Clock size={16} className="mr-2" /> 
                          下次计划: {record.nextDate}
                          {new Date(record.nextDate) < new Date(today) && (
                            <span className="ml-auto flex items-center text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-md">
                              <AlertCircle size={12} className="mr-1" /> 已逾期
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'kpi'
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('crm_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [followUps, setFollowUps] = useState(() => {
    const saved = localStorage.getItem('crm_followUps');
    return saved ? JSON.parse(saved) : INITIAL_FOLLOW_UPS;
  });

  // 监听数据变化并持久化到 LocalStorage
  useEffect(() => {
    localStorage.setItem('crm_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('crm_followUps', JSON.stringify(followUps));
  }, [followUps]);

  const handleAddFollowUp = (newRecord) => {
    setFollowUps(prev => [newRecord, ...prev]);
    
    // 同步更新客户的"最后跟进时间"
    setCustomers(prev => prev.map(c => 
      c.id === newRecord.customerId 
        ? { ...c, lastContact: newRecord.date } 
        : c
    ));
  };

  const handleAddCustomer = (newCustomer) => {
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const handleDeleteCustomer = (id) => {
    if (window.confirm('您确定要将此项移出资源池吗？（注：在实际CRM中通常为移入公海或软删除归档）')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      // 业务逻辑：根据公司要求决定是否连带删除对应的 followUps，为保证原型整洁这里连带清除
      setFollowUps(prev => prev.filter(f => f.customerId !== id));
      toast.success('客户已归档移出！');
    }
  };

  const handleDeleteFollowUp = (recordId) => {
    if (window.confirm('确认删除这条跟进记录吗？')) {
      setFollowUps(prev => prev.filter(f => f.id !== recordId));
      toast.success('跟进记录已删除！');
    }
  };

  const selectedCustomer = selectedCustomerId ? customers.find(c => c.id === selectedCustomerId) : null;

  // 模拟各个原有模块的占位页面
  const PlaceholderPage = ({ title, icon: Icon, desc }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <Icon size={48} />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-500 max-w-md text-center">{desc}</p>
      <div className="mt-8 px-4 py-2 bg-white text-slate-500 rounded-lg text-sm border border-slate-200 flex items-center shadow-sm">
        <CheckCircle size={16} className="mr-2 text-emerald-500" />
        系统原有存量模块（非本次新需求演示范围，已省略界面）
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      <ToastContainer />
      
      {/* Sidebar (左侧边栏) */}
      <aside className="w-[240px] bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 transition-all z-20 shadow-xl shadow-slate-900/20">
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <div className="flex-shrink-0 flex items-center bg-indigo-500 text-white w-8 h-8 rounded-lg justify-center font-bold text-lg mr-3 shadow-lg shadow-indigo-500/30">
            W
          </div>
          <span className="font-bold text-lg tracking-tight text-white">WallTech <span className="text-indigo-400">CRM</span></span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">核心业务</div>
          <button
            onClick={() => { setActiveTab('list'); setSelectedCustomerId(null); }}
            className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${activeTab === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/10 hover:text-white'}`}
          >
            <Users size={18} className={`mr-3 ${activeTab === 'list' ? 'text-indigo-200' : 'text-slate-400 group-hover:text-slate-300'}`} /> 
            <span className="font-medium text-sm">客户管理</span>
          </button>
          <button
            onClick={() => { setActiveTab('kpi'); setSelectedCustomerId(null); }}
            className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${activeTab === 'kpi' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/10 hover:text-white'}`}
          >
            <LayoutDashboard size={18} className={`mr-3 ${activeTab === 'kpi' ? 'text-indigo-200' : 'text-slate-400 group-hover:text-slate-300'}`} /> 
            <span className="font-medium text-sm">销售管理</span>
          </button>
          
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3 pt-6">扩展模块</div>
          <button
            onClick={() => { setActiveTab('marketing'); setSelectedCustomerId(null); }}
            className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${activeTab === 'marketing' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/10 hover:text-white'}`}
          >
            <Megaphone size={18} className={`mr-3 ${activeTab === 'marketing' ? 'text-indigo-200' : 'text-slate-400 group-hover:text-slate-300'}`} /> 
            <span className="font-medium text-sm">市场营销</span>
          </button>
          <button
            onClick={() => { setActiveTab('service'); setSelectedCustomerId(null); }}
            className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${activeTab === 'service' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/10 hover:text-white'}`}
          >
            <LifeBuoy size={18} className={`mr-3 ${activeTab === 'service' ? 'text-indigo-200' : 'text-slate-400 group-hover:text-slate-300'}`} /> 
            <span className="font-medium text-sm">服务与支持</span>
          </button>
          <button
            onClick={() => { setActiveTab('analysis'); setSelectedCustomerId(null); }}
            className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${activeTab === 'analysis' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/10 hover:text-white'}`}
          >
            <PieChart size={18} className={`mr-3 ${activeTab === 'analysis' ? 'text-indigo-200' : 'text-slate-400 group-hover:text-slate-300'}`} /> 
            <span className="font-medium text-sm">报表与分析</span>
          </button>
        </div>

        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="flex items-center space-x-3 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold shadow-inner">
              张
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">张三</p>
              <p className="text-xs text-slate-400 truncate">高级销售经理</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <div className="flex items-center text-slate-500 text-sm">
            <Menu size={20} className="mr-4 cursor-pointer hover:text-indigo-600 transition-colors" />
            <span className="font-medium">
              {activeTab === 'list' && (selectedCustomerId ? '客户管理 / 客户全景视图' : '客户管理 / 资源池')}
              {activeTab === 'kpi' && '销售管理 / 效能看板'}
              {activeTab === 'marketing' && '市场营销 / 活动管理'}
              {activeTab === 'service' && '服务与支持 / 工单中心'}
              {activeTab === 'analysis' && '报表与分析 / 全局洞察'}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-slate-400 hover:text-indigo-600 transition-colors"><Settings size={20} /></button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto w-full pb-12">
            {!selectedCustomerId && activeTab === 'list' && (
              <CustomerList 
                customers={customers} 
                followUps={followUps}
                onViewDetail={(c) => setSelectedCustomerId(c.id)}
                onAddCustomer={handleAddCustomer} 
                onDeleteCustomer={handleDeleteCustomer}
              />
            )}
            
            {!selectedCustomerId && activeTab === 'kpi' && (
              <KPIDashboard followUps={followUps} customers={customers} />
            )}

            {selectedCustomerId && selectedCustomer && (
              <CustomerDetail 
                customer={selectedCustomer} 
                followUps={followUps} 
                onBack={() => setSelectedCustomerId(null)}
                onAddFollowUp={handleAddFollowUp}
                onDeleteFollowUp={handleDeleteFollowUp}
              />
            )}

            {activeTab === 'marketing' && (
              <PlaceholderPage 
                title="市场营销自动化" 
                desc="用于规划和执行电子邮件营销、社交媒体推广及广告投放，提升品牌知名度与客户参与度。"
                icon={Megaphone}
              />
            )}
            {activeTab === 'service' && (
              <PlaceholderPage 
                title="客户服务与支持" 
                desc="提供工单管理与知识库功能，帮助客服团队快速响应客户需求，提升整体服务质量与客户满意度。"
                icon={LifeBuoy}
              />
            )}
            {activeTab === 'analysis' && (
              <PlaceholderPage 
                title="高级数据分析与报告" 
                desc="跨越多个维度（客户行为、销售业绩、市场周期）提供深度数据透视，为管理层战略决策提供支持。"
                icon={PieChart}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}