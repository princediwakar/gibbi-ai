# GibbiAI - AI-Powered Quiz Platform

GibbiAI is an end-to-end AI-based quiz creation, evaluation, and progress tracking platform. Create engaging quizzes effortlessly using AI assistance, evaluate performance in real-time, and track learning progress.

![GibbiAI Platform](/_static/og.png)

## 🚀 Features

- **AI-Powered Quiz Generation**: Create quizzes from topics, PDFs, or text in seconds
- **Real-Time Editing**: Customize questions and answers with an intuitive interface
- **Multiple Export Options**: Download quizzes as PDF or Excel files
- **Easy Sharing**: Share quizzes via unique links or embeds
- **Performance Analytics**: Track progress with detailed insights
- **Responsive Design**: Works seamlessly across all devices
- **Dark/Light Mode**: Choose your preferred theme

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Auth.js
- **Email**: Resend
- **AI**: OpenAI APIs
- **Styling**: shadcn/ui components, Tailwind CSS
- **Deployment**: Vercel

## 🏗 Project Structure

```
gibbi/
├── app/                # Next.js app directory
├── components/         # React components
├── config/            # Configuration files
├── lib/              # Utility functions and shared logic
├── public/           # Static assets
└── types/            # TypeScript type definitions
```

## 🚦 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gibbi.git
cd gibbi
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update the `.env.local` file with your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_api_key
```

5. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 📝 Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `OPENAI_API_KEY`: Your OpenAI API key
- `RESEND_API_KEY`: Your Resend API key for emails
- `NEXT_PUBLIC_BASE_URL`: Your application's base URL

## 🚀 Deployment

The easiest way to deploy GibbiAI is using the [Vercel Platform](https://vercel.com):

1. Push your code to a GitHub repository
2. Import your project into Vercel
3. Add your environment variables
4. Deploy!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email princediwakar25@gmail.com or join our Discord server.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [OpenAI](https://openai.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
