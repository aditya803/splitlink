# SplitLink 💰

A simple, shareable expense splitting app. Create a group, share a link, and let everyone add their expenses — no sign-up, no hassle.

## ✨ Features

- 🔗 **Shareable Links** - Create a group and share a unique link with participants
- 👥 **Multi-participant Support** - Add unlimited participants to your group
- 💵 **Expense Tracking** - Anyone with the link can add expenses
- 🧮 **Smart Settlement** - Automatically calculates who owes whom
- 📄 **PDF Export** - Download settlement reports as PDF
- 🎨 **Beautiful UI** - Clean, modern interface with smooth animations
- 🚀 **No Sign-up Required** - Start splitting expenses instantly

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team)
- **Database Provider**: Supabase
- **Form Validation**: React Hook Form + Zod
- **PDF Generation**: jsPDF + html-to-image

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or Supabase account)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd splitlink
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:
```env
DATABASE_URL=your_postgresql_connection_string
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Push database schema:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## 📂 Project Structure

```
splitlink/
├── app/
│   ├── api/          # API routes
│   ├── group/        # Group detail pages
│   ├── page.tsx      # Home page
│   └── layout.tsx    # Root layout
├── lib/
│   └── db/           # Database schema and config
├── public/           # Static assets
└── tailwind.config.js
```

## 🎯 How It Works

1. **Create a Group** - Enter a group name and add participants
2. **Share the Link** - Copy the unique link and share it with your group
3. **Add Expenses** - Anyone with the link can add expenses and specify who paid
4. **View Settlement** - The app automatically calculates who owes whom
5. **Download Report** - Export the settlement as a PDF for your records

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

Built with ❤️ by Aditya Pandey
