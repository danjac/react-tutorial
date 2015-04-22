import sq from 'sequelize';
import db from '../../config/db';
import User from './User';

const Post = db.define('Post', {
    title: {
        type: sq.STRING,
        allowNull: false
    },
    comment: {
        type: sq.TEXT
    },
    created: {
        type: sq.DATE,
        defaultValue: sq.NOW
    },
    url: {
        type: sq.STRING,
        validate: {
            isURL: true
        },
        allowNull: false
    },
    image: {
        type: sq.STRING,
        allowNull: false
    },
    score: {
        type: sq.INTEGER,
        defaultValue:1
    }
});

Post.belongsTo(User, {
    foreignKey: "author_id"
});

export default Post;
