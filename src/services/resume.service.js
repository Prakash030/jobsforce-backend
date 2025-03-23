import Resume from "../models/Resume.model.js";
import { uploadToS3 } from "../config/aws.js";
import mongoose from "mongoose";
import axios from "axios";
import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from "mammoth";
import OpenAI from 'openai';
import User from "../models/User.model.js";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const extractTextFromFile = async (file) => {
    if (file.mimetype === 'application/pdf') {
        const data = await pdf(file.buffer);
        return data.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const { value } = await mammoth.extractRawText({ buffer: file.buffer });
        return value;
    } else {
        throw new Error('Unsupported file type');
    }
};

const extractSkillsFromText = async (text) => {
    try {
        const prompt = `
            Extract technical and professional skills from the following resume text.
            Return only a comma-separated list of skills. Do not include any additional text or explanations.
            Resume Text: ${text}
        `;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant that extracts skills from resume text.' },
                { role: 'user', content: prompt },
            ],
            max_tokens: 100,
            temperature: 0.2,
        });

        const skillsText = response?.choices[0]?.message?.content;
        const skills = skillsText?.split(',')?.map(skill => skill?.trim());
        return skills;
    } catch (error) {
        console.error('Error extracting skills with GPT:', error);
        throw new Error('Failed to extract skills');
    }
};

export const uploadResume = async ({ userId, file, domain }) => {
    const extractedText = await extractTextFromFile(file);
    const extractedSkills = await extractSkillsFromText(extractedText);
    const s3Url = await uploadToS3(file);

    const newResume = await Resume.create({
        userId: new mongoose.Types.ObjectId(userId),
        s3Url,
        originalFileName: file.originalname,
        interestedDomain: domain,
        extractedSkills,
        extractedText
    });

    if (!newResume) throw new Error("Error uploading resume");
    await User.findByIdAndUpdate(userId, { resume: newResume?._id }, { new: true });
    return newResume;
};

export const getUserResumes = async (userId) => {
    const resumes = await Resume.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });
    if (!resumes) throw new Error("Resumes not found");
    return resumes;
};


export const getJobRecommendations = async ({ userId, limit }) => {
    try {
        const userResume = await Resume.findOne({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });
        if (!userResume) throw new Error("User resume not found");

        const interestedDomain = userResume?.interestedDomain;
        const skills = userResume?.extractedSkills;

        if (!skills || skills.length === 0) throw new Error("No skills found in the resume");

        const response = await axios.get(`https://remotive.com/api/remote-jobs?category=${interestedDomain}&limit=${limit}`);
        const jobs = response.data.jobs;

        const jobsWithScores = await Promise.all(
            jobs.map(async (job) => {
                const jobText = `${job.title} ${job.description} ${job.tags.join(' ')}`;
                const jobSkills = await extractSkillsFromText(jobText);

                const matchCount = skills?.filter(skill => jobSkills?.includes(skill))?.length;
                const score = (matchCount / skills.length) * 100;

                return { ...job, score };
            })
        );

        console.log("jobsWithScores", jobsWithScores);
        const recommendedJobs = jobsWithScores.filter(job => job.score > 10);

        const formattedJobs = recommendedJobs.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company_name,
            companyLogo: job.company_logo,
            location: job.candidate_required_location,
            salary: job.salary,
            jobType: job.job_type,
            publicationDate: job.publication_date,
            description: job.description,
            url: job.url,
            tags: job.tags,
            score: job.score,
        }));

        return formattedJobs?.sort((a, b) => b.score - a.score);
    } catch (error) {
        console.error('Error fetching job recommendations:', error.message);
        throw new Error('Failed to fetch job recommendations');
    }
}

// export const getJobRecommendations = async ({ userId }) => {
//     try {
//         // Find the user's most recent resume
//         const userResume = await Resume.findOne({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });
//         if (!userResume) throw new Error("User resume not found");

//         const interestedDomain = userResume?.interestedDomain;
//         const resumeText = userResume.extractedText;
//         const skills = extractSkillsWithNLP(resumeText);
//         if (!skills || skills.length === 0) throw new Error("No skills found in the resume");

//         const response = await axios.get(`https://remotive.com/api/remote-jobs?category=${interestedDomain}&limit=10`);
//         const jobs = response.data.jobs;

//         const jobsWithScores = jobs.map(async (job) => {
//             const jobText = `${job.title} ${job.description} ${job.tags.join(' ')}`;

//             const jobSkills = await extractSkillsFromText(jobText);
//             console.log(jobSkills);

//             const matchCount = skills.filter(skill => jobSkills.includes(skill)).length;
//             const score = (matchCount / skills.length) * 100;

//             return {
//                 ...job,
//                 score,
//             };
//         });
//         console.log("test",jobsWithScores);

//         const recommendedJobs = jobsWithScores.filter(job => job.score > 50);

//         const formattedJobs = recommendedJobs.map(job => ({
//             id: job.id,
//             title: job.title,
//             company: job.company_name,
//             companyLogo: job.company_logo,
//             location: job.candidate_required_location,
//             salary: job.salary,
//             jobType: job.job_type,
//             publicationDate: job.publication_date,
//             description: job.description,
//             url: job.url,
//             tags: job.tags,
//             score: job.score, // Include the score in the output
//         }));

//         // Sort jobs by score in descending order
//         formattedJobs.sort((a, b) => b.score - a.score);

//         return formattedJobs;
//     } catch (error) {
//         console.error('Error fetching job recommendations:', error);
//         throw new Error('Failed to fetch job recommendations');
//     }
// };