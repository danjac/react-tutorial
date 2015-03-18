import {Signup} from '../client/validators';


export class SignupAsync extends Signup {

    constructor(db) {

        super();

        const nameExists = (name, accept, reject) => {
            return db("users")
                .count("id")
                .where("name", name)
                .first()
                .then((result) => {
                    if (parseInt(result.count) > 0){
                        reject("This username already exists!")
                    } 
                    accept(name);
                });
        };

        const emailExists = (email, accept, reject) => {
            return db("users")
                .count("id")
                .where("email", email)
                .first()
                .then((result) => {
                    if (parseInt(result.count) > 0){
                        return reject("This email address already exists!")
                    }
                    accept(email);
                });
        };
        
        this.validate("name", nameExists, true);
        this.validate("email", emailExists, true);
    }
}

