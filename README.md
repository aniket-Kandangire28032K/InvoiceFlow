# InvoiceFlow

### Invoice & Client Management System

InvoiceFlow is a MERN Stack web application for managing clients and invoices. It allows users to manage client information, create itemized invoices, calculate invoice totals, and track invoice payment status.

## Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* Axios
* SCSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

## Project Structure

```text
InvoiceFlow/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   ├── package.json
│   ├── .env
│   └── ...
│
└── README.md
```

## Prerequisites

Before running the project, make sure the following are installed on your system:

* [Node.js](https://nodejs.org/)
* [MongoDB Compass](https://www.mongodb.com/products/tools/compass)
* Git

MongoDB Compass is used to connect to and view the MongoDB database.
## Environment Variables

InvoiceFlow uses separate environment variables for the frontend and backend.

### Backend Environment Variables

Create a `.env` file inside the `backend` folder:

```text
InvoiceFlow/
└── backend/
    └── .env
```

Add the following:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

* `PORT` - Port on which the backend server runs.
* `MONGO_URI` - MongoDB connection string.
* `JWT_SECRET` - Secret key used for JWT authentication.

### Frontend Environment Variables

Create a `.env` file inside the `frontend` folder:

```text
InvoiceFlow/
└── frontend/
    └── .env
```

Add the following:

```env
VITE_BACKEND_URL=http://localhost:5000
```

* `VITE_BACKEND_URL` - URL of the backend API.

### Important

The frontend does **not** require the `JWT_SECRET`. The JWT secret must remain on the backend and should never be exposed to the frontend.

Do not commit `.env` files, secrets, or credentials to the GitHub repository.

You can provide `.env.example` files containing the required variable names without exposing actual credentials.

## Installation

### 1. Clone the Repository

Clone the repository and open the project folder:

```bash
git clone <REPOSITORY_URL>
cd InvoiceFlow
```

Replace `<REPOSITORY_URL>` with the GitHub repository URL.

### 2. Install Dependencies

Install the dependencies for the backend:

```bash
cd backend
npm install
```

Then install the dependencies for the frontend:

```bash
cd ../frontend
npm install
```

## Environment Variables

Create a `.env` file inside the `backend` folder.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Do not commit the `.env` file to the repository.

## Database Setup

InvoiceFlow uses MongoDB for storing application data.

Make sure MongoDB is available and configure the MongoDB connection string in the backend `.env` file.

### Seed Dummy Data

The project includes a database seeding script that inserts sample/dummy data into the database.

From the `backend` folder, run:

```bash
npm run seed
```

This will create the required sample data so that the application can be tested without manually entering all the data.

> Make sure your MongoDB connection string is correctly configured in `.env` before running the seed command.

## Running the Application

The frontend and backend need to be run separately.

### Start Backend

Open a terminal:

```bash
cd backend
npm run dev
```

The backend server will start on the configured port.

### Start Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Vite will provide the local frontend URL in the terminal, usually:

```text
http://localhost:5173
```

Open the URL in your browser.

## Quick Setup

For a fresh setup, follow these steps:

```bash
git clone <REPOSITORY_URL>

cd InvoiceFlow

cd backend
npm install
npm run seed
npm run dev
```

In a second terminal:

```bash
cd InvoiceFlow/frontend
npm install
npm run dev
```

## Main Features

### Authentication

* User registration and login
* JWT-based authentication
* Protected application routes

### Client Management

* Add clients
* View clients
* Edit client information
* Delete clients
* Search clients

### Invoice Management

* Create invoices
* Add multiple invoice items
* Automatic calculation of invoice totals
* Tax and discount support
* Invoice number generation
* Invoice issue and due dates
* Invoice payment status
* Edit and delete invoices
* Search and filter invoices

### Dashboard

* Total invoices
* Total billed amount
* Total paid amount
* Outstanding amount
* Recent invoices
* Invoice status overview

## API

The backend provides RESTful APIs for authentication, clients, invoices, and related operations.

The frontend communicates with the backend using HTTP requests.

## Design & Development

The application follows a separate frontend/backend architecture:

```text
React Frontend
      │
      │ HTTP Requests
      ▼
Express.js API
      │
      ▼
MongoDB
```

The frontend is responsible for the user interface and user interactions, while the backend handles authentication, business logic, API requests, and database operations.

Invoice calculations are handled on the backend to prevent relying solely on totals sent from the browser.

## Known Limitations

* The application uses dummy/seed data for initial testing.
* Production deployment configuration is not included.
* Email functionality, if not configured, is not available in the local setup.


## Author

**Aniket Kandangire**

MERN Stack Developer
