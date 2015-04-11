import mongoose from 'mongoose';
import {checkit} from './middleware';
import * as validators from '../../app/validators';

const Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

const postSchema = new Schema({
    author: {
        type: ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        require: false
    },
    url: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        default: 1
    },
    created: {
        type: Date,
        default: Date.now
    }
});

postSchema.plugin(checkit, {validator: validators.newPost(false)});

export default mongoose.model('Post', postSchema);
