# Vibe Portfolio Tracker

A scalable full-stack investment tracker web app built with Next.js, specifically designed for New Zealand investors. Track managed funds, ETFs, and property investments with a beautiful, responsive interface.

## 🚀 Features

- **NZ-Specific Investments**: Support for popular NZ providers like Simplicity, Kernel, Smartshares
- **Investment Types**: Managed funds, ETFs (NZX-listed & international), and property
- **Authentication**: Firebase Auth with email/password and Google sign-in
- **Dashboard**: Real-time portfolio overview with net worth and asset allocation
- **Analytics**: Interactive charts showing portfolio performance over time
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Scalable Architecture**: SOLID principles with modular folder structure

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── investments/       # Investment management pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Button, Input, Card)
│   └── layout/           # Layout components
├── features/             # Feature-specific components (future expansion)
├── lib/                  # Utility functions and configurations
│   ├── constants.ts      # NZ investment providers and formatters
│   ├── firebase.ts       # Firebase configuration
│   ├── utils.ts          # General utilities
│   └── validations.ts    # Zod schemas
├── services/             # API services and business logic
│   ├── auth.ts           # Authentication service
│   ├── investments.ts    # Investment CRUD operations
│   └── portfolio.ts      # Portfolio analytics
└── types/                # TypeScript type definitions
```

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Firebase project with Firestore and Authentication enabled

### 1. Clone and Install

```bash
git clone <repository-url>
cd vibe-portfolio-tracker
npm install
```

### 2. Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication with Email/Password and Google providers
3. Create a Firestore database in production mode
4. Get your Firebase configuration from Project Settings

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Update `.env.local` with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Security Rules

Add these security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own investments
    match /investments/{investmentId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🎯 Usage

### Adding Investments

1. Sign up or sign in to your account
2. Click "Add Investment" from the dashboard
3. Select investment type (Managed Fund, ETF, or Property)
4. Choose from popular NZ providers or add custom ones
5. Enter investment details and value

### Dashboard Overview

- **Total Net Worth**: Combined value of all investments
- **Asset Allocation**: Visual breakdown by investment type
- **Recent Investments**: Latest additions to your portfolio
- **Quick Actions**: Fast access to common tasks

### Investment Management

- View all investments in a organized list
- Edit investment details and values
- Delete investments you no longer hold
- Filter by investment type or provider

## 🏗 Architecture & Design Patterns

### SOLID Principles

- **Single Responsibility**: Each service handles one domain (auth, investments, portfolio)
- **Open/Closed**: Components are extendable through props and composition
- **Liskov Substitution**: UI components follow consistent interfaces
- **Interface Segregation**: Type definitions are specific and focused
- **Dependency Inversion**: Services depend on abstractions, not concretions

### Scalability Features

- **Modular Structure**: Easy to add new features without breaking existing code
- **Type Safety**: Full TypeScript coverage prevents runtime errors
- **Reusable Components**: UI components can be shared across features
- **Separation of Concerns**: Business logic separated from UI components
- **Firebase Integration**: Scalable backend with real-time capabilities

## 🔮 Future Enhancements

- **React Native App**: Shared codebase structure ready for mobile app
- **Performance Tracking**: Historical price data and gain/loss calculations
- **Investment Categories**: Sub-categories like growth vs conservative funds
- **Goals & Targets**: Set and track investment goals
- **Data Export**: Export portfolio data to CSV/PDF
- **Notifications**: Email alerts for portfolio milestones
- **Advanced Analytics**: More detailed charts and insights

## 📱 Mobile & React Native Ready

The project structure is designed to support a future React Native application:

- Shared business logic in `services/` folder
- Reusable types in `types/` folder
- Platform-agnostic utilities in `lib/` folder
- Firebase services work across platforms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for New Zealand investors
- Inspired by the need for simple, effective portfolio tracking
- Uses modern web technologies for the best user experience