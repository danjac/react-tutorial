import Checkit from 'checkit';

export function Signup(db) {

    const nameExists = (name) => {
        return db("users")
            .count("id")
            .where("name", name)
            .first()
            .then((result) => {
                if (parseInt(result.count) > 0){
                    throw new Error('This username already exists');
                } 
            });
    };

    const emailExists = (email) => {
        return db("users")
            .count("id")
            .where("email", email)
            .first()
            .then((result) => {
                if (parseInt(result.count) > 0){
                    throw new Error("This email address already exists!")
                }
            });
    };

    return new Checkit({
        name: ['minLength:10', 'maxLength:60', nameExists],
        email: ['required', 'email', emailExists],
        password: ['minLength:6']
    });

};

