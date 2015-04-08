import mongoose from 'mongoose';
import {checkit} from './middleware';
import * as validators from '../../app/validators';

const Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

const postSchema = new Schema({
    author:     {
        type:       ObjectId,
        ref:        'User'
    },
    title:      {
        type:       String,
        required:   true,
    },
    url:        {
        type:       String,
        required:   true,
    },
    score:      {
        type:       Number,
        default:    1
    },
    created:    {
        type:       Date,
        default:    Date.now
    }
});

postSchema.plugin(checkit, {validator: validators.NewPost()});

export default mongoose.model('Post', postSchema);
