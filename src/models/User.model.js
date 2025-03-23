import mongoose, { Schema } from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "User"
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true,
    },
    resume: {
        type: Schema.Types.ObjectId,
        ref: 'resume'
    }
}, {timestamps: true} )

const User = mongoose.model('user', UserSchema);

export default User;