import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        expires: {
            type: Number,
            default: Date.now() / 1000 + 60 * 60, //valid for 1 hour
        },
    },
    {
        timestamps: true,
    }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
