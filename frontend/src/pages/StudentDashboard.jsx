import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const ExpandedDetails = ({ app }) => (
  <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm text-slate-700 animate-fade-in-up">
    <div className="md:col-span-2 text-indigo-800 font-extrabold pb-2 border-b border-slate-200">Full Application Details</div>
    <div><strong className="text-slate-900">Student Name:</strong> {app.studentId?.name || 'N/A'}</div>
    <div><strong className="text-slate-900">Roll Number:</strong> {app.rollNumber}</div>
    <div><strong className="text-slate-900">Course/Branch:</strong> {app.degreeCourse} in {app.branch} {app.currentYear ? `(${app.currentYear}, ${app.yearSession})` : `(${app.yearSession})`}</div>
    <div><strong className="text-slate-900">Latest CPI & Contact:</strong> {app.latestCPI} | Ph: {app.contactNo}</div>
    <div className="md:col-span-2"><strong className="text-slate-900">Internship Type:</strong> {app.internshipType}</div>
    <div className="md:col-span-2"><strong className="text-slate-900">Org Address:</strong> {app.organizationAddress}</div>

    <div className="pt-4 mt-2 border-t border-slate-200">
      <h4 className="font-extrabold text-slate-900 uppercase tracking-widest text-xs mb-2">Contact Person/ Mentor / H.O.D. Details</h4>
      <p className="font-medium">{app.mentorName} ({app.mentorDesignation})</p>
      <p className="text-slate-500">{app.mentorEmail} | {app.mentorContact}</p>
    </div>
    <div className="pt-4 mt-2 border-t border-slate-200">
      <h4 className="font-extrabold text-slate-900 uppercase tracking-widest text-xs mb-2">Addressee Details</h4>
      <p className="font-medium">{app.addresseeName} ({app.addresseeDesignation})</p>
      <p className="text-slate-500">{app.addresseeEmail} | {app.addresseeContact}</p>
    </div>
  </div>
);

