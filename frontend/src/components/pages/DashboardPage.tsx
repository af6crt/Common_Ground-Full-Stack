import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
    joinDate: string;
    interests?: string[];
    joinedEvents: number[];
    requestedMeals: number[];
    joinedClubs: number[];
}

const initialClubs: Club[] = [
    { id: 1, name: "Book Club", icon: "📚", description: "Monthly book discussions.", members: 24, tag: "Reading" },
    { id: 2, name: "Choir Club", icon: "🎵", description: "Weekly singing sessions.", members: 18, tag: "Music" },
    { id: 3, name: "Faith Circle", icon: "🙏", description: "Welcoming space for all faiths.", members: 15, tag: "Reflection" },
    { id: 4, name: "History Club", icon: "📜", description: "Exploring local history.", members: 22, tag: "Heritage" },
    { id: 5, name: "Games Club", icon: "🎲", description: "Board games and good company.", members: 16, tag: "Games" },
    { id: 6, name: "Garden Club", icon: "🌿", description: "Community gardening.", members: 20, tag: "Nature" },
    { id: 7, name: "Walking Club", icon: "🚶", description: "Gentle group walks.", members: 32, tag: "Active" },
    { id: 8, name: "Tech Club", icon: "💻", description: "Learn to use your phone.", members: 12, tag: "Tech" },
    { id: 9, name: "Disability Support", icon: "♿", description: "Support for people with disabilities.", members: 10, tag: "Support" },
    { id: 10, name: "Cooking Club", icon: "🍳", description: "Cook together, share recipes.", members: 14, tag: "Food" },
    { id: 11, name: "Psychological Support", icon: "🧠", description: "Mental health support.", members: 8, tag: "Wellbeing" },
    { id: 12, name: "Medical Support", icon: "🥗", description: "Healthy eating support.", members: 9, tag: "Health" },
    { id: 13, name: "Knitting Club", icon: "🧶", description: "Craft and chat.", members: 11, tag: "Crafts" },
    { id: 14, name: "Charity Outreach", icon: "🤲", description: "Faith and community service.", members: 13, tag: "Faith" },
    { id: 15, name: "Gentle Yoga", icon: "🧘", description: "Low-impact yoga.", members: 9, tag: "Wellness" },
];

const initialEvents: Event[] = [
    { id: 1, club: "History Club", title: "Local Heritage Walk", date: "Saturday, 10am", location: "Old Library", attendees: 14, description: "Guided walk." },
    { id: 2, club: "Book Club", title: "Monthly Meeting", date: "Thursday, 7pm", location: "Community Centre", attendees: 8, description: "Book discussion." },
    { id: 3, club: "Garden Club", title: "Spring Planting", date: "Saturday, 9am", location: "Community Garden", attendees: 12, description: "Plant flowers." },
];

