import React from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';

const ConfirmDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    type = 'warning' // 'warning', 'danger', 'info'
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <AlertTriangle className="w-6 h-6 text-red-600" />;
            case 'info':
                return <Check className="w-6 h-6 text-blue-600" />;
            default:
                return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'danger':
                return {
                    iconBg: 'bg-red-100',
                    confirmBtn: 'bg-red-600 hover:bg-red-700',
                    border: 'border-red-200'
                };
            case 'info':
                return {
                    iconBg: 'bg-blue-100',
                    confirmBtn: 'bg-blue-600 hover:bg-blue-700',
                    border: 'border-blue-200'
                };
            default:
                return {
                    iconBg: 'bg-yellow-100',
                    confirmBtn: 'bg-yellow-600 hover:bg-yellow-700',
                    border: 'border-yellow-200'
                };
        }
    };

    const colors = getColors();

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${colors.iconBg}`}>
                                {getIcon()}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {title}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Message */}
                    <div className={`p-4 rounded-lg border ${colors.border} ${colors.iconBg} mb-6`}>
                        <p className="text-gray-700 leading-relaxed">
                            {message}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            className={`px-6 py-2 ${colors.confirmBtn} text-white rounded-lg font-medium transition-colors duration-200`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
