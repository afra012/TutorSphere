# 🎓 TutorSphere

A database-driven web platform that directly connects students with qualified tutors without the need for middleman agencies.

TutorSphere provides a two-way platform where students can search for tutors, post their tutoring requirements, and hire suitable tutors. At the same time, tutors can showcase their qualifications and tutoring services, browse student requirements, and respond to suitable opportunities.

---

# 📌 Project Overview

TutorSphere is a **database-driven tutor hiring and management platform** designed to make the process of finding and hiring tutors easier, more transparent, secure, and accessible.

The platform supports a **two-way interaction system** between students and tutors.

### 👨‍🎓 Students can:

- Register and login
- Create and manage their profile
- Search for tutors
- Filter tutors by subject, location, qualification, and experience
- View tutor profiles and qualifications
- View tutor service posts
- Post tutoring requirements
- Send hire requests to tutors
- Hire suitable tutors
- Manage hiring requests
- Give ratings and reviews

### 👨‍🏫 Tutors can:

- Register and login
- Create and manage their tutor profile
- Add educational qualifications
- Add subjects they can teach
- Add teaching experience
- Add preferred teaching locations
- Create tutor service posts
- Browse student requirement posts
- Respond to suitable student requirements
- Accept or reject hire requests
- Manage tutoring activities
- Receive ratings and reviews

### 👨‍💼 Admin can:

- Manage student accounts
- Manage tutor accounts
- Manage subjects
- Manage locations
- Monitor tutor posts
- Monitor student requirement posts
- Monitor hire requests
- Manage ratings and reviews
- Handle inappropriate or reported content
- Maintain overall system security and data integrity

---

# 🚀 Application Flow

The following flow represents the main system interaction between students, tutors, and the platform.

```text
                              TutorSphere
                                   │
                 ┌─────────────────┴─────────────────┐
                 │                                   │
              Student                              Tutor
                 │                                   │
          Register / Login                   Register / Login
                 │                                   │
        ┌────────┴────────┐                 ┌────────┴────────┐
        │                 │                 │                 │
   Search Tutors    Post Requirement   Create Tutor Post   Browse Student
        │                 │                 │              Requirements
        │                 │                 │                 │
   Filter by         Required Tutor     Qualifications    View & Respond
 Subject, Location      Details         Subjects, etc.     to Requirements
        │                 │                 │                 │
        └────────┬────────┘                 └────────┬────────┘
                 │                                   │
                 └───────────────┬───────────────────┘
                                 │
                         Hire Request / Response
                                 │
                                 ▼
                         Accept / Reject
                                 │
                                 ▼
                               Hire
                                 │
                                 ▼
                          Rating & Review
```

---

# ⭐ Main Features

## 🔍 Tutor Search

Students can search for tutors based on:

- Subject
- Location
- Qualification
- Experience
- Teaching level
- Other relevant preferences

---

## 📢 Student Requirement Posts

Students can create posts when they are looking for a tutor.

A student can provide information such as:

- Required subject
- Educational level
- Preferred location
- Required qualification
- Preferred experience
- Other requirements

Tutors can browse these posts and respond if they are suitable.

---

## 👨‍🏫 Tutor Service Posts

Tutors can create posts to showcase their tutoring services and qualifications.

A tutor can provide:

- Educational qualification
- Subjects they teach
- Teaching experience
- Teaching level
- Preferred location
- Tutoring services
- Other relevant information

Students can browse tutor posts and hire suitable tutors.

---

# 📩 Hire Request Management

The system supports direct hiring between students and tutors.

### Student → Tutor

