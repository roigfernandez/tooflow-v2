'use client';

import { useState, useEffect } from 'react';

export default function DateTimeDisplay() {
    const [date, setDate] = useState<Date | null>(null);

    useEffect(() => {
        setDate(new Date());
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!date) return null;

    return (
        <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
            {date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}
            <span className="mx-2">•</span>
            {date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })}
        </div>
    );
}
