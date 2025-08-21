# AutoSell Ltd - Car Advertising Website

A modern, mobile-first car advertising platform for Ghana, built with HTML, CSS, and JavaScript, integrated with Supabase for backend functionality.

## 🚗 Features

- **Modern Design**: Clean, professional interface with mobile-first responsive design
- **Car Listings**: Browse featured cars with image slideshows
- **Sell Your Car**: Professional form for car advertising submissions
- **Admin Dashboard**: Manage submissions, update status, and view statistics
- **Photo Uploads**: Multiple photo uploads with Supabase storage
- **WhatsApp Integration**: Direct contact with sellers
- **Mobile Optimized**: Fully responsive design for all devices

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL + Storage)
- **Styling**: Custom CSS with CSS Variables
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Inter (Google Fonts)

## 📁 File Structure

```
autosell-website/
├── index.html          # Main homepage
├── sell-form.html      # Car submission form
├── admin.html          # Admin dashboard
├── styles.css          # Main stylesheet
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## 🚀 Quick Start

### 1. Local Development
```bash
# Navigate to project directory
cd autosell-website

# Start local server (Python)
py -m http.server 8000

# Or with Node.js
npx http-server -p 8000
```

### 2. Access Your Website
- **Homepage**: `http://localhost:8000`
- **Sell Form**: `http://localhost:8000/sell-form.html`
- **Admin Dashboard**: `http://localhost:8000/admin.html`

## 🔧 Supabase Setup

### Database Table
The `car_submissions` table includes:
- Car details (make, model, year, price, mileage, condition)
- Seller information (name, phone, email, location)
- Photos (array of URLs)
- Status tracking (new, contacted, completed)
- Timestamps and metadata

### Storage Bucket
- **Bucket Name**: `car-photos`
- **Public Access**: Enabled for photo viewing
- **File Structure**: `car_photos/timestamp_index_filename`

### Security Policies
- **Public Inserts**: Anyone can submit car listings
- **Public Reads**: Admin dashboard can view submissions
- **Public Updates**: Status changes allowed
- **Photo Uploads**: Public upload and download access

## 🎨 Customization

### Colors
```css
:root {
    --primary-accent: #FF6600;      /* Orange */
    --secondary-accent: #003049;    /* Dark Blue */
    --highlight: #00B894;           /* Green */
    --neutral-background: #F9F9F9; /* Light Gray */
    --text-color: #1A1A1A;         /* Dark Text */
}
```

### Adding New Cars
Edit `script.js` and add to the `sampleCars` array:
```javascript
{
    id: 7,
    title: "Your Car Model",
    price: "₵150,000",
    year: "2020",
    mileage: "50,000 km",
    location: "Your City",
    images: ["path/to/image1.jpg", "path/to/image2.jpg"],
    status: "Available"
}
```

## 📱 Mobile Features

- **Touch Gestures**: Swipe through car photos
- **Responsive Design**: Optimized for all screen sizes
- **Mobile Navigation**: Hamburger menu for small screens
- **Touch-Friendly**: Large buttons and touch targets

## 🔒 Security Features

- **Input Validation**: Form validation on both client and server
- **File Type Restrictions**: Only image files allowed
- **SQL Injection Protection**: Supabase handles security
- **Rate Limiting**: Built-in Supabase protections

## 🚀 Deployment

### Option 1: Static Hosting
- Upload files to any static hosting service
- Update Supabase URL and keys in HTML files
- Ensure CORS is properly configured

### Option 2: GitHub Pages
```bash
# Create repository
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/autosell-website.git
git push -u origin main

# Enable GitHub Pages in repository settings
```

### Option 3: Netlify/Vercel
- Connect your GitHub repository
- Automatic deployments on push
- Custom domain support

## 📞 Support

- **WhatsApp**: +233 50 567 7556
- **Facebook**: AutoSell Ltd
- **Instagram**: @autosell_ltd

## 🔄 Updates

### Version 2.0 (Current)
- Complete Supabase integration
- Modern UI/UX design
- Mobile-first responsive design
- Admin dashboard functionality
- Photo upload system

### Future Enhancements
- User authentication system
- Advanced search and filtering
- Payment integration
- SMS notifications
- Analytics dashboard

## 📄 License

© 2024 AutoSell Ltd. All rights reserved.

---

**Built with ❤️ for the Ghana automotive community**

