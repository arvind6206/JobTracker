import jwt from "jsonwebtoken";

function authMiddleware(req, res, next) {
    const token = req.headers.token;

    if (!token) {
        return res.status(401).json({
            msg: "Token not found"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded._id;

        next();
    } catch (error) {
        return res.status(401).json({
            msg: "Invalid token"
        });
    }
}

export default authMiddleware;