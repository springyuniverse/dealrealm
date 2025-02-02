# DealRealm

DealRealm is an AI-powered sales training platform that helps sales professionals improve their pitching skills through realistic CEO interactions.

## Features

- Practice sales pitches with AI-powered CEO interactions
- Real-time feedback and performance analytics
- Customizable scenarios with different difficulty levels
- Success metrics tracking
- Admin dashboard for managing scenarios

## Tech Stack

- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- Firebase (Auth & Firestore)
- OpenAI GPT-4
- Shadcn UI Components

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# OpenAI
OPENAI_API_KEY=
```

## License

MIT
