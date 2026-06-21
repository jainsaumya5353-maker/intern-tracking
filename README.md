# 🚀 InternTrack MVP

**InternTrack** is a high-performance visibility platform designed to bridge the gap between interns and managers. It provides real-time task tracking, automated learning logs, and deep team analytics in a sleek, professional interface.

---

## ✨ Key Features

### 👨‍💻 For Interns
- **Daily Task Logging**: Log tasks instantly as they are started or completed.
- **Learning Repository**: Capture daily insights and "Aha!" moments to build a knowledge base.
- **Micro-Timeline**: A dedicated Activity Log showing a beautiful chronological history of work.
- **Manager-of-the-Day**: A dynamic banner showing which lead manager is on duty.

### 📊 For Managers
- **Team Intelligence**: A high-level dashboard showing active vs. idle status for every intern.
- **Real-Time Tracking**: Drill down into any intern's specific history of tasks and learnings.
- **Productivity Analytics**: Visual charts (Bar/Pie) showing goal velocity and team contribution.
- **Team Reports**: Automated summaries for weekly review.

---

## 🛠️ Technical Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google) via Supabase SSR
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🏁 Getting Started

### 1. Environment Setup
Create a `.env.local` file in the root directory and add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Configuration
Run the provided SQL script in `scripts/schema.sql` within your Supabase SQL Editor. This will set up:
- Core tables (`users`, `managers`, `interns`, `tasks`, `learnings`, `activities`)
- Advanced **Row Level Security (RLS)** policies for secure data access.

### 3. Installation
```bash
npm install
npm run dev
```

---

## 🚀 Deployment

This project is optimized for deployment on **Vercel**.

1. Connect your repository to Vercel.
2. Add your environment variables in the Vercel Dashboard.
3. Update your **Redirect URIs** in Google Cloud Console and Supabase Auth settings to match your new production URL.

---

## 🛡️ Security & Privacy
InternTrack uses industry-standard RBAC (Role-Based Access Control). Managers can only see data for interns who have specifically assigned them as their mentor during onboarding.

---

## 📄 License
Created by **Saumya Jain**. Built for speed, visibility, and professional growth.
