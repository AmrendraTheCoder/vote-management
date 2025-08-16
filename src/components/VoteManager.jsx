import React, { useState } from 'react';
import { Plus } from 'lucide-react';

// Custom hooks
import { useAuth } from '../hooks/useAuth';
import { useStudentData } from '../hooks/useStudentData';

// Modular components
import Header from './VoteManager/Header';
import FilterControls from './VoteManager/FilterControls';
import StudentsTable from './VoteManager/StudentsTable';
import MobileStudentsList from './VoteManager/MobileStudentsList';
import StudentForm from './VoteManager/StudentForm';
import ExcelUpload from './VoteManager/ExcelUpload';
import ConfirmDialog from './VoteManager/ConfirmDialog';
import ErrorPopup from './VoteManager/ErrorPopup';

const VoteManager = () => {
    // Authentication hook
    const {
        isAuthenticated,
        user,
        loginId,
        setLoginId,
        password,
        setPassword,
        showPassword,
        setShowPassword,
        login,
        logout,
        loginError,
        loginLoading
    } = useAuth();

    // Student data hook
    const {
        students,
        loading,
        error,
        isOnline,
        syncing,
        addStudent,
        updateStudent,
        deleteStudent,
        moveStudent,
        bulkAddStudents,
        refreshData
    } = useStudentData(isAuthenticated);

    // Local state for UI components
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showStudentForm, setShowStudentForm] = useState(false);
    const [showExcelUpload, setShowExcelUpload] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHostel, setSelectedHostel] = useState('all');
    const [selectedVote, setSelectedVote] = useState('all');

    // Sort states
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    // Dialog states
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, studentId: null, studentName: '' });
    const [errorPopup, setErrorPopup] = useState({ isVisible: false, message: '', type: 'error' });

    // Responsive design listener
    React.useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Filter and sort students
    const filteredAndSortedStudents = React.useMemo(() => {
        let filtered = students.filter(student => {
            const matchesSearch = !searchTerm ||
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesHostel = selectedHostel === 'all' || student.hostel === selectedHostel;
            const matchesVote = selectedVote === 'all' || student.vote === selectedVote;

            return matchesSearch && matchesHostel && matchesVote;
        });

        // Sort the filtered results
        filtered.sort((a, b) => {
            let aValue = a[sortField] || '';
            let bValue = b[sortField] || '';

            if (sortField === 'roomNumber') {
                // Natural sorting for room numbers
                aValue = aValue.toString();
                bValue = bValue.toString();
            }

            if (sortDirection === 'asc') {
                return aValue.localeCompare(bValue, undefined, { numeric: true });
            } else {
                return bValue.localeCompare(aValue, undefined, { numeric: true });
            }
        });

        return filtered;
    }, [students, searchTerm, selectedHostel, selectedVote, sortField, sortDirection]);

    // Event handlers
    const handleAddStudent = () => {
        setEditingStudent(null);
        setShowStudentForm(true);
    };

    const handleEditStudent = (student) => {
        setEditingStudent(student);
        setShowStudentForm(true);
    };

    const handleSaveStudent = async (studentData) => {
        try {
            if (editingStudent) {
                await updateStudent(studentData);
                showSuccessMessage('Student updated successfully');
            } else {
                await addStudent(studentData);
                showSuccessMessage('Student added successfully');
            }
            setShowStudentForm(false);
            setEditingStudent(null);
        } catch (error) {
            showErrorMessage(error.message || 'Failed to save student');
        }
    };

    const handleDeleteStudent = (studentId) => {
        const student = students.find(s => s._id === studentId);
        setConfirmDialog({
            isOpen: true,
            studentId,
            studentName: student?.name || 'Unknown'
        });
    };

    const confirmDeleteStudent = async () => {
        try {
            await deleteStudent(confirmDialog.studentId);
            showSuccessMessage('Student deleted successfully');
            setConfirmDialog({ isOpen: false, studentId: null, studentName: '' });
        } catch (error) {
            showErrorMessage(error.message || 'Failed to delete student');
        }
    };

    const handleVoteChange = async (studentId, newVote) => {
        try {
            const student = students.find(s => s._id === studentId);
            if (student) {
                await updateStudent({ ...student, vote: newVote });
            }
        } catch (error) {
            showErrorMessage(error.message || 'Failed to update vote');
        }
    };

    const handleMoveStudent = async (studentId, direction) => {
        try {
            await moveStudent(studentId, direction);
        } catch (error) {
            showErrorMessage(error.message || 'Failed to move student');
        }
    };

    const handleExcelUpload = async (studentsData) => {
        try {
            await bulkAddStudents(studentsData);
            showSuccessMessage(`Successfully uploaded ${studentsData.length} students`);
            setShowExcelUpload(false);
        } catch (error) {
            showErrorMessage(error.message || 'Failed to upload students');
        }
    };

    const handleSort = (field, direction = null) => {
        if (direction) {
            setSortField(field);
            setSortDirection(direction);
        } else {
            if (sortField === field) {
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
            } else {
                setSortField(field);
                setSortDirection('asc');
            }
        }
    };

    const showErrorMessage = (message) => {
        setErrorPopup({ isVisible: true, message, type: 'error' });
    };

    const showSuccessMessage = (message) => {
        setErrorPopup({ isVisible: true, message, type: 'success' });
    };

    // Login screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Plus className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Vote Manager</h1>
                        <p className="text-gray-600 mt-2">Student Support Tracking System</p>
                    </div>

                    <form onSubmit={login} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                User ID
                            </label>
                            <input
                                type="text"
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Enter your ID"
                                required
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {loginError && (
                            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
                                {loginError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loginLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loginLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Debug information
    console.log('VoteManager render:', {
        loading,
        studentsLength: students.length,
        error,
        isAuthenticated,
        isOnline
    });

    // Main application
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - always show when authenticated */}
            <Header
                user={user}
                onLogout={logout}
                studentsData={students}
                onShowExcelUpload={() => setShowExcelUpload(true)}
                isOnline={isOnline}
                syncing={syncing}
            />

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6 space-y-6">
                {/* Debug Info - Temporary */}
                <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 text-sm">
                    <strong>Debug Info:</strong> Loading: {loading.toString()}, Students: {students.length}, Error: {error || 'none'}, Online: {isOnline.toString()}
                </div>

                {/* Initial Loading State - prominent */}
                {loading && students.length === 0 && (
                    <div className="text-center py-20">
                        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Fetching Student Data</h3>
                            <p className="text-gray-600">Please wait while we load the student information...</p>
                            <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Refreshing Loading State - smaller */}
                {loading && students.length > 0 && (
                    <div className="text-center py-4">
                        <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            <p className="text-blue-700 text-sm">Refreshing data...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={refreshData}
                            className="mt-2 text-red-600 hover:text-red-800 underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Add Student Button */}
                {!loading && (
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Students Management</h2>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowExcelUpload(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span>Upload Excel</span>
                            </button>
                            <button
                                onClick={handleAddStudent}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add Student</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Filter Controls */}
                {!loading && students.length > 0 && (
                    <FilterControls
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        selectedHostel={selectedHostel}
                        onHostelChange={setSelectedHostel}
                        selectedVote={selectedVote}
                        onVoteChange={setSelectedVote}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        totalStudents={students.length}
                        filteredCount={filteredAndSortedStudents.length}
                        isMobile={isMobile}
                    />
                )}

                {/* Students Display */}
                {!loading && (
                    <>
                        {students.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                                    <div className="mx-auto mb-4 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                                    <p className="text-gray-600 mb-6">Get started by adding students individually or uploading an Excel file.</p>
                                    <div className="flex justify-center space-x-4">
                                        <button
                                            onClick={handleAddStudent}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            <span>Add Student</span>
                                        </button>
                                        <button
                                            onClick={() => setShowExcelUpload(true)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <span>Upload Excel</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {isMobile ? (
                                    <MobileStudentsList
                                        students={filteredAndSortedStudents}
                                        onEdit={handleEditStudent}
                                        onDelete={handleDeleteStudent}
                                        onVoteChange={handleVoteChange}
                                        onMove={handleMoveStudent}
                                    />
                                ) : (
                                    <StudentsTable
                                        students={filteredAndSortedStudents}
                                        onEdit={handleEditStudent}
                                        onDelete={handleDeleteStudent}
                                        onVoteChange={handleVoteChange}
                                        onMove={handleMoveStudent}
                                        sortField={sortField}
                                        sortDirection={sortDirection}
                                        onSort={handleSort}
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Modals and Dialogs */}
            <StudentForm
                isOpen={showStudentForm}
                onClose={() => setShowStudentForm(false)}
                onSave={handleSaveStudent}
                editingStudent={editingStudent}
                existingStudents={students}
            />

            <ExcelUpload
                isOpen={showExcelUpload}
                onClose={() => setShowExcelUpload(false)}
                onUpload={handleExcelUpload}
            />

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ isOpen: false, studentId: null, studentName: '' })}
                onConfirm={confirmDeleteStudent}
                title="Delete Student"
                message={`Are you sure you want to delete "${confirmDialog.studentName}"? This action cannot be undone.`}
                confirmText="Delete"
                type="danger"
            />

            <ErrorPopup
                isVisible={errorPopup.isVisible}
                message={errorPopup.message}
                type={errorPopup.type}
                onClose={() => setErrorPopup({ isVisible: false, message: '', type: 'error' })}
            />
        </div>
    );
};

export default VoteManager;
