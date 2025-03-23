# QuizMaster Database Schema

> Auto-generated documentation created on 2025-03-23

## Tables Overview

This database contains the following tables:

- [users](#users)
- [quizzes](#quizzes)
- [questions](#questions)
- [question_possible_answers](#question_possible_answers)
- [submissions](#submissions)
- [user_answers](#user_answers)

## users

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id | string | |
| username | string | |
| email | string | |
| full_name | string | |
| created_at | datetime | |
| quizzes_taken | number | |
| average_score | number | |
| total_points | number | |
| rank | string | |
| email_notifications | boolean | |
| public_profile | boolean | |

### Relationships

- One user can have many submissions

## quizzes

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id | string | |
| title | string | |
| description | string | |
| difficulty | string | |
| category | unknown | |
| time_limit | number | |
| created_at | datetime | |
| updated_at | datetime | |
| total_questions | number | |
| total_points | number | |
| average_rating | number | |
| times_played | number | |

### Relationships

- One quiz can have many questions
- One quiz can have many submissions

## questions

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id | string | |
| quiz_id | string | |
| text | string | |
| type | string | |
| points | number | |
| correct_answer | string | |
| explanation | string | |
| order_num | number | |
| created_at | datetime | |

### Relationships

- Belongs to one quiz
- One question can have many possible answers
- One question can have many user answers

## question_possible_answers

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id | string | |
| question_id | string | |
| option_id | string | |
| text | string | |
| order_num | number | |

### Relationships

- Belongs to one question

## submissions

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id | string | |
| user_id | unknown | |
| quiz_id | string | |
| score | number | |
| total_possible | number | |
| time_spent | number | |
| completed_at | datetime | |
| created_at | datetime | |

### Relationships

- Belongs to one user
- Belongs to one quiz
- One submission can have many user answers

## user_answers

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| id | string | |
| submission_id | string | |
| question_id | string | |
| selected_option | string | |
| is_correct | boolean | |
| created_at | datetime | |

### Relationships

- Belongs to one submission
- References one question

## Notes

This documentation was generated automatically by querying the database structure. Some information, such as detailed descriptions and business logic, needs to be added manually.

Please consider enhancing this documentation with:

- More detailed column descriptions
- Examples of typical queries
- Information about indexes and constraints
- Business rules and validations
