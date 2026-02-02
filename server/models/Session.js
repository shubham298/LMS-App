import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        expires: {
            type: Number,
            default: Math.round(Date.now() / 1000 + 60 * 60 * 24 * 1), //valid for 1 day
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
