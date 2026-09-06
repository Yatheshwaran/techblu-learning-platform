# TechBlu Learning Platform

TechBlu is a learning platform starter inspired by the broad learning model of sites such as W3Schools and GeeksforGeeks, but with its own branding and UI.

## Current features

- Blue-themed responsive UI
- Light/dark mode with localStorage
- Home page
- Programming tutorials section
- Practice section
- 10 practice questions per language
- Easy / Medium / Hard levels
- Progress tracking in localStorage
- Student dashboard
- Multi-language compiler UI
- Mobile responsive navigation

Languages included in the starter:
- Python
- JavaScript
- Java
- C++
- C

## Run in VS Code

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## GitHub

```bash
git init
git add .
git commit -m "Initial TechBlu learning platform"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## Production architecture

For a real online compiler, do not execute arbitrary user code directly in the frontend or normal web server.

Recommended structure:

Frontend (React/Vite)
        |
        v
Backend API
        |
        v
Sandboxed code execution service
        |
        +--> Python
        +--> JavaScript
        +--> Java
        +--> C
        +--> C++

You can later connect the Compiler page to Judge0 or another isolated execution system.

## Future database

Move progress from localStorage to a database after authentication is added.

Suggested tables:
- users
- languages
- tutorials
- tutorial_lessons
- questions
- question_attempts
- user_progress
- submissions

## Cloudflare / Hostinger

If you use Cloudflare DNS with a Hostinger-hosted application, point the domain's DNS records to the Hostinger server according to the DNS values provided by Hostinger. Keep DNS management in one place to avoid conflicting records.

For a static React frontend, you can also deploy the frontend separately and keep the compiler/backend API on a server designed for backend workloads.
