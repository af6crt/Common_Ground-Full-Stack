export interface Club { id: number; name: string; }
export interface Event { id: number; title: string; }
export interface Meal { id: number; meal: string; }
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger';

// Add this BEFORE your routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));