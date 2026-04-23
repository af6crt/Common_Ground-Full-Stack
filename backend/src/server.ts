import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import yaml from 'js-yaml';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import mealRoutes from './routes/meals';
import clubRoutes from './routes/clubs';
import userRoutes from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Load Swagger YAML file
let swaggerDocument: any;
try {
    swaggerDocument = yaml.load(fs.readFileSync('./swagger.yaml', 'utf8')) as any;
    console.log('✅ Swagger documentation loaded');
} catch (error) {
    console.error('❌ Failed to load swagger.yaml:', error);
}

// Swagger UI route
if (swaggerDocument) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Home page with clickable links
app.get('/', (req, res) => {
    const baseUrl = `http://localhost:${PORT}`;
    res.json({
        name: "🌱 Common Ground API",
        version: "1.0.0",
        description: "Click any link below to test the endpoint",
        endpoints: {
            "🏠 Home": `${baseUrl}/`,
            "📚 API Docs": `${baseUrl}/api-docs`,
            "💚 Health Check": `${baseUrl}/api/health`,
            "📚 Clubs (15 clubs)": `${baseUrl}/api/clubs`,
            "📅 Events (20 events)": `${baseUrl}/api/events`,
            "🍲 Meals (25 meals)": `${baseUrl}/api/meals`,
            "📝 Sign Up": `${baseUrl}/api/auth/signup`,
            "🔐 Sign In": `${baseUrl}/api/auth/signin`,
            "👤 User Profile": `${baseUrl}/api/users/me`
        },
        instructions: "Copy and paste these URLs into Postman or browser to test"
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Common Ground API is running!' });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

export default app;