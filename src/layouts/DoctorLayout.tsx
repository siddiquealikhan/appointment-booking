import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { User, Calendar, LogOut, Home } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const DoctorLayout: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: "/doctor/dashboard", icon: <Home size={20} />, label: "Dashboard" },
    {
      to: "/doctor/appointments",
      icon: <Calendar size={20} />,
      label: "Appointments",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <div className="flex items-center space-x-2">
              <User size={24} className="text-primary-500" />
              <span className="text-xl font-semibold tracking-tight text-gray-900">
                Doctor Portal
              </span>
            </div>
          </div>
          <div className="flex flex-col flex-grow px-4 mt-5">
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "text-white bg-primary-500"
                        : "text-gray-600 hover:text-primary-600 hover:bg-primary-50"
                    }`
                  }
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="p-4 mt-auto">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User size={16} className="text-primary-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  Dr. {user?.name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 mt-4 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
            >
              <LogOut size={18} />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="md:hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div className="flex items-center space-x-2">
              <User size={24} className="text-primary-500" />
              <span className="text-lg font-semibold">Doctor Portal</span>
            </div>
            <div className="flex items-center">
              {/* Mobile menu button to be added with state management */}
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
