import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import config from '../../config/config.json'

const env = config[process.env.NODE_ENV || 'development'];
const basename  = path.basename(module.filename);

env.define = {
    timestamps: false
};

const sequelize = new Sequelize(env.database, env.username, env.password, env);

const db = {};

fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf('.') !== 0) && (file !== basename);
  })
  .forEach((file) => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
