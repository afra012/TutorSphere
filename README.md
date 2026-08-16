# 🎓 TutorSphere

A database-driven web platform that directly connects students with qualified tutors without the need for middleman agencies.

TutorSphere provides a two-way platform where students can search for tutors, post their tutoring requirements, and hire suitable tutors. At the same time, tutors can showcase their qualifications and tutoring services, browse student requirements, and respond to suitable opportunities.

---

# 📌 Project Overview

TutorSphere is a **database-driven tutor hiring and management platform** designed to make the process of finding and hiring tutors easier, more transparent, secure, and accessible.

The platform supports a **two-way interaction system** between students and tutors.

### Students can:

* Search for tutors
* Filter tutors by subject and location
* View tutor profiles and qualifications
* Hire suitable tutors
* Create posts describing the type of tutor they are looking for
* Receive responses from suitable tutors
* Manage hire requests
* Rate and review tutors

### Tutors can:

* Create professional tutor profiles
* Add their qualifications and teaching experience
* Select subjects they can teach
* Specify their preferred location
* Create posts about their tutoring services
* Browse student requirement posts
* Respond to suitable student requirements
* Receive and manage hire requests
* Receive ratings and reviews

The system relies heavily on **relational database management** to efficiently manage user authentication, student and tutor profiles, subjects, locations, tutor posts, student requirements, hire requests, and ratings.

---

# 🎯 Project Objectives

* Connect students directly with qualified tutors.
* Eliminate unnecessary middleman agencies.
* Make the tutor hiring process easier and more transparent.
* Allow students to search for suitable tutors.
* Allow students to post their tutoring requirements.
* Allow tutors to showcase their qualifications and tutoring services.
* Allow tutors to browse student requirements.
* Provide subject and location-based filtering.
* Manage the tutor hiring process efficiently.
* Maintain ratings and reviews.
* Provide better earning opportunities for tutors.
* Maintain organized and reliable relational database records.

---

# 🚀 Application Flow

The following diagram represents the main system flow and interaction between students and tutors.

```text
                         TutorSphere
                              │
                ┌─────────────┴─────────────┐
                │                           │
             Student                      Tutor
                │                           │
         Register / Login           Register / Login
                │                           │
        ┌───────┴────────┐          ┌───────┴────────┐
        │                │          │                │
   Search Tutor     Post Requirement   Create Tutor   Browse Student
        │                │             Profile        Requirements
        │                │                │                │
   Filter by          Required          Create           View &
Subject & Location    Tutor Details    Tutor Post       Respond
        │                │                │                │
        └────────┬───────┘                └───────┬────────┘
                 │                                │
                 └────────── Matching ────────────┘
                              │
                         Hire Request
                              │
                     Accept / Reject
                              │
                       Tutoring Service
                              │
                        Rating & Review
```

---

# 👥 User Roles

## 👨‍🎓 Student

Students can:

* Register and login.
* Create and manage their profile.
* Search for tutors.
* Filter tutors by subject.
* Filter tutors by location.
* View tutor profiles.
* View tutor qualifications and experience.
* Send hire requests.
* Create tutor requirement posts.
* Specify required subject, location, qualification, experience, and other preferences.
* View responses from tutors.
* Manage their hire requests.
* Rate and review tutors.

---

## 👨‍🏫 Tutor

Tutors can:

* Register and login.
* Create and manage their tutor profile.
* Add educational qualifications.
* Add teaching experience.
* Select subjects they teach.
* Specify their preferred teaching location.
* Create tutor service posts.
* Browse student requirement posts.
* Respond to suitable student requirements.
* Receive hire requests.
* Accept or reject hire requests.
* Manage their tutoring services.
* Receive ratings and reviews from students.

---

## 👨‍💼 Admin

Admin can:

* Manage student accounts.
* Manage tutor accounts.
* Manage subjects.
* Manage locations.
* Monitor tutor posts.
* Monitor student requirement posts.
* Monitor hire requests.
* Manage ratings and reviews.
* Handle inappropriate or reported content.
* Maintain overall system security and data integrity.

---

# ⭐ Main Features

## 🔍 Tutor Search

Students can search for tutors based on:

* Subject
* Location
* Qualification
* Experience
* Teaching level
* Other relevant preferences

