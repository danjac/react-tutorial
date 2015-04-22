'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.createTable('users', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(30),
            allowNull: false,
            unique:true
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique:true
        },
        password: {
            type: Sequelize.STRING,
            allowNull:false
        },
        totalScore: {
            type: Sequelize.INTEGER,
            defaultValue:0
        },
        votes: {
            type: Sequelize.ARRAY(Sequelize.INTEGER)
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

    return queryInterface.dropTable('users');
  }
};
