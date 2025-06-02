# Icon Maker Pro

A modern, AI-powered desktop application for creating and managing custom icons with smart packaging capabilities.

![Icon Maker Pro Screenshot](screenshot.png)

## Features

- 🤖 AI-powered icon generation from text descriptions
- 🎨 Advanced style customization options
- 📦 Smart packaging for multiple platforms
- 🎯 Multiple size support (16x16 to 1024x1024)
- 🌓 Dark/Light theme support
- 💾 Local storage for your icon collection
- 📤 Export to multiple formats (SVG, PNG, ICO)

## Tech Stack

- **Frontend**: React + TypeScript
- **Desktop Framework**: Electron
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/icon-maker.git
cd icon-maker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Build the application:
```bash
npm run build
# or
yarn build
```

## Project Structure

```
icon-maker/
├── src/
│   ├── main/           # Electron main process
│   ├── renderer/       # React application
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Custom React hooks
│   │   └── styles/     # Global styles
│   └── shared/         # Shared utilities
├── public/             # Static assets
└── electron/          # Electron configuration
```

## Usage

1. **Generate Icons**
   - Enter a description of the icon you want to create
   - Customize style options (colors, effects, complexity)
   - Click generate to create your icon

2. **Customize Styles**
   - Choose from multiple style presets
   - Adjust colors, effects, and complexity
   - Preview changes in real-time

3. **Export Icons**
   - Select target platforms (Web, iOS, Android, Mac)
   - Choose desired sizes
   - Export as a complete package or individual files

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

This project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