---

## 📢 Student Requirement Posts

Students can create posts when they are looking for a tutor.

A student can provide information such as:

* Required subject
* Educational level
* Preferred location
* Required qualification
* Preferred experience
* Other requirements

Tutors can browse these posts and respond if they are suitable.

---

## 👨‍🏫 Tutor Posts

Tutors can create posts to showcase their tutoring services and qualifications.

A tutor can provide:

* Educational qualification
* Subjects they teach
* Teaching experience
* Teaching level
* Preferred location
* Tutoring services
* Other relevant information

Students can browse tutor posts and hire suitable tutors.

---

## 📩 Hire Request Management

The system supports direct hiring between students and tutors.

### Student → Tutor

```text
Student
   ↓
View Tutor
   ↓
Send Hire Request
   ↓
Tutor
   ↓
Accept / Reject
```

### Student Requirement → Tutor

```text
Student
   ↓
Create Requirement Post
   ↓
Tutor Views Requirement
   ↓
Tutor Responds
   ↓
Student
   ↓
Hire Tutor
```

---

## ⭐ Ratings & Reviews

After receiving tutoring services, students can provide ratings and reviews for tutors.

Ratings and reviews help:

* Build tutor reputation.
* Increase transparency.
* Help students make better decisions.
* Maintain tutoring service quality.

---

## 🔐 User Authentication

The system provides registration and login functionality for:

* Students
* Tutors
* Administrators

Authentication helps protect user accounts and system data.

---

# 📂 Project Structure

TutorSphere is developed as a **single Laravel application**. The backend and frontend are organized within the Laravel project rather than being separated into different frontend and backend projects.

```text
TutorSphere/
│
├── app/                  ← Laravel Backend
├── resources/
│   └── views/            ← Blade Frontend
├── routes/
├── database/
├── public/
└── README.md
```
---

# 🛠️ Technology Stack

## Database

* Microsoft SQL Server
* SQL Server Management Studio (SSMS)

## Backend

* PHP
* Laravel Framework
* MVC Architecture

## Frontend

* Laravel Blade
* Bootstrap
* HTML
* CSS
* JavaScript

## Development Tools

* Visual Studio Code
* Git
* GitHub

## Local Development

* XAMPP or WAMP
* Apache
* PHP

## Optional Development Environment

* Laravel Sail
* Docker

---

# ⚙️ Backend & Application Setup

The application is developed using the **Laravel Framework**.

## Requirements

* PHP 8.2+
* Composer
* Laravel
* Microsoft SQL Server
* SQL Server Management Studio (SSMS)
* XAMPP or WAMP
* Visual Studio Code

---

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/TutorSphere.git
```

Navigate to the project directory:

```bash
cd TutorSphere
```

Install Laravel dependencies:

```bash
composer install
```

Create the environment file:

```bash
cp .env.example .env
```

Generate the Laravel application key:

```bash
php artisan key:generate
```

---

# 🗄️ Database Configuration

TutorSphere uses **Microsoft SQL Server** as the relational database management system.

Configure the database information inside the `.env` file.

Example:

```env
DB_CONNECTION=sqlsrv
DB_HOST=127.0.0.1
DB_PORT=1433
DB_DATABASE=tutorsphere
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

> Database credentials should never be committed to GitHub.

After configuring the database, run:

```bash
php artisan migrate
```

Start the Laravel development server:

```bash
php artisan serve
```

---

# 🗃️ Database Structure

TutorSphere uses a **relational database model** to organize and manage system data.

## User Management

* Users
* Student Profiles
* Tutor Profiles
* Admin

## Tutor Management

* Subjects
* Locations
* Qualifications
* Tutor Posts

## Student Requirement Management

* Student Requirements

## Hiring Management

* Hire Requests
* Request Status

## Engagement

* Ratings
* Reviews

---

# 🔗 Database Relationships

The planned database relationships include:

* One user can have one student profile.
* One user can have one tutor profile.
* One tutor can teach many subjects.
* One subject can be taught by many tutors.
* One tutor can create many tutor posts.
* One student can create many requirement posts.
* One student can send many hire requests.
* One tutor can receive many hire requests.
* One tutor can receive many ratings and reviews.
* One student can create many ratings and reviews.
* One subject can be associated with many student requirements.
* One location can be associated with many tutors.
* One location can be associated with many student requirements.

