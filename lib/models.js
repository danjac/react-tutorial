import mongoose from 'mongoose';
import validate from 'mongoose-validator';
import uniqueValidator from 'mongoose-unique-validator';
import bcrypt from 'bcryptjs';

const Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;


const userSchema = new Schema({
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
        required:   true,
        set:        (p) => bcrypt.hashSync(p, 10)
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
});

userSchema.plugin(uniqueValidator);

userSchema.methods.checkPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.statics.authenticate = function(identity, password) {
    return this
        .findOne()
        .or([
            {name: identity}, 
            {email: identity}
        ])
        .exec()
        .then((user) => {

            if (!user || !user.checkPassword(password)) {
                return null;
            }

            return user;

        });
};

// scrub password from returned value
userSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret.password;
    }
});

export const User = mongoose.model('User', userSchema);

const postSchema = new Schema({
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
                arguments:  [10, 100],
                message:    'Title should be between 10 and 100 characters'
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
});

export const Post = mongoose.model('Post', postSchema);
