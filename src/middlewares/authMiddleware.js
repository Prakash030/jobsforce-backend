import pkg from 'jsonwebtoken';
const { verify } = pkg;

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decodedToken = verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid Token' });
    }
};

export default authMiddleware;
