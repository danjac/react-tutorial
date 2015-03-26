import mongoose from 'mongoose';
import validate from 'mongoose-validator';

const Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;


export const User = mongoose.model('User', new Schema({
    name:       {
        type:       String,
        required:   true,
        unique:     true,
        validate:   [
            validate({
                validator:  'isLength',
                arguments:  [6, 60],
                message:    'Name should be between 6 and 60 characters'
            })
        ]
    },
    email:      {
        type:       String,
        required:   true,
        unique:     true,
        validate:   [
            validate({
                validator:  'isEmail',
                message:    'Not an email address'
            })
        ]

    },
    password:    {
        type:       String,
        required:   true
    },
    totalScore:      {
        type:       Number,
        default:    0
    },
    votes:          Array,
    created:    {
        type:       Date,
        default:    Date.now
    }
}));

export const Post = mongoose.model('Post', new Schema({
    author:     {
        type:       ObjectId,
        ref:        'User'
    },
    title:      {
        type:       String,
        required:   true,
        validate:   [
            validate({
                validator:  'isLength',
                arguments:  [20, 100],
                message:    'Titel should be between 10 and 100 characters'
            })
        ]
    },
    url:        {
        type:       String,
        required:   true,
        validate:   [
            validate({
                validator: 'isURL',
                message:    'Must be a valid URL'
            })
        ]
    },
    score:      {
        type:       Number,
        default:    0
    },
    created:    {
        type:   Date,
        default:Date.now
    }
}));
