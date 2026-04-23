/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of events
 */
// Your GET /events route here

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - club
 *               - title
 *               - date
 *               - location
 *             properties:
 *               club:
 *                 type: string
 *               title:
 *                 type: string
 *               date:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event created
 *       401:
 *         description: Unauthorized
 */
// POST /events route here
import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

const router = Router();

// Initial events data (20 events)
const initialEvents = [
    { club: "History Club", title: "Local Heritage Walk", date: "Saturday, 10am", location: "Old Library", attendees: 14, description: "Guided walk through neighbourhood history.", postcode: "BL1 1RL" },
    { club: "Book Club", title: "Monthly Meeting", date: "Thursday, 7pm", location: "Community Centre", attendees: 8, description: "Discuss this month's book over tea.", postcode: "BL1 2AB" },
    { club: "Garden Club", title: "Spring Planting Day", date: "Saturday, 9am", location: "Community Garden", attendees: 12, description: "Plant flowers and vegetables for the season.", postcode: "BL1 3CD" },
    { club: "Walking Club", title: "Sunday Morning Stroll", date: "Sunday, 10am", location: "Victoria Park", attendees: 9, description: "Gentle walk followed by coffee.", postcode: "BL1 4EF" },
    { club: "Choir Club", title: "Open Rehearsal", date: "Wednesday, 6:30pm", location: "St Mary's Church", attendees: 11, description: "All voices welcome!", postcode: "BL1 5GH" },
    { club: "Games Club", title: "Board Game Night", date: "Friday, 7pm", location: "Community Hub", attendees: 7, description: "Catan, Scrabble, Mahjong.", postcode: "BL1 6HI" },
    { club: "Tech Club", title: "Smartphone Basics", date: "Monday, 2pm", location: "Library", attendees: 6, description: "Learn to use your phone.", postcode: "BL1 1RL" },
    { club: "Faith Circle", title: "Quiet Reflection", date: "Sunday, 11am", location: "Community Centre", attendees: 5, description: "Meditation and gentle conversation.", postcode: "BL1 2AB" },
    { club: "Cooking Club", title: "Korean Cooking Class", date: "Tuesday, 6pm", location: "Community Kitchen", attendees: 10, description: "Learn to make Bibimbap.", postcode: "BL1 3CD" },
    { club: "Cooking Club", title: "Pakistani Street Food", date: "Thursday, 5:30pm", location: "Main Hall", attendees: 15, description: "Make samosas and chai.", postcode: "BL1 4EF" },
    { club: "Walking Club", title: "Park Run & Picnic", date: "Sunday, 9am", location: "Victoria Park", attendees: 30, description: "5km run/walk followed by picnic.", postcode: "BL1 4EF" },
    { club: "Faith Circle", title: "Ramadan Iftar Gathering", date: "Friday, 7pm", location: "Community Centre", attendees: 40, description: "Open Iftar meal.", postcode: "BL1 2AB" },
    { club: "Psychological Support", title: "Healing Circle", date: "Tuesday, 6pm", location: "Private Room", attendees: 6, description: "Confidential support space.", postcode: "BL1 2AB" },
    { club: "Medical Support", title: "Healthy Eating on a Budget", date: "Thursday, 5:30pm", location: "Community Kitchen", attendees: 10, description: "Cook nutritious, low-cost meals.", postcode: "BL1 3CD" },
    { club: "Knitting Club", title: "Beginner's Knitting", date: "Wednesday, 2pm", location: "Craft Room", attendees: 8, description: "Learn to knit a scarf.", postcode: "BL1 5GH" },
    { club: "Charity Outreach", title: "Mosque Open Day", date: "Saturday, 2pm", location: "Central Mosque", attendees: 25, description: "Learn about Islamic faith and culture.", postcode: "BL1 8LM" },
    { club: "Charity Outreach", title: "Church Community Lunch", date: "Sunday, 1pm", location: "St Peter's Church", attendees: 20, description: "Free community lunch.", postcode: "BL1 9NP" },
    { club: "Gentle Yoga", title: "Chair Yoga for Seniors", date: "Monday, 10am", location: "Community Centre", attendees: 12, description: "Low-impact yoga for mobility.", postcode: "BL1 2AB" },
    { club: "Charity Outreach", title: "Interfaith Peace Gathering", date: "Tuesday, 7pm", location: "Town Hall", attendees: 18, description: "Share food and conversation.", postcode: "BL1 1RU" },
    { club: "Walking Club", title: "Gentle Stroll to Park", date: "Saturday, 2pm", location: "Library", attendees: 11, description: "Easy walk with benches along the way.", postcode: "BL1 1RL" },
];

// GET all events (auto-adds data if empty)
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        let events = await prisma.event.findMany();
        if (events.length === 0) {
            await prisma.event.createMany({ data: initialEvents });
            events = await prisma.event.findMany();
        }
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// GET single event
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const event = await prisma.event.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

// POST create event (with tracking)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { club, title, date, location, description, postcode } = req.body;
        if (!club || !title || !date || !location) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const event = await prisma.event.create({
            data: { club, title, date, location, description: description || '', postcode: postcode || '', attendees: 0 }
        });
        // Add event ID to user's createdEvents
        await prisma.user.update({
            where: { id: req.user.id },
            data: { createdEvents: { push: event.id } }
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// PUT update event
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { club, title, date, location, description, postcode, attendees } = req.body;
        const eventId = parseInt(req.params.id);
        const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });
        if (!existingEvent) return res.status(404).json({ error: 'Event not found' });
        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: {
                club: club || existingEvent.club,
                title: title || existingEvent.title,
                date: date || existingEvent.date,
                location: location || existingEvent.location,
                description: description !== undefined ? description : existingEvent.description,
                postcode: postcode !== undefined ? postcode : existingEvent.postcode,
                attendees: attendees !== undefined ? attendees : existingEvent.attendees
            }
        });
        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// DELETE event (and remove from user's createdEvents)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const eventId = parseInt(req.params.id);
        await prisma.event.delete({ where: { id: eventId } });
        // Remove event ID from user's createdEvents
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (user && user.createdEvents.includes(eventId)) {
            await prisma.user.update({
                where: { id: req.user.id },
                data: { createdEvents: user.createdEvents.filter(id => id !== eventId) }
            });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// POST attend event
router.post('/:id/attend', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const eventId = parseInt(req.params.id);
        const userId = req.user.id;
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return res.status(404).json({ error: 'Event not found' });
        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: { attendees: event.attendees + 1 }
        });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && !user.joinedEvents.includes(eventId)) {
            await prisma.user.update({
                where: { id: userId },
                data: { joinedEvents: [...user.joinedEvents, eventId] }
            });
        }
        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ error: 'Failed to attend event' });
    }
});

export default router;