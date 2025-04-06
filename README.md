# Cricket Scorer

Cricket Scorer is a web application designed to help you keep track of cricket matches in real-time. It allows you to record runs, wickets, overs, and other match details with an intuitive interface.

## Features

- **Start a Match**: Set the number of overs and begin scoring.
- **Real-Time Scoring**: Add runs, wides, no-balls, and wickets as the match progresses.
- **Over Summary**: View detailed summaries of each over, including ball-by-ball data.
- **Match Completion**: Automatically detects when the match is complete.
- **Reset Match**: Reset the match to start over.

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Build Tool**: Vite
- **Linting**: ESLint with TypeScript and React plugins

## Installation

1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd cricket-scorer
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm run dev
    ```

4. Open the app in your browser at [http://localhost:5173](http://localhost:5173).

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the app for production.
- `npm run preview`: Preview the production build.
- `npm run lint`: Run ESLint to check for code quality issues.

## Folder Structure

```
cricket-scorer/
├── src/
│   ├── components/       # React components
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Entry point
│   ├── index.css         # Global styles
│   └── vite-env.d.ts     # Vite environment types
├── public/               # Static assets
├── index.html            # HTML entry point
├── tailwind.config.js    # TailwindCSS configuration
├── postcss.config.js     # PostCSS configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── package.json          # Project metadata and dependencies
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/) and [Vite](https://vitejs.dev/).
- Icons provided by [Lucide](https://lucide.dev/).
- Styling powered by [TailwindCSS](https://tailwindcss.com/).

Enjoy scoring your cricket matches! 🏏  