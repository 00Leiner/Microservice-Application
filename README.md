# Microservice-Application
 Full-Stack Microservice Application with MongoDB and External API Integration

# Backend Development Setup

This is the Backend Development, part of the Microservice-Application project. It handles user registration, authentication, and CRUD operations.

## Project Location

This service is located at: 
```
Microservice-Application/backend/user

or

Microservice-Application/backend/userData/
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
