import { useState, useEffect } from 'react';

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
    requestedMeals: number[];
}

const initialMeals: Meal[] = [
    { id: 1, cook: "Maria Rossi", meal: "Classic Lasagne", dietary: "Vegetarian", portions: 4, pickupTime: "6:00 PM", location: "Community Centre" },
    { id: 2, cook: "Giuseppe Bianchi", meal: "Spaghetti & Meatballs", dietary: "Halal", portions: 3, pickupTime: "7:00 PM", location: "Main Hall" },
    { id: 3, cook: "Sophia Moretti", meal: "Creamy Mac & Cheese", dietary: "Vegetarian", portions: 4, pickupTime: "5:30 PM", location: "Library" },
    { id: 4, cook: "James Thompson", meal: "Shepherd's Pie", dietary: "Halal", portions: 3, pickupTime: "6:30 PM", location: "Community Kitchen" },
    { id: 5, cook: "Emma Watson", meal: "Grilled Lemon Chicken", dietary: "Healthy", portions: 2, pickupTime: "7:00 PM", location: "Community Centre" },
    { id: 6, cook: "Henry Adams", meal: "Homemade Pizza", dietary: "Vegetarian", portions: 4, pickupTime: "7:00 PM", location: "Community Centre" },
    { id: 7, cook: "Amelia Brown", meal: "Roast Chicken & Veg", dietary: "Healthy", portions: 3, pickupTime: "6:30 PM", location: "Library" },
    { id: 8, cook: "William Baker", meal: "Chicken Noodle Soup", dietary: "Halal", portions: 4, pickupTime: "5:00 PM", location: "Community Centre" },
    { id: 9, cook: "Fatima Ahmed", meal: "Chicken Biryani", dietary: "Halal", portions: 3, pickupTime: "6:00 PM", location: "Community Centre" },
    { id: 10, cook: "Aisha Khan", meal: "Lentil Soup (Daal)", dietary: "Vegan", portions: 5, pickupTime: "5:30 PM", location: "Garden Room" },
    { id: 11, cook: "Aisha Khan", meal: "Chickpea Curry", dietary: "Vegan", portions: 4, pickupTime: "5:30 PM", location: "Garden Room" },
    { id: 12, cook: "Rashid Ali", meal: "Chicken Karahi", dietary: "Halal", portions: 3, pickupTime: "6:30 PM", location: "Community Kitchen" },
    { id: 13, cook: "Zara Ahmed", meal: "Vegetable Samosas", dietary: "Vegan", portions: 6, pickupTime: "4:00 PM", location: "Community Hub" },
    { id: 14, cook: "Sana Malik", meal: "Lamb Kofta", dietary: "Halal", portions: 2, pickupTime: "7:00 PM", location: "Main Hall" },
    { id: 15, cook: "Leila Haddad", meal: "Falafel & Hummus", dietary: "Vegan", portions: 4, pickupTime: "6:00 PM", location: "Community Centre" },
    { id: 16, cook: "Omar Mansour", meal: "Shawarma Chicken", dietary: "Halal", portions: 2, pickupTime: "7:00 PM", location: "Community Kitchen" },
    { id: 17, cook: "Min-Jae Kim", meal: "Bibimbap Bowl", dietary: "Vegetarian", portions: 3, pickupTime: "6:30 PM", location: "Community Centre" },
    { id: 18, cook: "Wei Chen", meal: "Egg Fried Rice", dietary: "Vegetarian", portions: 4, pickupTime: "5:00 PM", location: "Library" },
    { id: 19, cook: "Mei Lin", meal: "Stir-fried Veg & Rice", dietary: "Vegan", portions: 4, pickupTime: "5:30 PM", location: "Garden Room" },
    { id: 20, cook: "Li Na", meal: "Mapo Tofu", dietary: "Vegan", portions: 3, pickupTime: "6:30 PM", location: "Community Centre" },
    { id: 21, cook: "Lucas Martinez", meal: "Jasmine Rice & Veg", dietary: "Vegan", portions: 4, pickupTime: "5:00 PM", location: "Garden Room" },
    { id: 22, cook: "Mason Lee", meal: "Pasta Arrabbiata", dietary: "Vegan", portions: 4, pickupTime: "5:30 PM", location: "Community Centre" },
    { id: 23, cook: "Logan Rodriguez", meal: "Bean & Cheese Burrito", dietary: "Vegetarian", portions: 3, pickupTime: "6:00 PM", location: "Library" },
    { id: 24, cook: "Charlotte Green", meal: "Hearty Vegetable Soup", dietary: "Vegan", portions: 5, pickupTime: "4:00 PM", location: "Community Hub" },
    { id: 25, cook: "Ava Garcia", meal: "Vegetable Korma", dietary: "Vegetarian", portions: 3, pickupTime: "7:00 PM", location: "Library" },
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

export default function MealsPage() {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
    const [formData, setFormData] = useState({ cook: '', meal: '', dietary: '', portions: 0, pickupTime: '', location: '' });
    const [filter, setFilter] = useState('all');
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        setMeals(loadData('meals', initialMeals));
    }, []);

    const showMessage = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleRequestMeal = (mealId: number) => {
        const user = getCurrentUser();
        if (!user) {
            showMessage('Please sign in to request meals!');
            setTimeout(() => window.location.href = '/signin', 1500);
            return;
        }
        const meal = meals.find(m => m.id === mealId);
        if (meal && meal.portions > 0 && !user.requestedMeals?.includes(mealId)) {
            const updatedMeals = meals.map(m => m.id === mealId ? { ...m, portions: m.portions - 1 } : m);
            setMeals(updatedMeals);
            saveData('meals', updatedMeals);
            const updatedUser = { ...user, requestedMeals: [...(user.requestedMeals || []), mealId] };
            updateUserInStorage(updatedUser);
            showMessage(`✓ Requested "${meal.meal}" from ${meal.cook}!`);
        } else if (user.requestedMeals?.includes(mealId)) {
            showMessage('You already requested this meal!');
        } else if (meal && meal.portions <= 0) {
            showMessage('Sorry, no portions left for this meal.');
        }
    };

    const handleAddMeal = () => {
        if (!formData.cook || !formData.meal || !formData.dietary || formData.portions <= 0) {
            showMessage('Please fill all required fields');
            return;
        }
        const newMeal: Meal = { id: Math.max(...meals.map(m => m.id), 0) + 1, ...formData };
        const updatedMeals = [...meals, newMeal];
        setMeals(updatedMeals);
        saveData('meals', updatedMeals);
        setShowAddForm(false);
        setFormData({ cook: '', meal: '', dietary: '', portions: 0, pickupTime: '', location: '' });
        showMessage('Meal added successfully!');
    };

    const handleEditMeal = (meal: Meal) => {
        setEditingMeal(meal);
        setFormData({ cook: meal.cook, meal: meal.meal, dietary: meal.dietary, portions: meal.portions, pickupTime: meal.pickupTime, location: meal.location });
    };

    const handleUpdateMeal = () => {
        if (editingMeal) {
            const updatedMeals = meals.map(m => m.id === editingMeal.id ? { ...m, ...formData } : m);
            setMeals(updatedMeals);
            saveData('meals', updatedMeals);
            setEditingMeal(null);
            setFormData({ cook: '', meal: '', dietary: '', portions: 0, pickupTime: '', location: '' });
            showMessage('Meal updated successfully!');
        }
    };

    const handleDeleteMeal = (mealId: number) => {
        if (window.confirm('Delete this meal?')) {
            const updatedMeals = meals.filter(m => m.id !== mealId);
            setMeals(updatedMeals);
            saveData('meals', updatedMeals);
            showMessage('Meal deleted successfully!');
        }
    };

    const filteredMeals = filter === 'all' ? meals : meals.filter(m => m.dietary === filter);
    const counts = { all: meals.length, Halal: meals.filter(m => m.dietary === 'Halal').length, Vegetarian: meals.filter(m => m.dietary === 'Vegetarian').length, Vegan: meals.filter(m => m.dietary === 'Vegan').length, Healthy: meals.filter(m => m.dietary === 'Healthy').length };
    const dietaryOptions = ['Halal', 'Vegetarian', 'Vegan', 'Healthy'];

    return (
        <main className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div><h1 className="text-3xl font-bold text-emerald-700">🍲 Free Meals Near You</h1><p className="text-gray-500">Home-cooked meals shared by neighbours – filter by dietary need</p></div>
                <button onClick={() => setShowAddForm(!showAddForm)} className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 cursor-pointer">+ Share a Meal</button>
            </div>
            {notification && <div className="fixed bottom-5 right-5 bg-emerald-600 text-white px-5 py-3 rounded-xl z-50 animate-slide-in">{notification}</div>}
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
                <div className="bg-amber-50 rounded-2xl p-6 shadow-md border border-amber-200 mb-8">
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
                {filteredMeals.map(meal => (
                    <div key={meal.id} className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-all relative group">
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
                            <button onClick={() => handleRequestMeal(meal.id)} disabled={meal.portions === 0} className={`mt-3 sm:mt-0 px-5 py-2 rounded-lg font-medium transition cursor-pointer ${meal.portions === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-emerald-700 text-white hover:bg-emerald-800'}`}>
                                {meal.portions === 0 ? 'No portions left' : 'Request Meal →'}
                            </button>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => handleEditMeal(meal)} className="bg-amber-500 text-white px-2 py-1 rounded text-xs hover:bg-amber-600">Edit</button>
                            <button onClick={() => handleDeleteMeal(meal.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}