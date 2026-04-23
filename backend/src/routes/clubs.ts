import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

// Initial clubs data (15 clubs)
const initialClubs = [
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

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        let clubs = await prisma.club.findMany();
        if (clubs.length === 0) {
            await prisma.club.createMany({ data: initialClubs });
            clubs = await prisma.club.findMany();
        }
        res.json(clubs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch clubs' });
    }
});

router.post('/:id/join', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const clubId = parseInt(req.params.id);
        const userId = req.user.id;
        const club = await prisma.club.findUnique({ where: { id: clubId } });
        if (!club) return res.status(404).json({ error: 'Club not found' });
        const updatedClub = await prisma.club.update({
            where: { id: clubId },
            data: { members: club.members + 1 }
        });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && !user.joinedClubs.includes(clubId)) {
            await prisma.user.update({
                where: { id: userId },
                data: { joinedClubs: [...user.joinedClubs, clubId] }
            });
        }
        res.json(updatedClub);
    } catch (error) {
        res.status(500).json({ error: 'Failed to join club' });
    }
});


router.delete('/:id/join', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const clubId = parseInt(req.params.id);
        const userId = req.user.id;
        const club = await prisma.club.findUnique({ where: { id: clubId } });
        if (!club) return res.status(404).json({ error: 'Club not found' });
        const updatedClub = await prisma.club.update({
            where: { id: clubId },
            data: { members: Math.max(0, club.members - 1) }
        });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && user.joinedClubs.includes(clubId)) {
            await prisma.user.update({
                where: { id: userId },
                data: { joinedClubs: user.joinedClubs.filter(id => id !== clubId) }
            });
        }
        res.json(updatedClub);
    } catch (error) {
        res.status(500).json({ error: 'Failed to leave club' });
    }
});
export default router;