# VocApp - Word Learning Flashcard App

A mobile-friendly web application for creating and studying flashcard sets to learn new words. Built with Next.js, TailwindCSS, and Firebase.

## Features

- 📚 Create custom flashcard sets
- 🧠 Study mode with flip cards
- 🔐 User authentication with Firebase
- 💾 Cloud storage with Firestore
- 📱 Mobile-responsive design
- 🎨 Minimalist UI with custom color palette

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: TailwindCSS
- **Authentication & Database**: Firebase (Auth + Firestore)
- **Color Palette**: #00030D, #0C1526, #58748C, #4F6273, #B8CAD9

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project

### Setup

1. Clone the repository:
```bash
git clone https://github.com/AleksandrBorkun/vocapp.git
cd vocapp
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)

4. Enable Firebase Authentication (Email/Password) and Firestore Database

5. Copy `.env.example` to `.env.local` and add your Firebase configuration:
```bash
cp .env.example .env.local
```

6. Update `.env.local` with your Firebase credentials:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

7. Run the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Landing Page**: View the app features and sign up
2. **Login/Signup**: Create an account or sign in
3. **Home Dashboard**: Create and manage your flashcard sets
4. **Study Mode**: Practice your cards with the flip card interface

## Firebase Setup

### Firestore Rules

Add these security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cardSets/{cardSet} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

## Building for Production

```bash
npm run build
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
