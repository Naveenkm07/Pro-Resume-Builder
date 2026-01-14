import { Router } from 'express';
import Resume from '../models/Resume';
// Middleware is applied in server.ts, so we don't strictly need it here unless we use it per-route.
// Removing unused import to clean up lint error.

const router = Router();

// Middleware to ensure authentication
// If you don't have this middleware file, we will create it or use a check inside the route.
// For now, I will assume we might need to inline the check or create the middleware.
// Let's first check if 'authenticateToken' acts as a middleware.
// Given previous view of auth.ts, it handled logic but maybe not middleware.
// I'll create a simple middleware inline if needed, but for now let's assume standard pattern.

// GET /api/resume - Get all resumes for user (or just the latest one)
router.get('/', async (req: any, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // For this app, we'll sort by updated at and get the latest
        const resumes = await Resume.find({ user: userId }).sort({ updatedAt: -1 });
        res.json(resumes);
    } catch (err) {
        console.error('Error fetching resumes:', err);
        res.status(500).json({ error: 'Failed to fetch resumes' });
    }
});

// GET /api/resume/:id - Get specific resume
router.get('/:id', async (req: any, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const resume = await Resume.findOne({ _id: req.params.id, user: userId });
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }
        res.json(resume);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch resume' });
    }
});

// POST /api/resume - Create or Update (Upsert behavior for simplicity of single resume app)
router.post('/', async (req: any, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { name, contact, summary, skills, experience, education } = req.body;

        // Check if user already has a resume, if so update it (Single Resume Strategy for now)
        let resume = await Resume.findOne({ user: userId });

        if (resume) {
            // Update existing
            resume.name = name;
            resume.contact = contact;
            resume.summary = summary;
            resume.skills = skills;
            resume.experience = experience;
            resume.education = education;
            await resume.save();
        } else {
            // Create new
            resume = new Resume({
                user: userId,
                name,
                contact,
                summary,
                skills,
                experience,
                education,
            });
            await resume.save();
        }

        res.json(resume);
    } catch (err) {
        console.error('Error saving resume:', err);
        res.status(500).json({ error: 'Failed to save resume' });
    }
});

export default router;
