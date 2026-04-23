/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Missing fields or email exists
 */
// Your POST /signup route here

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
// Your POST /signin route here
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

const router = Router();

router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { email, password, fullName, phone, ageGroup, interests, postcode } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                fullName,
                phone: phone || '',
                ageGroup: ageGroup || '',
                interests: interests || [],
                postcode: postcode || '',
                // createdEvents and sharedMeals default to [] automatically
            }
        });

        const token = jwt.sign(
            { id: user.id, email: user.email, fullName: user.fullName },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                ageGroup: user.ageGroup,
                interests: user.interests,
                postcode: user.postcode,
                joinDate: user.joinDate,
                joinedEvents: user.joinedEvents,
                requestedMeals: user.requestedMeals,
                joinedClubs: user.joinedClubs,
                createdEvents: user.createdEvents,
                sharedMeals: user.sharedMeals
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Signup failed' });
    }
});

router.post('/signin', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, fullName: user.fullName },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                ageGroup: user.ageGroup,
                interests: user.interests,
                postcode: user.postcode,
                joinDate: user.joinDate,
                joinedEvents: user.joinedEvents,
                requestedMeals: user.requestedMeals,
                joinedClubs: user.joinedClubs,
                createdEvents: user.createdEvents,
                sharedMeals: user.sharedMeals
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;