const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatFileUrl = (dbPath) => {
  if (!dbPath) return '#';
  const cleanPath = dbPath.includes('uploads/')
    ? dbPath.substring(dbPath.indexOf('uploads/'))
    : dbPath;
  return `http://localhost:5001/${cleanPath}`;
};

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [formData, setFormData] = useState({
    departmentId: '', rollNumber: '', degreeCourse: 'B.Tech', branch: '', currentYear: '3rd Year', yearSession: '', latestCPI: '', contactNo: '',
    internshipType: 'Regular Internship (6 weeks duration)', durationFrom: '', durationTo: '',
    companyName: '', organizationAddress: '', mentorName: '', mentorDesignation: '', mentorContact: '', mentorEmail: '',
    addresseeName: '', addresseeDesignation: '', addresseeContact: '', addresseeEmail: '',
    offerLetter: null, statementOfObjective: null, mandatoryDocument: null, nocFormat: null, studentMessage: ''
  });
  const [loading, setLoading] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = () => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const stats = {
    total: applications.length,
    approved: applications.filter(app => app.status.includes('APPROVED') || app.status.includes('READY') || app.status === 'COLLECTED').length,
    pending: applications.filter(app => !app.status.includes('APPROVED') && !app.status.includes('READY') && !app.status.includes('REJECTED') && app.status !== 'COLLECTED').length,
    rejected: applications.filter(app => app.status.includes('REJECTED')).length
  };

  useEffect(() => {
    fetchApplications();
    fetchDepartments();
  }, []);

  const fetchApplications = async () => {
    const res = await api.get('/student/applications');
    setApplications(res.data);
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/student/departments');
      setDepartments(res.data);
      if (res.data.length > 0 && !formData.departmentId) {
        setFormData(prev => ({ ...prev, departmentId: res.data[0]._id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mandatoryDocument) {
      alert('Please upload the mandatory SOP or Previous Semester Marksheet');
      return;
    }
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (!['offerLetter', 'statementOfObjective', 'mandatoryDocument'].includes(key)) {
        data.append(key, formData[key]);
      }
    });
    if (formData.offerLetter) data.append('offerLetter', formData.offerLetter);
    if (formData.statementOfObjective) data.append('statementOfObjective', formData.statementOfObjective);
    if (formData.mandatoryDocument) data.append('mandatoryDocument', formData.mandatoryDocument);
    if (formData.nocFormat) data.append('nocFormat', formData.nocFormat);

    try {
      await api.post('/student/apply', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Application submitted successfully');
      setFormData({
        departmentId: departments.length > 0 ? departments[0]._id : '',
        rollNumber: '', degreeCourse: 'B.Tech', branch: '', currentYear: '3rd Year', yearSession: '', latestCPI: '', contactNo: '',
        internshipType: 'Regular Internship (6 weeks duration)', durationFrom: '', durationTo: '',
        companyName: '', organizationAddress: '', mentorName: '', mentorDesignation: '',
        mentorContact: '', mentorEmail: '', addresseeName: '', addresseeDesignation: '',
        addresseeContact: '', addresseeEmail: '', offerLetter: null, statementOfObjective: null,
        mandatoryDocument: null, nocFormat: null, studentMessage: ''
      });
      fetchApplications();
      setActiveTab('dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Error applying for NOC');
    } finally {
      setLoading(false);
    }
  };

  const handleResubmit = (app) => {
    setFormData({
      departmentId: app.departmentId?._id || (departments.length > 0 ? departments[0]._id : ''),
      rollNumber: app.rollNumber || '',
      degreeCourse: app.degreeCourse || 'B.Tech',
      branch: app.branch || '',
      currentYear: app.currentYear || '3rd Year',
      yearSession: app.yearSession || '',
      latestCPI: app.latestCPI || '',
      contactNo: app.contactNo || '',
      internshipType: app.internshipType || 'Regular Internship (6 weeks duration)',
      durationFrom: app.durationFrom ? app.durationFrom.substring(0, 10) : '',
      durationTo: app.durationTo ? app.durationTo.substring(0, 10) : '',
      companyName: app.companyName || '',
      organizationAddress: app.organizationAddress || '',
      mentorName: app.mentorName || '',
      mentorDesignation: app.mentorDesignation || '',
      mentorContact: app.mentorContact || '',
      mentorEmail: app.mentorEmail || '',
      addresseeName: app.addresseeName || '',
      addresseeDesignation: app.addresseeDesignation || '',
      addresseeContact: app.addresseeContact || '',
      addresseeEmail: app.addresseeEmail || '',
      offerLetter: null,
      statementOfObjective: null,
      mandatoryDocument: null,
      nocFormat: null,
      studentMessage: ''
    });
    setActiveTab('apply');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusColor = (status) => {
    if (status.includes('APPROVED') || status.includes('READY')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (status.includes('REJECTED')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (status === 'COLLECTED') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      {/* Header with Dynamic Greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{getGreeting()}, {user?.name}</h1>
          <p className="text-slate-500 mt-1 font-medium">{formatDate()}</p>
        </div>
      </div>

      {/* iOS-Style Segmented Tabs */}
      <div className="flex justify-start">
        <div className="bg-slate-100 p-1.5 rounded-xl inline-flex shadow-inner">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2.5 text-sm transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-white shadow-sm text-indigo-700 font-bold rounded-lg' : 'text-slate-500 hover:text-slate-700 font-medium'}`}
          >
            My Dashboard & History
          </button>
          <button
            onClick={() => setActiveTab('apply')}
            className={`px-6 py-2.5 text-sm transition-all duration-200 ${activeTab === 'apply' ? 'bg-white shadow-sm text-indigo-700 font-bold rounded-lg' : 'text-slate-500 hover:text-slate-700 font-medium'}`}
          >
            Apply for New NOC
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <div className="space-y-8">
          {/* Applications List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-slate-200 pb-3">My Applications Pipeline</h2>
            {applications.length === 0 && (
              <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-[2rem] p-12 text-center shadow-sm">
                <svg className="mx-auto h-16 w-16 text-slate-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No applications found</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-8">You haven't applied for a No Objection Certificate yet. Ready to start your internship journey?</p>
                <button
                  onClick={() => setActiveTab('apply')}
                  className="inline-flex items-center px-8 py-3.5 bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-700 transform transition-all hover:-translate-y-1 shadow-lg shadow-indigo-100"
                >
                  Start New Application →
                </button>
              </div>
            )}

            {applications.map(app => (
              <div key={app._id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 flex flex-col lg:flex-row justify-between relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex-1 pl-4">
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-1">{app.companyName}</h3>
                  <p className="text-sm font-medium text-indigo-600 mb-4 tracking-wide uppercase">{app.internshipType}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-slate-600">
                    <div><span className="font-bold text-slate-400 mr-2">Duration</span> <span className="text-slate-800 font-medium">{app.durationFrom} to {app.durationTo}</span></div>
                    <div><span className="font-bold text-slate-400 mr-2">Mentor</span> <span className="text-slate-800 font-medium">{app.mentorName} ({app.mentorEmail})</span></div>
                    <div className="md:col-span-2 line-clamp-1"><span className="font-bold text-slate-400 mr-2">Location</span> <span className="text-slate-800 font-medium">{app.organizationAddress}</span></div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button onClick={() => setExpandedAppId(expandedAppId === app._id ? null : app._id)} className="inline-flex items-center text-indigo-600 text-xs font-bold uppercase tracking-widest hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg active:bg-indigo-100">
                      {expandedAppId === app._id ? 'Close Details ▲' : 'View Full Details ▼'}
                    </button>
                    {app.approvedAt && app.status.includes('APPROVED') && (
                      <span className="inline-flex items-center bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        Approved On: {formatDate(app.approvedAt)}
                      </span>
                    )}
                  </div>

                  {expandedAppId === app._id && <ExpandedDetails app={app} />}

                  <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-6 text-sm">
                    {app.mandatoryDocument && <a href={formatFileUrl(app.mandatoryDocument)} target="_blank" rel="noreferrer" className="inline-flex items-center text-rose-600 font-bold hover:text-rose-800 transition-colors"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View SOP/Marksheet</a>}
                    {app.offerLetter && <a href={formatFileUrl(app.offerLetter)} target="_blank" rel="noreferrer" className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-800 transition-colors"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Offer Letter</a>}
                    {app.statementOfObjective && <a href={formatFileUrl(app.statementOfObjective)} target="_blank" rel="noreferrer" className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-800 transition-colors"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Statement</a>}
                    {app.nocFormat && <a href={formatFileUrl(app.nocFormat)} target="_blank" rel="noreferrer" className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-800 transition-colors"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View NOC Format</a>}
                  </div>
                </div>

                <div className="mt-8 lg:mt-0 lg:ml-10 flex flex-col justify-center items-end bg-slate-50 p-6 rounded-2xl border border-slate-100 w-full lg:w-80 flex-shrink-0">
                  <span className={`px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest font-extrabold w-full text-center border ${getStatusColor(app.status)}`}>
                    {app.status.replace(/_/g, ' ')}
                  </span>
                  {app.remarks && (
                    <div className="mt-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-left w-full relative">
                      <div className="absolute -top-2 left-4 bg-white px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Officer Note</div>
                      "{app.remarks}"
                    </div>
                  )}
                  {app.status.includes('REJECTED') && (
                    <button onClick={() => handleResubmit(app)} className="mt-4 w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-md flex justify-center items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Edit & Resubmit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Application Form Tab */
        <div id="noc-form-section" className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-xl border border-slate-100 scroll-mt-24">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Requisition Form for NOC</h2>
            <p className="text-slate-500 mt-3 font-medium max-w-2xl mx-auto">Fill out the detailed application below. Mandatory fields are marked with a red asterisk.<span className="text-rose-500 font-bold ml-1">*</span></p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

            {/* Section 1: Academic Details */}
            <div className="md:col-span-2"><h3 className="font-extrabold text-lg text-indigo-900 uppercase tracking-wider border-b-2 border-slate-100 pb-2 mb-2">1. Academic & Student Details</h3></div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Department <span className="text-rose-500 ml-1">*</span></label>
              <select name="departmentId" value={formData.departmentId} onChange={handleInputChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm font-medium text-slate-800">
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Roll Number <span className="text-rose-500 ml-1">*</span></label>
              <input type="text" name="rollNumber" placeholder="e.g. 21CS101" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm font-medium" value={formData.rollNumber} onChange={handleInputChange} />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Degree / Course <span className="text-rose-500 ml-1">*</span></label>
              <select name="degreeCourse" value={formData.degreeCourse} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm font-medium">
                <option value="B.Tech">B.Tech</option>
                <option value="MBA">MBA</option>
                <option value="M.Tech">M.Tech</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Branch <span className="text-rose-500 ml-1">*</span></label>
              <input type="text" name="branch" required placeholder="e.g. Computer Science" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm font-medium" value={formData.branch} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Current Year <span className="text-rose-500 ml-1">*</span></label>
              <select name="currentYear" value={formData.currentYear} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm font-medium">
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="5th Year">5th Year</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Year / Session <span className="text-rose-500 ml-1">*</span></label>
              <input type="text" name="yearSession" placeholder="e.g. 2023-2024" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm font-medium" value={formData.yearSession} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Latest CPI <span className="text-rose-500 ml-1">*</span></label>
              <input type="number" step="0.01" name="latestCPI" required placeholder="e.g. 8.5" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm font-medium" value={formData.latestCPI} onChange={handleInputChange} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Mobile / Contact No. <span className="text-rose-500 ml-1">*</span></label>
              <input type="text" name="contactNo" required placeholder="10-digit number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm font-medium" value={formData.contactNo} onChange={handleInputChange} />
            </div>

            {/* Section 2: Internship Details */}
            <div className="md:col-span-2 mt-8"><h3 className="font-extrabold text-lg text-indigo-900 uppercase tracking-wider border-b-2 border-slate-100 pb-2 mb-2">2. Internship Details</h3></div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Type of Internship Programme <span className="text-rose-500 ml-1">*</span></label>
              <select name="internshipType" value={formData.internshipType} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm font-medium">
                <option value="Embedded Internship (14 weeks duration)">B.Tech - Embedded Internship (14 weeks duration)</option>
                <option value="Regular Internship (6 weeks duration)">B.Tech - Regular Internship (6 weeks duration)</option>
                <option value="Regular Internship (6-8 weeks duration)">MBA - Regular Internship (6-8 weeks duration)</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Duration From <span className="text-rose-500 ml-1">*</span></label>
              <input type="date" name="durationFrom" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm font-medium" value={formData.durationFrom} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Duration To <span className="text-rose-500 ml-1">*</span></label>
              <input type="date" name="durationTo" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm font-medium" value={formData.durationTo} onChange={handleInputChange} />
            </div>

            {/* Section 3: Organization Details */}
            <div className="md:col-span-2 mt-8"><h3 className="font-extrabold text-lg text-indigo-900 uppercase tracking-wider border-b-2 border-slate-100 pb-2 mb-2">3. Organization Details</h3></div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Organization Name <span className="text-rose-500 ml-1">*</span></label>
              <input type="text" name="companyName" required placeholder="e.g. Google India" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm font-medium" value={formData.companyName} onChange={handleInputChange} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Organization Address <span className="text-rose-500 ml-1">*</span></label>
              <textarea name="organizationAddress" required placeholder="Full physical address of internship location" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm font-medium resize-none" rows="3" value={formData.organizationAddress} onChange={handleInputChange}></textarea>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Section 4: Contact Person / Mentor Details */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-2">Contact Person/ Mentor / H.O.D. Details</h3>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Name (Mr./Ms./Dr./Prof.) <span className="text-rose-500 ml-1">*</span></label>
                  <input type="text" name="mentorName" required className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.mentorName} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Designation <span className="text-rose-500 ml-1">*</span></label>
                  <input type="text" name="mentorDesignation" required className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.mentorDesignation} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Contact No. <span className="text-rose-500 ml-1">*</span></label>
                  <input type="text" name="mentorContact" required className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.mentorContact} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">E-mail <span className="text-rose-500 ml-1">*</span></label>
                  <input type="email" name="mentorEmail" required className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.mentorEmail} onChange={handleInputChange} />
                </div>
              </div>

              {/* Section 5: Addressee Details */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-2">Addressee Details</h3>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Name (Mr./Ms./Dr./Prof.) <span className="text-slate-400 font-normal ml-1">(Optional)</span></label>
                  <input type="text" name="addresseeName" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.addresseeName} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Designation <span className="text-slate-400 font-normal ml-1">(Optional)</span></label>
                  <input type="text" name="addresseeDesignation" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.addresseeDesignation} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Contact No. <span className="text-slate-400 font-normal ml-1">(Optional)</span></label>
                  <input type="text" name="addresseeContact" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.addresseeContact} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">E-mail <span className="text-slate-400 font-normal ml-1">(Optional)</span></label>
                  <input type="email" name="addresseeEmail" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formData.addresseeEmail} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="md:col-span-2 mt-8"><h3 className="font-extrabold text-lg text-indigo-900 uppercase tracking-wider border-b-2 border-slate-100 pb-2 mb-2">4. Attachments</h3></div>

            <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-rose-200 border-dashed transition-all hover:bg-rose-50/50">
              <label className="block text-sm font-bold text-slate-700 mb-2">SOP or Previous Semester Marksheet <span className="text-rose-500 ml-1">*</span></label>
              <input type="file" accept="application/pdf" required className="w-full file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200 transition-all cursor-pointer text-slate-600" onChange={e => setFormData({ ...formData, mandatoryDocument: e.target.files[0] })} />
              <p className="text-xs text-slate-500 mt-2 font-medium">Please upload a combined PDF of your SOP and Marksheet.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 border-dashed transition-all hover:bg-slate-100/50">
              <label className="block text-sm font-bold text-slate-700 mb-2">Statement of Objective <span className="text-slate-400 font-normal ml-1">(Optional PDF)</span></label>
              <input type="file" accept="application/pdf" className="w-full file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer text-slate-600" onChange={e => setFormData({ ...formData, statementOfObjective: e.target.files[0] })} />
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 border-dashed transition-all hover:bg-slate-100/50">
              <label className="block text-sm font-bold text-slate-700 mb-2">Offer Letter <span className="text-slate-400 font-normal ml-1">(Optional PDF)</span></label>
              <input type="file" accept="application/pdf" className="w-full file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer text-slate-600" onChange={e => setFormData({ ...formData, offerLetter: e.target.files[0] })} />
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 border-dashed transition-all hover:bg-slate-100/50">
              <label className="block text-sm font-bold text-slate-700 mb-2">Required Format of NOC <span className="text-slate-400 font-normal ml-1">(Optional PDF)</span></label>
              <input type="file" accept="application/pdf" className="w-full file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer text-slate-600" onChange={e => setFormData({ ...formData, nocFormat: e.target.files[0] })} />
            </div>

            {/* Student Message */}
            <div className="md:col-span-2 mt-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">Any urgent message or remarks for the approver? <span className="text-slate-400 font-normal ml-1">(Optional)</span></label>
              <textarea
                name="studentMessage"
                placeholder="e.g., I need to apply for this internship tomorrow, please process ASAP."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm font-medium resize-none"
                rows="3"
                value={formData.studentMessage}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div className="md:col-span-2 mt-8 pt-6 border-t border-slate-100">
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-lg font-extrabold py-4 px-8 rounded-xl transform transition-all duration-200 shadow-lg shadow-indigo-200 hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none">
                {loading ? 'Submitting Application...' : 'Submit NOC Requisition Form →'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
