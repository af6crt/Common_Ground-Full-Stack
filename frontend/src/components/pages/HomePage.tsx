export default function HomePage() {
    return (
        <main className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-emerald-700 mb-4">Common Ground</h1>
            <p className="text-xl text-gray-600">Where neighbours come together over shared interests.</p>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <span className="text-4xl">📚</span>
                    <h3 className="font-bold text-xl mt-2">Book Club</h3>
                    <p className="text-gray-500 mt-2">12 members</p>
                    <button className="mt-4 bg-emerald-700 text-white px-4 py-2 rounded-lg w-full">Join →</button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <span className="text-4xl">🌿</span>
                    <h3 className="font-bold text-xl mt-2">Gardening Club</h3>
                    <p className="text-gray-500 mt-2">8 members</p>
                    <button className="mt-4 bg-emerald-700 text-white px-4 py-2 rounded-lg w-full">Join →</button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <span className="text-4xl">🚶</span>
                    <h3 className="font-bold text-xl mt-2">Walking Club</h3>
                    <p className="text-gray-500 mt-2">15 members</p>
                    <button className="mt-4 bg-emerald-700 text-white px-4 py-2 rounded-lg w-full">Join →</button>
                </div>
            </div>
        </main>
    );
}