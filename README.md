# Microservice-Application
 Full-Stack Microservice Application with MongoDB and External API Integration

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- Node.js (version 14.0.0 or later)
- npm (usually comes with Node.js)

# Backend Development Setup

This is the Backend Development, part of the Microservice-Application project. It handles user registration, authentication, and CRUD operations.

## Clone the repository:
   ```
   git clone https://github.com/00Leiner/Microservice-Application/backend/user
   cd app

   or 

   git clone https://github.com/00Leiner/Microservice-Application/backend/userData
   cd userData
   ```

## Environment Setup

Follow these steps to set up your development environment for the Backend Microservice:

1. **Navigate to the Backend Directory**

   Open a terminal and navigate to the backend directory:

   ```
   cd Microservice-Application/backend/user
   
   or
   
   cd Microservice-Application/backend/userData
   ```

2. **Install Dependencies**

   Install the required npm packages:

   ```
   npm install
   ```

3. **Set Up Environment Variables**

   Create a `.env` file in the `Microservice-Application/backend/user` or `Microservice-Application/backend/userData` directory:

   ```
   touch .env
   ```

   Add the following environment variables to the `.env` file:

   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=3000
   ```

   Replace `your_mongodb_connection_string` with your actual MongoDB connection string.

4. **Verify TypeScript Configuration**

   Ensure that the `tsconfig.json` file in the user microservice directory is correctly configured for your environment.

5. **Build the Project**

   Compile the TypeScript code:

   ```
   npm run build
   ```

6. **Run the Microservice**

   Start the user microservice:

   ```
   npm start
   ```

   For development with hot-reloading, you can use:

   ```
   npm run dev
   ```

7. **Verify the Service**

   The user microservice should now be running on `http://localhost:3000` (or the port you specified in the `.env` file). You can verify this by checking the console output. Make sure the two different project has a different port if running in the same device

## Next Steps

- Explore the `src` directory to understand the structure and functionality of the user microservice.
- Review and update the API endpoints in `src/routes/userRoute.ts` as needed.
- Check the `src/controllers/userController.ts` file to understand and modify user-related operations.
- Examine `src/models/userModel.ts` for the user data schema.

# Frontend Documentation Setup

This is the Frontend Development, part of the Microservice-Application project. This project is a React TypeScript application provide a basic user interface to interact with the backend microservices.

## Clone the repository:
   ```
   git clone https://github.com/00Leiner/Microservice-Application/frontend/app
   cd app
   ```

## Environment Setup

Follow these steps to set up your development environment for the Frontend:

1. **Navigate to the Frontend Directory**

   Open a terminal and navigate to the frontend directory:

   ```
   cd my-startup
   ```

2. **Install Dependencies**

   Install the required npm packages:

   ```
   npm install
   ```

3. **Verify TypeScript Configuration**

   Ensure that the `tsconfig.json` file in the project directory is correctly configured for your environment.

4. **Build the Project**

   Compile the TypeScript code:

   ```
   npm run build
   ```

5. **Run the Frontend Application**

   Start the frontend application:

   ```
   npm start
   ```

   This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

6. **Verify the Application**

   The frontend application should now be running on `http://localhost:3000`. You can verify this by opening the URL in your web browser.

## Project Structure

- `src/index.tsx`: The entry point of the application
- `src/App.tsx`: The main component that sets up routing
- `src/components/`: Contains React components (AuthPage, Dashboard)
- `src/context/`: Contains the AuthContext for state management
- `src/index.css`: Global styles for the application

## Available Scripts

In the project directory, you can run:

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App (one-way operation)

## Next Steps

- Explore the `src` directory to understand the structure and functionality of the frontend application.
- Review and update the components in `src/components/` as needed.
- Check the `src/context/AuthContext.tsx` file to understand and modify authentication-related operations.
- Examine `src/App.tsx` for the main application structure and routing.
