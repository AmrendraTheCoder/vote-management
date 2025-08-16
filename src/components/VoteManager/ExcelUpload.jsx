import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';

const ExcelUpload = ({ isOpen, onUpload, onClose }) => {
    const [dragActive, setDragActive] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [previewData, setPreviewData] = useState([]);

    if (!isOpen) return null;

    const resetModalState = () => {
        setDragActive(false);
        setProcessing(false);
        setUploadResult(null);
        setPreviewData([]);
    };

    const handleClose = () => {
        resetModalState();
        onClose();
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file) => {
        if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
            setUploadResult({
                success: false,
                message: 'Please upload a valid Excel file (.xlsx, .xls) or CSV file.'
            });
            return;
        }

        setProcessing(true);
        setUploadResult(null);

        try {
            // Check if XLSX library is available
            const XLSX = await import('xlsx').catch(() => null);
            if (!XLSX) {
                throw new Error('Excel processing library not available. Please use CSV format.');
            }

            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                throw new Error('The Excel file is empty.');
            }

            // Validate and transform data
            const validatedData = validateAndTransformData(jsonData);
            setPreviewData(validatedData.slice(0, 5)); // Show first 5 rows as preview

            setUploadResult({
                success: true,
                message: `Successfully processed ${validatedData.length} students.`,
                data: validatedData
            });

        } catch (error) {
            console.error('Error processing file:', error);
            setUploadResult({
                success: false,
                message: error.message || 'Error processing file. Please check the format.'
            });
        } finally {
            setProcessing(false);
        }
    };

    const validateAndTransformData = (data) => {
        const validStudents = [];
        const errors = [];

        data.forEach((row, index) => {
            try {
                // Map column names (case insensitive and flexible)
                const studentName = findColumn(row, ['name', 'student name', 'studentname', 'student_name']);
                const roomNumber = findColumn(row, ['room number', 'roomnumber', 'room_number', 'room no', 'room', 'roomno']);
                const hostel = findColumn(row, ['hostel', 'hostel type', 'hosteltype', 'hostel_type']);
                const vote = findColumn(row, ['vote', 'support status', 'supportstatus', 'support_status', 'status']);

                if (!studentName || !roomNumber) {
                    errors.push(`Row ${index + 2}: Missing required fields (Name and Room Number)`);
                    return;
                }

                // Validate hostel
                let validatedHostel = 'BH'; // Default
                if (hostel) {
                    const hostelValue = hostel.toString().toUpperCase();
                    if (hostelValue.includes('GH') || hostelValue.includes('GIRL')) {
                        validatedHostel = 'GH';
                    } else if (hostelValue.includes('BH') || hostelValue.includes('BOY')) {
                        validatedHostel = 'BH';
                    }
                }

                // Validate vote
                let validatedVote = '';
                if (vote) {
                    const voteValue = vote.toString().toLowerCase();
                    if (voteValue.includes('yes') || voteValue.includes('will vote') || voteValue === '1') {
                        validatedVote = 'Yes';
                    } else if (voteValue.includes('no') || voteValue.includes('won\'t vote') || voteValue === '0') {
                        validatedVote = 'No';
                    } else if (voteValue.includes('undecided') || voteValue.includes('thinking')) {
                        validatedVote = 'Undecided';
                    } else if (voteValue.includes('absent') || voteValue.includes('not available')) {
                        validatedVote = 'Absent';
                    }
                }

                validStudents.push({
                    name: studentName.toString().trim(),
                    roomNumber: roomNumber.toString().trim(),
                    hostel: validatedHostel,
                    vote: validatedVote
                });

            } catch (error) {
                errors.push(`Row ${index + 2}: ${error.message}`);
            }
        });

        if (errors.length > 0) {
            console.warn('Validation errors:', errors);
        }

        return validStudents;
    };

    const findColumn = (row, possibleNames) => {
        for (const name of possibleNames) {
            for (const key in row) {
                if (key.toLowerCase().replace(/[^a-z0-9]/g, '') === name.toLowerCase().replace(/[^a-z0-9]/g, '')) {
                    return row[key];
                }
            }
        }
        return null;
    };

    const handleConfirmUpload = async () => {
        if (uploadResult && uploadResult.success && uploadResult.data) {
            await onUpload(uploadResult.data);
            onClose();
        }
    };

    const getColumnFormatExample = () => {
        return {
            'Student Name': 'John Doe',
            'Room Number': 'A-101',
            'Hostel': 'BH',
            'Support Status': 'Yes'
        };
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Upload Excel File</h3>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Format Requirements */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Required Excel Format:</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                            <p>• <strong>Student Name</strong> (required)</p>
                            <p>• <strong>Room Number</strong> (required)</p>
                            <p>• <strong>Hostel</strong> (BH/GH - optional, defaults to BH)</p>
                            <p>• <strong>Support Status</strong> (Yes/No/Undecided/Absent - optional)</p>
                        </div>
                        <div className="mt-3 text-xs text-blue-700">
                            <p><strong>Example:</strong> {JSON.stringify(getColumnFormatExample())}</p>
                        </div>
                    </div>

                    {/* Upload Area */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-700 mb-2">
                            Drop your Excel file here, or click to browse
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            Supports .xlsx, .xls, and .csv files
                        </p>
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileInput}
                            className="hidden"
                            id="excel-upload"
                        />
                        <label
                            htmlFor="excel-upload"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                        >
                            Choose File
                        </label>
                    </div>

                    {/* Processing State */}
                    {processing && (
                        <div className="mt-4 text-center">
                            <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                <span className="text-blue-700">Processing file...</span>
                            </div>
                        </div>
                    )}

                    {/* Upload Result */}
                    {uploadResult && (
                        <div className={`mt-4 p-4 rounded-lg ${uploadResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                            <div className="flex items-center space-x-2">
                                {uploadResult.success ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                )}
                                <span className={`font-medium ${uploadResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                    {uploadResult.message}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Preview Data */}
                    {previewData.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-medium text-gray-900 mb-2">Preview (First 5 rows):</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hostel</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {previewData.map((student, index) => (
                                            <tr key={index}>
                                                <td className="px-3 py-2 text-sm text-gray-900">{student.name}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900">{student.roomNumber}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900">{student.hostel}</td>
                                                <td className="px-3 py-2 text-sm text-gray-900">{student.vote || 'Not Asked'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        {uploadResult && uploadResult.success && (
                            <button
                                onClick={handleConfirmUpload}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                            >
                                Upload {uploadResult.data?.length || 0} Students
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExcelUpload;
