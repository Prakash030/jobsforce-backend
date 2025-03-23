import { registerUser, loginUser } from "../services/user.service.js";

export const registerUserController = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name) throw new Error("Name is required");
        if (!email) throw new Error("Email is required");
        if (!password) throw new Error("Password is required");

        const response = await registerUser({ name, email, password });
        res.status(200).json({ success: true, message: 'User registered successfully', user: response });
    } catch (error) {
        next(error);
    }
}

export const loginUserController = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email) throw new Error("Email is required");
        if (!password) throw new Error("Password is required");
        const response = await loginUser({ email, password });
        res.status(200).json({ success: true, message: 'User logged in successfully', user: response });
    } catch (error) {
        next(error);
    }
}