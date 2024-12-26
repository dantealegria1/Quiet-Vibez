# Quiet Vibez
A minimalist white noise application built with React Native and Expo, providing soothing background noise to help you focus, relax, or sleep better. 

## Features

- Clean, minimalist interface
- High-quality white noise generation
- Adjustable volume controls
- Works across all devices
- Progressive Web App (PWA) support
- Cross-platform compatibility (iOS, Android, Web)
- Docker container support for easy deployment

## Web page

Visit [https://dancing-dodol-946cf1.netlify.app/](https://dancing-dodol-946cf1.netlify.app/) to try the web version.

[![Netlify Status](https://api.netlify.com/api/v1/badges/27f86834-fd0d-4901-a1f6-7c34cc22c451/deploy-status)](https://app.netlify.com/sites/dancing-dodol-946cf1/deploys)


## Installation

### Standard Installation

1. Clone the repository:
```bash
git clone https://github.com/dantealegria1/Ruido_Blanco.git
cd Ruido_Blanco
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Docker Installation

You can run the application using Docker:

```bash
# Pull the Docker image
docker pull ghcr.io/dantealegria1/ruido_blanco:968f6dac5fd05606d5308710d5ac20d332237d95

# Run the container
docker run -p 3000:3000 ghcr.io/dantealegria1/ruido_blanco:968f6dac5fd05606d5308710d5ac20d332237d95
```

## Usage

- **Web Version**: Access through your browser at [https://dancing-dodol-946cf1.netlify.app/](https://dancing-dodol-946cf1.netlify.app/)
- **Docker Version**: Access through `http://localhost:3000` after running the container
- **Local Development**: 
  - Use `npm start` to launch the Expo development server
  - Run `npm run android` for Android development
  - Run `npm run ios` for iOS development
  - Use `npm run web` for web development

## Development Scripts

```bash
# Start Expo development server
npm start

# Build for deployment
npm run build

# Start web version
npm run web

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Technologies Used

- React Native
- Expo
- expo-av (for audio handling)
- expo-linear-gradient
- React Native Web
- Dropbox API integration
- Docker containerization

## Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## Repository

- GitHub: [https://github.com/dantealegria1/Ruido_Blanco](https://github.com/dantealegria1/Ruido_Blanco)
- Docker: [ghcr.io/dantealegria1/ruido_blanco](ghcr.io/dantealegria1/ruido_blanco)

## License

This project is licensed under the 0BSD License.
