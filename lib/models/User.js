import sq from 'sequelize';
import bcrypt from 'bcryptjs';
import db from '../../config/db';

export default db.define('User', {
    name: {
        type: sq.STRING(30),
        allowNull: false,
        unique:true
    },
    email: {
        type: sq.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: sq.STRING,
        allowNull:false,
        set: (p) => bcrypt.hashSync(p, 10)
    },
    totalScore: {
        type: sq.INTEGER,
        defaultValue:0
    },
    votes: {
        type: sq.ARRAY(sq.INTEGER)
    },
    created: {
        type: sq.DATE,
        defaultValue: sq.NOW
    },
},
{
    classMethods: {
        authenticate: (identity, password) => {
            this
            .find({
                where: {
                    $or: [
                        { name: identity },
                        { email: identity }
                    ]
                }
            })
            .then((user) => {
                if (user != null && bcrypt.compareSync(password, user.password)) {
                    return user;
                }
                return null;
            });
        }
    }
});
