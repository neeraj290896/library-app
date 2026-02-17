# Angular Library

This is a Library Management Application.

## Project Structure

```
src/
├── app/
│   ├── pages/
│   │   ├── layout/          # Main layout with sidebar
│   │   ├── login/           # Login page
│   │   ├── dashboard/       # Dashboard with statistics
│   │   ├── members/         # Members management
│   │   ├── add-books/       # Add new books
│   │   ├── checkout-books/  # Book checkout
│   │   ├── staff/           # Staff management
│   │   ├── settings/        # Application settings
│   │   └── help/            # Help & FAQ
│   ├── shared/
│   │   ├── services/
│   │   │   ├── auth.service.ts     # Authentication service
│   │   │   ├── book.service.ts     # Book data service
│   │   │   └── auth.guard.ts       # Route guard
│   │   └── utils/
│   │       └── primeng-import.ts   # Primeng Imports
│   ├── app.routes.ts        # Application routing
│   ├── app.config.ts        # Application config
│   └── app.component.ts     # Root component
└── styles.css               # Global styles
```

## Features

- **Login Page**: Secure authentication with demo credentials
- **Dashboard**: Real-time statistics and charts
- **Members Management**: View and manage library members
- **Book Management**: Add new books and manage checkouts
- **Staff Management**: Manage library staff (Librarian only)
- **Settings**: User preferences and account settings
- **Help Section**: FAQ and support information

## Demo Credentials

- **Librarian**: username: `librarian`, password: `librarian123`
- **Assistant**: username: `assistant`, password: `assistant123`

## Setup Instructions

1. Navigate to the project directory:
   ```
   cd Library-App
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:4200`

## Build for Production

```
npm run build
```