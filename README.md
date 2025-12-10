# WhatsApp Bot Admin Dashboard

A comprehensive management interface for the Geneline WhatsApp bridge, built with Next.js 16 and Supabase. This dashboard empowers administrators to monitor bot performance, manage escalations, and configure AI behavior in real-time.

## Features

### 📊 Real-time Analytics
- **Dashboard Overview**: Visualize key metrics including user engagement, message volume, and active sessions.
- **Bot Performance**: Monitor response times and intent accuracy.

### 👥 User & Interaction Management
- **Message Logs**: View complete conversation histories with advanced filtering capabilities.
- **Escalation Management**: Streamlined interface for handling cases that require human intervention.
- **Contacts & Users**: Manage the user database and WhatsApp contact details.

### 🤖 Bot Configuration
- **Bot Settings**: Configure system prompts, AI model parameters, and behavioral guidelines.
- **Health Topics**: Manage the knowledge base and intended topics for the health bot.
- **Training Data**: Tools for ingesting and managing data used to train the AI.

### 📢 Communication Tools
- **Broadcast System**: Send targeted mass messages to user segments.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Visualization**: [Recharts](https://recharts.org/)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jmsandi/whatsappbot-adminDashboard.git
   cd whatsappbot-adminDashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and configure your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/dashboard`: Contains all dashboard route pages and layouts.
- `components`: Reusable UI components (buttons, cards, dialogs, etc.).
- `lib`: Utility functions, API clients, and Supabase configuration.
- `public`: Static assets like images and icons.
- `scripts`: Database migration and seed scripts.

## License

This project is private and proprietary.
