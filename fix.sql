ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_test_scores DROP CONSTRAINT IF EXISTS user_test_scores_user_id_fkey;
ALTER TABLE user_test_scores ADD CONSTRAINT user_test_scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_career_suggestions DROP CONSTRAINT IF EXISTS user_career_suggestions_user_id_fkey;
ALTER TABLE user_career_suggestions ADD CONSTRAINT user_career_suggestions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_matched_cities DROP CONSTRAINT IF EXISTS user_matched_cities_user_id_fkey;
ALTER TABLE user_matched_cities ADD CONSTRAINT user_matched_cities_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_matched_cities DROP CONSTRAINT IF EXISTS user_matched_cities_city_id_fkey;
ALTER TABLE user_matched_cities ADD CONSTRAINT user_matched_cities_city_id_fkey FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE;

ALTER TABLE universities DROP CONSTRAINT IF EXISTS universities_city_id_fkey;
ALTER TABLE universities ADD CONSTRAINT universities_city_id_fkey FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE;

ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_uni_id_fkey;
ALTER TABLE departments ADD CONSTRAINT departments_uni_id_fkey FOREIGN KEY (uni_id) REFERENCES universities(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users(email);