import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up (order matters due to foreign keys)
  await prisma.user.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.event.deleteMany();
  await prisma.club.deleteMany();
  console.log('✓ Cleared existing data');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  await prisma.user.create({
    data: {
      email: 'demo321@example.com',
      fullName: 'Demo User',
      password: hashedPassword,
      ageGroup: 'Adult (40-60)',
      interests: ['Books', 'Walking', 'Gardening'],
      joinedEvents: [],
      requestedMeals: [],
      joinedClubs: [],
    },
  });
  console.log('✓ Created demo user: demo321@example.com / demo123');

  // ========== 15 CLUBS ==========
  const clubs = [
    { name: "Book Club", icon: "📚", description: "Monthly book discussions over tea and biscuits.", members: 24, tag: "Reading" },
    { name: "Choir Club", icon: "🎵", description: "All voices welcome! Weekly singing sessions.", members: 18, tag: "Music" },
    { name: "Faith & Spirituality Circle", icon: "🙏", description: "A welcoming space for people of all faiths and none.", members: 15, tag: "Reflection" },
    { name: "History Club", icon: "📜", description: "Exploring local history and sharing stories.", members: 22, tag: "Heritage" },
    { name: "Games Club", icon: "🎲", description: "Board games, card games, and good company.", members: 16, tag: "Games" },
    { name: "Garden Club", icon: "🌿", description: "Community gardening, plant swaps, growing together.", members: 20, tag: "Nature" },
    { name: "Walking Club", icon: "🚶", description: "Gentle group walks around the neighbourhood.", members: 32, tag: "Active" },
    { name: "Tech Club", icon: "💻", description: "Learn to use your phone, tablet, or laptop.", members: 12, tag: "Tech" },
    { name: "Disability Support & Social", icon: "♿", description: "A welcoming space for people with disabilities.", members: 10, tag: "Support" },
    { name: "Cooking Club", icon: "🍳", description: "Cook together, share recipes, enjoy good food.", members: 14, tag: "Food" },
    { name: "Psychological Support Club", icon: "🧠", description: "Safe space to talk about mental health and wellbeing.", members: 8, tag: "Wellbeing" },
    { name: "Medical & Nutrition Support", icon: "🥗", description: "Healthy eating and chronic condition management.", members: 9, tag: "Health" },
    { name: "Knitting & Sewing Club", icon: "🧶", description: "Share tips, learn basics, and chat while crafting.", members: 11, tag: "Crafts" },
    { name: "Charity & Faith Outreach", icon: "🤲", description: "Visit mosques, churches, temples together. Community service.", members: 13, tag: "Faith" },
    { name: "Gentle Yoga Club", icon: "🧘", description: "Low-impact yoga for mobility and relaxation.", members: 9, tag: "Wellness" },
  ];

  for (const club of clubs) {
    await prisma.club.create({ data: club });
  }
  console.log(`✓ Seeded ${clubs.length} clubs`);

  // ========== 20 EVENTS ==========
  const events = [
    { club: "History Club", title: "Local Heritage Walk", date: "Saturday, 10am", location: "Old Library", attendees: 14, description: "Guided walk through neighbourhood history." },
    { club: "Book Club", title: "Monthly Meeting", date: "Thursday, 7pm", location: "Community Centre", attendees: 8, description: "Discuss this month's book over tea." },
    { club: "Garden Club", title: "Spring Planting Day", date: "Saturday, 9am", location: "Community Garden", attendees: 12, description: "Plant flowers and vegetables for the season." },
    { club: "Walking Club", title: "Sunday Morning Stroll", date: "Sunday, 10am", location: "Victoria Park", attendees: 9, description: "Gentle walk followed by coffee." },
    { club: "Choir Club", title: "Open Rehearsal", date: "Wednesday, 6:30pm", location: "St Mary's Church", attendees: 11, description: "All voices welcome!" },
    { club: "Games Club", title: "Board Game Night", date: "Friday, 7pm", location: "Community Hub", attendees: 7, description: "Catan, Scrabble, Mahjong." },
    { club: "Tech Club", title: "Smartphone Basics", date: "Monday, 2pm", location: "Library", attendees: 6, description: "Learn to use your phone." },
    { club: "Faith Circle", title: "Quiet Reflection", date: "Sunday, 11am", location: "Community Centre", attendees: 5, description: "Meditation and gentle conversation." },
    { club: "Cooking Club", title: "Korean Cooking Class", date: "Tuesday, 6pm", location: "Community Kitchen", attendees: 10, description: "Learn to make Bibimbap." },
    { club: "Cooking Club", title: "Pakistani Street Food", date: "Thursday, 5:30pm", location: "Main Hall", attendees: 15, description: "Make samosas and chai." },
    { club: "Walking Club", title: "Park Run & Picnic", date: "Sunday, 9am", location: "Victoria Park", attendees: 30, description: "5km run/walk followed by picnic." },
    { club: "Faith Circle", title: "Ramadan Iftar Gathering", date: "Friday, 7pm", location: "Community Centre", attendees: 40, description: "Open Iftar meal." },
    { club: "Psychological Support", title: "Healing Circle", date: "Tuesday, 6pm", location: "Private Room", attendees: 6, description: "Confidential support space." },
    { club: "Medical Support", title: "Healthy Eating on a Budget", date: "Thursday, 5:30pm", location: "Community Kitchen", attendees: 10, description: "Cook nutritious, low-cost meals." },
    { club: "Knitting Club", title: "Beginner's Knitting", date: "Wednesday, 2pm", location: "Craft Room", attendees: 8, description: "Learn to knit a scarf." },
    { club: "Charity Outreach", title: "Mosque Open Day", date: "Saturday, 2pm", location: "Central Mosque", attendees: 25, description: "Learn about Islamic faith and culture." },
    { club: "Charity Outreach", title: "Church Community Lunch", date: "Sunday, 1pm", location: "St Peter's Church", attendees: 20, description: "Free community lunch." },
    { club: "Gentle Yoga", title: "Chair Yoga for Seniors", date: "Monday, 10am", location: "Community Centre", attendees: 12, description: "Low-impact yoga for mobility." },
    { club: "Charity Outreach", title: "Interfaith Peace Gathering", date: "Tuesday, 7pm", location: "Town Hall", attendees: 18, description: "Share food and conversation." },
    { club: "Walking Club", title: "Gentle Stroll to Park", date: "Saturday, 2pm", location: "Library", attendees: 11, description: "Easy walk with benches along the way." },
  ];

  for (const event of events) {
    await prisma.event.create({ data: event });
  }
  console.log(`✓ Seeded ${events.length} events`);

  // ========== 25 MEALS ==========
  const meals = [
    { cook: "Maria Rossi", meal: "Classic Lasagne", dietary: "Vegetarian", portions: 4, pickupTime: "6:00 PM", location: "Community Centre" },
    { cook: "Giuseppe Bianchi", meal: "Spaghetti & Meatballs", dietary: "Halal", portions: 3, pickupTime: "7:00 PM", location: "Main Hall" },
    { cook: "Sophia Moretti", meal: "Creamy Mac & Cheese", dietary: "Vegetarian", portions: 4, pickupTime: "5:30 PM", location: "Library" },
    { cook: "James Thompson", meal: "Shepherd's Pie", dietary: "Halal", portions: 3, pickupTime: "6:30 PM", location: "Community Kitchen" },
    { cook: "Emma Watson", meal: "Grilled Lemon Chicken", dietary: "Healthy", portions: 2, pickupTime: "7:00 PM", location: "Community Centre" },
    { cook: "Henry Adams", meal: "Homemade Pizza", dietary: "Vegetarian", portions: 4, pickupTime: "7:00 PM", location: "Community Centre" },
    { cook: "Amelia Brown", meal: "Roast Chicken & Veg", dietary: "Healthy", portions: 3, pickupTime: "6:30 PM", location: "Library" },
    { cook: "William Baker", meal: "Chicken Noodle Soup", dietary: "Halal", portions: 4, pickupTime: "5:00 PM", location: "Community Centre" },
    { cook: "Fatima Ahmed", meal: "Chicken Biryani", dietary: "Halal", portions: 3, pickupTime: "6:00 PM", location: "Community Centre" },
    { cook: "Aisha Khan", meal: "Lentil Soup (Daal)", dietary: "Vegan", portions: 5, pickupTime: "5:30 PM", location: "Garden Room" },
    { cook: "Aisha Khan", meal: "Chickpea Curry", dietary: "Vegan", portions: 4, pickupTime: "5:30 PM", location: "Garden Room" },
    { cook: "Rashid Ali", meal: "Chicken Karahi", dietary: "Halal", portions: 3, pickupTime: "6:30 PM", location: "Community Kitchen" },
    { cook: "Zara Ahmed", meal: "Vegetable Samosas", dietary: "Vegan", portions: 6, pickupTime: "4:00 PM", location: "Community Hub" },
    { cook: "Sana Malik", meal: "Lamb Kofta", dietary: "Halal", portions: 2, pickupTime: "7:00 PM", location: "Main Hall" },
    { cook: "Leila Haddad", meal: "Falafel & Hummus", dietary: "Vegan", portions: 4, pickupTime: "6:00 PM", location: "Community Centre" },
    { cook: "Omar Mansour", meal: "Shawarma Chicken", dietary: "Halal", portions: 2, pickupTime: "7:00 PM", location: "Community Kitchen" },
    { cook: "Min-Jae Kim", meal: "Bibimbap Bowl", dietary: "Vegetarian", portions: 3, pickupTime: "6:30 PM", location: "Community Centre" },
    { cook: "Wei Chen", meal: "Egg Fried Rice", dietary: "Vegetarian", portions: 4, pickupTime: "5:00 PM", location: "Library" },
    { cook: "Mei Lin", meal: "Stir-fried Veg & Rice", dietary: "Vegan", portions: 4, pickupTime: "5:30 PM", location: "Garden Room" },
    { cook: "Li Na", meal: "Mapo Tofu", dietary: "Vegan", portions: 3, pickupTime: "6:30 PM", location: "Community Centre" },
    { cook: "Lucas Martinez", meal: "Jasmine Rice & Veg", dietary: "Vegan", portions: 4, pickupTime: "5:00 PM", location: "Garden Room" },
    { cook: "Mason Lee", meal: "Pasta Arrabbiata", dietary: "Vegan", portions: 4, pickupTime: "5:30 PM", location: "Community Centre" },
    { cook: "Logan Rodriguez", meal: "Bean & Cheese Burrito", dietary: "Vegetarian", portions: 3, pickupTime: "6:00 PM", location: "Library" },
    { cook: "Charlotte Green", meal: "Hearty Vegetable Soup", dietary: "Vegan", portions: 5, pickupTime: "4:00 PM", location: "Community Hub" },
    { cook: "Ava Garcia", meal: "Vegetable Korma", dietary: "Vegetarian", portions: 3, pickupTime: "7:00 PM", location: "Library" },
  ];

  for (const meal of meals) {
    await prisma.meal.create({ data: meal });
  }
  console.log(`✓ Seeded ${meals.length} meals`);

  console.log('✅ Seeding complete!');
}

main()
    .catch((e) => {
      console.error('❌ Seeding failed:', e);
      process.exit(1);
    })
    .finally(async () => {tool
      await prisma.$disconnect();
    });