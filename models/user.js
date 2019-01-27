import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
    {
        firstname: {
            type: String,
            required: true
        },
        lastname: {
            type: String,
            required: true
        },
        age: {
            type: Number,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    {
        collection: 'random_collection'
    }
);

const UserModel = mongoose.model('UserModel', userSchema);

export default UserModel;