```text
Student
   ↓
Search / View Tutor
   ↓
View Tutor Profile
   ↓
Send Hire Request
   ↓
Tutor
   ↓
Accept / Reject
   ↓
Hire
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

# ⭐ Ratings & Reviews

After receiving tutoring services, students can provide ratings and reviews for tutors.

Ratings and reviews help to:

- Build tutor reputation
- Increase transparency
- Help students make better decisions
- Maintain tutoring service quality

---

# 🔐 User Authentication

The system provides registration and login functionality for:

- Students
- Tutors
- Administrators

Authentication helps protect user accounts and system data.

---

# 📂 Project Structure

TutorSphere uses a **separate frontend and backend architecture**.

The frontend and backend are maintained in separate folders within the same GitHub repository.

```text
TutorSphere/
│
├── frontend/          
├── backend/           
├── README.md
└── .gitignore
```

### Frontend

The frontend is developed separately using **React.js with Vite**.

It is responsible for:

- User interface
- Pages
- Components
- Forms
- Navigation
- Search and filtering
- Student dashboard
- Tutor dashboard
- API communication

### Backend

The backend is developed separately using **PHP Laravel Framework**.

It is responsible for:

- REST APIs
- Authentication
- Database operations
- Business logic
- Validation
- User management
- Tutor management
- Requirement management
- Hire request management
- Ratings and reviews

---

# 🛠️ Technology Stack

## Frontend

- React.js
- Vite
- JavaScript
- HTML
- CSS
- Bootstrap
- Axios

## Backend

- PHP
- Laravel Framework
- Laravel REST API
- MVC Architecture

## Database

- MySQL
- MySQL Workbench

## Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman

## Local Development Environment

- XAMPP
- Apache
- PHP
- MySQL

---

# 🔌 System Architecture

TutorSphere follows a separate frontend-backend architecture.

```text
┌──────────────────────┐
│   React Frontend     │
│      + Vite          │
└──────────┬───────────┘
           │
           │ HTTP / REST API
           │
           ▼
┌──────────────────────┐
│   Laravel Backend    │
│      REST API        │
└──────────┬───────────┘
           │
           │ Database Queries
           │
           ▼
┌──────────────────────┐
│    MySQL Database    │
└──────────────────────┘
```

The React frontend communicates with the Laravel backend through REST APIs.

Axios will be used in the React frontend to send HTTP requests to the Laravel API.

---

# ⚙️ Backend Setup

The backend is developed using Laravel and is located inside the `backend` folder.

## Requirements

- PHP 8.2+
- Composer
- Laravel
- MySQL
- XAMPP

## Create Laravel Backend

From the project root directory:

```bash
composer create-project laravel/laravel backend
```

Navigate to the backend folder:

```bash
cd backend
```

Generate the Laravel application key:

```bash
php artisan key:generate
```

Configure the MySQL database information in the `.env` file.

Start the Laravel development server:

```bash
php artisan serve
```

---

# 💻 Frontend Setup

The frontend is developed using React.js with Vite and is located inside the `frontend` folder.

## Requirements

- Node.js
- npm

## Create React Frontend

From the project root directory:

```bash
npm create vite@latest frontend -- --template react
```

Navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Install Axios:

```bash
npm install axios
```

Install Bootstrap:

```bash
npm install bootstrap
```

Start the React development server:

```bash
npm run dev
```

---

# 🗄️ Database Configuration

TutorSphere uses **MySQL** as the relational database management system.

Start MySQL from XAMPP and create a database named:

```text
tutorsphere
```

Configure the database information inside the Laravel `.env` file.

Example:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tutorsphere
DB_USERNAME=root
DB_PASSWORD=
```

> Database credentials should never be committed to GitHub.

After configuring the database, run:

```bash
php artisan migrate
```

---

# 🗃️ Database Structure

TutorSphere uses a relational database model to organize and manage system data.

## User Management

- Users
- Roles
- Student Profiles
- Tutor Profiles

## Tutor Management

- Subjects
- Locations
- Qualifications
- Tutor Experience
- Tutor Posts

## Student Requirement Management

- Student Requirements
- Requirement Subjects
- Preferred Locations

## Hiring Management

- Hire Requests
- Request Status

## Engagement

- Ratings
- Reviews

---

# 🔗 Database Relationships

The planned database relationships include:

- One Role can have many Users
- One User belongs to one Role
- One Student has one Student Profile
- One Tutor has one Tutor Profile
- One Tutor can have many Qualifications
- One Tutor can have many Subjects
- One Subject can be associated with many Tutors
- One Tutor can create many Tutor Posts
- One Student can create many Student Requirement Posts
- One Student Requirement belongs to one Student
- One Tutor can receive many Hire Requests
- One Student can send many Hire Requests
- One Hire Request belongs to one Student
- One Hire Request belongs to one Tutor
- One Tutor can receive many Reviews
- One Student can write many Reviews

Many-to-many relationships will be handled using appropriate intermediate or pivot tables.

---

# 🌐 API Route Plan

The Laravel backend will provide REST API endpoints for communication with the React frontend.

## Authentication

| Method | Route |
|--------|-------|
| POST | `/api/register` |
| POST | `/api/login` |
| POST | `/api/logout` |
| GET | `/api/profile` |

