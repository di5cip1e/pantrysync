# PantrySync

A modern household pantry management app built with Expo and Firebase.

## Features

✨ **Real-time Pantry Management**
- Add, edit, and track pantry items
- Low stock alerts and expiry notifications
- AI-powered inventory capture (coming soon)

🏠 **Household Collaboration**
- Multi-user household support
- Role-based permissions (admin/member)
- Real-time synchronization across devices

🛒 **Smart Shopping Lists**
- Collaborative shopping lists
- Item assignment and completion tracking
- Integration with pantry inventory

📊 **Activity Tracking**
- Real-time activity feed
- Household member actions
- Usage analytics and insights

## Demo Account

Try the app instantly with our demo account:
- **Email**: demo@pantrysync.com
- **Password**: demo123

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Navigation**: Expo Router
- **Styling**: React Native StyleSheet
- **Icons**: Lucide React Native

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. **Set up environment variables:**
   - Copy `.env.example` to `.env`: `cp .env.example .env`
   - Update `.env` with your Firebase project configuration (see [Environment Setup](#environment-setup) below)
4. Start the development server: `npm run dev`
5. Use the demo account or create a new account

### Environment Setup

**IMPORTANT**: The app requires Firebase configuration to function properly. Follow these steps:

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com/)
2. **Enable Authentication** with Email/Password provider
3. **Create a Firestore database** with the provided security rules
4. **Enable Storage** for image uploads
5. **Deploy Firestore rules** from `firestore.rules`
6. **Deploy Storage rules** from `storage.rules`
4. **Copy your Firebase config** from Project Settings > General > Your apps
5. **Update your `.env` file** with the Firebase configuration values:

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your Firebase project values
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

⚠️ **Critical Setup Notes**: 
- Never commit your `.env` file to version control
- The app will not work without proper Firebase configuration
- Use the demo account (demo@pantrysync.com / demo123) only after setting up Firebase
- Deploy the security rules to Firebase before using the app

### Firebase Setup Commands

After configuring your Firebase project:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules  
firebase deploy --only storage
```

## Project Structure

```
app/
├── _layout.tsx          # Root layout with providers
├── index.tsx            # Landing/loading screen
├── auth/                # Authentication screens
├── (tabs)/              # Main app tabs
│   ├── index.tsx        # Pantry management
│   ├── shopping.tsx     # Shopping lists
│   ├── household.tsx    # Household management
│   └── activity.tsx     # Activity feed
└── household-setup/     # Household creation/joining

components/              # Reusable components
contexts/               # React contexts (Auth, Household)
services/               # Firebase services
types/                  # TypeScript type definitions
```

## Firebase Configuration

The app uses Firebase for:
- **Authentication**: Email/password auth
- **Firestore**: Real-time database
- **Storage**: Image uploads
- **Security Rules**: Proper data access control

## Development

- **Platform**: Web-first with React Native Web
- **Hot Reload**: Enabled for fast development
- **TypeScript**: Full type safety
- **ESLint**: Code quality and consistency

## Deployment

The app can be deployed to:
- **Web**: Firebase Hosting
- **Mobile**: Expo Application Services (EAS)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details