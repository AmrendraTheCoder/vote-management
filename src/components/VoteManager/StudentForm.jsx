import React, { useState, useEffect } from 'react';
import { Save, X, User, Home, Building } from 'lucide-react';

const StudentForm = ({
    isOpen,
    onClose,
    onSave,
    editingStudent,
    existingStudents = []
}) => {
    const [formData, setFormData] = useState({
        name: '',
        roomNumber: '',
        hostel: 'BH',
        vote: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (editingStudent) {
            setFormData({
                name: editingStudent.name || '',
                roomNumber: editingStudent.roomNumber || '',
                hostel: editingStudent.hostel || 'BH',
                vote: editingStudent.vote || ''
            });
        } else {
            setFormData({
                name: '',
                roomNumber: '',
                hostel: 'BH',
                vote: ''
            });
        }
        setErrors({});
    }, [editingStudent, isOpen]);

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Student name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Room number validation
        if (!formData.roomNumber.trim()) {
            newErrors.roomNumber = 'Room number is required';
        }

        // Check for duplicates (only for new students or if name/room changed)
        if (!editingStudent ||
            editingStudent.name !== formData.name.trim() ||
            editingStudent.roomNumber !== formData.roomNumber.trim()) {

            const duplicate = existingStudents.find(student =>
                student.name.toLowerCase() === formData.name.trim().toLowerCase() &&
                student.roomNumber.toLowerCase() === formData.roomNumber.trim().toLowerCase() &&
                student.hostel === formData.hostel
            );

            if (duplicate) {
                newErrors.duplicate = 'A student with this name and room number already exists in this hostel';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const studentData = {
                ...formData,
                name: formData.name.trim(),
                roomNumber: formData.roomNumber.trim()
            };

            if (editingStudent) {
                studentData._id = editingStudent._id;
            }

            await onSave(studentData);
            onClose();
        } catch (error) {
            console.error('Error saving student:', error);
            setErrors({ submit: 'Failed to save student. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear specific field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
        if (errors.duplicate) {
            setErrors(prev => ({ ...prev, duplicate: null }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-300">
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                {editingStudent ? 'Edit Student' : 'Add New Student'}
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Error Messages */}
                    {errors.duplicate && (
                        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
                            {errors.duplicate}
                        </div>
                    )}
                    {errors.submit && (
                        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
                            {errors.submit}
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Student Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Student Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                placeholder="Enter student name"
                                autoComplete="name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Room Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Room Number *
                            </label>
                            <div className="relative">
                                <Home className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.roomNumber}
                                    onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.roomNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                    placeholder="e.g., A-101"
                                />
                            </div>
                            {errors.roomNumber && (
                                <p className="mt-1 text-sm text-red-600">{errors.roomNumber}</p>
                            )}
                        </div>

                        {/* Hostel */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hostel Type
                            </label>
                            <div className="relative">
                                <Building className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <select
                                    value={formData.hostel}
                                    onChange={(e) => handleInputChange('hostel', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                                >
                                    <option value="BH">Boys Hostel (BH)</option>
                                    <option value="GH">Girls Hostel (GH)</option>
                                </select>
                            </div>
                        </div>

                        {/* Support Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Support Status
                            </label>
                            <select
                                value={formData.vote}
                                onChange={(e) => handleInputChange('vote', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                            >
                                <option value="">Not Asked</option>
                                <option value="Yes">Will Vote</option>
                                <option value="No">Won't Vote</option>
                                <option value="Undecided">Undecided</option>
                                <option value="Absent">Absent</option>
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>{editingStudent ? 'Update' : 'Add'} Student</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;
