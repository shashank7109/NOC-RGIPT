import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({ email: '', otp: '', newPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: formData.email });
      setMessage(res.data.message || 'OTP sent to your email! (Check inbox)');
      setShowOtpField(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending password reset request');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', formData);
      toast.success(res.data.message);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center -mt-8">
      <div className="bg-white flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl mx-4 border border-slate-100">

        {/* Left Side: Graphic */}
        <div className="hidden md:flex flex-col flex-1 bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 text-white p-12 justify-center items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

          <img src="/rgipt_logo.png" alt="RGIPT Logo" className="w-32 h-auto mb-8 z-10 drop-shadow-xl" />
          <h2 className="text-4xl font-extrabold mb-4 z-10 text-center tracking-tight text-white drop-shadow">Account Recovery</h2>
          <p className="text-blue-100 text-center z-10 max-w-sm text-lg font-medium leading-relaxed">Securely reset your password and get back to managing your NOCs.</p>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 sm:p-14 w-full flex flex-col justify-center bg-white relative">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Reset Password</h2>
            <p className="text-slate-500 font-medium mb-8">Enter your registered email below to receive a reset code.</p>

            {error && <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-6 text-sm font-medium flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
              {error}
            </div>}
            {message && <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-xl mb-6 text-sm font-medium flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              {message}
            </div>}

            <form onSubmit={showOtpField ? handleResetPassword : handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Registered Email (@rgipt.ac.in)</label>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={showOtpField}
                  placeholder="e.g. name@rgipt.ac.in"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {showOtpField && (
                <div className="animate-fade-in-up space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-indigo-700 mb-1">6-Digit Reset Code</label>
                    <input
                      type="text"
                      name="otp"
                      required
                      maxLength="6"
                      placeholder="Enter verification code"
                      className="w-full px-4 py-3 border-2 border-indigo-200 bg-indigo-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold tracking-widest text-center text-indigo-900"
                      value={formData.otp}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm pr-16"
                        value={formData.newPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-slate-500 hover:text-indigo-600 font-bold transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                {showOtpField ? (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setShowOtpField(false); setFormData({ ...formData, otp: '', newPassword: '' }); }}
                      className="w-1/3 bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-200 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-2/3 bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 transform transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {loading ? 'Resetting...' : 'Change Password'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 transform transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {loading ? 'Sending Code...' : 'Send Reset Code'}
                  </button>
                )}
              </div>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-slate-600">
              Remembered your password? <Link to="/login" className="text-indigo-600 font-bold hover:underline ml-1">Log in</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
