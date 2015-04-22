'use strict';

/*
 *    title: {
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


 */
module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
      return queryInterface.createTable('posts', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        author_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: "users",
            referenceKey: "id",
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        url: {
            type: Sequelize.STRING,
            allowNull: false
        },
        image: {
            type: Sequelize.STRING,
            allowNull: false
        },
        comment: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        score: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
        created: {
            type: Sequelize.DATE
        }

      });
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.dropTable('posts');
  }
};
