import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Event {
    id: number;
    club: string;
    title: string;
    date: string;
    location: string;
    attendees: number;
    description: string;
}

interface User {
    id: number;
    joinedEvents: number[];
}

const initialEvents: Event[] = [
    { id: 1, club: "History Club", title: "Local Heritage Walk", date: "Saturday, 10am", location: "Old Library", attendees: 14, description: "Guided walk through neighbourhood history." },
    { id: 2, club: "Book Club", title: "Monthly Meeting", date: "Thursday, 7pm", location: "Community Centre", attendees: 8, description: "Discuss this month's book over tea." },
    { id: 3, club: "Garden Club", title: "Spring Planting Day", date: "Saturday, 9am", location: "Community Garden", attendees: 12, description: "Plant flowers and vegetables for the season." },
    { id: 4, club: "Walking Club", title: "Sunday Morning Stroll", date: "Sunday, 10am", location: "Victoria Park", attendees: 9, description: "Gentle walk followed by coffee." },
    { id: 5, club: "Choir Club", title: "Open Rehearsal", date: "Wednesday, 6:30pm", location: "St Mary's Church", attendees: 11, description: "All voices welcome!" },
    { id: 6, club: "Games Club", title: "Board Game Night", date: "Friday, 7pm", location: "Community Hub", attendees: 7, description: "Catan, Scrabble, Mahjong." },
    { id: 7, club: "Tech Club", title: "Smartphone Basics", date: "Monday, 2pm", location: "Library", attendees: 6, description: "Learn to use your phone." },
    { id: 8, club: "Faith Circle", title: "Quiet Reflection", date: "Sunday, 11am", location: "Community Centre", attendees: 5, description: "Meditation and gentle conversation." },
    { id: 9, club: "Cooking Club", title: "Korean Cooking Class", date: "Tuesday, 6pm", location: "Community Kitchen", attendees: 10, description: "Learn to make Bibimbap." },
    { id: 10, club: "Cooking Club", title: "Pakistani Street Food", date: "Thursday, 5:30pm", location: "Main Hall", attendees: 15, description: "Make samosas and chai." },
    { id: 11, club: "Walking Club", title: "Park Run & Picnic", date: "Sunday, 9am", location: "Victoria Park", attendees: 30, description: "5km run/walk followed by picnic." },
    { id: 12, club: "Faith Circle", title: "Ramadan Iftar Gathering", date: "Friday, 7pm", location: "Community Centre", attendees: 40, description: "Open Iftar meal." },
    { id: 13, club: "Psychological Support", title: "Healing Circle", date: "Tuesday, 6pm", location: "Private Room", attendees: 6, description: "Confidential support space." },
    { id: 14, club: "Medical Support", title: "Healthy Eating on a Budget", date: "Thursday, 5:30pm", location: "Community Kitchen", attendees: 10, description: "Cook nutritious, low-cost meals." },
    { id: 15, club: "Knitting Club", title: "Beginner's Knitting", date: "Wednesday, 2pm", location: "Craft Room", attendees: 8, description: "Learn to knit a scarf." },
    { id: 16, club: "Charity Outreach", title: "Mosque Open Day", date: "Saturday, 2pm", location: "Central Mosque", attendees: 25, description: "Learn about Islamic faith and culture." },
    { id: 17, club: "Charity Outreach", title: "Church Community Lunch", date: "Sunday, 1pm", location: "St Peter's Church", attendees: 20, description: "Free community lunch." },
    { id: 18, club: "Gentle Yoga", title: "Chair Yoga for Seniors", date: "Monday, 10am", location: "Community Centre", attendees: 12, description: "Low-impact yoga for mobility." },
    { id: 19, club: "Charity Outreach", title: "Interfaith Peace Gathering", date: "Tuesday, 7pm", location: "Town Hall", attendees: 18, description: "Share food and conversation." },
    { id: 20, club: "Walking Club", title: "Gentle Stroll to Park", date: "Saturday, 2pm", location: "Library", attendees: 11, description: "Easy walk with benches along the way." },
];

function loadData<T>(key: string, defaultData: T): T {
    const saved = localStorage.getItem(key);
    if (saved && saved !== 'undefined') return JSON.parse(saved);
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
}

function saveData<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
}

function getCurrentUser(): User | null {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return null;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = JSON.parse(userJson);
    return users.find((u: any) => u.id === currentUser.id) || null;
}