## Tutors

| Method | Route |
|--------|-------|
| GET | `/api/tutors` |
| POST | `/api/tutors` |
| GET | `/api/tutors/{id}` |
| PUT | `/api/tutors/{id}` |
| DELETE | `/api/tutors/{id}` |

## Tutor Posts

| Method | Route |
|--------|-------|
| GET | `/api/tutor-posts` |
| POST | `/api/tutor-posts` |
| GET | `/api/tutor-posts/{id}` |
| PUT | `/api/tutor-posts/{id}` |
| DELETE | `/api/tutor-posts/{id}` |

## Student Requirements

| Method | Route |
|--------|-------|
| GET | `/api/requirements` |
| POST | `/api/requirements` |
| GET | `/api/requirements/{id}` |
| PUT | `/api/requirements/{id}` |
| DELETE | `/api/requirements/{id}` |

## Hire Requests

| Method | Route |
|--------|-------|
| GET | `/api/hire-requests` |
| POST | `/api/hire-requests` |
| GET | `/api/hire-requests/{id}` |
| PUT | `/api/hire-requests/{id}` |

## Ratings & Reviews

| Method | Route |
|--------|-------|
| GET | `/api/reviews` |
| POST | `/api/reviews` |
| PUT | `/api/reviews/{id}` |
| DELETE | `/api/reviews/{id}` |

> API routes are planned and may be updated during development.

---

# 📢 Post Management

TutorSphere supports two main types of posts.

## 👨‍🏫 Tutor Service Post

Tutors can create posts containing:

- Qualifications
- Subjects
- Teaching experience
- Teaching level
- Preferred location
- Tutoring services
- Other relevant information

Students can browse these posts and hire suitable tutors.

## 👨‍🎓 Student Requirement Post

Students can create posts containing:

- Required subject
- Educational level
- Preferred location
- Required qualification
- Preferred experience
- Other requirements

Tutors can browse these posts and respond to suitable requirements.

---

# 🔎 Search & Filtering

TutorSphere will provide search and filtering functionality based on:

- Subject
- Location
- Qualification
- Experience
- Teaching level
- Other relevant preferences

Students can use these filters to find suitable tutors.

Tutors can also browse student requirement posts and identify opportunities that match their qualifications and teaching preferences.

---

# 🧪 Database Development Status

Planned database components include:

- Users table
- Roles table
- Student Profiles table
- Tutor Profiles table
- Subjects table
- Locations table
- Qualifications table
- Tutor Experience table
- Tutor Posts table
- Student Requirements table
- Hire Requests table
- Ratings table
- Reviews table

The database schema, tables, relationships, constraints, and sample data will be implemented gradually as the project progresses.

---

# 📁 Development Structure

The project is divided into two main development areas.

## Frontend Development

Frontend development will focus on:

- React components
- User interface
- Pages
- Navigation
- Forms
- Search and filtering UI
- Student dashboard
- Tutor dashboard
- Admin dashboard
- API integration

## Backend Development

Backend development will focus on:

- Laravel setup
- Database design
- Migrations
- Models
- Controllers
- API routes
- Authentication
- Business logic
- Validation
- API integration

---

# 🚧 Project Status

**Status: Under Development**

Current development areas include:

- Database design
- User authentication
- Student management
- Tutor management
- Tutor service posts
- Student requirement posts
- Search and filtering
- Hire request management
- Rating and review system
- Admin management
- React frontend
- Laravel REST API

Features will be implemented and integrated gradually.

---

# 🔮 Future Enhancements

Possible future improvements include:

- Online payment system
- Real-time chat between students and tutors
- Notification system
- Tutor availability scheduling
- Advanced tutor recommendation
- Location-based tutor matching
- Improved admin dashboard
- Mobile application support

---

# 🤝 Contribution

1. Clone the repository:

```bash
git clone https://github.com/afra012/TutorSphere.git
```

2. Navigate to the project directory:

```bash
cd TutorSphere
```

3. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

4. Make your changes.

5. Add and commit your changes:

```bash
git add .
git commit -m "Add feature"
```

6. Push the branch:

```bash
git push origin feature/your-feature-name
```

7. Create a Pull Request on GitHub.

8. After review and approval, merge the Pull Request into the `main` branch.

---

# 📜 License

This project is developed for academic purposes.
