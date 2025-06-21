import jwt from 'jsonwebtoken';

const authMiddleware = (req,res,next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.status(401).json({message: "No token provided"});
    }

    const token = authHeader.slice(7);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({message: "Invalid Token"});
    }
};

export default authMiddleware;