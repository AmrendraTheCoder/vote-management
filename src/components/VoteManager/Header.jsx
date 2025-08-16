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
                            <p className="text-xs text-gray-500">Student Support Tracker</p>
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
                        className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Menu Header */}
                        <div className="bg-gray-800 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">Menu</h2>
                                    <p className="text-sm text-gray-300">Manage your data</p>
                                </div>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-white hover:bg-gray-700 rounded-full p-1"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-4 space-y-2">
                            {menuItems.map((item, index) => {
                                const IconComponent = item.icon;
                                return (
                                    <button
                                        key={index}
                                        onClick={item.action}
                                        disabled={item.disabled}
                                        className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${item.disabled
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-full ${item.disabled
                                            ? 'bg-gray-200'
                                            : 'bg-gray-100'
                                            }`}>
                                            <IconComponent className={`w-5 h-5 ${item.disabled
                                                ? 'text-gray-400'
                                                : 'text-gray-600'
                                                }`} />
                                        </div>
                                        <span className="font-medium">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Stats Section */}
                        <div className="p-4 mt-6 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistics Overview</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Will Vote</span>
                                    <span className="text-gray-800 font-bold">{stats.yes}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Won't Vote</span>
                                    <span className="text-gray-800 font-bold">{stats.no}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Undecided</span>
                                    <span className="text-gray-800 font-bold">{stats.undecided}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Not Asked</span>
                                    <span className="text-gray-800 font-bold">{stats.notAsked}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Absent</span>
                                    <span className="text-gray-800 font-bold">{stats.absent}</span>
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
