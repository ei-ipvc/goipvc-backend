CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS course_units (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL,
  moodle_id INTEGER,

  name VARCHAR(255) NOT NULL,
  academic_year INTEGER NOT NULL,
  study_year SMALLINT NOT NULL,
  semester SMALLINT NOT NULL,
  ects SMALLINT NOT NULL,
  autonomous_hours SMALLINT NOT NULL,

  class_type JSON NOT NULL,
  teachers JSON NOT NULL,

  summary TEXT NOT NULL,
  objectives TEXT NOT NULL,
  course_content TEXT NOT NULL,
  methodologies TEXT NOT NULL,
  evaluation TEXT NOT NULL,
  bibliography TEXT NOT NULL,
  bibliography_extra TEXT NOT NULL,

  FOREIGN KEY (course_id) REFERENCES courses(id)
);