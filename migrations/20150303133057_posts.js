'use strict';

exports.up = function(knex, Promise) {
	return knex.schema.createTable("posts", function(table){
		table.increments();
		table.string("title").notNullable();
		table.string("url").notNullable();
		table.integer("user_id").notNullable().references("users.id");
		table.timestamps();
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable("posts");
};
