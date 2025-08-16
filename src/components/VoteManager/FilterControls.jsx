import React from 'react';
import {
    Search,
    Filter,
    X,
    SortAsc,
    Users,
    Building,
    CheckCircle,
    XCircle,
    Clock,
    UserMinus
} from 'lucide-react';

const FilterControls = ({
    searchTerm,
    onSearchChange,
    selectedHostel,
    onHostelChange,
    selectedVote,
    onVoteChange,
    sortField,
    sortDirection,
    onSort,
    totalStudents,
    filteredCount,
    isMobile = false
}) => {
    const clearFilters = () => {
        onSearchChange('');
        onHostelChange('all');
        onVoteChange('all');
    };

    const hasActiveFilters = searchTerm || selectedHostel !== 'all' || selectedVote !== 'all';

    const getVoteIcon = (vote) => {
        switch (vote) {
            case 'Yes':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'No':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'Undecided':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'Absent':
                return <UserMinus className="w-4 h-4 text-orange-600" />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
                </div>
                <div className="flex items-center justify-between gap-4">
                    {/* Results Count */}
                    <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                        <Users className="w-4 h-4 inline mr-1" />
                        {filteredCount} of {totalStudents} students
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-red-600 hover:text-red-800 flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors border border-red-200"
                        >
                            <X className="w-4 h-4" />
                            <span>Clear All</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name or room number..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base placeholder-gray-500"
                />
                {searchTerm && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Filter Controls */}
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
                {/* Hostel Filter */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        <Building className="w-4 h-4 inline mr-2" />
                        Hostel Type
                    </label>
                    <select
                        value={selectedHostel}
                        onChange={(e) => onHostelChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                    >
                        <option value="all">All Hostels</option>
                        <option value="BH">Boys Hostel (BH)</option>
                        <option value="GH">Girls Hostel (GH)</option>
                    </select>
                </div>

                {/* Vote Status Filter */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Support Status
                    </label>
                    <select
                        value={selectedVote}
                        onChange={(e) => onVoteChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                    >
                        <option value="all">All Statuses</option>
                        <option value="">Not Asked</option>
                        <option value="Yes">Will Vote</option>
                        <option value="No">Won't Vote</option>
                        <option value="Undecided">Undecided</option>
                        <option value="Absent">Absent</option>
                    </select>
                </div>

                {/* Sort Control */}
                {!isMobile && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            <SortAsc className="w-4 h-4 inline mr-2" />
                            Sort By
                        </label>
                        <select
                            value={`${sortField}-${sortDirection}`}
                            onChange={(e) => {
                                const [field, direction] = e.target.value.split('-');
                                onSort(field, direction);
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                        >
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="roomNumber-asc">Room (Low-High)</option>
                            <option value="roomNumber-desc">Room (High-Low)</option>
                            <option value="hostel-asc">Hostel (BH First)</option>
                            <option value="hostel-desc">Hostel (GH First)</option>
                            <option value="vote-asc">Status (A-Z)</option>
                            <option value="vote-desc">Status (Z-A)</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Results Summary */}
            <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>
                            Showing <span className="font-medium text-gray-900">{filteredCount}</span> of{' '}
                            <span className="font-medium text-gray-900">{totalStudents}</span> students
                        </span>
                    </div>

                    {hasActiveFilters && (
                        <div className="flex items-center space-x-2">
                            <span className="text-blue-600 text-xs">Filters active:</span>
                            <div className="flex items-center space-x-1">
                                {searchTerm && (
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        Search: "{searchTerm}"
                                    </span>
                                )}
                                {selectedHostel !== 'all' && (
                                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                        {selectedHostel}
                                    </span>
                                )}
                                {selectedVote !== 'all' && (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                                        {getVoteIcon(selectedVote)}
                                        <span>{selectedVote || 'Not Asked'}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterControls;
