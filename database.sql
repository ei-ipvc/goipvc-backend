CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  name jsonb NOT NULL,
  type jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS curricular_units (
  id SERIAL PRIMARY KEY,
  course_id INTEGER,
  moodle_id INTEGER,

  name jsonb,
  academic_year INTEGER,
  study_year SMALLINT,
  semester SMALLINT,
  ects SMALLINT,
  autonomous_hours SMALLINT,

  summary jsonb,
  objectives jsonb,
  content jsonb,
  teach_methods jsonb,
  evaluation jsonb,
  main_biblio jsonb,
  comp_biblio jsonb,

  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS curricular_unit_class_types (
  id INTEGER PRIMARY KEY,
  class_type JSON,
  hours JSON
);

CREATE TABLE IF NOT EXISTS curricular_unit_teachers (
  id INTEGER,
  teacher_id INTEGER,
  responsible BOOLEAN NOT NULL DEFAULT FALSE,

  PRIMARY KEY (id, teacher_id)
);

CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,

  custom_name VARCHAR(255),

  theme VARCHAR(6),
  color_scheme VARCHAR(6),
  school_theme VARCHAR(4),

  lesson_notifs INTEGER NOT NULL DEFAULT 10,
  task_notifs INTEGER NOT NULL DEFAULT 2
);