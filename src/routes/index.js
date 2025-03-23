import userRoutes from '../routes/user.route.js';
import resumeRoutes from '../routes/resume.route.js';

export default (app) => {
    app.use('/api/v1/auth', userRoutes);
    app.use('/api/v1/resume', resumeRoutes);
}

