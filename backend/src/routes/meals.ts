import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

const router = Router();

// Initial meals data (25 meals)
const initialMeals = [
    { cook: "Maria Rossi", meal: "Classic Lasagne", dietary: "Vegetarian", portions: 4, pickupTime: "6:00 PM", location: "Community Centre", postcode: "BL1 2AB" },
    { cook: "Giuseppe Bianchi", meal: "Spaghetti & Meatballs", dietary: "Halal", portions: 3, pickupTime: "7:00 PM", location: "Main Hall", postcode: "BL1 4EF" },
    { cook: "Sophia Moretti", meal: "Creamy Mac & Cheese", dietary: "Vegetarian", portions: 4, pickupTime: "5:30 PM", location: "Library", postcode: "BL1 1RL" },
    { cook: "James Thompson", meal: "Shepherd's Pie", dietary: "Halal", portions: 3, pickupTime: "6:30 PM", location: "Community Kitchen", postcode: "BL1 3CD" },
    { cook: "Emma Watson", meal: "Grilled Lemon Chicken", dietary: "Healthy", portions: 2, pickupTime: "7:00 PM", location: "Community Centre", postcode: "BL1 2AB" },
    { cook: "Henry Adams", meal: "Homemade Pizza", dietary: "Vegetarian", portions: 4, pickupTime: "7:00 PM", location: "Community Centre", postcode: "BL1 2AB" },
    { cook: "Amelia Brown", meal: "Roast Chicken & Veg", dietary: "Healthy", portions: 3, pickupTime: "6:30 PM", location: "Library", postcode: "BL1 1RL" },
    { cook: "William Baker", meal: "Chicken Noodle Soup", dietary: "Halal", portions: 4, pickupTime: "5:00 PM", location: "Community Centre", postcode: "BL1 2AB" },
    { cook: "Fatima Ahmed", meal: "Chicken Biryani", dietary: "Halal", portions: 3, pickupTime: "6:00 PM", location: "Community Centre", postcode: "BL1 2AB" },
    { cook: "Aisha Khan", meal: "Lentil Soup", dietary: "Vegan", portions: 5, pickupTime: "5:30 PM", location: "Garden Room", postcode: "BL1 3CD" },
    { cook: "Aisha Khan", meal: "Chickpea Curry", dietary: "Vegan", portions: 4, pickupTime: "5:30 PM", location: "Garden Room", postcode: "BL1 3CD" },
    { cook: "Rashid Ali", meal: "Chicken Karahi", dietary: "Halal", portions: 3, pickupTime: "6:30 PM", location: "Community Kitchen", postcode: "BL1 3CD" },
    { cook: "Zara Ahmed", meal: "Vegetable Samosas", dietary: "Vegan", portions: 6, pickupTime: "4:00 PM", location: "Community Hub", postcode: "BL1 6HI" },
    { cook: "Leila Haddad", meal: "Falafel & Hummus", dietary: "Vegan", portions: 4, pickupTime: "6:00 PM", location: "Community Centre", postcode: "BL1 2AB" },
    { cook: "Min-Jae Kim", meal: "Bibimbap Bowl", dietary: "Vegetarian", portions: 3, pickupTime: "6:30 PM", location: "Community Centre", postcode: "BL1 2AB" },
    { cook: "Wei Chen", meal: "Egg Fried Rice", dietary: "Vegetarian", portions: 4, pickupTime: "5:00 PM", location: "Library", postcode: "BL1 1RL" },
    { cook: "Mei Lin", meal: "Stir-fried Veg & Rice", dietary: "Vegan", portions: 4, pickupTime: "5:30 PM", location: "Garden Room", postcode: "BL1 3CD" },
    { cook: "Li Na", meal: "Mapo Tofu", dietary: "Vegan", portions: 3, pickupTime: "6:30 PM", location: "Community Centre", postcode: "BL1 2AB" },
    { cook: "Lucas Martinez", meal: "Jasmine Rice & Veg", dietary: "Vegan", portions: 4, pickupTime: "5:00 PM", location: "Garden Room", postcode: "BL1 3CD" },
    { cook: "Mason Lee", meal: "Pasta Arrabbiata", dietary: "Vegan", portions: 4, pickupTime: "5:30 PM", location: "Community Centre", postcode: "BL1 2AB" },
    { cook: "Logan Rodriguez", meal: "Bean & Cheese Burrito", dietary: "Vegetarian", portions: 3, pickupTime: "6:00 PM", location: "Library", postcode: "BL1 1RL" },
    { cook: "Charlotte Green", meal: "Hearty Vegetable Soup", dietary: "Vegan", portions: 5, pickupTime: "4:00 PM", location: "Community Hub", postcode: "BL1 6HI" },
    { cook: "Ava Garcia", meal: "Vegetable Korma", dietary: "Vegetarian", portions: 3, pickupTime: "7:00 PM", location: "Library", postcode: "BL1 1RL" },
    { cook: "Omar Mansour", meal: "Shawarma Chicken", dietary: "Halal", portions: 2, pickupTime: "7:00 PM", location: "Community Kitchen", postcode: "BL1 3CD" },
    { cook: "Nour El-Din", meal: "Couscous with Veg", dietary: "Vegan", portions: 3, pickupTime: "5:00 PM", location: "Garden Room", postcode: "BL1 3CD" },
];

