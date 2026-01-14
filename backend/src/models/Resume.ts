import mongoose, { Schema, Document } from 'mongoose';

export interface IResume extends Document {
    user: mongoose.Types.ObjectId;
    versionName: string;
    sectionOrder?: string[];
    name: string;
    contact: string;
    summary: string;
    skills: string[];
    experience: Array<{
        title: string;
        company: string;
        desc: string;
        from: string;
        to: string;
    }>;
    education: Array<{
        degree: string;
        college: string;
        year: string;
    }>;
    projects: Array<{
        name: string;
        description: string;
        techStack?: string;
        link?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const ResumeSchema: Schema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        versionName: { type: String, default: 'Base' },
        sectionOrder: [{ type: String }],
        name: { type: String, required: true, default: '' },
        contact: { type: String, default: '' },
        summary: { type: String, default: '' },
        skills: [{ type: String }],
        experience: [
            {
                title: { type: String, default: '' },
                company: { type: String, default: '' },
                desc: { type: String, default: '' },
                from: { type: String, default: '' },
                to: { type: String, default: '' },
            },
        ],
        education: [
            {
                degree: { type: String, default: '' },
                college: { type: String, default: '' },
                year: { type: String, default: '' },
            },
        ],
        projects: [
            {
                name: { type: String, default: '' },
                description: { type: String, default: '' },
                techStack: { type: String, default: '' },
                link: { type: String, default: '' },
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IResume>('Resume', ResumeSchema);
