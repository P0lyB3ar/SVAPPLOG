# SvAppLog

SvAppLog is a lightweight, customizable logging framework that allows you to manage logs, applications, and organizations through secure API endpoints. It is built using Node.js, Express, PostgreSQL, and JWT-based authentication.
Features

    Secure JWT-based API Key generation for users
    Organization and application management
    Customizable logging structure with support for predefined dictionaries
    API to create, read, and manage log entries
    Role-based access control for admins, users, and owners
    RESTful API with clear endpoints for application developers
    PostgreSQL as a persistent backend for logs, applications, and organizations

Prerequisites

Ensure you have the following installed on your system:

    Node.js v14 or later
    PostgreSQL 12 or later
    npm or yarn for managing dependencies

Installation

    Clone the repository:
```
git clone https://github.com/P0lyB3ar/SvAppLog.git
cd SvAppLog
```
Install the required dependencies:
```
npm install
```
Configure the environment variables:
```
Create a .env file in the root directory and add the following variables:


DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key
```
Set up the PostgreSQL database by running the provided setup script:
```

    ./setup_db.sh

    This script will create the database and tables required for the application.
```
Usage
```
1. Start the Server

To run the application locally, use the following command:

npm run dev

The api server will be available at http://localhost:3000
The frontend will be available are http://localhost:5173
```
2. API Endpoints
Authentication

    Generate API Key:
        GET /genapikey
        Requires a valid JWT token (generated through login). Returns a 30-day valid API key for the authenticated user.

Organization Management

    Create Organization:
        POST /create-organisation
        Requires user, admin, or owner role. Associates a new organization with the authenticated user.

    List Organizations:
        GET /list-organisations
        Returns the organizations associated with the authenticated user.

Application Management

    Create Application:
        POST /create-application
        Requires user, admin, or owner role. Associates a new application with the specified organization and user.

    List Applications:
        GET /list-applications
        Returns the applications associated with the authenticated user.

Logging
```
    Write Log Entry:
        POST /write
        Logs data for a specific application and organization. Requires valid headers (applicationSecret, organisationName, applicationName) and body data. The data structure should match predefined dictionary types.
```
```
    Read Logs:
        GET /read?logs=all&name={dictName}&sort={type}
        Reads logs from the database. Supports filtering by dictionary name and log type.
```
Dictionary Management
```
    Create Dictionary:
        POST /create-dictionary
        Requires admin or owner role. Creates a new dictionary with predefined log entry types.
```
```
    Fetch Dictionaries:
        GET /list-dictionaries
        Lists all available dictionaries.
```
```
    Fetch a Specific Dictionary:
        GET /dictionary/:name
        Fetches data for a specific dictionary by its name.
```
Database Schema
```
    Users: Manages user roles and organizations
    Applications: Stores application details, including organization and associated user
    Dictionaries: Stores predefined types of log structures
    Logs: Stores the actual log entries with references to dictionaries and applications
```
Example Usage
	Create an Organization:
```
curl -X POST http://localhost:3000/create-organisation \
-H "Authorization: Bearer <JWT_TOKEN>" \
-d '{"organisationName": "MyOrg"}'
```
Create an Application:

```

curl -X POST http://localhost:3000/create-application \
-H "Authorization: Bearer <JWT_TOKEN>" \
-d '{"applicationName": "MyApp", "organisationName": "MyOrg"}'
```
Write a Log Entry:
```

    curl -X POST http://localhost:3000/write \
    -H "applicationSecret: <APP_SECRET>" \
    -H "organisationName: MyOrg" \
    -H "applicationName: MyApp" \
    -d '{"logType": "info", "message": "This is a log message"}'
```


Contributing

Contributions are welcome! If you’d like to contribute to SvAppLog, feel free to fork the repository and submit a pull request.
```
    Fork the project
    Create your feature branch (git checkout -b feature/my-feature)
    Commit your changes (git commit -m 'Add my feature')
    Push to the branch (git push origin feature/my-feature)
    Open a pull request
```
