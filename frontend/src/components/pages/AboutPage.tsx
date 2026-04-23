export default function AboutPage() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-emerald-700 mb-4">About Common Ground</h1>
            <p className="text-lg text-gray-600 mb-8">Building stronger neighbourhoods, one connection at a time.</p>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <span className="text-4xl">📅</span>
                    <h3 className="text-xl font-bold mt-2">Community Events</h3>
                    <p className="text-gray-500 mt-2">Neighbours creating and joining local activities - book clubs, walking groups, gardening, faith gatherings, and more.</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <span className="text-4xl">🍲</span>
                    <h3 className="text-xl font-bold mt-2">Food Sharing Network</h3>
                    <p className="text-gray-500 mt-2">Adults & elderly cook extra meals → Students & neighbours who need food. Filter by Halal, Vegetarian, Vegan.</p>
                </div>
            </div>

            <div className="mt-12 bg-gray-50 rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-gray-600">To create welcoming spaces where neighbours can connect, share, and grow together.</p>
            </div>
        </main>
    );
}