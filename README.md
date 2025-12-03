# Project Mock Test Platform v1.0.0

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [How Each Technology is Used](#how-each-technology-is-used)
- [Contributing](#contributing)
- [License](#license)

## Introduction
The **Project Mock Test Platform** is a comprehensive web application designed to facilitate online mock tests. It provides features for users to take exams, view leaderboards, and manage their profiles. Admins can manage exams, questions, and view reports.

## Features
- User authentication and profile management.
- Admin dashboard for managing exams, questions, and reports.
- Leaderboard to display top-performing users.
- Payment integration for premium features.
- Responsive design for seamless usage across devices.
- Study mode with flashcards and spaced repetition.
- Analytics dashboard for performance tracking.

## Technologies Used
- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **State Management**: Redux
- **Styling**: CSS
- **Authentication**: JSON Web Tokens (JWT)
- **Payment Integration**: Stripe API

## Folder Structure
```
LICENSE
package.json
Procfile
README.md
client/
    package.json
    public/
        favicon.ico
        index.html
    src/
        apicalls/
        components/
        contexts/
        hooks/
        pages/
        redux/
        stylesheets/
server/
    server.js
    config/
    middlewares/
    models/
    routes/
```

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd Project-MOCK-TEST-PLATFORM-V-1.0.0
   ```
3. Install backend/shared dependencies from the project root:
   ```bash
   npm install
   ```
4. Install frontend dependencies:
   ```bash
   npm install --prefix client
   ```

## Configuration
1. Copy the provided environment templates and fill in real secrets:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```
2. In `server/.env`, supply your MongoDB connection string(s), JWT secret, email credentials, and deployment-specific options such as `ALLOWED_ORIGINS` and `RATE_LIMIT_MAX_REQUESTS`.
3. In `client/.env`, set `REACT_APP_API_BASE_URL` to the URL where the backend is reachable.

## Usage
1. Start both client and server in development (concurrently):
   ```bash
   npm run dev
   ```
2. To run only the backend server (production-equivalent):
   ```bash
   npm start
   ```
3. To run just the React client:
   ```bash
   npm start --prefix client
   ```
4. Open your browser and navigate to the port specified for the client (default `http://localhost:3001`).

## API Endpoints
### User Routes
- `POST /api/users/register`: Register a new user.
- `POST /api/users/login`: Login a user.

### Exam Routes
- `GET /api/exams`: Fetch all exams.
- `POST /api/exams`: Create a new exam (Admin only).

### Leaderboard Routes
- `GET /api/leaderboard`: Fetch leaderboard data.

### Payment Routes
- `POST /api/payments`: Process a payment.

### Report Routes
- `GET /api/reports`: Fetch reports (Admin only).

## How Each Technology is Used
### Frontend (React.js)
- React is used to build the user interface, including components like forms, dashboards, and leaderboards.
- React Router is used for navigation between pages.
- Axios is used for making API calls to the backend.

### Backend (Node.js, Express.js)
- Node.js serves as the runtime environment for the backend.
- Express.js is used to create RESTful APIs for user authentication, exam management, and leaderboard data.

### Database (MongoDB)
- MongoDB is used to store user data, exam details, leaderboard scores, and payment records.
- Mongoose is used as the ODM (Object Data Modeling) library for MongoDB.

### State Management (Redux)
- Redux is used to manage the global state of the application, such as user authentication status and exam data.

### Styling (CSS)
- Custom CSS files are used for styling components and pages.
- Responsive design is implemented using media queries.

### Authentication (JWT)
- JSON Web Tokens (JWT) are used for secure user authentication and session management.

### Payment Integration (Stripe API)
- Stripe API is used to handle payment processing for premium features.

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push to your fork.
4. Submit a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.