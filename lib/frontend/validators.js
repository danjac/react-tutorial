import Checkit from 'checkit';


export const Signup = new Checkit({
    name: ['minLength:10', 'maxLength:60'],
    email: ['required', 'email'],
    password: 'minLength:6'
});


export const Login = new Checkit({
    identity: {
        rule: 'required',
        message: 'You must provide an email address or username'
    },
    password: 'required'
});


export const NewPost = new Checkit({
    title: ['minLength:6', 'maxLength:100'],
    url: [
        'required', 
        {
            rule: 'url',
            message: 'Please provide a valid URL'
        }
    ]
});


