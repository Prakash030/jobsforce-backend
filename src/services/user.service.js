import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async ({
    name,
    email,
    password,
}) => {
    console.log("name", name);
    const existingUser = await User.findOne({ email });
    console.log("existingUser", existingUser);
    if (existingUser) {
        throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
    })
    console.log("newUser", newUser);
    if (!newUser) {
        throw new Error("Error in creating user");
    }
    const token = jwt.sign({ id: newUser?._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return {newUser, token};
}

export const loginUser = async ({
    email,
    password
}) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("User not found!");
    }
    const MatchedPassword = bcrypt.compare(password, user?.password);
    if (!MatchedPassword) {
        throw new Error("Invalid password!");
    }
    const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return {user, token};
}