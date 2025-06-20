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
3. Start the development server: `npm run dev`
4. Use the demo account or create a new account

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