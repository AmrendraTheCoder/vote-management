import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const ErrorPopup = ({ 
    isVisible, 
    message, 
    type = 'error', // 'error', 'success', 'info', 'warning'
    duration = 5000, 
    onClose 
}) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'info':
                return <Info className="w-5 h-5 text-blue-600" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            default:
                return <AlertCircle className="w-5 h-5 text-red-600" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    text: 'text-green-800'
                };
            case 'info':
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    text: 'text-blue-800'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    text: 'text-yellow-800'
                };
            default:
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    text: 'text-red-800'
                };
        }
    };

    const colors = getColors();

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
            <div className={`${colors.bg} ${colors.border} ${colors.text} border rounded-lg shadow-lg p-4 min-w-[320px] max-w-md`}>
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        {getIcon()}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium leading-relaxed">
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                
                {/* Progress bar for duration */}
                {duration > 0 && (
                    <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${
                                type === 'success' ? 'bg-green-500' :
                                type === 'info' ? 'bg-blue-500' :
                                type === 'warning' ? 'bg-yellow-500' :
                                'bg-red-500'
                            } transition-all ease-linear`}
                            style={{
                                width: '100%',
                                animation: `shrink ${duration}ms linear forwards`
                            }}
                        />
                    </div>
                )}
            </div>
            
            <style jsx>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

export default ErrorPopup;
