import { Router } from 'express';
import { Op } from 'sequelize';
import Resume from '../models/Resume';

const router = Router();

router.get('/', async (req: any, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const versionName = typeof req.query?.versionName === 'string' ? req.query.versionName.trim() : '';

        if (versionName) {
            const whereClause =
                versionName === 'Base'
                    ? { user: userId, [Op.or]: [{ versionName: 'Base' }, { versionName: null }] }
                    : { user: userId, versionName };
            const resume = await Resume.findOne({ 
                where: whereClause,
                order: [['updatedAt', 'DESC']]
            });
            if (!resume) {
                return res.json(null);
            }
            const obj = resume.toJSON();
            if (!obj.versionName) obj.versionName = 'Base';
            return res.json(obj);
        }

        const resumes = await Resume.findAll({ 
            where: { user: userId },
            order: [['updatedAt', 'DESC']]
        });
        const normalized = resumes.map((r) => {
            const obj = r.toJSON();
            if (!obj.versionName) obj.versionName = 'Base';
            return obj;
        });
        res.json(normalized);
    } catch (err) {
        console.error('Error fetching resumes:', err);
        res.status(500).json({ error: 'Failed to fetch resumes' });
    }
});

router.get('/:id', async (req: any, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const resume = await Resume.findOne({ where: { id: req.params.id, user: userId } });
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }
        res.json(resume);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch resume' });
    }
});

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

        const whereClause =
            versionName === 'Base'
                ? { user: userId, [Op.or]: [{ versionName: 'Base' }, { versionName: null }] }
                : { user: userId, versionName };

        let resume = await Resume.findOne({ where: whereClause });

        if (resume) {
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
            resume = await Resume.create({
                user: userId,
                versionName,
                sectionOrder: Array.isArray(sectionOrder) ? sectionOrder : [],
                name,
                contact,
                summary,
                skills,
                experience,
                education,
                projects,
                certifications: Array.isArray(certifications) ? certifications : [],
            });
        }

        const obj = resume.toJSON();
        if (!obj.versionName) obj.versionName = 'Base';
        res.json(obj);
    } catch (err) {
        console.error('Error saving resume:', err);
        res.status(500).json({ error: 'Failed to save resume' });
    }
});

router.delete('/', async (req: any, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const versionNameRaw = typeof req.query?.versionName === 'string' ? req.query.versionName.trim() : '';
        if (!versionNameRaw) {
            return res.status(400).json({ error: 'versionName is required' });
        }

        const versionName = versionNameRaw;
        const whereClause =
            versionName === 'Base'
                ? { user: userId, [Op.or]: [{ versionName: 'Base' }, { versionName: null }] }
                : { user: userId, versionName };

        const deletedCount = await Resume.destroy({ where: whereClause });
        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Resume version not found' });
        }

        return res.json({ message: 'Deleted', versionName });
    } catch (err) {
        console.error('Error deleting resume:', err);
        return res.status(500).json({ error: 'Failed to delete resume' });
    }
});

export default router;
