import { useContext } from 'react';
import { CalendarContext } from './CalendarContextCore';

export const useCalendar = () => {
    const context = useContext(CalendarContext);
    if (!context) throw new Error('useCalendar must be used within CalendarProvider');
    return context;
};