---

# 🌐 System Route Plan

## Authentication

| Method | Route       |
| ------ | ----------- |
| GET    | `/register` |
| POST   | `/register` |
| GET    | `/login`    |
| POST   | `/login`    |
| POST   | `/logout`   |

## Tutors

| Method | Route               |
| ------ | ------------------- |
| GET    | `/tutors`           |
| GET    | `/tutors/{id}`      |
| GET    | `/tutors/create`    |
| POST   | `/tutors`           |
| GET    | `/tutors/{id}/edit` |
| PUT    | `/tutors/{id}`      |

## Tutor Posts

| Method | Route                 |
| ------ | --------------------- |
| GET    | `/tutor-posts`        |
| GET    | `/tutor-posts/create` |
| POST   | `/tutor-posts`        |
| GET    | `/tutor-posts/{id}`   |
| PUT    | `/tutor-posts/{id}`   |
| DELETE | `/tutor-posts/{id}`   |

## Student Requirements

| Method | Route                  |
| ------ | ---------------------- |
| GET    | `/requirements`        |
| GET    | `/requirements/create` |
| POST   | `/requirements`        |
| GET    | `/requirements/{id}`   |
| PUT    | `/requirements/{id}`   |
| DELETE | `/requirements/{id}`   |

## Hire Requests

| Method | Route                 |
| ------ | --------------------- |
| GET    | `/hire-requests`      |
| POST   | `/hire-requests`      |
| GET    | `/hire-requests/{id}` |
| PUT    | `/hire-requests/{id}` |

## Ratings & Reviews

| Method | Route           |
| ------ | --------------- |
| GET    | `/reviews`      |
| POST   | `/reviews`      |
| PUT    | `/reviews/{id}` |
| DELETE | `/reviews/{id}` |

> Routes are planned and may be updated during development.

---

# 📢 Post Management

TutorSphere supports two main types of posts.

## Tutor Service Post

Tutors can create posts containing:

* Qualifications
* Subjects
* Teaching experience
* Teaching level
* Preferred location
* Tutoring services
* Other relevant information

Students can browse these posts and hire suitable tutors.

## Student Requirement Post

Students can create posts containing:

* Required subject
* Educational level
* Preferred location
* Required qualification
* Preferred experience
* Other requirements

Tutors can browse these posts and respond to suitable requirements.

---

# 🔎 Search & Filtering

TutorSphere will provide search and filtering functionality based on:

* Subject
* Location
* Qualification
* Experience
* Teaching level
* Other relevant preferences

Students can use these filters to find suitable tutors.

Tutors can also browse student requirement posts and identify opportunities that match their qualifications and teaching preferences.

---

# 🧪 Database Development Status

Planned database components include:

* Users table
* Student Profiles table
* Tutor Profiles table
* Subjects table
* Locations table
* Qualifications table
* Tutor Posts table
* Student Requirements table
* Hire Requests table
* Ratings table
* Reviews table

The database schema, tables, relationships, constraints, and sample data will be implemented gradually as the project progresses.

---

# 🚧 Project Status

**Status: Under Development**

Current development areas include:

* Database design
* User authentication
* Student management
* Tutor management
* Tutor posts
* Student requirement posts
* Search and filtering
* Hire request management
* Rating and review system
* Admin management

Features will be implemented and integrated gradually.

---

# 🔮 Future Enhancements

Possible future improvements include:

* Online payment system
* Real-time chat between students and tutors
* Notification system
* Tutor availability scheduling
* Advanced tutor recommendation
* Location-based tutor matching
* Improved admin dashboard
* Mobile application support

---

# 🤝 Contribution

1. Clone the repository.

```bash
git clone https://github.com/your-username/TutorSphere.git
```

2. Create a feature branch.

```bash
git checkout -b feature/your-feature-name
```

3. Make your changes.

4. Add and commit your changes.

```bash
git add .
git commit -m "Add feature"
```

5. Push the branch.

```bash
git push origin feature/your-feature-name
```

6. Create a Pull Request.

7. After review and approval, merge the Pull Request into the `main` branch.

---

# 📜 License

This project is developed for academic purposes.
