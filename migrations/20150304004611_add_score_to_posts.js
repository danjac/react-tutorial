'use strict';

exports.up = function(knex, Promise) {
  
    return knex.schema.table("posts", function(table) {
        table.integer("score").defaultTo(1);
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table("posts", function(table) {
        table.dropColumn("score");
    });
  
};
