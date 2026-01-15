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

        const versionName = typeof req.query?.versionName === 'string' ? req.query.versionName.trim() : '';

        if (versionName) {
            const query =
                versionName === 'Base'
                    ? { user: userId, $or: [{ versionName: 'Base' }, { versionName: { $exists: false } }] }
                    : { user: userId, versionName };
            const resume = await Resume.findOne(query).sort({ updatedAt: -1 });
            if (!resume) {
                return res.json(null);
            }
            const obj = resume.toObject();
            if (!obj.versionName) obj.versionName = 'Base';
            return res.json(obj);
        }

        // For this app, we'll sort by updated at and get the latest
        const resumes = await Resume.find({ user: userId }).sort({ updatedAt: -1 });
        const normalized = resumes.map((r) => {
            const obj = r.toObject();
            if (!obj.versionName) obj.versionName = 'Base';
            return obj;
        });
        res.json(normalized);
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

        const {
            versionName: rawVersionName,
            sectionOrder,
            name,
            contact,
            summary,
            skills,
            experience,
            education,
            projects,
            certifications,
        } = req.body;

        const versionName = typeof rawVersionName === 'string' && rawVersionName.trim() ? rawVersionName.trim() : 'Base';

        const findQuery =
            versionName === 'Base'
                ? { user: userId, $or: [{ versionName: 'Base' }, { versionName: { $exists: false } }] }
                : { user: userId, versionName };

        // Check if user already has this version, if so update it
        let resume = await Resume.findOne(findQuery);

        if (resume) {
            // Update existing
            resume.versionName = versionName;
            resume.sectionOrder = Array.isArray(sectionOrder) ? sectionOrder : resume.sectionOrder;
            resume.name = name;
            resume.contact = contact;
            resume.summary = summary;
            resume.skills = skills;
            resume.experience = experience;
            resume.education = education;
            resume.projects = projects;
            resume.certifications = Array.isArray(certifications) ? certifications : resume.certifications;
            await resume.save();
        } else {
            // Create new
            resume = new Resume({
                user: userId,
                versionName,
                sectionOrder: Array.isArray(sectionOrder) ? sectionOrder : undefined,
                name,
                contact,
                summary,
                skills,
                experience,
                education,
                projects,
                certifications: Array.isArray(certifications) ? certifications : [],
            });
            await resume.save();
        }

        const obj = resume.toObject();
        if (!obj.versionName) obj.versionName = 'Base';
        res.json(obj);
    } catch (err) {
        console.error('Error saving resume:', err);
        res.status(500).json({ error: 'Failed to save resume' });
    }
});

// DELETE /api/resume?versionName=... - Delete a specific resume version
router.delete('/', async (req: any, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const versionNameRaw = typeof req.query?.versionName === 'string' ? req.query.versionName.trim() : '';
        if (!versionNameRaw) {
            return res.status(400).json({ error: 'versionName is required' });
        }

        const versionName = versionNameRaw;
        const query =
            versionName === 'Base'
                ? { user: userId, $or: [{ versionName: 'Base' }, { versionName: { $exists: false } }] }
                : { user: userId, versionName };

        const deleted = await Resume.findOneAndDelete(query);
        if (!deleted) {
            return res.status(404).json({ error: 'Resume version not found' });
        }

        return res.json({ message: 'Deleted', versionName });
    } catch (err) {
        console.error('Error deleting resume:', err);
        return res.status(500).json({ error: 'Failed to delete resume' });
    }
});

export default router;
