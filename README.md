# Pharmacy Shop Web View

A Vue.js application that displays a list of nearby pharmacies with their information and "Order Now" functionality.

## Project Setup

### File Structure
Make sure your project has the following structure:
```
pharmacy_ui/
├── dist/
├── node_modules/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   └── PharmacyList.vue
│   ├── App.vue
│   ├── main.js
│   └── pharmacy-data.json
├── .gitignore
├── babel.config.js
├── jsconfig.json
├── package-lock.json
├── package.json
├── README.md
└── vue.config.js
```

### Installation

1. Install dependencies:
```
npm install
```

2. Compile and hot-reload for development:
```
npm run serve
```

3. Compile and minify for production:
```
npm run build
```

## Features

- Display list of pharmacies with their information
- Search functionality for finding specific pharmacies
- Filter options for location, services, rating, and hours
- "Order Now" button for each pharmacy
- Responsive design for mobile and desktop

## Customization

You can add actual pharmacy logo images by:
1. Adding image files to the src/assets directory
2. Updating the PharmacyList.vue component to use the actual images instead of placeholders
3. Ensuring the pharmacy-data.json file points to the correct image paths
