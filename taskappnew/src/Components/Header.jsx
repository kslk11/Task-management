import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ClipboardList, 
  ChevronDown, 
  LogOut, 
  User, 
  Lock, 
  Search,
  X,
  Bell,
  Plus
} from "lucide-react";

const Header = () => {
  const [getuser, setGetUser] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const getUser = async () => {
    try {
      const res = await axios.get("http://localhost:7800/api/users/getOne", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGetUser(res.data);
      const userTheme = res.data.theme || "light";
      setTheme(userTheme);
      localStorage.setItem("theme", userTheme);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  useEffect(() => {
    if (token) getUser();
  }, [token]);

  // Listen for theme changes
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedTheme = localStorage.getItem("theme") || "light";
      setTheme(updatedTheme);
    };

    window.addEventListener("storage", handleStorageChange);
    
    const currentTheme = localStorage.getItem("theme") || "light";
    setTheme(currentTheme);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("theme");
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Add your search logic here
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Get user initials
  const getUserInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Theme-based styles
  const isDark = theme === "dark";
  const headerBg = isDark 
    ? "bg-gradient-to-tl from-gray-600 via-gray-800 to-gray-900" 
    : "bg-gradient-to-tl from-rose-100 via-teal-500 to-cyan-300";
  const textColor = isDark ? "text-gray-100" : "text-white";
  const textHoverColor = isDark ? "hover:text-gray-300" : "hover:text-blue-100";
  const dropdownBg = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100";
  const dropdownText = isDark ? "text-gray-100" : "text-gray-700";
  const dropdownHover = isDark ? "hover:bg-gray-700" : "hover:bg-indigo-50";
  const searchBg = isDark ? "bg-gray-700/50 border-gray-600" : "bg-white/20 border-white/30";
  const searchText = isDark ? "text-gray-100" : "text-white";
  const searchPlaceholder = isDark ? "placeholder-gray-400" : "placeholder-white/70";
  const buttonBg = isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-white/20 hover:bg-white/30";
  const avatarBg = isDark ? "bg-gradient-to-br from-indigo-500 to-purple-600" : "bg-gradient-to-br from-blue-500 to-indigo-600";

  return (
    <header className={`${headerBg} shadow-lg sticky top-0 z-50 backdrop-blur-md transition-all duration-500`}>
      <nav className="container mx-auto flex justify-between items-center py-3 px-6">
        {/* Left Section - Logo & Navigation */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={`text-2xl font-bold ${textColor} ${textHoverColor} transition-colors flex items-center gap-2`}
          >
            <ClipboardList size={28} />
            <span className="hidden sm:block">TaskFlow</span>
          </Link>

          {token && (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/giver"
                className={`${buttonBg} ${textColor} px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 backdrop-blur-sm`}
              >
                <ClipboardList size={18} />
                <span>My Tasks</span>
              </Link>

              <button
                className={`${buttonBg} ${textColor} p-2 rounded-lg transition-all duration-200 backdrop-blur-sm`}
                title="Create New"
              >
                <Plus size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Center Section - Search Bar */}
        {token && (
          <div className="hidden lg:flex flex-1 max-w-md mx-6">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks, users..."
                  className={`w-full ${searchBg} ${searchText} ${searchPlaceholder} border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm transition-all`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X size={18} className={textColor} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className={`w-full ${searchBg} ${searchText} ${searchPlaceholder} border rounded-lg px-4 py-2 text-left flex items-center gap-2 backdrop-blur-sm transition-all hover:scale-[1.02]`}
              >
                <Search size={18} />
                <span>Search...</span>
              </button>
            )}
          </div>
        )}

        {/* Right Section - User Menu */}
        {token ? (
          <div className="flex items-center gap-3">
            {/* Mobile Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`lg:hidden ${buttonBg} ${textColor} p-2 rounded-lg transition-all backdrop-blur-sm`}
            >
              <Search size={20} />
            </button>

            {/* Notifications */}
            <button
              className={`${buttonBg} ${textColor} p-2 rounded-lg transition-all backdrop-blur-sm relative`}
              title="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2 ${textColor} font-medium transition-all duration-200 ${buttonBg} px-3 py-1.5 rounded-lg backdrop-blur-sm hover:scale-105`}
              >
                {/* Profile Avatar Circle */}
                <div 
                  className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center text-white text-sm font-bold shadow-md`}
                  title={getuser?.name || "User"}
                >
                  {getUserInitials(getuser?.name)}
                </div>
                <span className="hidden sm:block capitalize">{getuser?.name || "User"}</span>
                <ChevronDown 
                  size={18} 
                  className={`${dropdownOpen ? "rotate-180" : "rotate-0"} transition-transform duration-200`} 
                />
              </button>

              {dropdownOpen && (
                <div className={`absolute right-0 mt-3 w-64 ${dropdownBg} rounded-xl shadow-2xl border overflow-hidden animate-fadeIn`}>
                  {/* User Info Section */}
                  <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full ${avatarBg} flex items-center justify-center text-white text-lg font-bold shadow-md`}>
                        {getUserInitials(getuser?.name)}
                      </div>
                      <div>
                        <p className={`font-semibold ${dropdownText} capitalize`}>{getuser?.name || "User"}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{getuser?.email || "user@example.com"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <Link
                    to="/profile"
                    className={`flex items-center gap-3 px-4 py-3 ${dropdownText} ${dropdownHover} transition-colors`}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={18} className={isDark ? "text-indigo-400" : "text-indigo-500"} />
                    <span>View Profile</span>
                  </Link>

                  <Link
                    to="/rp"
                    className={`flex items-center gap-3 px-4 py-3 ${dropdownText} ${dropdownHover} transition-colors`}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Lock size={18} className={isDark ? "text-indigo-400" : "text-indigo-500"} />
                    <span>Reset Password</span>
                  </Link>

                  <Link
                    to="/"
                    className={`flex items-center gap-3 px-4 py-3 ${dropdownText} ${dropdownHover} transition-colors md:hidden`}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <ClipboardList size={18} className={isDark ? "text-green-400" : "text-green-600"} />
                    <span>Assigned Tasks</span>
                  </Link>
                  <Link
                    to="/tg"
                    className={`flex items-center gap-3 px-4 py-3 ${dropdownText} ${dropdownHover} transition-colors md:hidden`}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <ClipboardList size={18} className={isDark ? "text-green-400" : "text-green-600"} />
                    <span>TaskPage</span>
                  </Link>
                  <Link
                    to="/cln"
                    className={`flex items-center gap-3 px-4 py-3 ${dropdownText} ${dropdownHover} transition-colors md:hidden`}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <ClipboardList size={18} className={isDark ? "text-green-400" : "text-green-600"} />
                    <span>Calendar</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 text-red-600 ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'} border-t ${isDark ? 'border-gray-700' : 'border-gray-100'} transition-colors`}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className={`${textColor} ${textHoverColor} font-medium transition-colors duration-200 px-4 py-2`}
            >
              Login
            </Link>
            <Link
              to="/sign"
              className={`${buttonBg} ${textColor} font-medium transition-all duration-200 px-6 py-2 rounded-lg backdrop-blur-sm hover:scale-105`}
            >
              Sign Up
            </Link>
          </div>
        )}
      </nav>

      {/* Mobile Search Bar */}
      {token && searchOpen && (
        <div className="lg:hidden px-6 pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, users..."
              className={`w-full ${searchBg} ${searchText} ${searchPlaceholder} border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X size={18} className={textColor} />
            </button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;