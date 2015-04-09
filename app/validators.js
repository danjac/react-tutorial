import Checkit from 'checkit';

export function Signup(nameExists, emailExists) {
    return new Checkit({
        name: ['minLength:10', 'maxLength:60', nameExists],
        email: ['required', 'email', emailExists],
        password: 'minLength:6'
    });
}

export function Login() {
    return new Checkit({
        identity: {
            rule: 'required',
            message: 'You must provide an email address or username'
        },
        password: 'required'
    });
}

export function NewPost(checkImage) {
    const rules = {
        title: ['minLength:6', 'maxLength:100'],
        comment: [],
        url: [
            'required', 
            {
                rule: 'url',
                message: 'Please provide a valid URL'
            }
        ],
    };

    if (checkImage) {
        rules.image =  [
            'required', 
            {
                rule: 'url',
                message: 'Please provide a valid URL'
            }
        ];
    }
    return Checkit(rules);
}

