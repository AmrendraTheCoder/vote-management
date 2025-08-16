import React, { useState } from 'react';
import {
    Edit,
    Trash2,
    ChevronUp,
    ChevronDown,
    Building,
    Home,
    User,
    CheckCircle,
    XCircle,
    Clock,
    UserMinus
} from 'lucide-react';

const MobileStudentCard = ({
    student,
    index,
    totalStudents,
    onEdit,
    onDelete,
    onMove
}) => {
    const [movingDirection, setMovingDirection] = useState(null);

    const getVoteIcon = (vote) => {
        switch (vote) {
            case 'Yes':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'No':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'Undecided':
                return <Clock className="w-5 h-5 text-yellow-600" />;
            case 'Absent':
                return <UserMinus className="w-5 h-5 text-orange-600" />;
            default:
                return <div className="w-5 h-5 rounded-full bg-gray-300"></div>;
        }
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

    const getCardBackground = (vote) => {
        switch (vote) {
            case 'Yes':
                return 'bg-green-50 border-green-200';
            case 'No':
                return 'bg-red-50 border-red-200';
            case 'Undecided':
                return 'bg-yellow-50 border-yellow-200';
            case 'Absent':
                return 'bg-orange-50 border-orange-200';
            default:
                return 'bg-white border-gray-200';
        }
    };

    const handleMove = async (direction) => {
        setMovingDirection(direction);
        try {
            await onMove(student._id, direction);
        } finally {
            setMovingDirection(null);
        }
    };

    return (
        <div className={`rounded-lg shadow-sm border p-4 space-y-4 ${getCardBackground(student.vote)}`}>
            {/* Header with position and move buttons */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                        #{index + 1}
                    </div>
                    <div className="flex flex-col space-y-1">
                        <button
                            onClick={() => handleMove('up')}
                            disabled={index === 0 || movingDirection}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed p-1"
                            title="Move up"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleMove('down')}
                            disabled={index === totalStudents - 1 || movingDirection}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed p-1"
                            title="Move down"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => onEdit(student)}
                        className="text-blue-600 hover:text-blue-800 p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                        title="Edit student"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(student._id)}
                        className="text-red-600 hover:text-red-800 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                        title="Delete student"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Student Info */}
            <div className="space-y-3">
                {/* Name */}
                <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                        <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Student Name</p>
                        <p className="font-medium text-gray-900">{student.name}</p>
                    </div>
                </div>

                {/* Room Number */}
                <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                        <Home className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Room Number</p>
                        <p className="font-medium text-gray-900 font-mono">{student.roomNumber}</p>
                    </div>
                </div>

                {/* Hostel */}
                <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                        <Building className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Hostel</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.hostel === 'GH'
                            ? 'bg-pink-100 text-pink-800'
                            : 'bg-blue-100 text-blue-800'
                            }`}>
                            {student.hostel}
                        </span>
                    </div>
                </div>
            </div>

            {/* Support Status - Read Only */}
            <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${student.vote === 'Yes' ? 'bg-green-100' :
                            student.vote === 'No' ? 'bg-red-100' :
                                student.vote === 'Undecided' ? 'bg-yellow-100' :
                                    student.vote === 'Absent' ? 'bg-orange-100' :
                                        'bg-gray-100'
                        }`}>
                        {getVoteIcon(student.vote)}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-1">Support Status</p>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getVoteColor(student.vote)}`}>
                            {student.vote === 'Yes' && '✅ Will Vote'}
                            {student.vote === 'No' && '❌ Won\'t Vote'}
                            {student.vote === 'Undecided' && '🤔 Undecided'}
                            {student.vote === 'Absent' && '👻 Absent'}
                            {(!student.vote || student.vote === '') && '📋 Not Asked'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Moving indicator */}
            {movingDirection && (
                <div className="absolute inset-0 bg-blue-50 bg-opacity-90 rounded-lg flex items-center justify-center">
                    <div className="flex items-center space-x-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm font-medium">
                            Moving {movingDirection}...
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

const MobileStudentsList = ({
    students,
    onEdit,
    onDelete,
    onMove
}) => {
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
        <div className="space-y-4">
            {students.map((student, index) => (
                <MobileStudentCard
                    key={student._id}
                    student={student}
                    index={index}
                    totalStudents={students.length}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onMove={onMove}
                />
            ))}
        </div>
    );
};

export default MobileStudentsList;
