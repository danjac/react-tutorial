'use strict';

exports.up = function(knex, Promise) {
	return knex.raw(
	"CREATE OR REPLACE FUNCTION update_at_timestamp() \
	RETURNS TRIGGER AS $$ \
	BEGIN \
	   NEW.updated_at = now(); \
	   RETURN NEW;\
	END; \
	$$ language 'plpgsql'; \
	CREATE TRIGGER change_users_update_at_on_update BEFORE UPDATE \
    ON users FOR EACH ROW EXECUTE PROCEDURE  \
    update_at_timestamp(); \
	CREATE TRIGGER change_posts_update_at_on_update BEFORE UPDATE \
    ON posts FOR EACH ROW EXECUTE PROCEDURE  \
    update_at_timestamp();	\
    ALTER TABLE users ALTER COLUMN created_at SET DEFAULT now(); \
    ALTER TABLE posts ALTER COLUMN created_at SET DEFAULT now();");	
};

exports.down = function(knex, Promise) {
	return knex.raw(
    "ALTER TABLE posts ALTER COLUMN created_at DROP DEFAULT; \
    ALTER TABLE users ALTER COLUMN created_at DROP DEFAULT; \
    DROP TRIGGER change_users_update_at_on_update ON users; \
    DROP TRIGGER change_posts_update_at_on_update ON posts; \
    DROP FUNCTION IF EXISTS update_at_timestamp(TRIGGER);");
};
