// SignUp.jsx - Professional Design with Theme Support
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Hash, Lock, Phone, UserPlus, Moon, Sun, Eye, EyeOff } from "lucide-react";

const SignUp = () => {
  const [form, setForm] = useState({ name: "", email: "", age: "", password: "", phone: "" });
  const [error, setError] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, age, password, phone } = form;
    const errors = {};

    if (!name) errors.name = "Name is required!";
    if (!email) errors.email = "Email is required!";
    if (!age) errors.age = "Age is required!";
    if (!password) errors.password = "Password is required!";
    if (!phone) errors.phone = "Phone is required!";

    if (Object.keys(errors).length) {
      setError(errors);
      return;
    }
    
    setError({});
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:7800/api/users/add", form);
      alert("✅ Account created successfully! Please check your email for OTP.");
      console.log("User added:", res.data);
      setTimeout(() => {
        navigate("/login");
      }, 500);
    } catch (err) {
      console.error("SignUp Error:", err);
      setError({ 
        submit: err.response?.data?.message || "Failed to create account, please try again." 
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

      {/* SignUp Card */}
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
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-3xl font-bold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Create Account
          </h2>
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Join us today and start managing tasks
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {/* Name Field */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Full Name
            </label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                  error.name 
                    ? 'border-red-500 focus:ring-red-500' 
                    : (darkMode 
                        ? 'bg-slate-700/50 border-purple-400/50 text-white focus:ring-purple-500' 
                        : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500')
                }`}
              />
            </div>
            {error.name && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <span className="font-semibold">⚠</span> {error.name}
              </p>
            )}
          </div>

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
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                  error.email 
                    ? 'border-red-500 focus:ring-red-500' 
                    : (darkMode 
                        ? 'bg-slate-700/50 border-purple-400/50 text-white focus:ring-purple-500' 
                        : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500')
                }`}
              />
            </div>
            {error.email && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <span className="font-semibold">⚠</span> {error.email}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Phone Number
            </label>
            <div className="relative">
              <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={handleChange}
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                  error.phone 
                    ? 'border-red-500 focus:ring-red-500' 
                    : (darkMode 
                        ? 'bg-slate-700/50 border-purple-400/50 text-white focus:ring-purple-500' 
                        : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500')
                }`}
              />
            </div>
            {error.phone && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <span className="font-semibold">⚠</span> {error.phone}
              </p>
            )}
          </div>

          {/* Age Field */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Age
            </label>
            <div className="relative">
              <Hash className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="number"
                name="age"
                placeholder="Enter your age"
                value={form.age}
                onChange={handleChange}
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                  error.age 
                    ? 'border-red-500 focus:ring-red-500' 
                    : (darkMode 
                        ? 'bg-slate-700/50 border-purple-400/50 text-white focus:ring-purple-500' 
                        : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500')
                }`}
              />
            </div>
            {error.age && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <span className="font-semibold">⚠</span> {error.age}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                className={`w-full pl-11 pr-11 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition ${
                  error.password 
                    ? 'border-red-500 focus:ring-red-500' 
                    : (darkMode 
                        ? 'bg-slate-700/50 border-purple-400/50 text-white focus:ring-purple-500' 
                        : 'bg-white border-teal-300 text-gray-800 focus:ring-teal-500')
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {error.password && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <span className="font-semibold">⚠</span> {error.password}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {error.submit && (
            <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
              <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                <span className="text-lg">⚠</span>
                {error.submit}
              </p>
            </div>
          )}

          {/* Submit Button */}
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
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>

          {/* Login Link */}
          <p className={`text-center text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Already have an account?{" "}
            <Link 
              to="/login" 
              className={`font-bold transition-all hover:underline ${
                darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-teal-600 hover:text-teal-700'
              }`}
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;