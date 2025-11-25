// Resend.jsx (Forgot Password) - Professional Design with Theme Support
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Key, Send, Shield, Moon, Sun, ArrowLeft } from "lucide-react";

const Resend = () => {
  const [form, setForm] = useState({ email: "", otp: "", password: "" });
  const [error, setError] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme === 'dark');

    const handleStorageChange = () => {
      const newTheme = localStorage.getItem('theme');
      setDarkMode(newTheme === 'dark');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    window.dispatchEvent(new Event('storage'));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error[e.target.name]) {
      setError({ ...error, [e.target.name]: "" });
    }
  };

  const handleOtp = async (e) => {
    e.preventDefault();

    const { email } = form;
    const errors = {};

    if (!email) errors.email = "Email is required!";

    if (Object.keys(errors).length) {
      setError(errors);
      return;
    }
    
    setError({});
    setLoading(true);

    try {
      const res = await axios.post("https://task-management-b4ua.onrender.com/api/users/resend", { email });

      if (res.status === 200) {
        setOtpSent(true);
        alert("✅ OTP sent successfully! Check your email.");
      }
    } catch (err) {
      console.error("OTP Error:", err.response?.data || err.message);
      setError({ 
        submit: err.response?.data?.message || "Failed to send OTP, please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password, otp } = form;
    const errors = {};

    if (!email) errors.email = "Email is required!";
    if (!password) errors.password = "New password is required!";
    if (!otp) errors.otp = "OTP is required!";

    if (Object.keys(errors).length) {
      setError(errors);
      return;
    }
    
    setError({});
    setLoading(true);

    try {
      const res = await axios.post("https://task-management-b4ua.onrender.com/api/users/fp", {
        email,
        password,
        otp
      });

      if (res.status === 200) {
        alert("✅ Password changed successfully!");
        setTimeout(() => {
          navigate('/login');
        }, 500);
      }
    } catch (err) {
      console.error("Reset Password Error:", err.response?.data || err.message);
      setError({ 
        submit: err.response?.data?.message || "Failed to reset password, please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-rose-50 via-teal-50 to-cyan-50'
    }`}>
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-6 right-6 p-3 rounded-full transition-all transform hover:scale-110 shadow-xl z-50 ${
          darkMode 
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' 
            : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
        }`}
        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      {/* Back Button */}
      <Link
        to="/login"
        className={`fixed top-6 left-6 p-3 rounded-full transition-all transform hover:scale-110 shadow-xl z-50 ${
          darkMode 
            ? 'bg-slate-800/50 border-2 border-purple-500/30 text-white hover:bg-slate-700/50' 
            : 'bg-white/90 border-2 border-teal-200 text-gray-800 hover:bg-white'
        }`}
        title="Back to Login"
      >
        <ArrowLeft className="w-6 h-6" />
      </Link>

      {/* Forgot Password Card */}
      <div className={`w-full max-w-md rounded-2xl shadow-2xl backdrop-blur-xl border-2 transition-all ${
        darkMode 
          ? 'bg-slate-800/50 border-purple-500/30' 
          : 'bg-white/90 border-teal-200'
      }`}>
        {/* Header */}
        <div className={`p-8 text-center border-b-2 ${
          darkMode ? 'border-purple-500/30' : 'border-teal-200'
        }`}>
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            darkMode 
              ? 'bg-gradient-to-br from-purple-600 to-pink-600' 
              : 'bg-gradient-to-br from-teal-500 to-cyan-500'
          }`}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-3xl font-bold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Reset Password
          </h2>
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {otpSent ? 'Enter OTP and new password' : 'Enter your email to receive OTP'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Email Field */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                disabled={otpSent}
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                  error.email 
                    ? 'border-red-500 focus:ring-red-500' 
                    : (darkMode 
                        ? 'bg-slate-700/50 border-purple-400/50 text-white focus:ring-purple-500' 
                        : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500')
                } ${otpSent ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
            {error.email && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <span className="font-semibold">⚠</span> {error.email}
              </p>
            )}
          </div>

          {/* Send OTP Button */}
          {!otpSent && (
            <button
              type="button"
              onClick={handleOtp}
              disabled={loading || !form.email}
              className={`w-full py-3 px-6 rounded-xl font-bold text-white transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending OTP...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send OTP
                </>
              )}
            </button>
          )}

          {/* OTP and Password Fields (shown after OTP is sent) */}
          {otpSent && (
            <>
              {/* OTP Field */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  OTP Code
                </label>
                <div className="relative">
                  <Key className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={form.otp}
                    onChange={handleChange}
                    maxLength={6}
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                      error.otp 
                        ? 'border-red-500 focus:ring-red-500' 
                        : (darkMode 
                            ? 'bg-slate-700/50 border-purple-400/50 text-white focus:ring-purple-500' 
                            : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500')
                    }`}
                  />
                </div>
                {error.otp && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span className="font-semibold">⚠</span> {error.otp}
                  </p>
                )}
              </div>

              {/* New Password Field */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  New Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter new password"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                      error.password 
                        ? 'border-red-500 focus:ring-red-500' 
                        : (darkMode 
                            ? 'bg-slate-700/50 border-purple-400/50 text-white focus:ring-purple-500' 
                            : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500')
                    }`}
                  />
                </div>
                {error.password && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span className="font-semibold">⚠</span> {error.password}
                  </p>
                )}
              </div>

              {/* Resend OTP Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleOtp}
                  disabled={loading}
                  className={`text-sm font-semibold transition-all hover:underline ${
                    darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-teal-600 hover:text-teal-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Resend OTP
                </button>
              </div>
            </>
          )}

          {/* Submit Error */}
          {error.submit && (
            <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
              <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                <span className="text-lg">⚠</span>
                {error.submit}
              </p>
            </div>
          )}

          {/* Reset Password Button (shown after OTP is sent) */}
          {otpSent && (
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-xl font-bold text-white transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Resetting Password...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Reset Password
                </>
              )}
            </button>
          )}

          {/* Sign Up Link */}
          <p className={`text-center text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Don't have an account?{" "}
            <Link 
              to="/sign" 
              className={`font-bold transition-all hover:underline ${
                darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-teal-600 hover:text-teal-700'
              }`}
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Resend;