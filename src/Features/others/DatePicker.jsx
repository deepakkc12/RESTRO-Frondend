import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const DatePicker = ({
    onChange,
    value,
    placeholder = "Select Date",
    type = 'single' // 'single' or 'range'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const [error, setError] = useState('');

    // Ensure onChange is called correctly for both single and range types
    useEffect(() => {
        const today = new Date();

        if (!value) {
            if (type === 'single') {
                const defaultDate = today;
                setLocalValue(defaultDate);
                onChange(defaultDate);
            } else if (type === 'range') {
                const oneWeekAgo = new Date(today);
                oneWeekAgo.setDate(today.getDate() - 7);

                const defaultRange = [oneWeekAgo, today];
                setLocalValue(defaultRange);
                onChange(defaultRange);
            }
        }
    }, [type, value, onChange]);

    const handleDateChange = (selectedDate) => {
        if (type === 'single') {
            setLocalValue(selectedDate);
            onChange(selectedDate);
            setError('');
        } else if (type === 'range') {
            const [startDate, endDate] = selectedDate;
            
            // Validate that start date is not after end date
            if (startDate && endDate && startDate > endDate) {
                setError('Start date cannot be later than end date');
                return;
            }
            
            setLocalValue(selectedDate);
            onChange(selectedDate);
            setError('');
        }
        
        setIsOpen(false);
    };

    const renderDateInput = () => {
        if (type === 'single') {
            return (
                <div className="flex items-center gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            Date
                        </label>
                        <input
                            type="date"
                            value={localValue ? localValue.toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChange(new Date(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
                        />
                    </div>
                </div>
            );
        }

        // Get today's date for max attribute
        const today = new Date().toISOString().split('T')[0];
        const startDate = localValue && localValue[0] ? localValue[0].toISOString().split('T')[0] : '';
        const endDate = localValue && localValue[1] ? localValue[1].toISOString().split('T')[0] : '';

        return (
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            max={endDate || today}
                            onChange={(e) => {
                                const newStartDate = new Date(e.target.value);
                                const newRange = [newStartDate, localValue?.[1] || newStartDate];
                                handleDateChange(newRange);
                            }}
                            placeholder="Start Date"
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            min={startDate}
                            // max={today}
                            onChange={(e) => {
                                const newEndDate = new Date(e.target.value);
                                const newRange = [localValue?.[0] || newEndDate, newEndDate];
                                handleDateChange(newRange);
                            }}
                            placeholder="End Date"
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full"
                        />
                    </div>
                </div>
                {error && (
                    <p className="text-red-500 text-xs mt-1">{error}</p>
                )}
            </div>
        );
    };

    return (
        <div className="relative w-full">
            <div className="flex items-center">
                {renderDateInput()}
            </div>

            {isOpen && (
                <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg">
                    {/* Custom calendar UI */}
                </div>
            )}
        </div>
    );
};

export default DatePicker;