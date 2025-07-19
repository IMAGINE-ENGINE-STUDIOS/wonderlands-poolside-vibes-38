# E-commerce Template with Animated Landscape

This is a beautiful e-commerce template featuring an animated landscape background and fully customizable product catalog.

## Project info

**URL**: https://lovable.dev/projects/f69161c2-4779-4a2d-8c27-f010eb21b01d

## Features

- **Animated Landscape Background**: Interactive SVG landscape with parallax effects and mouse tracking
- **Customizable Hero Section**: Easy to modify logo, title, subtitle, and call-to-action buttons
- **Product Catalog**: Generic product catalog that works for any type of e-commerce business
- **Service Section**: Display services with pricing and features
- **Responsive Design**: Fully responsive design that works on all devices
- **Modern UI Components**: Built with shadcn/ui components for a professional look

## Template Usage

### Demo Routes
- `/` - Original pool company website
- `/template` - Generic e-commerce template

### Customizing the Template

#### 1. Hero Section
Edit the `EcommerceTemplate.tsx` file to customize:
- Logo image and alt text
- Business title and subtitle
- Button texts
- Trust badge text

```tsx
<HeroTemplate
  logo="your-logo.png"
  logoAlt="Your Business Logo"
  title="Your Amazing Business"
  subtitle="Your business description"
  primaryButtonText="Explore Products"
  secondaryButtonText="Get Free Quote"
  trustBadgeText="Trusted by X customers"
  // ... other props
/>
```

#### 2. Products
Replace the sample products in `EcommerceTemplate.tsx`:

```tsx
const yourProducts: Product[] = [
  {
    id: "1",
    name: "Your Product Name",
    price: 999,
    category: "premium", // premium, deluxe, standard, compact
    dimensions: "Product dimensions",
    specifications: "Product specs",
    features: ["Feature 1", "Feature 2"],
    description: "Product description",
    image: "product-image.jpg" // optional
  }
];
```

#### 3. Services
Customize services in the same file:

```tsx
const yourServices: Service[] = [
  {
    id: "s1",
    name: "Your Service",
    price: 500,
    type: "installation", // installation, maintenance, repair, etc.
    description: "Service description",
    duration: "2-4 hours",
    warranty: "1 year",
    features: ["Feature 1", "Feature 2"]
  }
];
```

#### 4. Colors and Styling
The template uses a semantic design system. Customize colors in:
- `src/index.css` - CSS variables for colors
- `tailwind.config.ts` - Tailwind configuration

## Components

### Template Components
- `HeroTemplate.tsx` - Customizable hero section
- `ProductCatalog.tsx` - Generic product catalog
- `ProductCard.tsx` - Individual product cards
- `ProductDetailModal.tsx` - Product detail popup
- `ServiceSection.tsx` - Services display section

### UI Components
All UI components are from shadcn/ui and fully customizable.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/f69161c2-4779-4a2d-8c27-f010eb21b01d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/f69161c2-4779-4a2d-8c27-f010eb21b01d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
