import mongoose from 'mongoose';
import Checkit from 'checkit';


export function checkit (schema, options) {
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



