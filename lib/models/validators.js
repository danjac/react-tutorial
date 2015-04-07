import mongoose from 'mongoose';
import co from 'co';
import Checkit from 'checkit';

export function isUnique (model, field) {

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


