import Sequelize from 'sequelize';

export default new Sequelize(`postgres://${process.env.DB_NAME}:${process.env.DB_PASS}@${process.env.DB_HOST || 'localhost:5432'}/${process.env.DB_NAME}`);


