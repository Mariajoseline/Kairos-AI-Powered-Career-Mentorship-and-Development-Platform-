# Kairos AI-Powered Career Mentorship and Development Platform

A comprehensive platform for career mentorship and development powered by AI.

## Features

- User authentication and profile management
- Career development tracking
- AI-powered mentorship recommendations
- Skill assessment and development planning
- Secure and optimized backend architecture

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/Kairos-AI-Powered-Career-Mentorship-and-Development-Platform.git
   cd Kairos-AI-Powered-Career-Mentorship-and-Development-Platform
   ```

2. Install dependencies:
   ```
   npm run install-all
   ```

3. Configure the environment variables:
   - Copy the `.env.example` file to `.env` in the `Kairos_web/backend` directory
   - Update the database credentials and other settings as needed

4. Set up the database:
   - Create a MySQL database named `kairos_career`
   - The tables will be created automatically when you start the application

## Running the Application

### Windows

Simply double-click the `start-app.bat` file or run it from the command line:
```
start-app.bat
```

### Manual Start

1. Start the backend server:
   ```
   cd Kairos_web/backend
   npm run dev
   ```

2. Start the frontend (in a separate terminal):
   ```
   cd Kairos_web
   npm run dev
   ```

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/health` - Health check endpoint

## Security Features

- Rate limiting to prevent brute force attacks
- Helmet for secure HTTP headers
- CORS protection
- Input validation and sanitization
- Secure password handling

## Performance Optimizations

- Database query optimization with proper indexing
- Response compression
- Connection pooling
- Efficient error handling

## License

ISC 