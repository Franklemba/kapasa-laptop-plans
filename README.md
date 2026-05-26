# fiTech - Laptop Payment Plans

A modern web application for managing laptop payment plans with flexible installment options.

## Features

- **Client Portal**
  - Browse laptop catalog
  - Apply for payment plans
  - View payment history
  - Manage profile and settings
  - Track payment schedules

- **Admin Dashboard**
  - Manage clients and applications
  - Approve/reject payment plans
  - Record payments
  - Inventory management
  - Stock movement tracking
  - Comprehensive statistics

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Mobile:** Capacitor (iOS + Android)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase CLI

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd kapasa-laptop-plans

# Install dependencies
npm install

# Start Supabase local development
supabase start

# Run development server
npm run dev
```

### Database Setup

The database migrations are in `supabase/migrations/`. They will be automatically applied when you run `supabase start`.

### Environment Variables

Create a `.env.local` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   └── integrations/   # Third-party integrations
├── supabase/
│   └── migrations/     # Database migrations
├── public/             # Static assets
└── android/            # Android app (Capacitor)
└── ios/                # iOS app (Capacitor)
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Admin Access

To create an admin account:

1. Register a new account through the app
2. Run this SQL command:
   ```sql
   UPDATE clients SET role = 'admin' WHERE email = 'your@email.com';
   ```
3. Logout and login again

## Currency

All amounts are displayed in Zambian Kwacha (ZMK).

## License

Proprietary - All rights reserved

## Support

For support, email info@fitech.com