// GET all meals (auto-adds data if empty)
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        let meals = await prisma.meal.findMany();
        if (meals.length === 0) {
            await prisma.meal.createMany({ data: initialMeals });
            meals = await prisma.meal.findMany();
        }
        res.json(meals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch meals' });
    }
});

// GET single meal
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const meal = await prisma.meal.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!meal) {
            return res.status(404).json({ error: 'Meal not found' });
        }
        res.json(meal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch meal' });
    }
});

// POST create meal (with tracking)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { cook, meal, dietary, portions, pickupTime, location, postcode } = req.body;
        if (!cook || !meal || !dietary || !portions || !pickupTime || !location) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const newMeal = await prisma.meal.create({
            data: { cook, meal, dietary, portions: parseInt(portions), pickupTime, location, postcode: postcode || '' }
        });
        // Add meal ID to user's sharedMeals
        await prisma.user.update({
            where: { id: req.user.id },
            data: { sharedMeals: { push: newMeal.id } }
        });
        res.status(201).json(newMeal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create meal' });
    }
});

// PUT update meal
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { cook, meal, dietary, portions, pickupTime, location, postcode } = req.body;
        const mealId = parseInt(req.params.id);
        const existingMeal = await prisma.meal.findUnique({ where: { id: mealId } });
        if (!existingMeal) return res.status(404).json({ error: 'Meal not found' });
        const updatedMeal = await prisma.meal.update({
            where: { id: mealId },
            data: {
                cook: cook || existingMeal.cook,
                meal: meal || existingMeal.meal,
                dietary: dietary || existingMeal.dietary,
                portions: portions !== undefined ? parseInt(portions) : existingMeal.portions,
                pickupTime: pickupTime || existingMeal.pickupTime,
                location: location || existingMeal.location,
                postcode: postcode !== undefined ? postcode : existingMeal.postcode
            }
        });
        res.json(updatedMeal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update meal' });
    }
});

// DELETE meal (and remove from user's sharedMeals)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const mealId = parseInt(req.params.id);
        await prisma.meal.delete({ where: { id: mealId } });
        // Remove meal ID from user's sharedMeals
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (user && user.sharedMeals.includes(mealId)) {
            await prisma.user.update({
                where: { id: req.user.id },
                data: { sharedMeals: user.sharedMeals.filter(id => id !== mealId) }
            });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete meal' });
    }
});

// POST request meal
router.post('/:id/request', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const mealId = parseInt(req.params.id);
        const userId = req.user.id;
        const meal = await prisma.meal.findUnique({ where: { id: mealId } });
        if (!meal) return res.status(404).json({ error: 'Meal not found' });
        if (meal.portions <= 0) return res.status(400).json({ error: 'No portions left' });
        const updatedMeal = await prisma.meal.update({
            where: { id: mealId },
            data: { portions: meal.portions - 1 }
        });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && !user.requestedMeals.includes(mealId)) {
            await prisma.user.update({
                where: { id: userId },
                data: { requestedMeals: [...user.requestedMeals, mealId] }
            });
        }
        res.json(updatedMeal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to request meal' });
    }
});

export default router;