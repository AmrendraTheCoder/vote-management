import React, { useState, useEffect } from 'react';
import { Plus, Download, Trash2, Users, CheckCircle, XCircle, Clock, UserX, Wifi, WifiOff, RefreshCw, Lock, LogOut, Eye, EyeOff } from 'lucide-react';
import ApiService from '../services/api.js';

const VoteManager = () => {
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({ total: 0, forChirag: 0, againstChirag: 0, undecided: 0, absent: 0, notAsked: 0 });
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [error, setError] = useState(null);
    const [syncing, setSyncing] = useState(false);

    // Authentication states
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    // Hardcoded credentials (in production, this should be handled by backend)
    const validCredentials = {
        'admin': 'admin123',
        'chirag': 'chirag@vote2024',
        'manager': 'vote_manager_2024',
        'coordinator': 'coordinator@123',
        'viva24': 'viva_city'
    };

    // Debounce timer for API calls
    const [updateTimers, setUpdateTimers] = useState({});
    const [lastFetch, setLastFetch] = useState(null);
    const CACHE_DURATION = 30000; // 30 seconds cache

    useEffect(() => {
        // Check if user is already authenticated
        const authStatus = localStorage.getItem('voteManagerAuth');
        if (authStatus === 'true') {
            setIsAuthenticated(true);
            loadStudents();
        } else {
            setLoading(false);
        }

        // Listen for online/offline events
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);

            // Clean up any pending timers
            Object.values(updateTimers).forEach(timer => {
                if (timer) clearTimeout(timer);
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError('');

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (validCredentials[loginId] && validCredentials[loginId] === password) {
            setIsAuthenticated(true);
            localStorage.setItem('voteManagerAuth', 'true');
            localStorage.setItem('voteManagerUser', loginId);
            loadStudents();
        } else {
            setLoginError('Invalid ID or password. Please try again.');
        }

        setLoginLoading(false);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('voteManagerAuth');
        localStorage.removeItem('voteManagerUser');
        setLoginId('');
        setPassword('');
        setStudents([]);
        setStats({ total: 0, forChirag: 0, againstChirag: 0, undecided: 0, absent: 0, notAsked: 0 });
    };

    const loadStudents = async (forceRefresh = false) => {
        // Check cache first (unless force refresh)
        const now = Date.now();
        if (!forceRefresh && lastFetch && (now - lastFetch) < CACHE_DURATION && students.length > 0) {
            console.log('Using cached data, skipping API call');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('Fetching students from API...');
            const response = await ApiService.getStudents();

            if (response.success) {
                setStudents(response.data || []);
                if (response.stats) {
                    setStats(response.stats);
                } else {
                    // Fallback to calculating stats locally if not provided
                    updateStatsLocal(response.data || []);
                }
                setLastFetch(now);
                console.log('Students loaded successfully');
            } else {
                throw new Error(response.message || 'Failed to load students');
            }
        } catch (error) {
            console.error('Error loading students:', error);
            setError('Failed to load students. Please check your connection.');

            // Load from localStorage as fallback
            const localStudents = JSON.parse(localStorage.getItem('voteManagerStudents') || '[]');
            if (localStudents.length > 0) {
                setStudents(localStudents);
                updateStatsLocal(localStudents);
                setError('Using offline data. Some changes may not be saved.');
            }
        } finally {
            setLoading(false);
        }
    };

    const saveToLocalStorage = (studentsData) => {
        localStorage.setItem('voteManagerStudents', JSON.stringify(studentsData));
    };

    const updateStatsLocal = (studentsData) => {
        const total = studentsData.length;
        const forChirag = studentsData.filter(s => s.vote === 'Yes').length;
        const againstChirag = studentsData.filter(s => s.vote === 'No').length;
        const undecided = studentsData.filter(s => s.vote === 'Undecided').length;
        const absent = studentsData.filter(s => s.vote === 'Absent').length;
        const notAsked = studentsData.filter(s => s.vote === '').length;

        setStats({ total, forChirag, againstChirag, undecided, absent, notAsked });
    };

    const addStudent = async () => {
        const newStudent = {
            name: 'New Student',
            roomNumber: 'Room-' + (students.length + 1),
            vote: ''
        };

        try {
            setError(null); // Clear previous errors

            if (isOnline) {
                console.log('Creating student via API...');
                const response = await ApiService.createStudent(newStudent);

                if (response.success) {
                    // Add student to local state immediately for better UX
                    const newStudentData = response.data;
                    setStudents(prev => [...prev, newStudentData]);
                    updateStatsLocal([...students, newStudentData]);
                    saveToLocalStorage([...students, newStudentData]);

                    // Invalidate cache for next fetch
                    setLastFetch(null);
                    console.log('Student created successfully');
                } else {
                    throw new Error(response.message || 'Failed to create student');
                }
            } else {
                // Offline mode - add locally
                const localStudent = {
                    ...newStudent,
                    _id: 'local_' + Date.now(),
                    createdAt: new Date().toISOString()
                };
                const updatedStudents = [...students, localStudent];
                setStudents(updatedStudents);
                updateStatsLocal(updatedStudents);
                saveToLocalStorage(updatedStudents);
            }
        } catch (error) {
            console.error('Error adding student:', error);
            const errorMessage = error.message || 'Failed to add student. Please try again.';
            setError(`Add Student Error: ${errorMessage}`);

            // Fallback to offline mode
            const localStudent = {
                ...newStudent,
                _id: 'local_' + Date.now(),
                createdAt: new Date().toISOString()
            };
            const updatedStudents = [...students, localStudent];
            setStudents(updatedStudents);
            updateStatsLocal(updatedStudents);
            saveToLocalStorage(updatedStudents);
        }
    };

    const removeStudent = async (id) => {
        try {
            if (isOnline && !id.toString().startsWith('local_')) {
                // Remove from local state immediately for better UX
                const updatedStudents = students.filter(s => s._id !== id);
                setStudents(updatedStudents);
                updateStatsLocal(updatedStudents);
                saveToLocalStorage(updatedStudents);

                // Then make API call
                await ApiService.deleteStudent(id);

                // Invalidate cache
                setLastFetch(null);
            } else {
                // Remove locally
                const updatedStudents = students.filter(s => s._id !== id);
                setStudents(updatedStudents);
                updateStatsLocal(updatedStudents);
                saveToLocalStorage(updatedStudents);
            }
        } catch (error) {
            console.error('Error removing student:', error);
            setError('Failed to remove student. Please try again.');
            // Reload data on error to maintain consistency
            await loadStudents(true);
        }
    };

    const updateStudent = async (id, field, value) => {
        // Update local state immediately for responsive UI
        const updatedStudents = students.map(student =>
            student._id === id ? { ...student, [field]: value } : student
        );

        setStudents(updatedStudents);
        updateStatsLocal(updatedStudents);
        saveToLocalStorage(updatedStudents);

        // Debounced API call for better performance
        if (isOnline && !id.toString().startsWith('local_')) {
            // Clear existing timer for this student
            if (updateTimers[id]) {
                clearTimeout(updateTimers[id]);
            }

            // Set new timer
            const timer = setTimeout(async () => {
                try {
                    const studentToUpdate = updatedStudents.find(s => s._id === id);
                    if (studentToUpdate) {
                        console.log(`Updating student ${id} via API...`);
                        await ApiService.updateStudent(id, {
                            name: studentToUpdate.name,
                            roomNumber: studentToUpdate.roomNumber,
                            vote: studentToUpdate.vote
                        });
                        console.log(`Student ${id} updated successfully`);
                    }
                } catch (err) {
                    console.error('Error updating student:', err);
                    // Optionally show a subtle error indicator
                }

                // Clean up timer
                setUpdateTimers(prev => {
                    const newTimers = { ...prev };
                    delete newTimers[id];
                    return newTimers;
                });
            }, 1000); // 1 second debounce

            setUpdateTimers(prev => ({ ...prev, [id]: timer }));
        }
    };

    const syncData = async () => {
        if (!isOnline) return;

        try {
            setSyncing(true);
            await loadStudents(true); // Force refresh
            setError(null);
        } catch (error) {
            setError('Failed to sync data');
            console.error('Sync error:', error);
        } finally {
            setSyncing(false);
        }
    };

    const exportToCSV = () => {
        const csvContent = [
            ['S.No.', 'Student Name', 'Room Number', 'Support Status for Chirag Sir'],
            ...students.map((student, index) => [
                index + 1,
                student.name || '',
                student.roomNumber || '',
                student.vote || ''
            ])
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chirag_sir_support_tracker.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getVoteIcon = (vote) => {
        switch (vote) {
            case 'Yes': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'No': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'Undecided': return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'Absent': return <UserX className="w-4 h-4 text-gray-600" />;
            default: return null;
        }
    };

    const getVoteSelectStyle = (vote) => {
        switch (vote) {
            case 'Yes': return 'border-green-500 bg-green-50 text-green-800';
            case 'No': return 'border-red-500 bg-red-50 text-red-800';
            case 'Undecided': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
            case 'Absent': return 'border-gray-500 bg-gray-50 text-gray-800';
            default: return 'border-gray-300 bg-white';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
            {/* Authentication Overlay */}
            {!isAuthenticated && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4">
                        <div className="text-center mb-8">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg mb-4">
                                <Lock className="w-8 h-8 mx-auto mb-2" />
                                <h1 className="text-xl font-bold">Vote Management Access</h1>
                                <p className="text-blue-100 text-sm">Secure Authentication Required</p>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {loginError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="flex items-center space-x-2">
                                        <XCircle className="w-5 h-5 text-red-600" />
                                        <span className="text-red-800 text-sm">{loginError}</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    User ID
                                </label>
                                <input
                                    type="text"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                    placeholder="Enter your ID"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    disabled={loginLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                                        required
                                        disabled={loginLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        disabled={loginLoading}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loginLoading || !loginId || !password}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
                            >
                                {loginLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        <span>Authenticating...</span>
                                    </div>
                                ) : (
                                    'Access Dashboard'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <h4 className="font-medium text-blue-800 mb-2 text-sm">Demo Credentials:</h4>
                                <div className="text-xs text-blue-700 space-y-1">
                                    <div>ID: <span className="font-mono bg-blue-100 px-1 rounded">admin</span> | Password: <span className="font-mono bg-blue-100 px-1 rounded">admin123</span></div>
                                    <div>ID: <span className="font-mono bg-blue-100 px-1 rounded">viva24</span> | Password: <span className="font-mono bg-blue-100 px-1 rounded">viva_city</span></div>
                                    <div>ID: <span className="font-mono bg-blue-100 px-1 rounded">chirag</span> | Password: <span className="font-mono bg-blue-100 px-1 rounded">chirag@vote2024</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">

                {/* Connection Status & Error Messages */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-800 text-sm">{error}</span>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
                    <div className="text-center">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg mb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h1 className="text-lg sm:text-xl font-bold">Vote Management App</h1>
                                    <p className="text-blue-100 text-sm">Track Support for Chirag Sir</p>
                                </div>

                                {/* Connection Status & User Info */}
                                <div className="flex items-center space-x-3">
                                    {/* User Info */}
                                    <div className="flex items-center space-x-2">
                                        <div className="text-right">
                                            <div className="text-xs text-blue-200">Logged in as</div>
                                            <div className="text-sm font-medium text-white">{localStorage.getItem('voteManagerUser') || 'User'}</div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                                            title="Logout"
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Connection Status */}
                                    <div className="flex items-center space-x-2">
                                        {isOnline ? (
                                            <div className="flex items-center space-x-1">
                                                <Wifi className="w-4 h-4 text-green-300" />
                                                <span className="text-xs text-green-300">Online</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-1">
                                                <WifiOff className="w-4 h-4 text-red-300" />
                                                <span className="text-xs text-red-300">Offline</span>
                                            </div>
                                        )}

                                        {isOnline && (
                                            <button
                                                onClick={syncData}
                                                disabled={syncing || loading}
                                                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                                                title="Refresh Data"
                                            >
                                                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <div className="flex items-center justify-center mb-1">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-xl font-bold text-blue-700">{stats?.total || 0}</div>
                                <div className="text-xs text-blue-600">Total</div>
                            </div>

                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                <div className="flex items-center justify-center mb-1">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="text-xl font-bold text-green-700">{stats?.forChirag || 0}</div>
                                <div className="text-xs text-green-600">Will Vote</div>
                            </div>

                            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                <div className="flex items-center justify-center mb-1">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <div className="text-xl font-bold text-red-700">{stats?.againstChirag || 0}</div>
                                <div className="text-xs text-red-600">Won't Vote</div>
                            </div>

                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                <div className="flex items-center justify-center mb-1">
                                    <Clock className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div className="text-xl font-bold text-yellow-700">{stats?.undecided || 0}</div>
                                <div className="text-xs text-yellow-600">Undecided</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Student List - Mobile First Design */}
                <div className="bg-white rounded-xl shadow-lg mb-4">
                    {/* Desktop Table View - Hidden on mobile */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">S.No.</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Room No.</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Support Status</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students.map((student, index) => (
                                    <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={student.name}
                                                onChange={(e) => updateStudent(student._id, 'name', e.target.value)}
                                                placeholder="Enter name"
                                                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={student.roomNumber}
                                                onChange={(e) => updateStudent(student._id, 'roomNumber', e.target.value)}
                                                placeholder="A-101"
                                                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-2">
                                                {getVoteIcon(student.vote)}
                                                <select
                                                    value={student.vote}
                                                    onChange={(e) => updateStudent(student._id, 'vote', e.target.value)}
                                                    className={`flex-1 p-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${getVoteSelectStyle(student.vote)}`}
                                                >
                                                    <option value="">Not Asked Yet</option>
                                                    <option value="Yes">✓ Will Vote for Chirag Sir</option>
                                                    <option value="No">✗ Won't Vote for Chirag Sir</option>
                                                    <option value="Undecided">? Still Thinking</option>
                                                    <option value="Absent">- Not Available</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => removeStudent(student._id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                                                title="Delete Student"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View - Visible on mobile and tablet */}
                    <div className="lg:hidden p-4 space-y-4">
                        {loading ? (
                            <div className="text-center py-8">
                                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                                <p className="text-gray-600">Loading students...</p>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                <p className="text-gray-600">No students added yet</p>
                                <p className="text-sm text-gray-500">Click "Add Student" to get started</p>
                            </div>
                        ) : (
                            students.map((student, index) => (
                                <div key={student._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    {/* Student Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                                {index + 1}
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">Student #{index + 1}</span>
                                        </div>
                                        <button
                                            onClick={() => removeStudent(student._id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-lg transition-all"
                                            title="Delete Student"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Input Fields */}
                                    <div className="space-y-3">
                                        {/* Name Input */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Student Name</label>
                                            <input
                                                type="text"
                                                value={student.name}
                                                onChange={(e) => updateStudent(student._id, 'name', e.target.value)}
                                                placeholder="Enter student name"
                                                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        {/* Room Number Input */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Room Number</label>
                                            <input
                                                type="text"
                                                value={student.roomNumber}
                                                onChange={(e) => updateStudent(student._id, 'roomNumber', e.target.value)}
                                                placeholder="e.g., A-101"
                                                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        {/* Vote Selection */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Support Status</label>
                                            <div className="flex items-center space-x-2">
                                                {getVoteIcon(student.vote)}
                                                <select
                                                    value={student.vote}
                                                    onChange={(e) => updateStudent(student._id, 'vote', e.target.value)}
                                                    className={`flex-1 p-3 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${getVoteSelectStyle(student.vote)}`}
                                                >
                                                    <option value="">Not Asked Yet</option>
                                                    <option value="Yes">✓ Will Vote for Chirag Sir</option>
                                                    <option value="No">✗ Won't Vote for Chirag Sir</option>
                                                    <option value="Undecided">? Still Thinking</option>
                                                    <option value="Absent">- Not Available</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={addStudent}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Student</span>
                        </button>

                        <button
                            onClick={exportToCSV}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <Download className="w-5 h-5" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">How to Use:</h3>
                    <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                        <li>• Add student names and room numbers before going for canvassing</li>
                        <li>• When asking for votes, update their support status</li>
                        <li>• Track who will vote for Chirag Sir vs won't vote</li>
                        <li>• Export data to analyze voting patterns and plan strategy</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default VoteManager;