function updateUserInStorage(updatedUser: any): void {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex((u: any) => u.id === updatedUser.id);
    if (index !== -1) users[index] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));
    const { password, ...userWithoutPassword } = updatedUser;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [formData, setFormData] = useState({ club: '', title: '', date: '', location: '', description: '', attendees: 0 });
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        setEvents(loadData('events', initialEvents));
    }, []);

    const showMessage = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAttendEvent = (eventId: number) => {
        const user = getCurrentUser();
        if (!user) {
            showMessage('Please sign in to attend events!');
            setTimeout(() => window.location.href = '/signin', 1500);
            return;
        }
        const event = events.find(e => e.id === eventId);
        if (event && !user.joinedEvents?.includes(eventId)) {
            const updatedEvents = events.map(e => e.id === eventId ? { ...e, attendees: e.attendees + 1 } : e);
            setEvents(updatedEvents);
            saveData('events', updatedEvents);
            const updatedUser = { ...user, joinedEvents: [...(user.joinedEvents || []), eventId] };
            updateUserInStorage(updatedUser);
            showMessage(`You joined "${event.title}"! 🎉`);
        } else if (user.joinedEvents?.includes(eventId)) {
            showMessage('You are already attending this event!');
        }
    };

    const handleAddEvent = () => {
        if (!formData.club || !formData.title || !formData.date || !formData.location) {
            showMessage('Please fill all required fields');
            return;
        }
        const newEvent: Event = { id: Math.max(...events.map(e => e.id), 0) + 1, ...formData, attendees: 0 };
        const updatedEvents = [...events, newEvent];
        setEvents(updatedEvents);
        saveData('events', updatedEvents);
        setShowAddForm(false);
        setFormData({ club: '', title: '', date: '', location: '', description: '', attendees: 0 });
        showMessage('Event created successfully!');
    };

    const handleEditEvent = (event: Event) => {
        setEditingEvent(event);
        setFormData({ club: event.club, title: event.title, date: event.date, location: event.location, description: event.description, attendees: event.attendees });
    };

    const handleUpdateEvent = () => {
        if (editingEvent) {
            const updatedEvents = events.map(e => e.id === editingEvent.id ? { ...e, ...formData } : e);
            setEvents(updatedEvents);
            saveData('events', updatedEvents);
            setEditingEvent(null);
            setFormData({ club: '', title: '', date: '', location: '', description: '', attendees: 0 });
            showMessage('Event updated successfully!');
        }
    };

    const handleDeleteEvent = (eventId: number) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            const updatedEvents = events.filter(e => e.id !== eventId);
            setEvents(updatedEvents);
            saveData('events', updatedEvents);
            showMessage('Event deleted successfully!');
        }
    };

    const clubOptions = ['Book Club', 'Choir Club', 'Faith Circle', 'History Club', 'Games Club', 'Garden Club', 'Walking Club', 'Tech Club', 'Cooking Club', 'Charity Outreach', 'Gentle Yoga', 'Psychological Support', 'Medical Support', 'Knitting Club'];
    const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeOptions = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'];

    return (
        <main className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div><h1 className="text-3xl font-bold text-emerald-700">📅 Community Events</h1><p className="text-gray-500">Find events near you – join and meet your neighbours</p></div>
                <button onClick={() => setShowAddForm(!showAddForm)} className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 cursor-pointer">+ Create Event</button>
            </div>
            {notification && <div className="fixed bottom-5 right-5 bg-emerald-600 text-white px-5 py-3 rounded-xl z-50 animate-slide-in">{notification}</div>}
            {showAddForm && (
                <div className="bg-white rounded-2xl p-6 shadow-md border mb-8">
                    <h3 className="text-xl font-bold mb-4">Create New Event</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <select value={formData.club} onChange={(e) => setFormData({ ...formData, club: e.target.value })} className="p-3 border rounded-xl"><option value="">Select Club *</option>{clubOptions.map(c => <option key={c}>{c}</option>)}</select>
                        <input type="text" placeholder="Event Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="p-3 border rounded-xl" />
                        <select value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="p-3 border rounded-xl"><option value="">Select Day *</option>{dayOptions.map(d => <option key={d}>{d}</option>)}</select>
                        <select value={formData.date.split(',')[1]?.trim() || ''} onChange={(e) => { const day = formData.date.split(',')[0] || ''; setFormData({ ...formData, date: day ? `${day}, ${e.target.value}` : e.target.value }); }} className="p-3 border rounded-xl"><option value="">Select Time *</option>{timeOptions.map(t => <option key={t}>{t}</option>)}</select>
                        <input type="text" placeholder="Location *" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="p-3 border rounded-xl" />
                        <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="p-3 border rounded-xl md:col-span-2" rows={3} />
                    </div>
                    <div className="flex gap-3 mt-4"><button onClick={handleAddEvent} className="bg-emerald-700 text-white px-6 py-2 rounded-lg cursor-pointer">Create Event</button><button onClick={() => setShowAddForm(false)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg cursor-pointer">Cancel</button></div>
                </div>
            )}
            {editingEvent && (
                <div className="bg-amber-50 rounded-2xl p-6 shadow-md border border-amber-200 mb-8">
                    <h3 className="text-xl font-bold mb-4">Edit Event: {editingEvent.title}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Club" value={formData.club} onChange={(e) => setFormData({ ...formData, club: e.target.value })} className="p-3 border rounded-xl" />
                        <input type="text" placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="p-3 border rounded-xl" />
                        <input type="text" placeholder="Date & Time" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="p-3 border rounded-xl" />
                        <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="p-3 border rounded-xl" />
                        <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="p-3 border rounded-xl md:col-span-2" rows={3} />
                    </div>
                    <div className="flex gap-3 mt-4"><button onClick={handleUpdateEvent} className="bg-amber-600 text-white px-6 py-2 rounded-lg cursor-pointer">Update Event</button><button onClick={() => setEditingEvent(null)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg cursor-pointer">Cancel</button></div>
                </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                    <div key={event.id} className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-l-amber-600 hover:shadow-md transition-all relative group">
                        <div className="text-xs font-semibold text-amber-600 uppercase mb-2">{event.club}</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                        <div className="space-y-1 mb-3 text-sm text-gray-500"><p>📅 {event.date}</p><p>📍 {event.location}</p></div>
                        <p className="text-sm text-gray-500 mb-3">{event.description}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <span className="text-sm text-emerald-700">👥 {event.attendees} going</span>
                            <button onClick={() => handleAttendEvent(event.id)} className="bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-emerald-800 transition cursor-pointer">I'm interested</button>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => handleEditEvent(event)} className="bg-amber-500 text-white px-2 py-1 rounded text-xs hover:bg-amber-600">Edit</button>
                            <button onClick={() => handleDeleteEvent(event.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}