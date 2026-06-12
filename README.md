# 🚀 StayScape

StayScape is a modern, production-level MERN stack accommodation booking platform built for final year BCA major projects and tech placements.

## ✨ Features
- **User Authentication:** JWT tokens and Google OAuth.
- **Hosting System:** Users can become hosts, publish properties with Cloudinary image uploads, and manage their listings via a dedicated dashboard.
- **Advanced Search & AI Chatbot:** Find properties using intelligent filtering or talk directly to our **StayScape AI**, powered by OpenAI Function Calling, which dynamically fetches real-time MongoDB results into the chat widget.
- **Booking & Payments:** Select dates, calculate pricing, and pay securely using Stripe Elements integration.
- **Responsive UI:** Clean, Airbnb-inspired design utilizing Tailwind CSS.

## 🛠 Tech Stack
**Frontend:** React (Vite), Tailwind CSS, React Router, `@react-oauth/google`, `@stripe/react-stripe-js`, `axios`
**Backend:** Node.js, Express, MongoDB (Mongoose), `jsonwebtoken`, `multer`, `cloudinary`, `stripe`, `openai`

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (Atlas recommended)
- Cloudinary Account (for image uploads)
- Stripe Account (for test payments)
- Google Cloud Console Project (for OAuth Client ID)
- OpenAI API Key

### 1. Clone & Install
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Variables Integration
You must create `.env` files in both the `server` and `client` directories.

**Backend (`server/.env`)**:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/stayscape
JWT_SECRET=your_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...

# OpenAI
OPENAI_API_KEY=sk-...
```

**Frontend (`client/.env.local`)**:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### 3. Run the Application
```bash
# Terminal 1 - Start the backend
cd server
npm run dev

# Terminal 2 - Start the frontend
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 💡 How the AI Chatbot works (Function Calling)
1. User asks the chat widget: *"Find me villas under $200"*
2. Node.js sends the query to OpenAI, passing our custom `search_properties` JSON schema.
3. OpenAI determines it needs database data and responds with a function call (argument: `{ type: "Villa", maxPrice: 200 }`).
4. Our backend executes the MongoDB Mongoose query using those arguments.
5. We send the raw property data back to OpenAI to formulate a friendly response, and simultaneously send the raw DB objects back to the React UI.
6. React renders the AI's friendly text alongside beautiful, clickable UI cards for the database properties.

## 📌 Future Enhancements
- Real-time WebSockets for host messaging.
- Dynamic pricing algorithms for hosts based on demand.
- Interactive Mapbox/Google Maps integration on the search page.
