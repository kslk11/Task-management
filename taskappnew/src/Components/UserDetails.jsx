// UserDetails.jsx - Professional Design with Theme Support
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Hash, 
  Moon, 
  Sun,
  ArrowLeft,
  Shield,
  Clock,
  RefreshCw
} from "lucide-react";

const UserDetails = () => {
    const [user, setUser] = useState({});
    const [darkMode, setDarkMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

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

    const getUser = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:7800/api/users/getOne", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(res.data);
        } catch (err) {
            console.error("Error fetching user:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateTheme = async (mode) => {
        try {
            setDarkMode(mode === 'dark');
            localStorage.setItem("theme", mode);
            await axios.put(
                "http://localhost:7800/api/users/updateTheme",
                { theme: mode },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Trigger storage event for other tabs/components
            window.dispatchEvent(new Event('storage'));
        } catch (err) {
            console.error("Error updating theme:", err);
        }
    };

    const toggleTheme = () => {
        const newMode = darkMode ? 'light' : 'dark';
        updateTheme(newMode);
    };

    useEffect(() => {
        if (token) getUser();
    }, [token]);

    // Get user initials
    const getUserInitials = (name) => {
        if (!name) return "U";
        const names = name.split(" ");
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
                darkMode 
                    ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
                    : 'bg-gradient-to-br from-rose-50 via-teal-50 to-cyan-50'
            }`}>
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className={`w-12 h-12 animate-spin ${darkMode ? 'text-purple-400' : 'text-teal-600'}`} />
                    <p className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Loading profile...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex items-center justify-center p-6 transition-all duration-500 ${
            darkMode 
                ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
                : 'bg-gradient-to-br from-rose-50 via-teal-50 to-cyan-50'
        }`}>
            <div className={`w-full max-w-2xl rounded-2xl shadow-2xl backdrop-blur-xl border-2 overflow-hidden transition-all ${
                darkMode 
                    ? 'bg-slate-800/50 border-purple-500/30' 
                    : 'bg-white/95 border-teal-200'
            }`}>
                {/* Header Banner */}
                <div className={`h-40 w-full relative ${
                    darkMode 
                        ? 'bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800' 
                        : 'bg-gradient-to-br from-teal-400 via-cyan-500 to-teal-600'
                }`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className={`absolute top-4 left-4 p-2 rounded-xl transition-all hover:scale-110 shadow-lg ${
                            darkMode 
                                ? 'bg-slate-800/70 text-white hover:bg-slate-700 border border-purple-500/30' 
                                : 'bg-white/90 text-gray-800 hover:bg-white border border-teal-200'
                        }`}
                        title="Go Back"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    {/* Theme Toggle */}
                   
                </div>

                {/* Profile Section */}
                <div className="px-8 -mt-16 flex flex-col items-center text-center relative z-10">
                    {/* Profile Avatar */}
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-2xl ring-4 ${
                        darkMode 
                            ? 'bg-gradient-to-br from-purple-600 to-pink-600 ring-slate-700' 
                            : 'bg-gradient-to-br from-teal-500 to-cyan-500 ring-white'
                    }`}>
                        {getUserInitials(user?.name)}
                    </div>

                    {/* User Name */}
                    <h2 className={`text-3xl font-bold mt-4 ${
                        darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                        {user?.name || "User"}
                    </h2>
                    
                    {/* Role Badge */}
                    <div className={`mt-2 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg ${
                        darkMode 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                            : 'bg-teal-100 text-teal-700 border border-teal-200'
                    }`}>
                        <Shield className="inline mr-1" size={14} />
                        Team Member
                    </div>
                </div>

                {/* User Details */}
                <div className="px-8 py-8 space-y-4">
                    {/* Email */}
                    <div className={`p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                        darkMode 
                            ? 'bg-slate-700/30 border-purple-400/30' 
                            : 'bg-teal-50 border-teal-200'
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                                darkMode 
                                    ? 'bg-purple-600' 
                                    : 'bg-teal-500'
                            }`}>
                                <Mail size={18} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold mb-1 ${
                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    Email Address
                                </p>
                                <p className={`font-medium truncate ${
                                    darkMode ? 'text-white' : 'text-gray-800'
                                }`}>
                                    {user.email || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className={`p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                        darkMode 
                            ? 'bg-slate-700/30 border-purple-400/30' 
                            : 'bg-cyan-50 border-cyan-200'
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                                darkMode 
                                    ? 'bg-pink-600' 
                                    : 'bg-cyan-500'
                            }`}>
                                <Phone size={18} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <p className={`text-xs font-semibold mb-1 ${
                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    Phone Number
                                </p>
                                <p className={`font-medium ${
                                    darkMode ? 'text-white' : 'text-gray-800'
                                }`}>
                                    {user.phone || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Age */}
                    <div className={`p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                        darkMode 
                            ? 'bg-slate-700/30 border-purple-400/30' 
                            : 'bg-purple-50 border-purple-200'
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                                darkMode 
                                    ? 'bg-purple-500' 
                                    : 'bg-purple-500'
                            }`}>
                                <Hash size={18} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <p className={`text-xs font-semibold mb-1 ${
                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    Age
                                </p>
                                <p className={`font-medium ${
                                    darkMode ? 'text-white' : 'text-gray-800'
                                }`}>
                                    {user.age || "N/A"} years old
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Account Status */}
                    <div className={`p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                        darkMode 
                            ? 'bg-slate-700/30 border-purple-400/30' 
                            : 'bg-green-50 border-green-200'
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-400 to-green-600">
                                <Clock size={18} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <p className={`text-xs font-semibold mb-1 ${
                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    Account Status
                                </p>
                                <p className="font-medium text-green-600">
                                    ● Active
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`px-8 py-6 border-t-2 ${
                    darkMode ? 'border-purple-500/30' : 'border-teal-200'
                }`}>
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className={`px-6 py-2.5 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2 ${
                                darkMode 
                                    ? 'bg-slate-700 text-white hover:bg-slate-600' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <ArrowLeft size={18} />
                            Back
                        </button>

                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-semibold ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                Theme:
                            </span>
                            <button
                                onClick={toggleTheme}
                                className={`px-4 py-2.5 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2 shadow-lg ${
                                    darkMode 
                                        ? 'bg-slate-700 text-white hover:bg-slate-600 border border-purple-500/30' 
                                        : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                                }`}
                            >
                                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                                {darkMode ? "Light" : "Dark"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetails;