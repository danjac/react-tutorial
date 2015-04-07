import mongoose from 'mongoose';
import co from 'co';
import bcrypt from 'bcryptjs';
import Checkit from 'checkit';
import * as validators from '../app/validators';

const Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

export function connect() {
    const connectionString = 'mongodb://' + (process.env.DB_HOST || 'localhost') + '/' + process.env.DB_NAME;

    mongoose.connect(connectionString);
    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
}

const checkit = (schema, options) => {
    const rules = options.rules
    if (!rules) {
        throw new Error("rules must be defined!")
    }
    schema.pre('validate', function(next) {
        Checkit(rules)
            .run(this.toObject())
            .then(() => next())
            .catch((err) => {
                next(err) // returning 'next()' causes an unhandled error 
            });
    });
};

const isUnique = (model, field) => {

    return co.wrap(function*(value) {
        const attrs = {};
        attrs[field] = value;
        const num = yield mongoose.model(model)
            .find(attrs)
            .count();
        if (num) {
            throw new Checkit.ValidationError("The " + field + " field is already in use")
        }
    });
};


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

userSchema.statics.authenticate = function* (identity, password) {

    const user = yield this
        .findOne()
        .or([
            {name: identity}, 
            {email: identity}
        ])
        .exec();

    if (user && user.checkPassword(password)) {
        return user;
        
    }
    return null;
};

// scrub password from returned value
userSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret.password
    }
})

export const User = mongoose.model('User', userSchema)

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
})

postSchema.plugin(checkit, {rules: validators.NewPost})

export const Post = mongoose.model('Post', postSchema)
