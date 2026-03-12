import { formatISO, isValid } from "date-fns";

export const isDateToday = (dateInput?: string | number): boolean => {
    if (!dateInput) return false;
    let parsedDate: Date;
    try {
        if (typeof dateInput === 'number' || /^\d+$/.test(dateInput.toString())) {
            parsedDate = new Date(Number(dateInput));
        } else {
            parsedDate = new Date(dateInput);
        }
        if (isNaN(parsedDate.getTime())) return false;

        const today = new Date();
        return parsedDate.getFullYear() === today.getFullYear() &&
            parsedDate.getMonth() === today.getMonth() &&
            parsedDate.getDate() === today.getDate();
    } catch {
        return false;
    }
};

export const timestampToISO = (timestamp: string | number): string | number | null => {
    if (!timestamp || isNaN(Number(timestamp))) {
        console.error('Invalid timestamp:', timestamp);
        return timestamp;
    }
    try {
        const date = new Date(Number(timestamp));
        if (!isValid(date)) {
            console.error('Invalid parsed date:', timestamp);
            return null;
        }
        return formatISO(date, { representation: 'complete' });
    } catch (error) {
        console.error('Error converting timestamp:', error);
        return null;
    }
};