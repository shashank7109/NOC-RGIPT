import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
    const [departments, setDepartments] = useState([]);
    const [newDept, setNewDept] = useState({ name: '', code: '' });
    const [routings, setRoutings] = useState([]);
    const [newRouting, setNewRouting] = useState({ departmentId: '', primaryApproverEmail: '', roleType: 'tnp_coordinator' });
    const [roleAssignForm, setRoleAssignForm] = useState({ email: '', role: 'DeptOfficer', departmentId: '' });
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        document.title = 'RGIPT NOC — Admin Dashboard';
        fetchDepartments();
        fetchRoutings();
    }, []);

    const fetchDepartments = async () => {
        try {
            setFetching(true);
            const res = await api.get('/admin/departments');
            setDepartments(res.data);
            if (res.data.length > 0) {
                setNewRouting(prev => ({ ...prev, departmentId: res.data[0]._id }));
                setRoleAssignForm(prev => ({ ...prev, departmentId: res.data[0]._id }));
            }
        } catch (error) {
            toast.error('Failed to load departments');
        } finally {
            setFetching(false);
        }
    };

    const fetchRoutings = async () => {
        try {
            const res = await api.get('/admin/routing');
            setRoutings(res.data);
        } catch (error) {
            toast.error('Failed to load routing configurations');
        }
    };

    const handleCreateDept = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/departments', newDept);
            setNewDept({ name: '', code: '' });
            toast.success('Department created successfully!');
            fetchDepartments();
        } catch (error) {
            toast.error('Error creating department: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleUpdateRouting = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/routing', newRouting);
            setNewRouting({ ...newRouting, primaryApproverEmail: '' });
            toast.success('Routing config updated!');
            fetchRoutings();
        } catch (error) {
            toast.error('Error updating config');
        }
    };

    const handleAssignRole = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/admin/users/assign-role', roleAssignForm);
            toast.success(res.data.message);
            setRoleAssignForm({ email: '', role: 'DeptOfficer', departmentId: departments[0]?._id });
        } catch (error) {
            toast.error('Error assigning role: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="space-y-12 pb-12 animate-fade-in-up">
            <div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">System Administration</h1>
                <p className="text-slate-500 mt-2 font-medium">Manage departments, routing workflows, and secure access-control delegations.</p>
            </div>

            {/* Role Assignment Section */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-lg border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                <div className="pl-4">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                        <span className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </span>
                        <h2 className="text-2xl font-extrabold text-slate-800">Assign Elevated Roles (Pre-provisioning)</h2>
                    </div>

                    <form onSubmit={handleAssignRole} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                        <div className="col-span-1 md:pr-6 md:border-r border-slate-100 h-full flex items-center">
                            <p className="text-sm font-medium text-slate-500 leading-relaxed tracking-wide">Securely map specific `@rgipt.ac.in` addresses to elevated staff roles. Assignments take effect immediately upon their next authentication.</p>
                        </div>
                        <div className="space-y-5 col-span-1 md:col-span-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">User Email Address</label>
                                    <input type="email" placeholder="faculty@rgipt.ac.in" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium shadow-sm transition-all text-slate-800" value={roleAssignForm.email} onChange={e => setRoleAssignForm({ ...roleAssignForm, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Access Level Authorization</label>
                                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-900 shadow-sm transition-all" value={roleAssignForm.role} onChange={e => setRoleAssignForm({ ...roleAssignForm, role: e.target.value })}>
                                        <option value="DeptOfficer">TNP Coordinator / Dept Officer</option>
                                        <option value="TNPHead">TNP Head</option>
                                        <option value="Admin">System Administrator</option>
                                    </select>
                                </div>
                            </div>

                            {roleAssignForm.role === 'DeptOfficer' && (
                                <div className="animate-fade-in-up">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Restrict Scope to Department</label>
                                    <select className="w-full px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-900 shadow-sm transition-all" value={roleAssignForm.departmentId} onChange={e => setRoleAssignForm({ ...roleAssignForm, departmentId: e.target.value })}>
                                        {departments.map(d => <option key={d._id} value={d._id}>{d.name} ({d.code})</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="pt-2">
                                <button type="submit" className="w-full bg-slate-900 text-white font-extrabold tracking-widest uppercase text-sm py-4 rounded-xl hover:bg-black hover:-translate-y-0.5 shadow-xl shadow-slate-200 transition-all duration-200 border border-slate-800 flex justify-center items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    Provision User Role Authorization
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Departments Setup */}
                <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></span>
                        <h2 className="text-xl font-extrabold text-slate-800">Manage Departments</h2>
                    </div>
                    <form onSubmit={handleCreateDept} className="flex gap-3 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <input type="text" placeholder="Dept Name" required className="flex-1 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium shadow-sm transition-all" value={newDept.name} onChange={e => setNewDept({ ...newDept, name: e.target.value })} />
                        <input type="text" placeholder="Code" required className="w-24 px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold uppercase shadow-sm transition-all" value={newDept.code} onChange={e => setNewDept({ ...newDept, code: e.target.value })} />
                        <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-blue-700 shadow-md transition-colors">+</button>
                    </form>

                    <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">Registered Units</h3>
                    <ul className="space-y-3">
                        {departments.map(dept => (
                            <li key={dept._id} className="p-4 bg-white border border-slate-100 shadow-sm rounded-xl flex justify-between items-center group hover:border-blue-200 transition-colors">
                                <span className="font-bold text-slate-700">{dept.name}</span>
                                <span className="text-xs font-extrabold bg-slate-100 text-slate-500 px-3 py-1 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">{dept.code}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Routing Setup */}
                <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg></span>
                        <h2 className="text-xl font-extrabold text-slate-800">Workflow Routing Engine</h2>
                    </div>

                    <form onSubmit={handleUpdateRouting} className="space-y-5 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Subject Department</label>
                            <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium shadow-sm transition-all text-slate-800" value={newRouting.departmentId} onChange={e => setNewRouting({ ...newRouting, departmentId: e.target.value })}>
                                {departments.map(d => <option key={d._id} value={d._id}>{d.name} ({d.code})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Target Approver Email</label>
                            <div className="relative">
                                <input type="email" placeholder="hod@rgipt.ac.in" required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium shadow-sm transition-all text-slate-800 pl-10" value={newRouting.primaryApproverEmail} onChange={e => setNewRouting({ ...newRouting, primaryApproverEmail: e.target.value })} />
                                <svg className="w-4 h-4 text-slate-400 absolute left-4 top-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-emerald-600 text-white font-extrabold tracking-widest uppercase text-xs py-3.5 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5">Initialize Routing Rule</button>
                    </form>

                    <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">Active Pipeline Hooks</h3>
                    <ul className="space-y-3">
                        {routings.map(route => (
                            <li key={route._id} className="p-4 bg-white border border-slate-100 shadow-sm rounded-xl hover:border-emerald-200 transition-colors relative overflow-hidden group">
                                <div className="absolute left-0 top-0 h-full w-1.5 bg-emerald-400"></div>
                                <div className="font-extrabold text-slate-800 ml-2">{route.departmentId?.name}</div>
                                <div className="text-xs font-bold text-slate-500 ml-2 mt-2 flex items-center">
                                    <span className="bg-slate-100 text-slate-400 px-2 py-1 rounded border border-slate-200 mr-2">NOC Request</span>
                                    <span className="text-emerald-500 mr-2">→</span>
                                    <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">{route.primaryApproverEmail}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
