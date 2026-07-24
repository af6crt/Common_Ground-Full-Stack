import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

// ============ TYPES ============
interface Club {
    id: number;
    name: string;
    icon: string;
    description: string;
    members: number;
    tag: string;
}

interface Event {
    id: number;
    club: string;
    title: string;
    date: string;
    location: string;
    attendees: number;
    description: string;
}

interface Meal {
    id: number;
    cook: string;
    meal: string;
    dietary: string;
    portions: number;
    pickupTime: string;
    location: string;
}

interface User {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    ageGroup?: string;
    interests?: string[];
    joinDate: string;
    joinedEvents: number[];
    requestedMeals: number[];
    joinedClubs: number[];
    createdEvents?: number[];
    sharedMeals?: number[];
}

// ============ API CONFIGURATION ============
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';

function getToken(): string | null {
    return localStorage.getItem('token');
}

function setAuth(token: string, user: User) {
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
}

async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };
    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

    // Handle 204 No Content (successful DELETE)
    if (response.status === 204) {
        return null;
    }

    if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
        } catch (e) {
            errorMsg = response.statusText || errorMsg;
        }
        throw new Error(errorMsg);
    }

    // Only parse JSON if there is a JSON body
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    return null;
}
function getCurrentUser(): User | null {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return null;
    return JSON.parse(userJson);
}

function updateUserInStorage(updatedUser: User): void {
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
}

