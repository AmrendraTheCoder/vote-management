import React, { useState } from 'react';
import { Menu, X, Users, BarChart3, Download, Upload, LogOut, User, Wifi, WifiOff, RefreshCw } from 'lucide-react';

const Header = ({
    user,
    onLogout,
    studentsData,
    onShowExcelUpload,
    isOnline = true,
    syncing = false
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const stats = {
        total: studentsData.length,
        yes: studentsData.filter(s => s.vote === 'Yes').length,
        no: studentsData.filter(s => s.vote === 'No').length,
        undecided: studentsData.filter(s => s.vote === 'Undecided').length,
        notAsked: studentsData.filter(s => s.vote === '' || s.vote === 'Not Asked').length,
        absent: studentsData.filter(s => s.vote === 'Absent').length
    };

    const menuItems = [
        {
            icon: BarChart3,
            label: 'Statistics',
            action: () => setIsMenuOpen(false),
            disabled: false
        },
        {
            icon: Download,
            label: 'Download Excel',
            action: () => {
                exportToExcel();
                setIsMenuOpen(false);
            },
            disabled: studentsData.length === 0
        },
        {
            icon: Upload,
            label: 'Upload Excel',
            action: () => {
                onShowExcelUpload();
                setIsMenuOpen(false);
            },
            disabled: false
        },
        {
            icon: LogOut,
            label: 'Logout',
            action: () => {
                onLogout();
                setIsMenuOpen(false);
            },
            disabled: false
        }
    ];

    const exportToExcel = () => {
        if (studentsData.length === 0) return;

        const exportData = studentsData.map(student => ({
            'Student Name': student.name,
            'Room Number': student.roomNumber,
            'Hostel': student.hostel || 'BH',
            'Support Status': student.vote || 'Not Asked'
        }));

        // Since we can't use xlsx on frontend, create CSV
        const csvContent = [
            ['Student Name', 'Room Number', 'Hostel', 'Support Status'],
            ...exportData.map(row => Object.values(row))
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `students_data_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 text-gray-800 shadow-sm sticky top-0 z-40">
                <div className="flex items-center justify-between p-4">
                    {/* Logo/Title */}
                    <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 rounded-full p-2">
                            <Users className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Vote Manager</h1>
                            {/* <p className="text-xs text-gray-500">Student Support Tracker</p> */}
                        </div>
                    </div>

                    {/* User Info & Menu */}
                    <div className="flex items-center space-x-3">
                        {/* Connection Status */}
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${isOnline
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                            }`}>
                            {syncing ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : isOnline ? (
                                <Wifi className="w-3 h-3" />
                            ) : (
                                <WifiOff className="w-3 h-3" />
                            )}
                            <span className="hidden sm:inline">
                                {syncing ? 'Syncing' : isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>

                        {/* User Avatar */}
                        <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                            <User className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">{user}</span>
                        </div>

                        {/* Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all duration-200"
                        >
                            {isMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
                        </button>
                    </div>
                </div>

                {/* Quick Stats Bar */}
                <div className="px-4 pb-3">
                    <div className="flex justify-between items-center text-xs bg-gray-50 border rounded-lg p-2">
                        <div className="text-center">
                            <div className="font-bold text-gray-800">{stats.total}</div>
                            <div className="text-gray-500">Total</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-gray-800">{stats.yes}</div>
                            <div className="text-gray-500">Yes</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-gray-800">{stats.no}</div>
                            <div className="text-gray-500">No</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-gray-800">{stats.undecided}</div>
                            <div className="text-gray-500">Undecided</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-gray-800">{stats.notAsked}</div>
                            <div className="text-gray-500">Pending</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slide Menu Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <div
                        className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Menu Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-2">
                                        <Menu className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Menu</h2>
                                        <p className="text-sm text-blue-100">Manage your data</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Menu Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto">
                            {/* User Info Section */}
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                                    <div className="bg-blue-100 rounded-full p-2">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Logged in as</p>
                                        <p className="text-lg font-bold text-blue-600">{user}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="p-4 space-y-3">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Actions</h3>
                                {menuItems.map((item, index) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <button
                                            key={index}
                                            onClick={item.action}
                                            disabled={item.disabled}
                                            className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 ${item.disabled
                                                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                                                    : item.label === 'Logout'
                                                        ? 'bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 hover:border-red-300'
                                                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border border-blue-200 hover:border-blue-300 hover:shadow-sm'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${item.disabled
                                                    ? 'bg-gray-200'
                                                    : item.label === 'Logout'
                                                        ? 'bg-red-100'
                                                        : 'bg-blue-100'
                                                }`}>
                                                <IconComponent className={`w-5 h-5 ${item.disabled
                                                        ? 'text-gray-400'
                                                        : item.label === 'Logout'
                                                            ? 'text-red-600'
                                                            : 'text-blue-600'
                                                    }`} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold">{item.label}</p>
                                                <p className="text-xs opacity-70">
                                                    {item.label === 'Statistics' && 'View detailed analytics'}
                                                    {item.label === 'Download Excel' && 'Export current data'}
                                                    {item.label === 'Upload Excel' && 'Import student data'}
                                                    {item.label === 'Logout' && 'Sign out of your account'}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Stats Section */}
                            <div className="p-4 border-t border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Statistics Overview</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-green-600">{stats.yes}</div>
                                        <div className="text-xs text-green-700 font-medium">Will Vote</div>
                                    </div>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-red-600">{stats.no}</div>
                                        <div className="text-xs text-red-700 font-medium">Won't Vote</div>
                                    </div>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-yellow-600">{stats.undecided}</div>
                                        <div className="text-xs text-yellow-700 font-medium">Undecided</div>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-gray-600">{stats.notAsked}</div>
                                        <div className="text-xs text-gray-700 font-medium">Pending</div>
                                    </div>
                                </div>
                                <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                                    <div className="text-3xl font-bold text-purple-600">{stats.total}</div>
                                    <div className="text-sm text-purple-700 font-medium">Total Students</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
