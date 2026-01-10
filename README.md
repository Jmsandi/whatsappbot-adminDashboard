# 🏥 Kai Health: Admin Command Center

A high-performance, premium management interface for the Kai WhatsApp Health Bridge. Built with **Next.js 16**, **Tailwind CSS 4**, and **Supabase**, this dashboard provides real-time epidemiological intelligence and emergency escalation management for Sierra Leone's public health network.

**Live Deployment:** [https://admin-dashboard-omega-jade-64.vercel.app/](https://admin-dashboard-omega-jade-64.vercel.app/)

### � Critical Escalation Pipeline
- **Live Alert Queue**: Instant notifications for high-risk symptoms (Meningitis, Severe Malaria, etc.) detected by Kai.
- **Clinician Takeover**: Direct interface for health workers to respond to patients via the bot.
- **Audit Trails**: Full conversation summaries with AI thought-process logging.

### 📊 Real-time Epidemiological Intelligence
- **Symptom Clustering**: Visualize disease outbreaks across districts in real-time.
- **Engagement Metrics**: Track user retention, message volume, and intent accuracy.
- **Interactive Data**: Beautifully rendered charts using Recharts with 10-second live refreshes.

### 🎨 Premium Design System
- **Glassmorphism UI**: Modern frosted glass aesthetics with smooth purple/blue gradients.
- **Responsive Dark Mode**: Fully adaptive themes with glowing accent effects.
- **Micro-animations**: GPU-accelerated hover effects, pulse notifications, and smooth transitions.

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & React 19)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (Modern CSS Configuration)
- **Database/Auth**: [Supabase](https://supabase.com/) (Real-time Subscriptions)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Visuals**: [Lucide React](https://lucide.dev/) + [Recharts](https://recharts.org/)
- **State/Fetching**: [SWR](https://swr.vercel.app/) (Stale-While-Revalidate)

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
GNU

This project is private and proprietary.
