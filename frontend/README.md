# Hardware Lab Management System - Frontend

React-based frontend application for the Hardware Lab Management System.

## Getting Started

### Prerequisites
- Node.js 14+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

### Available Scripts

- `npm start` - Run the app in development mode
- `npm build` - Build the app for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App (one-way operation)

## Project Structure

```
frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── index.js           # Entry point
│   ├── App.js             # Main component with routing
│   ├── components/        # React components
│   │   ├── LoginPage.js
│   │   ├── MainPortal.js
│   │   ├── ProjectPage.js
│   │   └── HardwareInventoryPage.js
│   ├── services/          # API communication
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── projectService.js
│   │   └── hardwareService.js
│   └── utils/             # Utility functions
│       └── constants.js
└── package.json
```

## Features

- User authentication (login/register)
- Project management (create/join projects)
- Hardware inventory viewing
- Hardware checkout/check-in
- Responsive design

## API Integration

The frontend communicates with the Flask backend through RESTful APIs.
The proxy is configured in `package.json` to forward requests to `http://localhost:5000`.

## Technologies

- React 18
- React Router for navigation
- Axios for API calls
- CSS3 for styling
