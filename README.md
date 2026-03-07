# QuarryLink Frontend

![QuarryLink Banner](/public/images/quarry-screenshot.png)

QuarryLink is a modern, production-grade Next.js web application designed to revolutionize quarry logistics and supply chain management in Nigeria and beyond. Built with AI-powered platform concepts in mind, it provides tools for material suppliers, project builders, and cargo movers.

## 🚀 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Language:** TypeScript

## 📂 Project Structure

The project follows a modular, scalable architecture with separation of concerns:

```
quarrylink_frontend/
├── app/                  # Next.js App Router (Pages, Layouts, global CSS)
│   ├── not-found.tsx     # Custom 404 Error Page
│   └── globals.css       # Tailwind entry and global variables
├── components/           # Reusable React components
│   ├── layout/           # Navbar, Footer, and Section wrappers
│   └── ui/               # Buttons, Skeletons, Animations, Framer Variants
├── constants/            # Static data, mock DB, and configurations
│   ├── navigation.ts     # Site links and metadata
│   └── ...               # Section-specific data (services, showcase, etc.)
├── sections/             # Large page segments (Hero, Feature, Service, CTA)
└── public/               # Static assets
    └── images/           # All graphical assets, logos, and icons
```

## ✨ Key Features

- **Component-Driven Design:** Everything is broken down into reusable `<Section>` and `<Container>` blocks.
- **Fluid Animations:** Scroll-triggered entry animations and stagger effects powered by Framer Motion.
- **Image Optimization:** Full leverage of Next.js `<Image>` component coupled with loading Skeletons (`ImageWithSkeleton`) for a premium loading experience.
- **Responsive Navigation:** Mobile-friendly layouts, smooth anchor scrolling, and scalable UI elements.

## 🛠️ Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

You will need **Node.js 18+** installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/war-riz/quarrylink-frontend.git
   ```

2. **Navigate into the directory:**
   ```bash
   cd quarrylink-frontend
   ```

3. **Install the dependencies:**
   Choose your preferred package manager:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **View the application:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/), the creators of Next.js. Simply push your code to a GitHub repository, link it to Vercel, and the platform will handle the rest with zero configuration.

---

*For business or support inquiries, please contact: hello@quarrylink.com*