// ============ NAVBAR (unchanged) ============
function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setUser(getCurrentUser());
    }, []);

    const handleLogout = () => {
        clearAuth();
        setUser(null);
        window.location.href = '/';
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold text-emerald-700 no-underline">
                        <span className="text-2xl">🌱</span><span>Common Ground</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-gray-600 hover:text-emerald-700 no-underline">Home</Link>
                        <Link to="/events" className="text-gray-600 hover:text-emerald-700 no-underline">Events</Link>
                        <Link to="/meals" className="text-gray-600 hover:text-emerald-700 no-underline">Meals</Link>
                        <Link to="/about" className="text-gray-600 hover:text-emerald-700 no-underline">About</Link>
                        <Link to="/dashboard" className="text-gray-600 hover:text-emerald-700 no-underline">Dashboard</Link>
                        <Link to="/profile" className="text-gray-600 hover:text-emerald-700 no-underline">Profile</Link>
                        {user ? (
                            <>
                                <span className="text-gray-500">👋 {user.fullName.split(' ')[0]}</span>
                                <button onClick={handleLogout} className="border border-gray-300 px-4 py-2 rounded-lg hover:border-emerald-700 hover:text-emerald-700 cursor-pointer">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/signin" className="border border-gray-300 px-4 py-2 rounded-lg hover:border-emerald-700 hover:text-emerald-700 no-underline">Sign In</Link>
                                <Link to="/signup" className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 no-underline">Join Free</Link>
                            </>
                        )}
                    </div>
                    <button className="md:hidden text-2xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>
                </div>
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 mt-4 pt-4 flex flex-col gap-3">
                        <Link to="/" className="text-gray-600 py-2">Home</Link>
                        <Link to="/events" className="text-gray-600 py-2">Events</Link>
                        <Link to="/meals" className="text-gray-600 py-2">Meals</Link>
                        <Link to="/about" className="text-gray-600 py-2">About</Link>
                        <Link to="/dashboard" className="text-gray-600 py-2">Dashboard</Link>
                        <Link to="/profile" className="text-gray-600 py-2">Profile</Link>
                        {user ? (
                            <>
                                <span className="text-gray-500 py-2">👋 {user.fullName.split(' ')[0]}</span>
                                <button onClick={handleLogout} className="border px-4 py-2 rounded-lg text-left">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/signin" className="border px-4 py-2 rounded-lg text-center">Sign In</Link>
                                <Link to="/signup" className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-center">Join Free</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}

// ============ HOME PAGE ============
function HomePage() {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [notification, setNotification] = useState<{ msg: string; type: string } | null>(null);

    useEffect(() => {
        fetchClubs();
    }, []);

    const fetchClubs = async () => {
        try {
            const data = await apiFetch('/clubs');
            setClubs(data);
        } catch (err) {
            console.error('Failed to load clubs', err);
        }
    };

    const user = getCurrentUser();

    const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleJoinClub = async (clubId: number) => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            showMessage('Please sign in to join clubs!', 'error');
            setTimeout(() => window.location.href = '/signin', 1500);
            return;
        }
        const club = clubs.find(c => c.id === clubId);
        if (!club) return;
        if (currentUser.joinedClubs?.includes(clubId)) {
            showMessage('You already joined this club!', 'info');
            return;
        }
        try {
            const updatedClub = await apiFetch(`/clubs/${clubId}/join`, { method: 'POST' });
            setClubs(prev => prev.map(c => c.id === clubId ? updatedClub : c));
            const updatedUser = { ...currentUser, joinedClubs: [...(currentUser.joinedClubs || []), clubId] };
            updateUserInStorage(updatedUser);
            showMessage(`You joined ${club.name}! 🎉`, 'success');
        } catch (err: any) {
            showMessage(err.message, 'error');
        }
    };

    return (
        <main>
            {notification && (
                <div className={`fixed bottom-5 right-5 px-5 py-3 rounded-xl z-50 animate-slide-in ${
                    notification.type === 'success' ? 'bg-emerald-600' :
                        notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                } text-white`}>
                    {notification.msg}
                </div>
            )}
            <section className="bg-gradient-to-br from-gray-50 to-indigo-50 py-16 px-4">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">Find your <span className="text-emerald-700 relative inline-block">people</span>, right in your neighbourhood</h1>
                        <p className="text-lg text-gray-600 mt-4 mb-8">Common Ground is where neighbours come together over shared interests.</p>
                        <div className="flex gap-4 flex-wrap">
                            <Link to="/events" className="bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-800">Explore Events →</Link>
                            <Link to="/signup" className="border-2 border-emerald-700 text-emerald-700 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 hover:text-white">Join Free</Link>
                        </div>
                    </div>
                    <div className="relative min-h-[300px]">
                        <div className="absolute top-0 left-0 bg-white px-5 py-3 rounded-xl shadow-lg font-medium animate-float">📚 Book Club · 24 members</div>
                        <div className="absolute top-16 right-0 bg-white px-5 py-3 rounded-xl shadow-lg font-medium animate-float" style={{ animationDelay: '0.5s' }}>🌿 Gardening · 20 members</div>
                        <div className="absolute bottom-0 left-12 bg-white px-5 py-3 rounded-xl shadow-lg font-medium animate-float" style={{ animationDelay: '1s' }}>🚶 Walking · 32 members</div>
                    </div>
                </div>
            </section>
            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto bg-gradient-to-r from-emerald-700 to-emerald-500 rounded-2xl p-8 text-white flex gap-6 items-start">
                    <div className="text-5xl bg-white/20 w-16 h-16 rounded-full flex items-center justify-center">👋</div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-2">Hey there, neighbour!</h2>
                        <p className="opacity-90">Welcome to Common Ground — your local hub for connection.</p>
                    </div>
                </div>
            </section>
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <span className="bg-gray-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">Community Groups</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">Join a club that feels like home</h2>
                        <p className="text-gray-500">From books to board games, there's something for everyone</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {clubs.map(club => {
                            const isJoined = user?.joinedClubs?.includes(club.id) ?? false;
                            return (
                                <div key={club.id} className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-all hover:-translate-y-1">
                                    <div className="text-4xl mb-4">{club.icon}</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{club.name}</h3>
                                    <p className="text-gray-500 text-sm mb-4">{club.description}</p>
                                    <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                                        <span>👥 {club.members} members</span>
                                        <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">{club.tag}</span>
                                    </div>
                                    <button
                                        onClick={() => !isJoined && handleJoinClub(club.id)}
                                        disabled={isJoined}
                                        className={`w-full py-2 rounded-lg font-medium transition cursor-pointer ${
                                            isJoined
                                                ? 'bg-blue-100 text-blue-700 border border-blue-300 cursor-not-allowed'
                                                : 'border border-emerald-700 text-emerald-700 hover:bg-emerald-700 hover:text-white'
                                        }`}
                                    >
                                        {isJoined ? '✓ Joined' : 'Join this club'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
            <footer className="bg-gray-900 text-white py-12 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4"><span className="text-2xl">🌱</span><span className="font-bold text-xl">Common Ground</span></div>
                    <p className="text-gray-400 text-sm">© 2026 Common Ground — Building community, one connection at a time.</p>
                </div>
            </footer>
        </main>
    );
}

// ============ EVENTS PAGE (with scroll-to-edit & optimistic updates) ============
function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [formData, setFormData] = useState({ club: '', title: '', date: '', location: '', description: '', attendees: 0 });
    const [notification, setNotification] = useState<{ msg: string; type: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const user = getCurrentUser();
    const editFormRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const data = await apiFetch('/events');
            setEvents(data);
        } catch (err) {
            showMessage('Failed to load events', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAttendEvent = async (eventId: number) => {
        if (!user) {
            showMessage('Please sign in to attend events!', 'error');
            setTimeout(() => window.location.href = '/signin', 1500);
            return;
        }
        const event = events.find(e => e.id === eventId);
        if (user.joinedEvents?.includes(eventId)) {
            showMessage('You are already attending this event!', 'info');
            return;
        }
        // Optimistic update
        const previousEvents = [...events];
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendees: e.attendees + 1 } : e));
        const updatedUser = { ...user, joinedEvents: [...(user.joinedEvents || []), eventId] };
        updateUserInStorage(updatedUser);
        try {
            await apiFetch(`/events/${eventId}/attend`, { method: 'POST' });
            showMessage(`You joined "${event?.title}"! 🎉`, 'success');
        } catch (err: any) {
            setEvents(previousEvents);
            const rollbackUser = { ...user, joinedEvents: user.joinedEvents.filter(id => id !== eventId) };
            updateUserInStorage(rollbackUser);
            showMessage(err.message, 'error');
        }
    };

    const handleAddEvent = async () => {
        if (!formData.club || !formData.title || !formData.date || !formData.location) {
            showMessage('Please fill all required fields', 'error');
            return;
        }
        try {
            const newEvent = await apiFetch('/events', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            setEvents(prev => [...prev, newEvent]);
            const currentUser = getCurrentUser();
            if (currentUser) {
                const updatedUser = {
                    ...currentUser,
                    createdEvents: [...(currentUser.createdEvents || []), newEvent.id]
                };
                updateUserInStorage(updatedUser);
            }
            setShowAddForm(false);
            setFormData({ club: '', title: '', date: '', location: '', description: '', attendees: 0 });
            showMessage('Event created successfully!', 'success');
        } catch (err: any) {
            showMessage(err.message, 'error');
        }
    };

    const handleEditEvent = (event: Event) => {
        setEditingEvent(event);
        setFormData({
            club: event.club,
            title: event.title,
            date: event.date,
            location: event.location,
            description: event.description,
            attendees: event.attendees,
        });
        // Scroll to edit form smoothly
        setTimeout(() => {
            editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleUpdateEvent = async () => {
        if (!editingEvent) return;
        try {
            const updated = await apiFetch(`/events/${editingEvent.id}`, {
                method: 'PUT',
                body: JSON.stringify(formData),
            });
            setEvents(prev => prev.map(e => e.id === editingEvent.id ? updated : e));
            setEditingEvent(null);
            setFormData({ club: '', title: '', date: '', location: '', description: '', attendees: 0 });
            showMessage('Event updated successfully!', 'success');
        } catch (err: any) {
            showMessage(err.message, 'error');
        }
    };

    const handleDeleteEvent = async (eventId: number) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await apiFetch(`/events/${eventId}`, { method: 'DELETE' });
            setEvents(prev => prev.filter(e => e.id !== eventId));
            const currentUser = getCurrentUser();
            if (currentUser && currentUser.createdEvents?.includes(eventId)) {
                const updatedUser = {
                    ...currentUser,
                    createdEvents: currentUser.createdEvents.filter(id => id !== eventId)
                };
                updateUserInStorage(updatedUser);
            }
            showMessage('Event deleted successfully!', 'success');
        } catch (err: any) {
            showMessage(err.message, 'error');
        }
    };

    const clubOptions = ['Book Club', 'Choir Club', 'Faith Circle', 'History Club', 'Games Club', 'Garden Club', 'Walking Club', 'Tech Club', 'Cooking Club', 'Charity Outreach', 'Gentle Yoga', 'Psychological Support', 'Medical Support', 'Knitting Club'];
    const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeOptions = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'];

    if (loading) return <div className="max-w-6xl mx-auto px-4 py-12 text-center">Loading events...</div>;

    return (
        <main className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div><h1 className="text-3xl font-bold text-emerald-700">📅 Community Events</h1><p className="text-gray-500">Find events near you – join and meet your neighbours</p></div>
                <button onClick={() => setShowAddForm(!showAddForm)} className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 cursor-pointer">+ Create Event</button>
            </div>
            {notification && (
                <div className={`fixed bottom-5 right-5 px-5 py-3 rounded-xl z-50 animate-slide-in ${
                    notification.type === 'success' ? 'bg-emerald-600' :
                        notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                } text-white`}>
                    {notification.msg}
                </div>
            )}
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
                <div ref={editFormRef} className="bg-amber-50 rounded-2xl p-6 shadow-md border border-amber-200 mb-8">
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
                {events.map(event => {
                    const isAttending = user?.joinedEvents?.includes(event.id) ?? false;
                    return (
                        <div key={event.id} className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-l-amber-600 hover:shadow-md transition-all hover:-translate-y-1 relative group">
                            <div className="text-xs font-semibold text-amber-600 uppercase mb-2">{event.club}</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                            <div className="space-y-1 mb-3 text-sm text-gray-500"><p>📅 {event.date}</p><p>📍 {event.location}</p></div>
                            <p className="text-sm text-gray-500 mb-3">{event.description}</p>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                <span className="text-sm text-emerald-700">👥 {event.attendees} going</span>
                                <button
                                    onClick={() => !isAttending && handleAttendEvent(event.id)}
                                    disabled={isAttending}
                                    className={`px-4 py-1.5 rounded-lg text-sm transition cursor-pointer ${
                                        isAttending
                                            ? 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                                            : 'bg-emerald-700 text-white hover:bg-emerald-800'
                                    }`}
                                >
                                    {isAttending ? '✓ Attending' : "I'm interested"}
                                </button>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button onClick={() => handleEditEvent(event)} className="bg-amber-500 text-white px-2 py-1 rounded text-xs hover:bg-amber-600">Edit</button>
                                <button onClick={() => handleDeleteEvent(event.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Delete</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}

// ============ MEALS PAGE (with scroll-to-edit & optimistic updates) ============
function MealsPage() {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
    const [formData, setFormData] = useState({ cook: '', meal: '', dietary: '', portions: 0, pickupTime: '', location: '' });
    const [filter, setFilter] = useState('all');
    const [notification, setNotification] = useState<{ msg: string; type: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const user = getCurrentUser();
    const editFormRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMeals();
    }, []);

    const fetchMeals = async () => {
        try {
            const data = await apiFetch('/meals');
            setMeals(data);
        } catch (err) {
            showMessage('Failed to load meals', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleRequestMeal = async (mealId: number) => {
        if (!user) {
            showMessage('Please sign in to request meals!', 'error');
            setTimeout(() => window.location.href = '/signin', 1500);
            return;
        }
        const meal = meals.find(m => m.id === mealId);
        if (!meal) return;
        if (user.requestedMeals?.includes(mealId)) {
            showMessage('You already requested this meal!', 'info');
            return;
        }
        if (meal.portions <= 0) {
            showMessage('Sorry, no portions left for this meal.', 'error');
            return;
        }
        // Optimistic update
        const previousMeals = [...meals];
        setMeals(prev => prev.map(m => m.id === mealId ? { ...m, portions: m.portions - 1 } : m));
        const updatedUser = { ...user, requestedMeals: [...(user.requestedMeals || []), mealId] };
        updateUserInStorage(updatedUser);
        try {
            await apiFetch(`/meals/${mealId}/request`, { method: 'POST' });
            showMessage(`✓ Requested "${meal.meal}" from ${meal.cook}!`, 'success');
        } catch (err: any) {
            setMeals(previousMeals);
            const rollbackUser = { ...user, requestedMeals: user.requestedMeals.filter(id => id !== mealId) };
            updateUserInStorage(rollbackUser);
            showMessage(err.message, 'error');
        }
    };

    const handleAddMeal = async () => {
        if (!formData.cook || !formData.meal || !formData.dietary || formData.portions <= 0) {
            showMessage('Please fill all required fields', 'error');
            return;
        }
        try {
            const newMeal = await apiFetch('/meals', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            setMeals(prev => [...prev, newMeal]);
            const currentUser = getCurrentUser();
            if (currentUser) {
                const updatedUser = {
                    ...currentUser,
                    sharedMeals: [...(currentUser.sharedMeals || []), newMeal.id]
                };
                updateUserInStorage(updatedUser);
            }
            setShowAddForm(false);
            setFormData({ cook: '', meal: '', dietary: '', portions: 0, pickupTime: '', location: '' });
            showMessage('Meal added successfully!', 'success');
        } catch (err: any) {
            showMessage(err.message, 'error');
        }
    };

    const handleEditMeal = (meal: Meal) => {
        setEditingMeal(meal);
        setFormData({ cook: meal.cook, meal: meal.meal, dietary: meal.dietary, portions: meal.portions, pickupTime: meal.pickupTime, location: meal.location });
        setTimeout(() => {
            editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleUpdateMeal = async () => {
        if (!editingMeal) return;
        try {
            const updated = await apiFetch(`/meals/${editingMeal.id}`, {
                method: 'PUT',
                body: JSON.stringify(formData),
            });
            setMeals(prev => prev.map(m => m.id === editingMeal.id ? updated : m));
            setEditingMeal(null);
            setFormData({ cook: '', meal: '', dietary: '', portions: 0, pickupTime: '', location: '' });
            showMessage('Meal updated successfully!', 'success');
        } catch (err: any) {
            showMessage(err.message, 'error');
        }
    };

    const handleDeleteMeal = async (mealId: number) => {
        if (!window.confirm('Delete this meal?')) return;
        try {
            await apiFetch(`/meals/${mealId}`, { method: 'DELETE' });
            setMeals(prev => prev.filter(m => m.id !== mealId));
            const currentUser = getCurrentUser();
            if (currentUser && currentUser.sharedMeals?.includes(mealId)) {
                const updatedUser = {
                    ...currentUser,
                    sharedMeals: currentUser.sharedMeals.filter(id => id !== mealId)
                };
                updateUserInStorage(updatedUser);
            }
            showMessage('Meal deleted successfully!', 'success');
        } catch (err: any) {
            showMessage(err.message, 'error');
        }
    };

    const filteredMeals = filter === 'all' ? meals : meals.filter(m => m.dietary === filter);
    const counts = { all: meals.length, Halal: meals.filter(m => m.dietary === 'Halal').length, Vegetarian: meals.filter(m => m.dietary === 'Vegetarian').length, Vegan: meals.filter(m => m.dietary === 'Vegan').length, Healthy: meals.filter(m => m.dietary === 'Healthy').length };
    const dietaryOptions = ['Halal', 'Vegetarian', 'Vegan', 'Healthy'];

    if (loading) return <div className="max-w-6xl mx-auto px-4 py-12 text-center">Loading meals...</div>;

    return (
        <main className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div><h1 className="text-3xl font-bold text-emerald-700">🍲 Free Meals Near You</h1><p className="text-gray-500">Home-cooked meals shared by neighbours – filter by dietary need</p></div>
                <button onClick={() => setShowAddForm(!showAddForm)} className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 cursor-pointer">+ Share a Meal</button>
            </div>
            {notification && (
                <div className={`fixed bottom-5 right-5 px-5 py-3 rounded-xl z-50 animate-slide-in ${
                    notification.type === 'success' ? 'bg-emerald-600' :
                        notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                } text-white`}>
                    {notification.msg}
                </div>
            )}
            {showAddForm && (
                <div className="bg-white rounded-2xl p-6 shadow-md border mb-8">
                    <h3 className="text-xl font-bold mb-4">Share a Meal</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Your Name *" value={formData.cook} onChange={(e) => setFormData({ ...formData, cook: e.target.value })} className="p-3 border rounded-xl" />
                        <input type="text" placeholder="Meal Name *" value={formData.meal} onChange={(e) => setFormData({ ...formData, meal: e.target.value })} className="p-3 border rounded-xl" />
                        <select value={formData.dietary} onChange={(e) => setFormData({ ...formData, dietary: e.target.value })} className="p-3 border rounded-xl"><option value="">Dietary *</option>{dietaryOptions.map(d => <option key={d}>{d}</option>)}</select>
                        <input type="number" placeholder="Portions *" value={formData.portions || ''} onChange={(e) => setFormData({ ...formData, portions: parseInt(e.target.value) })} className="p-3 border rounded-xl" />
                        <input type="text" placeholder="Pickup Time *" value={formData.pickupTime} onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })} className="p-3 border rounded-xl" />
                        <input type="text" placeholder="Location *" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="p-3 border rounded-xl" />
                    </div>
                    <div className="flex gap-3 mt-4"><button onClick={handleAddMeal} className="bg-emerald-700 text-white px-6 py-2 rounded-lg cursor-pointer">Share Meal</button><button onClick={() => setShowAddForm(false)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg cursor-pointer">Cancel</button></div>
                </div>
            )}
            {editingMeal && (
                <div ref={editFormRef} className="bg-amber-50 rounded-2xl p-6 shadow-md border border-amber-200 mb-8">
                    <h3 className="text-xl font-bold mb-4">Edit Meal: {editingMeal.meal}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Cook" value={formData.cook} onChange={(e) => setFormData({ ...formData, cook: e.target.value })} className="p-3 border rounded-xl" />
                        <input type="text" placeholder="Meal" value={formData.meal} onChange={(e) => setFormData({ ...formData, meal: e.target.value })} className="p-3 border rounded-xl" />
                        <select value={formData.dietary} onChange={(e) => setFormData({ ...formData, dietary: e.target.value })} className="p-3 border rounded-xl">{dietaryOptions.map(d => <option key={d}>{d}</option>)}</select>
                        <input type="number" placeholder="Portions" value={formData.portions || ''} onChange={(e) => setFormData({ ...formData, portions: parseInt(e.target.value) })} className="p-3 border rounded-xl" />
                        <input type="text" placeholder="Pickup Time" value={formData.pickupTime} onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })} className="p-3 border rounded-xl" />
                        <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="p-3 border rounded-xl" />
                    </div>
                    <div className="flex gap-3 mt-4"><button onClick={handleUpdateMeal} className="bg-amber-600 text-white px-6 py-2 rounded-lg cursor-pointer">Update Meal</button><button onClick={() => setEditingMeal(null)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg cursor-pointer">Cancel</button></div>
                </div>
            )}
            <div className="flex gap-2 flex-wrap mb-6">
                {['all', 'Halal', 'Vegetarian', 'Vegan', 'Healthy'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full font-medium cursor-pointer transition ${filter === f ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        {f === 'all' ? 'All' : f} ({counts[f as keyof typeof counts]})
                    </button>
                ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                {filteredMeals.map(meal => {
                    const isRequested = user?.requestedMeals?.includes(meal.id) ?? false;
                    return (
                        <div key={meal.id} className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-all hover:-translate-y-1 relative group">
                            <div className="flex justify-between items-start flex-wrap">
                                <div>
                                    <h3 className="text-xl font-bold">🍲 {meal.meal}</h3>
                                    <p className="text-gray-500">by {meal.cook}</p>
                                    <div className="flex gap-2 my-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${meal.dietary === 'Halal' ? 'bg-green-100 text-green-700' : meal.dietary === 'Vegetarian' ? 'bg-purple-100 text-purple-700' : meal.dietary === 'Vegan' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{meal.dietary}</span>
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">{meal.portions} portions left</span>
                                    </div>
                                    <p className="text-gray-500 text-sm">📍 {meal.location} | ⏰ {meal.pickupTime}</p>
                                </div>
                                <button
                                    onClick={() => !isRequested && handleRequestMeal(meal.id)}
                                    disabled={isRequested || meal.portions === 0}
                                    className={`mt-3 sm:mt-0 px-5 py-2 rounded-lg font-medium transition cursor-pointer ${
                                        isRequested
                                            ? 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                                            : meal.portions === 0
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-emerald-700 text-white hover:bg-emerald-800'
                                    }`}
                                >
                                    {isRequested ? '✓ Requested' : meal.portions === 0 ? 'No portions left' : 'Request Meal →'}
                                </button>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button onClick={() => handleEditMeal(meal)} className="bg-amber-500 text-white px-2 py-1 rounded text-xs hover:bg-amber-600">Edit</button>
                                <button onClick={() => handleDeleteMeal(meal.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Delete</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}

// ============ DASHBOARD PAGE (fixed delete) ============
function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [notification, setNotification] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'joined' | 'created'>('joined');

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        Promise.all([fetchEvents(), fetchMeals(), fetchClubs()]);
    }, []);

    const fetchEvents = async () => {
        try {
            const data = await apiFetch('/events');
            setEvents(data);
        } catch (err) { console.error(err); }
    };
    const fetchMeals = async () => {
        try {
            const data = await apiFetch('/meals');
            setMeals(data);
        } catch (err) { console.error(err); }
    };
    const fetchClubs = async () => {
        try {
            const data = await apiFetch('/clubs');
            setClubs(data);
        } catch (err) { console.error(err); }
    };

    const showMessage = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    if (!user) {
        return (
            <main className="max-w-md mx-auto px-4 py-12 text-center">
                <div className="bg-white rounded-2xl shadow-sm border p-8">
                    <h2 className="text-2xl font-bold text-emerald-700 mb-2">Not Signed In</h2>
                    <p className="text-gray-500 mb-6">Please sign in to view your dashboard</p>
                    <Link to="/signin" className="bg-emerald-700 text-white px-6 py-3 rounded-xl inline-block">Sign In →</Link>
                </div>
            </main>
        );
    }

    const joinedEvents = events.filter(e => user.joinedEvents?.includes(e.id));
    const requestedMeals = meals.filter(m => user.requestedMeals?.includes(m.id));
    const joinedClubs = clubs.filter(c => user.joinedClubs?.includes(c.id));
    const userCreatedEvents = events.filter(e => user.createdEvents?.includes(e.id) ?? false);
    const userSharedMeals = meals.filter(m => user.sharedMeals?.includes(m.id) ?? false);

    const handleRemoveEvent = (eventId: number) => {
        const updatedUser = { ...user, joinedEvents: user.joinedEvents.filter(id => id !== eventId) };
        updateUserInStorage(updatedUser);
        setUser(updatedUser);
        showMessage('Event removed from your dashboard');
    };

    const handleRemoveMeal = (mealId: number) => {
        const updatedUser = { ...user, requestedMeals: user.requestedMeals.filter(id => id !== mealId) };
        updateUserInStorage(updatedUser);
        setUser(updatedUser);
        showMessage('Meal removed from your dashboard');
    };

    const handleLeaveClub = async (clubId: number) => {
        try {
            await apiFetch(`/clubs/${clubId}/join`, { method: 'DELETE' });
            const updatedUser = { ...user, joinedClubs: user.joinedClubs.filter(id => id !== clubId) };
            updateUserInStorage(updatedUser);
            setUser(updatedUser);
            setClubs(prev => prev.map(c => c.id === clubId ? { ...c, members: c.members - 1 } : c));
            showMessage('You left the club');
        } catch (err) {
            showMessage('Failed to leave club');
        }
    };

    const handleDeleteCreatedEvent = async (eventId: number) => {
        if (!window.confirm('Delete this event? It will be removed for everyone.')) return;
        try {
            await apiFetch(`/events/${eventId}`, { method: 'DELETE' });
            setEvents(prev => prev.filter(e => e.id !== eventId));
            if (user.createdEvents?.includes(eventId)) {
                const updatedUser = {
                    ...user,
                    createdEvents: user.createdEvents.filter(id => id !== eventId)
                };
                updateUserInStorage(updatedUser);
                setUser(updatedUser);
            }
            showMessage('Event deleted successfully!');
        } catch (err: any) {
            console.error('Delete error:', err);
            showMessage(err.message || 'Failed to delete event');
        }
    };

    const handleDeleteSharedMeal = async (mealId: number) => {
        if (!window.confirm('Delete this meal? It will be removed for everyone.')) return;
        try {
            await apiFetch(`/meals/${mealId}`, { method: 'DELETE' });
            setMeals(prev => prev.filter(m => m.id !== mealId));
            if (user.sharedMeals?.includes(mealId)) {
                const updatedUser = {
                    ...user,
                    sharedMeals: user.sharedMeals.filter(id => id !== mealId)
                };
                updateUserInStorage(updatedUser);
                setUser(updatedUser);
            }
            showMessage('Meal deleted successfully!');
        } catch (err: any) {
            console.error('Delete error:', err);
            showMessage(err.message || 'Failed to delete meal');
        }
    };

    return (
        <main className="max-w-6xl mx-auto px-4 py-12">
            {notification && <div className="fixed bottom-5 right-5 bg-emerald-600 text-white px-5 py-3 rounded-xl z-50 animate-slide-in">{notification}</div>}
            <h1 className="text-3xl font-bold text-emerald-700 mb-2">📊 My Dashboard</h1>
            <p className="text-gray-500 mb-8">See what you've joined and manage your activities</p>

            <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                <h3 className="text-xl font-bold mb-2">👋 Hello, {user.fullName}!</h3>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Member since:</strong> {new Date(user.joinDate).toLocaleDateString()}</p>
                <p><strong>Interests:</strong> {user.interests?.map(i => <span key={i} className="inline-block bg-gray-100 px-2 py-1 rounded-full text-sm mr-1">{i}</span>) || 'None'}</p>
                <Link to="/profile" className="inline-block mt-4 text-emerald-700 hover:underline">Edit Profile →</Link>
            </div>

            <div className="flex gap-2 mb-6 border-b">
                <button onClick={() => setActiveTab('joined')} className={`px-6 py-2 font-semibold transition ${activeTab === 'joined' ? 'border-b-2 border-emerald-700 text-emerald-700' : 'text-gray-500 hover:text-emerald-600'}`}>
                    📋 Joined / Requested
                </button>
                <button onClick={() => setActiveTab('created')} className={`px-6 py-2 font-semibold transition ${activeTab === 'created' ? 'border-b-2 border-emerald-700 text-emerald-700' : 'text-gray-500 hover:text-emerald-600'}`}>
                    ✨ Created / Shared by You
                </button>
            </div>

            {activeTab === 'joined' ? (
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h3 className="text-xl font-bold mb-4">📅 Events You're Attending ({joinedEvents.length})</h3>
                        {joinedEvents.length === 0 ? <p className="text-gray-500 text-center">No events yet.<br/><Link to="/events" className="text-emerald-700">Browse events →</Link></p> : joinedEvents.map(event => (
                            <div key={event.id} className="py-3 border-b flex justify-between items-center">
                                <div><div className="font-semibold">{event.title}</div><div className="text-sm text-gray-500">{event.date} • {event.location}</div></div>
                                <button onClick={() => handleRemoveEvent(event.id)} className="text-red-500 text-sm hover:text-red-700">Remove</button>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h3 className="text-xl font-bold mb-4">🍲 Meals You've Requested ({requestedMeals.length})</h3>
                        {requestedMeals.length === 0 ? <p className="text-gray-500 text-center">No meals yet.<br/><Link to="/meals" className="text-emerald-700">Find meals →</Link></p> : requestedMeals.map(meal => (
                            <div key={meal.id} className="py-3 border-b flex justify-between items-center">
                                <div><div className="font-semibold">🍽️ {meal.meal}</div><div className="text-sm text-gray-500">from {meal.cook} • Pickup: {meal.pickupTime}</div></div>
                                <button onClick={() => handleRemoveMeal(meal.id)} className="text-red-500 text-sm hover:text-red-700">Remove</button>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h3 className="text-xl font-bold mb-4">🤝 Clubs You've Joined ({joinedClubs.length})</h3>
                        {joinedClubs.length === 0 ? <p className="text-gray-500 text-center">No clubs yet.<br/><Link to="/" className="text-emerald-700">Browse clubs →</Link></p> : joinedClubs.map(club => (
                            <div key={club.id} className="py-3 border-b flex justify-between items-center">
                                <div><div className="font-semibold">{club.icon} {club.name}</div><div className="text-sm text-gray-500">{club.members} members • {club.tag}</div></div>
                                <button onClick={() => handleLeaveClub(club.id)} className="text-red-500 text-sm hover:text-red-700">Leave</button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h3 className="text-xl font-bold mb-4">✨ Events You Created ({userCreatedEvents.length})</h3>
                        {userCreatedEvents.length === 0 ? <p className="text-gray-500 text-center">You haven't created any events yet.<br/><Link to="/events" className="text-emerald-700">Create an event →</Link></p> : userCreatedEvents.map(event => (
                            <div key={event.id} className="py-3 border-b flex justify-between items-center">
                                <div><div className="font-semibold">{event.title}</div><div className="text-sm text-gray-500">{event.date} • {event.location} • 👥 {event.attendees} going</div></div>
                                <div className="flex gap-2">
                                    <Link to="/events" className="text-amber-500 text-sm hover:text-amber-700">Edit</Link>
                                    <button onClick={() => handleDeleteCreatedEvent(event.id)} className="text-red-500 text-sm hover:text-red-700">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h3 className="text-xl font-bold mb-4">🍳 Meals You Shared ({userSharedMeals.length})</h3>
                        {userSharedMeals.length === 0 ? <p className="text-gray-500 text-center">You haven't shared any meals yet.<br/><Link to="/meals" className="text-emerald-700">Share a meal →</Link></p> : userSharedMeals.map(meal => (
                            <div key={meal.id} className="py-3 border-b flex justify-between items-center">
                                <div><div className="font-semibold">🍲 {meal.meal}</div><div className="text-sm text-gray-500">by {meal.cook} • {meal.portions} portions left • {meal.location}</div></div>
                                <div className="flex gap-2">
                                    <Link to="/meals" className="text-amber-500 text-sm hover:text-amber-700">Edit</Link>
                                    <button onClick={() => handleDeleteSharedMeal(meal.id)} className="text-red-500 text-sm hover:text-red-700">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-emerald-50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-emerald-700">{joinedEvents.length}</div><div className="text-xs text-gray-500">Events Attending</div></div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-emerald-700">{requestedMeals.length}</div><div className="text-xs text-gray-500">Meals Requested</div></div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-emerald-700">{joinedClubs.length}</div><div className="text-xs text-gray-500">Clubs Joined</div></div>
                <div className="bg-amber-50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-amber-700">{userCreatedEvents.length}</div><div className="text-xs text-gray-500">Events Created</div></div>
                <div className="bg-amber-50 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-amber-700">{userSharedMeals.length}</div><div className="text-xs text-gray-500">Meals Shared</div></div>
            </div>
        </main>
    );
}

// ============ PROFILE PAGE (unchanged) ============
function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [ageGroup, setAgeGroup] = useState('');
    const [interests, setInterests] = useState<string[]>([]);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            setFullName(currentUser.fullName);
            setPhone(currentUser.phone || '');
            setAgeGroup(currentUser.ageGroup || '');
            setInterests(currentUser.interests || []);
        }
    }, []);

    const allInterests = ['Books', 'Gardening', 'Walking', 'Faith', 'Games', 'Wellness', 'Cooking', 'History', 'Music', 'Crafts'];

    const handleSave = async () => {
        if (!user) return;
        try {
            const updatedUser = await apiFetch('/users/me', {
                method: 'PUT',
                body: JSON.stringify({ fullName, phone, ageGroup, interests }),
            });
            if (newPassword) {
                if (!currentPassword) { setError('Please enter current password to change it'); return; }
                if (newPassword.length < 6) { setError('New password must be at least 6 characters'); return; }
                if (newPassword !== confirmPassword) { setError('New passwords do not match'); return; }
                await apiFetch('/users/me/password', {
                    method: 'PUT',
                    body: JSON.stringify({ currentPassword, newPassword }),
                });
            }
            setAuth(getToken()!, updatedUser as User);
            setUser(updatedUser as User);
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
            setMessage('Profile updated successfully!');
            setTimeout(() => { setMessage(''); setError(''); }, 3000);
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (!user) {
        return (
            <main className="max-w-md mx-auto px-4 py-12 text-center">
                <div className="bg-white rounded-2xl shadow-sm border p-8">
                    <h2 className="text-2xl font-bold text-emerald-700 mb-2">Not Signed In</h2>
                    <Link to="/signin" className="bg-emerald-700 text-white px-6 py-3 rounded-xl inline-block">Sign In →</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-2xl mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h2 className="text-2xl font-bold text-emerald-700 mb-6">👤 My Profile</h2>
                {message && <div className="bg-emerald-100 text-emerald-700 p-3 rounded-lg mb-4">{message}</div>}
                {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
                <div className="space-y-4">
                    <div><label className="block font-medium mb-1">Full Name</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 border rounded-xl" /></div>
                    <div><label className="block font-medium mb-1">Email</label><input type="email" value={user.email} disabled className="w-full p-3 border rounded-xl bg-gray-50" /></div>
                    <div><label className="block font-medium mb-1">Phone Number</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border rounded-xl" /></div>
                    <div><label className="block font-medium mb-1">Age Group</label><select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="w-full p-3 border rounded-xl"><option value="">Select</option><option>Student (16-25)</option><option>Young Adult (26-39)</option><option>Adult (40-60)</option><option>Elderly (60+)</option></select></div>
                    <div><label className="block font-medium mb-2">Interests</label><div className="grid grid-cols-2 gap-2">{allInterests.map(i => (<label key={i} className="flex items-center gap-2"><input type="checkbox" checked={interests.includes(i)} onChange={() => setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])} /> {i}</label>))}</div></div>
                    <div className="border-t pt-4 mt-4"><h3 className="text-lg font-bold mb-3">🔐 Change Password</h3><div className="space-y-3"><input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-3 border rounded-xl" /><input type="password" placeholder="New Password (min 6 characters)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 border rounded-xl" /><input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-3 border rounded-xl" /></div></div>
                    <button onClick={handleSave} className="w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold hover:bg-emerald-800 cursor-pointer mt-4">Save Changes</button>
                </div>
            </div>
        </main>
    );
}

// ============ ABOUT PAGE ============
function AboutPage() {
    return (
        <main className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-emerald-700 mb-4">🌱 About Common Ground</h1>
            <p className="text-lg text-gray-600 mb-8">A neighbourhood platform connecting people through shared activities and home-cooked food.</p>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white rounded-2xl shadow-sm border p-6 text-center"><div className="text-5xl mb-4">📅</div><h2 className="text-xl font-bold mb-2">Community Events</h2><p className="text-gray-500">Neighbours creating and joining local activities - book clubs, walking groups, gardening, faith gatherings, and more.</p></div>
                <div className="bg-white rounded-2xl shadow-sm border p-6 text-center"><div className="text-5xl mb-4">🍲</div><h2 className="text-xl font-bold mb-2">Food Sharing Network</h2><p className="text-gray-500">Adults & elderly cook extra meals → Students & neighbours who need food. Filter by Halal, Vegetarian, Vegan, or allergies.</p></div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center"><div className="w-12 h-12 bg-emerald-700 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">1</div><h3 className="font-bold text-lg mb-2">Sign Up Free</h3><p className="text-gray-500 text-sm">Create your profile and tell us your interests & dietary needs</p></div>
                    <div className="text-center"><div className="w-12 h-12 bg-emerald-700 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">2</div><h3 className="font-bold text-lg mb-2">Find Your People</h3><p className="text-gray-500 text-sm">Browse events or available meals near you</p></div>
                    <div className="text-center"><div className="w-12 h-12 bg-emerald-700 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">3</div><h3 className="font-bold text-lg mb-2">Connect & Share</h3><p className="text-gray-500 text-sm">Join events, request meals, or share extra food</p></div>
                </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mb-12">
                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">🤝 Building Community</span>
                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">🍽️ Reducing Food Waste</span>
                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">🌍 Supporting Students</span>
                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">💚 Bridging Generations</span>
                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">🕌 Inclusive & Welcoming</span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
                <div className="grid grid-cols-3 gap-8 text-center">
                    <div><div className="text-3xl font-bold text-emerald-700">156</div><div className="text-gray-500 text-sm">Members</div></div>
                    <div><div className="text-3xl font-bold text-emerald-700">24</div><div className="text-gray-500 text-sm">Meals Shared</div></div>
                    <div><div className="text-3xl font-bold text-emerald-700">8</div><div className="text-gray-500 text-sm">Active Events</div></div>
                </div>
            </div>
        </main>
    );
}

// ============ SIGN IN PAGE ============
function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await apiFetch('/auth/signin', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            if (data.token && data.user) {
                setAuth(data.token, data.user);
                window.location.href = '/dashboard';
            } else {
                setError('Invalid response from server');
            }
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h1 className="text-2xl font-bold text-emerald-700 mb-2">Welcome back</h1>
                <p className="text-gray-500 mb-6">Sign in to continue</p>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-xl mb-4" required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-xl mb-6" required />
                    <button type="submit" disabled={loading} className="w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold hover:bg-emerald-800 disabled:opacity-50">
                        {loading ? 'Signing in...' : 'Sign In →'}
                    </button>
                </form>
                <p className="text-center text-gray-500 mt-6">Don't have an account? <Link to="/signup" className="text-emerald-700">Sign up</Link></p>
            </div>
        </main>
    );
}

// ============ SIGN UP PAGE ============
function SignUpPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [ageGroup, setAgeGroup] = useState('');
    const [interests, setInterests] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const allInterests = ['Books', 'Gardening', 'Walking', 'Faith', 'Games', 'Wellness', 'Cooking', 'History', 'Music', 'Crafts'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await apiFetch('/auth/signup', {
                method: 'POST',
                body: JSON.stringify({ fullName, email, password, ageGroup, interests }),
            });
            if (data.token && data.user) {
                setAuth(data.token, data.user);
                window.location.href = '/dashboard';
            } else {
                setError('Registration failed');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleInterest = (interest: string) => {
        setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
    };

    return (
        <main className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h1 className="text-2xl font-bold text-emerald-700 mb-2">Join Common Ground</h1>
                <p className="text-gray-500 mb-6">Create your account to connect with neighbours</p>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 border rounded-xl mb-4" required />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-xl mb-4" required />
                    <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-xl mb-4" required />
                    <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="w-full p-3 border rounded-xl mb-4"><option value="">Age Group</option><option>Student (16-25)</option><option>Young Adult (26-39)</option><option>Adult (40-60)</option><option>Elderly (60+)</option></select>
                    <div className="mb-4"><label className="block font-medium mb-2">Interests</label><div className="grid grid-cols-2 gap-2">{allInterests.map(i => (<label key={i} className="flex items-center gap-2"><input type="checkbox" checked={interests.includes(i)} onChange={() => toggleInterest(i)} /> {i}</label>))}</div></div>
                    <button type="submit" disabled={loading} className="w-full bg-emerald-700 text-white py-3 rounded-xl font-semibold hover:bg-emerald-800 disabled:opacity-50">
                        {loading ? 'Creating account...' : 'Create Account →'}
                    </button>
                </form>
                <p className="text-center text-gray-500 mt-6">Already have an account? <Link to="/signin" className="text-emerald-700">Sign In</Link></p>
            </div>
        </main>
    );
}

// ============ MAIN APP ============
function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/meals" element={<MealsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;