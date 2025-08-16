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
            {/* Enhanced Header */}
            <div className="bg-white border-b border-gray-200 text-gray-800 shadow-lg sticky top-0 z-40">
                <div className="flex items-center justify-between p-4">
                    {/* Enhanced Logo/Title */}
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-3 shadow-md">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Vote Manager
                            </h1>
                            <p className="text-sm text-gray-500 font-medium">Student Support Tracker</p>
                        </div>
                    </div>

                    {/* Enhanced User Info & Menu */}
                    <div className="flex items-center space-x-3">
                        {/* Enhanced Connection Status */}
                        <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm ${isOnline
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {syncing ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : isOnline ? (
                                <Wifi className="w-4 h-4" />
                            ) : (
                                <WifiOff className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">
                                {syncing ? 'Syncing' : isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>

                        {/* Enhanced User Avatar */}
                        {/* <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl px-4 py-2 border border-gray-200 shadow-sm">
                            <div className="bg-blue-100 rounded-full p-2">
                                <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{user}</span>
                        </div> */}

                        {/* Enhanced Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl p-3 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            {isMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
                        </button>
                    </div>
                </div>

                {/* Enhanced Stats Bar */}
                <div className="px-4 pb-4">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="grid grid-cols-5 gap-4">
                            {/* Total Students */}
                            <div className="text-center">
                                <div className="bg-blue-100 rounded-full p-2 w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="font-bold text-lg text-gray-900">{stats.total}</div>
                                <div className="text-xs text-gray-600 font-medium">Total</div>
                            </div>

                            {/* Will Vote */}
                            <div className="text-center">
                                <div className="bg-green-100 rounded-full p-2 w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                                    <div className="text-green-600 font-bold text-lg">✓</div>
                                </div>
                                <div className="font-bold text-lg text-green-700">{stats.yes}</div>
                                <div className="text-xs text-gray-600 font-medium">Yes</div>
                            </div>

                            {/* Won't Vote */}
                            <div className="text-center">
                                <div className="bg-red-100 rounded-full p-2 w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                                    <div className="text-red-600 font-bold text-lg">✕</div>
                                </div>
                                <div className="font-bold text-lg text-red-700">{stats.no}</div>
                                <div className="text-xs text-gray-600 font-medium">No</div>
                            </div>

                            {/* Undecided */}
                            <div className="text-center">
                                <div className="bg-yellow-100 rounded-full p-2 w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                                    <div className="text-yellow-600 font-bold text-lg">?</div>
                                </div>
                                <div className="font-bold text-lg text-yellow-700">{stats.undecided}</div>
                                <div className="text-xs text-gray-600 font-medium">Undecided</div>
                            </div>

                            {/* Pending */}
                            <div className="text-center">
                                <div className="bg-gray-100 rounded-full p-2 w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                                    <div className="text-gray-600 font-bold text-lg">⏳</div>
                                </div>
                                <div className="font-bold text-lg text-gray-700">{stats.notAsked}</div>
                                <div className="text-xs text-gray-600 font-medium">Pending</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="h-full flex">
                                {stats.total > 0 && (
                                    <>
                                        <div
                                            className="bg-green-500 transition-all duration-500"
                                            style={{ width: `${(stats.yes / stats.total) * 100}%` }}
                                        ></div>
                                        <div
                                            className="bg-red-500 transition-all duration-500"
                                            style={{ width: `${(stats.no / stats.total) * 100}%` }}
                                        ></div>
                                        <div
                                            className="bg-yellow-500 transition-all duration-500"
                                            style={{ width: `${(stats.undecided / stats.total) * 100}%` }}
                                        ></div>
                                        <div
                                            className="bg-gray-400 transition-all duration-500"
                                            style={{ width: `${(stats.notAsked / stats.total) * 100}%` }}
                                        ></div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Percentage Display */}
                        {stats.total > 0 && (
                            <div className="mt-2 flex justify-center text-xs text-gray-600">
                                <span className="bg-white px-2 py-1 rounded-full shadow-sm">
                                    {Math.round((stats.yes / stats.total) * 100)}% support rate
                                </span>
                            </div>
                        )}
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
