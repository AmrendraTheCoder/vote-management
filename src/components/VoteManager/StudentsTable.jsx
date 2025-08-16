import React, { useState } from 'react';
import {
    Edit,
    Trash2,
    ChevronUp,
    ChevronDown,
    ArrowUpDown,
    Building,
    Home,
    User,
    CheckCircle,
    XCircle,
    Clock,
    UserMinus
} from 'lucide-react';

const StudentsTable = ({
    students,
    onEdit,
    onDelete,
    onMove,
    sortField,
    sortDirection,
    onSort
}) => {
    const [movingStudent, setMovingStudent] = useState(null);

    const getSortIcon = (field) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
        }
        return sortDirection === 'asc'
            ? <ChevronUp className="w-4 h-4 text-blue-600" />
            : <ChevronDown className="w-4 h-4 text-blue-600" />;
    };

    const getVoteColor = (vote) => {
        switch (vote) {
            case 'Yes':
                return 'bg-green-50 text-green-800 border-green-200';
            case 'No':
                return 'bg-red-50 text-red-800 border-red-200';
            case 'Undecided':
                return 'bg-yellow-50 text-yellow-800 border-yellow-200';
            case 'Absent':
                return 'bg-orange-50 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-50 text-gray-800 border-gray-200';
        }
    };

    const getRowBackground = (vote) => {
        switch (vote) {
            case 'Yes':
                return 'bg-green-50 hover:bg-green-100';
            case 'No':
                return 'bg-red-50 hover:bg-red-100';
            case 'Undecided':
                return 'bg-yellow-50 hover:bg-yellow-100';
            case 'Absent':
                return 'bg-orange-50 hover:bg-orange-100';
            default:
                return 'bg-white hover:bg-gray-50';
        }
    };

    const handleMoveStudent = async (studentId, direction) => {
        setMovingStudent(studentId);
        try {
            await onMove(studentId, direction);
        } finally {
            setMovingStudent(null);
        }
    };

    if (students.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No students found</p>
                <p className="text-gray-400 text-sm mt-2">Add students or adjust your filters</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                #
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => onSort('name')}
                            >
                                <div className="flex items-center space-x-2">
                                    <User className="w-4 h-4" />
                                    <span>Student Name</span>
                                    {getSortIcon('name')}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => onSort('roomNumber')}
                            >
                                <div className="flex items-center space-x-2">
                                    <Home className="w-4 h-4" />
                                    <span>Room</span>
                                    {getSortIcon('roomNumber')}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => onSort('hostel')}
                            >
                                <div className="flex items-center space-x-2">
                                    <Building className="w-4 h-4" />
                                    <span>Hostel</span>
                                    {getSortIcon('hostel')}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => onSort('vote')}
                            >
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Support Status</span>
                                    {getSortIcon('vote')}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student, index) => (
                            <tr
                                key={student._id}
                                className={`transition-colors ${getRowBackground(student.vote)}`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center space-x-2">
                                        <span>{index + 1}</span>
                                        <div className="flex flex-col space-y-1">
                                            <button
                                                onClick={() => handleMoveStudent(student._id, 'up')}
                                                disabled={index === 0 || movingStudent === student._id}
                                                className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Move up"
                                            >
                                                <ChevronUp className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleMoveStudent(student._id, 'down')}
                                                disabled={index === students.length - 1 || movingStudent === student._id}
                                                className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Move down"
                                            >
                                                <ChevronDown className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {student.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 font-mono">
                                        {student.roomNumber}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.hostel === 'GH'
                                        ? 'bg-pink-100 text-pink-800'
                                        : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {student.hostel}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-3">
                                        {/* Status Icon */}
                                        <div className="flex-shrink-0">
                                            {student.vote === 'Yes' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                            {student.vote === 'No' && <XCircle className="w-5 h-5 text-red-600" />}
                                            {student.vote === 'Undecided' && <Clock className="w-5 h-5 text-yellow-600" />}
                                            {student.vote === 'Absent' && <UserMinus className="w-5 h-5 text-orange-600" />}
                                            {(!student.vote || student.vote === '') && <div className="w-5 h-5 rounded-full bg-gray-300 border-2 border-gray-400"></div>}
                                        </div>
                                        {/* Status Text */}
                                        <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${getVoteColor(student.vote)}`}>
                                            {student.vote === 'Yes' && '✅ Will Vote'}
                                            {student.vote === 'No' && '❌ Won\'t Vote'}
                                            {student.vote === 'Undecided' && '🤔 Undecided'}
                                            {student.vote === 'Absent' && '👻 Absent'}
                                            {(!student.vote || student.vote === '') && '📋 Not Asked'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => onEdit(student)}
                                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                            title="Edit student"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(student._id)}
                                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                            title="Delete student"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentsTable;
