'use strict';

exports.up = function(knex, Promise) {
	return knex.schema.table("users", function(table) {
		table.specificType("votes", "integer[]").defaultTo("{}");
	}); 
};

exports.down = function(knex, Promise) {
	return knex.schema.table("users", function(table) {
		table.dropColumn("votes");
	});
  
};
