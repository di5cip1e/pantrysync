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

Try the app instantly with our demo account (configurable via environment variables):
- **Email**: Configured via `EXPO_PUBLIC_DEMO_EMAIL` (default: demo@pantrysync.com)
- **Password**: Configured via `EXPO_PUBLIC_DEMO_PASSWORD` (default: demo123)

*Note: Demo mode can be disabled by setting `EXPO_PUBLIC_ENABLE_DEMO_MODE=false`*

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Navigation**: Expo Router
- **Styling**: React Native StyleSheet
- **Icons**: Lucide React Native

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Firebase project (for production use)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/di5cip1e/pantrysync.git
   cd pantrysync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your actual values
   nano .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the app**
   - Web: Open your browser to the URL shown in the terminal
   - Mobile: Use the Expo Go app to scan the QR code

### Environment Configuration

PantrySync uses environment variables for configuration. All variables use the `EXPO_PUBLIC_` prefix to make them available in the client-side code.

#### Required Variables

**Firebase Configuration** (Required for app functionality)
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com  
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

#### Optional Variables

**Demo Account Configuration**
```bash
EXPO_PUBLIC_DEMO_EMAIL=demo@pantrysync.com
EXPO_PUBLIC_DEMO_PASSWORD=demo123
EXPO_PUBLIC_ENABLE_DEMO_MODE=true
```

**API Configuration**
```bash
EXPO_PUBLIC_API_URL=https://api.pantrysync.com
EXPO_PUBLIC_API_KEY=your_api_key_here
```

**Environment Settings**
```bash
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_BUILD_TIMESTAMP=2025-06-30T11:24:30Z
```

**Feature Flags**
```bash
EXPO_PUBLIC_ENABLE_ANALYTICS=false
```

#### Setting up Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Enable Storage
5. Get your configuration from Project Settings > General > Your apps
6. Copy the configuration values to your `.env` file

#### Security Best Practices

⚠️ **Important Security Notes:**

- **Never commit `.env` files** - they are already in `.gitignore`
- **Use different Firebase projects** for development/staging/production
- **Rotate API keys regularly** in production environments
- **Demo credentials** should only be used in development
- **Environment variables** are visible in client code - don't put secrets here

For production deployments:
- Use environment-specific `.env` files
- Set variables in your hosting platform (Vercel, Netlify, etc.)
- Use Firebase Security Rules to protect data
- Enable Firebase App Check for additional security

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

**⚠️ Security Update**: Firebase credentials are now configured via environment variables instead of being hardcoded in the source code. See the Environment Configuration section above for setup instructions.

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