const initialMeals: Meal[] = [
    { id: 1, cook: "Maria Rossi", meal: "Classic Lasagne", dietary: "Vegetarian", portions: 4, pickupTime: "6:00 PM", location: "Community Centre" },
    { id: 2, cook: "Fatima Ahmed", meal: "Chicken Biryani", dietary: "Halal", portions: 3, pickupTime: "6:00 PM", location: "Community Centre" },
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

function updateUserInStorage(updatedUser: User): void {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex((u: any) => u.id === updatedUser.id);
    if (index !== -1) users[index] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));
    const { password, ...userWithoutPassword } = updatedUser;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [notification, setNotification] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'joined' | 'created'>('joined');

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setEvents(loadData('events', initialEvents));
        setMeals(loadData('meals', initialMeals));
        setClubs(loadData('clubs', initialClubs));
    }, []);

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

    // Get user's joined items
    const joinedEvents = events.filter(e => user.joinedEvents?.includes(e.id));
    const requestedMeals = meals.filter(m => user.requestedMeals?.includes(m.id));
    const joinedClubs = clubs.filter(c => user.joinedClubs?.includes(c.id));

    // Get user's created items (ID > 20 for events, ID > 25 for meals)
    const userCreatedEvents = events.filter(e => e.id > 20);
    const userSharedMeals = meals.filter(m => m.id > 25);

    const handleRemoveEvent = (eventId: number) => {
        if (window.confirm('Remove this event from your dashboard?')) {
            const updatedUser = { ...user, joinedEvents: user.joinedEvents.filter(id => id !== eventId) };
            updateUserInStorage(updatedUser);
            setUser(updatedUser);
            showMessage('Event removed from your dashboard');
        }
    };

    const handleRemoveMeal = (mealId: number) => {
        if (window.confirm('Remove this meal from your dashboard?')) {
            const updatedUser = { ...user, requestedMeals: user.requestedMeals.filter(id => id !== mealId) };
            updateUserInStorage(updatedUser);
            setUser(updatedUser);
            showMessage('Meal removed from your dashboard');
        }
    };

    const handleLeaveClub = (clubId: number) => {
        if (window.confirm('Leave this club?')) {
            const updatedUser = { ...user, joinedClubs: user.joinedClubs.filter(id => id !== clubId) };
            updateUserInStorage(updatedUser);
            setUser(updatedUser);

            const updatedClubs = clubs.map(c => c.id === clubId ? { ...c, members: Math.max(0, c.members - 1) } : c);
            setClubs(updatedClubs);
            saveData('clubs', updatedClubs);
            showMessage('You left the club');
        }
    };

    const handleDeleteCreatedEvent = (eventId: number) => {
        if (window.confirm('Delete this event? It will be removed for everyone.')) {
            const updatedEvents = events.filter(e => e.id !== eventId);
            setEvents(updatedEvents);
            saveData('events', updatedEvents);
            showMessage('Event deleted successfully!');
        }
    };

    const handleDeleteSharedMeal = (mealId: number) => {
        if (window.confirm('Delete this meal? It will be removed for everyone.')) {
            const updatedMeals = meals.filter(m => m.id !== mealId);
            setMeals(updatedMeals);
            saveData('meals', updatedMeals);
            showMessage('Meal deleted successfully!');
        }
    };

    return (
        <main className="max-w-6xl mx-auto px-4 py-12">
            {notification && <div className="fixed bottom-5 right-5 bg-emerald-600 text-white px-5 py-3 rounded-xl z-50 animate-slide-in">{notification}</div>}
            <h1 className="text-3xl font-bold text-emerald-700 mb-2">📊 My Dashboard</h1>
            <p className="text-gray-500 mb-8">See what you've joined and manage your activities</p>

            {/* Profile Summary */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                <h3 className="text-xl font-bold mb-2">👋 Hello, {user.fullName}!</h3>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Member since:</strong> {new Date(user.joinDate).toLocaleDateString()}</p>
                <p><strong>Interests:</strong> {user.interests?.map(i => <span key={i} className="inline-block bg-gray-100 px-2 py-1 rounded-full text-sm mr-1">{i}</span>) || 'None'}</p>
                <Link to="/profile" className="inline-block mt-4 text-emerald-700 hover:underline">Edit Profile →</Link>
            </div>

            {/* Tab Navigation */}
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
                    {/* Events Column */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h3 className="text-xl font-bold mb-4">📅 Events You're Attending ({joinedEvents.length})</h3>
                        {joinedEvents.length === 0 ? (
                            <p className="text-gray-500 text-center">No events yet.<br/><Link to="/events" className="text-emerald-700">Browse events →</Link></p>
                        ) : (
                            joinedEvents.map(event => (
                                <div key={event.id} className="py-3 border-b flex justify-between items-center">
                                    <div><div className="font-semibold">{event.title}</div><div className="text-sm text-gray-500">{event.date} • {event.location}</div></div>
                                    <button onClick={() => handleRemoveEvent(event.id)} className="text-red-500 text-sm hover:text-red-700">Remove</button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Meals Column */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h3 className="text-xl font-bold mb-4">🍲 Meals You've Requested ({requestedMeals.length})</h3>
                        {requestedMeals.length === 0 ? (
                            <p className="text-gray-500 text-center">No meals yet.<br/><Link to="/meals" className="text-emerald-700">Find meals →</Link></p>
                        ) : (
                            requestedMeals.map(meal => (
                                <div key={meal.id} className="py-3 border-b flex justify-between items-center">
                                    <div><div className="font-semibold">🍽️ {meal.meal}</div><div className="text-sm text-gray-500">from {meal.cook} • Pickup: {meal.pickupTime}</div></div>
                                    <button onClick={() => handleRemoveMeal(meal.id)} className="text-red-500 text-sm hover:text-red-700">Remove</button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Clubs Column - FIXED */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h3 className="text-xl font-bold mb-4">🤝 Clubs You've Joined ({joinedClubs.length})</h3>
                        {joinedClubs.length === 0 ? (
                            <p className="text-gray-500 text-center">No clubs yet.<br/><Link to="/" className="text-emerald-700">Browse clubs →</Link></p>
                        ) : (
                            joinedClubs.map(club => (
                                <div key={club.id} className="py-3 border-b flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold">{club.icon} {club.name}</div>
                                        <div className="text-sm text-gray-500">{club.members} members • {club.tag}</div>
                                    </div>
                                    <button onClick={() => handleLeaveClub(club.id)} className="text-red-500 text-sm hover:text-red-700">Leave</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Created Events Column */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h3 className="text-xl font-bold mb-4">✨ Events You Created ({userCreatedEvents.length})</h3>
                        {userCreatedEvents.length === 0 ? (
                            <p className="text-gray-500 text-center">You haven't created any events yet.<br/><Link to="/events" className="text-emerald-700">Create an event →</Link></p>
                        ) : (
                            userCreatedEvents.map(event => (
                                <div key={event.id} className="py-3 border-b flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold">{event.title}</div>
                                        <div className="text-sm text-gray-500">{event.date} • {event.location} • 👥 {event.attendees} going</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link to="/events" className="text-amber-500 text-sm hover:text-amber-700">Edit</Link>
                                        <button onClick={() => handleDeleteCreatedEvent(event.id)} className="text-red-500 text-sm hover:text-red-700">Delete</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Shared Meals Column */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h3 className="text-xl font-bold mb-4">🍳 Meals You Shared ({userSharedMeals.length})</h3>
                        {userSharedMeals.length === 0 ? (
                            <p className="text-gray-500 text-center">You haven't shared any meals yet.<br/><Link to="/meals" className="text-emerald-700">Share a meal →</Link></p>
                        ) : (
                            userSharedMeals.map(meal => (
                                <div key={meal.id} className="py-3 border-b flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold">🍲 {meal.meal}</div>
                                        <div className="text-sm text-gray-500">by {meal.cook} • {meal.portions} portions left • {meal.location}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link to="/meals" className="text-amber-500 text-sm hover:text-amber-700">Edit</Link>
                                        <button onClick={() => handleDeleteSharedMeal(meal.id)} className="text-red-500 text-sm hover:text-red-700">Delete</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Stats Summary */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-emerald-700">{joinedEvents.length}</div>
                    <div className="text-xs text-gray-500">Events Attending</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-emerald-700">{requestedMeals.length}</div>
                    <div className="text-xs text-gray-500">Meals Requested</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-emerald-700">{joinedClubs.length}</div>
                    <div className="text-xs text-gray-500">Clubs Joined</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-amber-700">{userCreatedEvents.length}</div>
                    <div className="text-xs text-gray-500">Events Created</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-amber-700">{userSharedMeals.length}</div>
                    <div className="text-xs text-gray-500">Meals Shared</div>
                </div>
            </div>
        </main>
    );
}