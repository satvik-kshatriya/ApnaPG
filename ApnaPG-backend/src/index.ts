import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/database.js'; // Added .js extension

// Import Routes (Added .js extensions for ESM)
import userRoutes from './routes/userRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import connectionRoutes from './routes/connectionRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import { runConnectivityDiagnostics } from './utils/connectivityDebugger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            process.env.FRONTEND_URL,
            'https://apna-pg-xi.vercel.app'
        ].filter(Boolean) as string[];
        
        // Use startsWith to be more resilient with trailing slashes
        if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
            callback(null, true);
        } else {
            console.log('🚫 CORS Refused Origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// 🔌 Database Connection Middleware (Ensures DB is connected for every request in serverless)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('❌ Database connection middleware error:', err);
        res.status(503).json({ error: 'Database Connection Error' });
    }
});

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/documents', documentRoutes);

// Home & Health
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to ApnaPG Node.js API', status: 'online' });
});

app.get('/health', async (req, res) => {
    // Attempt re-connect if not connected (good for serverless lazy starts)
    if (mongoose.connection.readyState === 0) {
        try {
            await connectDB();
        } catch (e) {
            console.error('Health Check: Failed to connect on-demand.');
        }
    }

    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const readyState = mongoose.connection.readyState;
    
    res.json({ 
        status: 'healthy', 
        database: states[readyState] || 'unknown',
        db_ready_state: readyState,
        service: 'apnapg-api-node', 
        version: '1.0.0' 
    });
});

app.get('/api/diagnose', async (req, res) => {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        return res.status(500).json({ error: 'MONGO_URI is not defined' });
    }

    try {
        const diagnostics = await runConnectivityDiagnostics(MONGO_URI);
        res.json(diagnostics);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Connect to Database and Start Server
// Start server ONLY in local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const startServer = async () => {
        try {
            console.log('⏳ (Dev) Checking MongoDB connection...');
            await connectDB();
            
            app.listen(PORT, () => {
                console.log(`🚀 Dev Server is running on port ${PORT}`);
            });
        } catch (err) {
            console.error('❌ Failed to start dev server:', err);
        }
    };
    startServer();
}

export default app;
