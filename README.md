# Zumma Coffee Demo

A modern, progressive web application (PWA) built for Zumma Coffee to provide a seamless digital menu and ordering experience. Engineered with a focus on high-performance rendering, fluid micro-interactions, and robust cross-device compatibility, particularly optimized for iOS Safari edge cases.

## Live Application
The production build is continuously deployed and accessible at:
https://zumma-coffee-demo.vercel.app

## Demonstration
A comprehensive walkthrough of the application's core user flows is available in the repository:

<video src="Zumma%20Coffee%20-%20DEMO.mp4" controls="controls" muted="muted"></video>

## Architecture Overview
The application is structured as a Single Page Application (SPA) utilizing modern React and Vite for optimal build and development speed. 

Key architectural decisions include:
*   State Management: Context API for localized cart and order tracking, ensuring immediate UI reflection without heavy global stores.
*   Animation Engine: Framer Motion employed for declarative, physics-based micro-interactions, ensuring consistent 60fps frame rates across devices.
*   Scroll Hijacking Prevention: Lenis implemented for smooth scroll behavior without overriding native accessibility features.
*   Viewport Handling: Dynamic Viewport Height (dvh) utilized globally alongside CSS bleed techniques to circumvent iOS Safari's floating address bar layout shifts.

## Core Features
*   Progressive Web App (PWA) integration for native-like installation and offline asset caching.
*   Responsive UI scaling with skeleton loading states for perceived performance optimization.
*   Client-side order persistence, maintaining active session state post-checkout.
*   Categorized menu navigation with real-time search filtering.

## Development Setup

### Prerequisites
*   Node.js (v18.0.0 or higher recommended)
*   npm (v9.0.0 or higher)

### Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/feboyfierlyan/zumma-coffee-demo.git
cd zumma-coffee-demo
npm install
```

### Local Development
Start the Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`. 

### Production Build
Generate an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Deployment
This project is configured for seamless deployment on Vercel. Pushes to the `main` branch automatically trigger a production rebuild. The architecture strictly adheres to Vercel's SPA routing configuration standards.

## Code Standards
*   Component Structure: Functional components with React Hooks.
*   Styling: Vanilla CSS with custom property (variable) themes for scalable dark/light mode implementation.
*   Performance: Image optimization pipeline integrated (WebP format prioritized) to minimize network payload.
