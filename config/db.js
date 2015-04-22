import Sequelize from 'sequelize';

const connStr =`postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST || 'localhost:5432'}/${process.env.DB_NAME}`;
export default new Sequelize(connStr, {
    define: {
        timestamps: false
    }
});


