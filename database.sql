CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS curricular_units (
  id SERIAL PRIMARY KEY,
  course_id INTEGER,
  moodle_id INTEGER,

  name VARCHAR(255),
  academic_year INTEGER,
  study_year SMALLINT,
  semester SMALLINT,
  ects SMALLINT,
  autonomous_hours SMALLINT,

  class_type JSON,
  teachers JSON,

  summary TEXT,
  objectives TEXT,
  course_content TEXT,
  methodologies TEXT,
  evaluation TEXT,
  bibliography TEXT,
  bibliography_extra TEXT
);

CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,

  custom_name VARCHAR(255),

  theme VARCHAR(6),
  color_scheme VARCHAR(6),
  school_theme VARCHAR(4),

  lesson_notifs INTEGER NOT NULL DEFAULT 10,
  task_notifs INTEGER NOT NULL DEFAULT 2,

  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  requests INTEGER NOT NULL DEFAULT 0
);