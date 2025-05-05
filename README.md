Mock Interview App

An interactive full-stack web application designed to help users practice technical interviews in a simulated environment. Built using Next.js, Node.js, PostgreSQL, and Tailwind CSS, this platform allows users to attempt coding challenges, receive instant feedback, and track their progress over time.


---

Features

Real-time Coding Environment: Solve problems directly in the browser with code execution.

Problem Bank: Diverse set of curated DSA problems, categorized by difficulty and topic.

Progress Tracker: Track attempts, success rate, and problem history.

Mock Interviews: Timed interview rounds to simulate real-world pressure.

Authentication: User sign-up/login with secure sessions.

Admin Panel: Add/edit/delete problems and manage user data.



---

Tech Stack

Frontend: Next.js, Tailwind CSS

Backend: Node.js, Express

Database: PostgreSQL

Auth: Clerk

Other: Prisma ORM, REST APIs



---

Setup Instructions

1. Clone the repository

git clone https://github.com/Prabhat2912/ai-mock-interview.git
cd mock-interview-app


2. Install dependencies

npm install


3. Set up environment variables

Create a .env file and add your environment variables:

DATABASE_URL=your_postgres_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret


4. Run the development server

npm run dev




---

Future Improvements

AI-based feedback on submissions

Audio/video interview practice

Competitive coding rounds with leaderboards

Resume feedback integration



---

Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss the proposed changes.


---

License

This project is licensed under the MIT License.

