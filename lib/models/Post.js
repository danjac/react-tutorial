import sq from 'sequelize';

export default function(db) {
    const Post =  db.define('Post', {
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
        },
    }, {
        tableName: 'posts',
        classMethods: {
            associate: (models) => {
                Post.belongsTo(models.User, {
                    as: 'author',
                    foreignKey: "author_id"
                });
            }
        }
    });
    return Post;
}
