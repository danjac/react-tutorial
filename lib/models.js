import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Checkit from 'checkit';
import * as validators from './frontend/validators';

const Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;


const checkit = (schema, options) => {
    const rules = options.rules;
    if (!rules) {
        throw new Error("rules must be defined!");
    }
    schema.pre('validate', function(next) {
        Checkit(rules)
            .run(this.toObject())
            .then(() => next())
            .catch((err) => {
                next(err); // returning 'next()' causes an unhandled error 
            });
    });
};

const isUnique = (model, field) => {

    return (value) => {
        const attrs = {};
        attrs[field] = value;
        return mongoose.model(model)
            .find(attrs)
            .count()
            .exec()
            .then((result) => {
                if (result) {
                    throw new Checkit.ValidationError("The " + field + " field is already in use");
                }
            });
    }
}


const userSchema = new Schema({
    name:       {
        type:       String,
        required:   true,
        unique:     true,
    },
    email:      {
        type:       String,
        required:   true,
        unique:     true,
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


validators.Signup.name.push(isUnique('User', 'name'));
validators.Signup.email.push(isUnique('User', 'email'));

userSchema.plugin(checkit, {rules: validators.Signup});

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

postSchema.plugin(checkit, {rules: validators.NewPost});

export const Post = mongoose.model('Post', postSchema);
