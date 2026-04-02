import React, { useState } from 'react';
import { visitsAPI } from '../api';
import toast from 'react-hot-toast';

export default function VisitBookingModal({ isOpen, onClose, room, onSuccess }) {
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('10:00-11:00');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const todayISO = new Date().toISOString().split('T')[0];

    const timeSlots = [];
    for (let h = 10; h < 18; h++) {
        const start = `${String(h).padStart(2,'0')}:00`;
        const end = `${String(h+1).padStart(2,'0')}:00`;
        timeSlots.push(`${start}-${end}`);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!date) return toast.error('Please select a date');
        const selected = new Date(date);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (selected < today) return toast.error('Date cannot be in the past');
        setLoading(true);
        try {
            await visitsAPI.createVisit({ roomId: room._id, date, timeSlot, message });
            toast.success('Visit request sent (Pending approval)');
            setDate(''); setTimeSlot('10:00-11:00'); setMessage('');
            onSuccess && onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to schedule visit');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Schedule a Visit</h3>
                    <button onClick={onClose} className="text-2xl">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-secondary mb-1">Room</label>
                        <div className="font-medium">{room.title}</div>
                    </div>
                    <div>
                        <label className="block text-sm text-secondary mb-1">Visit Date</label>
                        <input type="date" className="w-full px-3 py-2 border rounded" value={date} min={todayISO} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm text-secondary mb-1">Time Slot</label>
                        <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)} className="w-full px-3 py-2 border rounded">
                            {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-secondary mb-1">Message (optional)</label>
                        <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full px-3 py-2 border rounded" rows={3} placeholder="I'll come with a friend" />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" disabled={loading} className="flex-1 bg-primary text-white px-4 py-2 rounded">{loading ? 'Sending...' : 'Send Request'}</button>
                        <button type="button" onClick={onClose} className="flex-1 bg-gray-100 px-4 py-2 rounded">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
