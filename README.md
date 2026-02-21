# Angular Library

This is a Library Management Application.

## Project Structure

```
src/
├── app/
│   ├── pages/
│   │   ├── layout/          # Main Layout With Sidebar
│   │   ├── login/           # Login Page
│   │   ├── dashboard/       # Dashboard
│   │   ├── books/           # Manage Books
│   │   ├── checkout/        # Manage Check-In/Out Books
│   │   ├── admin/           # Manage Admin
│   │   ├── settings/        # Application Settings
│   │   └── help/            # Help & FAQ
│   ├── shared/
│   │   ├── services/
│   │   │   ├── auth.service.ts     # Authentication service
│   │   │   └── book.service.ts     # Book data service
│   │   └── guards/
│   │       └── auth.guard.ts       # Route guard
│   ├── app.routes.ts        # Application routing
│   ├── app.config.ts        # Application config
│   └── app.component.ts     # Root component
└── styles.css               # Global styles
```

## Features

- **Login**: Secure authentication
- **Dashboard**: Dashboard data
- **Book**: Add books
- **Admin**: Manage users
- **Checkout**: Manage checkouts
- **Settings**: User preferences and account settings
- **Help**: FAQ and support information

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