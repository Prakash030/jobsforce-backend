import { uploadResume, getUserResumes, getJobRecommendations } from "../services/resume.service.js";

export const uploadResumeController = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        if (!userId) throw new Error("User ID is required");
        const domain = req.body.domain;
        if(!domain) throw new Error("Domain is required");

        const file = req.file;
        if (!file) throw new Error("Resume file is required");
        const resume = await uploadResume({ userId, file, domain });

        res.status(201).json({ success: true, message: "Resume uploaded successfully", resume });
    } catch (error) {
        next(error);
    }
};

export const getUserResumesController = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        if (!userId) throw new Error("User ID is required");

        const resumes = await getUserResumes(userId);
        res.status(200).json({ success: true, resumes });
    } catch (error) {
        next(error);
    }
};

export const getJobRecommendationsController = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        if (!userId) throw new Error("User ID is required");
        const limit = req.query.limit || 100;

        const recommendations = await getJobRecommendations({ userId, limit });
        res.status(200).json({ success: true, recommendations, count: recommendations?.length});
    } catch (error) {
        next(error);
    }
};