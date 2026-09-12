# AgriSentinel — Smart Agriculture Monitoring Platform

> IoT-based precision agriculture platform with AI-powered crop health analysis, real-time sensor monitoring, and multilingual voice alerts for Indian farmers.

---

## Table of Contents

1. [What is AgriSentinel?](#what-is-agrisentinel)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [How It Works](#how-it-works)
6. [Pages & Screens](#pages--screens)
7. [API Endpoints](#api-endpoints)
8. [Database Schema](#database-schema)
9. [Authentication System](#authentication-system)
10. [IoT Device Integration](#iot-device-integration)
11. [AI Analysis Engine](#ai-analysis-engine)
12. [Simulation System](#simulation-system)
13. [Getting Started](#getting-started)
14. [Demo Accounts](#demo-accounts)
15. [Deployment](#deployment)
16. [Future Scope](#future-scope)

---

## What is AgriSentinel?

AgriSentinel is a full-stack web application designed for **IoT-based smart agriculture monitoring**. It connects physical sensor stations deployed in farms to a cloud dashboard, enabling farmers, FPOs (Farmer Producer Organizations), and administrators to:

- Monitor **real-time soil and weather data** (nitrogen, phosphorus, potassium, pH, moisture, temperature, humidity)
- Detect **crop diseases and stress** using AI analysis of sensor readings
- Receive **instant alerts** when conditions go out of safe ranges
- Track **multiple farms, fields, and stations** from a single dashboard
- Get **multilingual voice alerts** in Hindi, Kannada, and Telugu
- Calculate **ROI** for adopting smart agriculture technology

The platform is built to serve the Indian agricultural ecosystem — from individual farmers managing 5-acre plots to FPOs overseeing hundreds of acres across multiple districts.

---

## Key Features

### Real-Time Monitoring
- Live sensor readings from IoT stations (soil nutrients, moisture, temperature, humidity)
- Circular gauge visualizations for each sensor metric
- Time-series charts showing trends over 24h, 7d, 30d, and 3 months
- Station health monitoring (battery level, solar status, uptime, connectivity)

### AI-Powered Crop Health Analysis
- Analyzes sensor data to calculate crop health score (0-100%)
- Disease risk probability assessment
- Water stress, nutrient stress, and chlorophyll stress detection
- NDRE (Normalized Difference Red Edge) estimation
- Actionable recommendations based on analysis results

### Smart Alerts System
- Automatic alerts when sensor values exceed safe thresholds
- Three severity levels: Info, Warning, Critical
- Alert types: disease risk, soil moisture low, nutrient imbalance, high temperature, station offline, low battery
- Acknowledge and resolve workflow
- Filter by status (new / acknowledged / resolved)

### Multi-Farm Management
- Register and manage multiple farms
- Sub-divide farms into fields with crop tracking
- Per-field crop health monitoring
- Geographic location tracking (latitude/longitude)

### IoT Station Management
- Register stations with unique IDs (AGR-001, AGR-002, etc.)
- Track firmware version, battery, solar charging status
- Heartbeat monitoring for station health
- Automatic offline/low-battery detection

### FPO Dashboard
- Overview of all member farms
- Total acreage and crop distribution analytics
- Aggregated station and alert statistics
- Bar chart visualization of crop coverage

### ROI Calculator
- Input farm size, crop type, investment per acre
- Calculate expected yield and revenue
- Estimate savings from soil health improvement, water savings, labor savings
- Visualize return on investment percentage

### Simulation Mode
- Run sensor simulations without physical hardware
- 6 scenarios: Healthy, Disease, Low Moisture, Nutrient Deficiency, Station Offline, Low Battery
- Generates realistic sensor readings, AI analyses, and alerts
- Useful for demos and testing

### Multilingual Support
- Voice alerts in Hindi, Kannada, and Telugu
- Language selection in settings (English, Hindi, Kannada, Telugu)
- Designed for rural Indian users

### Offline Support
- Offline detection banner with pending sync count
- Sync queue for offline data uploads
- Automatic retry logic for failed syncs

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router) | React framework with server-side rendering |
| **UI** | Tailwind CSS v4 | Utility-first styling |
| **Icons** | Lucide React | Icon library |
| **Charts** | Recharts | Interactive data visualizations |
| **Fonts** | Geist + Geist Mono | Typography |
| **Backend** | Next.js API Routes | RESTful API endpoints |
| **Database** | SQLite (via Prisma) | Lightweight relational database |
| **ORM** | Prisma 7 | Database schema and queries |
| **Auth** | JWT (jsonwebtoken) | Token-based authentication |
| **Password Hashing** | bcryptjs | Secure password storage |
| **Language** | TypeScript | Type-safe development |
| **Build** | Turbopack | Fast bundling and compilation |

---

## Project Structure

```
agriculture/
├── prisma/
│   ├── schema.prisma          # Database schema (15 models)
│   ├── seed.ts                # Seed data (users, farms, stations, readings, alerts)
│   └── dev.db                 # SQLite database file
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout with fonts
│   │   ├── page.tsx           # Root redirect (→ /dashboard or /login)
│   │   ├── client-providers.tsx # AuthProvider + AppLayout wrapper
│   │   ├── login/page.tsx     # Login page
│   │   ├── register/page.tsx  # Registration page
│   │   ├── dashboard/page.tsx # Main dashboard
│   │   ├── farms/             # Farms list + detail
│   │   ├── stations/          # Stations list + detail
│   │   ├── alerts/page.tsx    # Alerts management
│   │   ├── ai-analysis/page.tsx # AI crop health
│   │   ├── soil/page.tsx      # Soil monitoring
│   │   ├── crops/page.tsx     # Crop tracking
│   │   ├── roi/page.tsx       # ROI calculator
│   │   ├── fpo/page.tsx       # FPO dashboard
│   │   ├── admin/page.tsx     # Admin panel
│   │   ├── settings/page.tsx  # User settings
│   │   └── api/               # 16 API route handlers
│   │       ├── auth/          # login, register, me
│   │       ├── farms/         # CRUD + detail
│   │       ├── stations/      # CRUD + readings + alerts + heartbeat
│   │       ├── alerts/        # List + update
│   │       ├── ai-analysis/   # Run analysis
│   │       ├── readings/      # Submit readings
│   │       ├── simulation/    # Run simulations
│   │       ├── sync/          # Offline sync
│   │       └── health/        # Health check
│   ├── components/            # 16 reusable UI components
│   │   ├── AppLayout.tsx      # Main app shell (sidebar + header)
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   ├── Header.tsx         # Top header bar
│   │   ├── StatCard.tsx       # Stat display card
│   │   ├── StatusBadge.tsx    # Status indicator badge
│   │   ├── SensorGauge.tsx    # Circular sensor gauge
│   │   ├── Charts.tsx         # Line/Area/Bar chart wrappers
│   │   ├── AlertCard.tsx      # Alert display card
│   │   ├── DataTable.tsx      # Sortable data table
│   │   ├── EmptyState.tsx     # Empty state placeholder
│   │   ├── ErrorState.tsx     # Error state display
│   │   ├── LoadingSpinner.tsx # Loading indicator
│   │   ├── NotificationToast.tsx # Toast notifications
│   │   ├── OfflineBanner.tsx  # Offline status banner
│   │   ├── SimulationPanel.tsx # Simulation controls
│   │   └── TimeRangeSelector.tsx # Time range toggle
│   ├── contexts/
│   │   └── auth-context.tsx   # Authentication context/provider
│   └── lib/                   # Utility modules
│       ├── prisma.ts          # Prisma client singleton
│       ├── auth.ts            # JWT auth helpers
│       ├── utils.ts           # cn(), date formatting, color helpers
│       ├── ai-service.ts      # AI analysis engine
│       ├── simulation.ts      # Sensor simulation logic
│       └── sync.ts            # Offline sync queue processor
├── middleware.ts               # Route protection middleware
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── package.json
```

---

## How It Works

### Data Flow

```
Physical Sensors → IoT Station → API (POST /api/readings) → Database → Dashboard (polling)
                                    ↓
                              AI Analysis → Alerts → Notifications
                                    ↓
                              Voice Alerts (Hindi/Kannada/Telugu)
```

1. **Sensor Stations** deployed in farms collect soil and weather data every 15 minutes
2. **API Routes** receive readings and store them in the database
3. **AI Engine** analyzes readings to detect crop health issues, disease risk, and stress levels
4. **Alert System** triggers notifications when values exceed safe thresholds
5. **Dashboard** displays real-time and historical data through charts and gauges
6. **Voice Alerts** deliver multilingual warnings to farmers in their local language

### User Roles

| Role | Access |
|------|--------|
| **Farmer** | Own farms, stations, alerts, crop health, soil data |
| **FPO** | Aggregate view of all member farms, analytics |
| **Admin** | Full system access, user management, all stations/alerts |

---

## Pages & Screens

### Login & Register
- Email/password authentication
- Demo account credentials shown for testing
- Role selection during registration (Farmer / FPO Member)

### Dashboard
- **Station Summary**: Total, Online, Warning, Offline counts
- **Alert Summary**: Total, Critical, New alerts
- **Recent Alerts**: Last 5 alerts with severity indicators
- **Quick Actions**: Links to Farms, Stations, Crop Health, Soil, Alerts, ROI Calculator

### Farms
- Grid view of all farms with location, acreage, field/station counts
- Farm detail page showing:
  - Fields with crop information and growth stages
  - Associated stations with live status

### Stations
- Grid view of all IoT stations
- Station health summary (Online / Warning / Offline counts)
- Station detail page showing:
  - 6 sensor gauges: Nitrogen, Phosphorus, Potassium, pH, Moisture, Temperature
  - Time-series chart of sensor trends
  - Station alerts list
  - Battery, solar status, firmware version

### Alerts
- Full alert list with filter tabs: All / New / Acknowledged / Resolved
- Each alert shows: type icon, severity color, title, message, station, timestamp
- Acknowledge and Resolve action buttons

### AI Crop Health Analysis
- Per-station analysis cards showing:
  - Crop Health Score (0-100%)
  - Disease Risk Probability
  - Moisture Level
  - Nitrogen, pH, Temperature readings
  - Health status badge (Healthy / Warning / Critical)

### Soil Monitoring
- Station selector dropdown
- 5 sensor gauges: Nitrogen, Phosphorus, Potassium, pH, Moisture
- NPK trend chart
- Moisture trend chart

### Crops
- Grid view of all crops across all farms
- Each card shows: crop name, variety, growth stage, status, field, farm
- Growth stage badges: Seedling, Vegetative, Flowering, Fruiting, Harvest

### ROI Calculator
- Input fields: Acreage, Crop Type, Investment per Acre, Expected Yield, Price per Quintal
- Savings inputs: Soil Health Improvement %, Water Savings %, Labor Savings %
- Output: ROI percentage, Total Investment, Expected Revenue, Net Profit, Savings Breakdown

### FPO Dashboard
- Member farms count, total acreage, active stations, critical alerts
- Crop distribution bar chart
- Summary cards with key metrics

### Admin Panel
- **Users Tab**: Registered user list
- **Stations Tab**: All stations with status and battery
- **Alerts Tab**: All alerts with severity and timestamps
- **Activity Logs Tab**: Recent system events

### Settings
- Profile information (name, email, role, phone)
- Notification preferences (push, email, SMS toggles)
- Language selection (English, Hindi, Kannada, Telugu)
- Timezone setting
- Logout button

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login with email/password | None |
| POST | `/api/auth/register` | Create new account | None |
| GET | `/api/auth/me` | Get current user profile | JWT |

### Farms
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/farms` | List user's farms | JWT |
| POST | `/api/farms` | Create new farm | JWT |
| GET | `/api/farms/[id]` | Get farm with fields & stations | JWT |
| PUT | `/api/farms/[id]` | Update farm details | JWT (owner/admin) |
| DELETE | `/api/farms/[id]` | Delete farm | JWT (owner/admin) |

### Stations
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/stations` | List all stations | JWT |
| GET | `/api/stations/[id]` | Get station detail | JWT |
| PUT | `/api/stations/[id]` | Update station | JWT |
| DELETE | `/api/stations/[id]` | Delete station | JWT |
| POST | `/api/stations/register` | Register IoT device | Device Key |
| POST | `/api/stations/heartbeat` | Device heartbeat ping | Device Key |
| GET | `/api/stations/[id]/readings` | Get sensor readings | JWT |
| GET | `/api/stations/[id]/alerts` | Get station alerts | JWT |

### Sensor Data
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/readings` | Submit sensor reading | Device Key |

### Alerts
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/alerts` | List all alerts | JWT |
| PUT | `/api/alerts` | Update alert status | JWT |

### AI Analysis
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/ai-analysis` | Run crop health analysis | Device Key |

### Simulation
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/simulation` | Run sensor simulation | JWT |

### Sync & Health
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET/POST | `/api/sync` | Sync offline data queue | None |
| GET | `/api/health` | Health check | None |

---

## Database Schema

15 Prisma models powering the application:

| Model | Records | Description |
|-------|---------|-------------|
| **User** | 3 | Admin, Farmer, FPO accounts |
| **Session** | - | JWT session tracking |
| **Farm** | 3 | Nashik, Mysore, Hyderabad farms |
| **Field** | 7 | Tomato, Potato, Cotton, Chilli, Rice, Wheat, Maize fields |
| **Station** | 8 | AGR-001 through AGR-008 IoT stations |
| **Sensor** | 64 | 8 sensors per station (N, P, K, pH, moisture x2, temp, humidity) |
| **SensorReading** | ~28,800 | 30 days of 15-min interval data |
| **Crop** | 7 | Crops with varieties and growth stages |
| **AIAnalysis** | 21 | Health scores, disease risk, stress levels |
| **Alert** | 17 | Disease, moisture, nutrient, temperature, station alerts |
| **Recommendation** | 5 | Actionable maintenance/irrigation recommendations |
| **DeviceHeartbeat** | 40 | Station health pings |
| **VoiceAlert** | 5 | Multilingual alerts (Hindi, Kannada, Telugu) |
| **SyncQueue** | 5 | Offline sync queue entries |

---

## Authentication System

### How It Works

1. User submits email + password via login form
2. Server verifies password against bcrypt hash
3. Server generates a JWT token (7-day expiry) containing `userId` and `role`
4. Token is set as an `httpOnly` cookie named `auth-token`
5. Subsequent requests include the cookie automatically
6. Middleware checks for the cookie on protected routes — redirects to `/login` if missing

### Token Extraction

API routes extract tokens from:
1. `Authorization: Bearer <token>` header (for IoT devices)
2. `auth-token` cookie (for browser sessions)

### Device Authentication

IoT stations use a separate `x-device-key` header with a shared `DEVICE_API_KEY` environment variable for endpoints like station registration, heartbeat, and reading submission.

---

## IoT Device Integration

### Station Registration
```json
POST /api/stations/register
Headers: { "x-device-key": "YOUR_DEVICE_API_KEY" }
Body: {
  "stationId": "AGR-009",
  "name": "Field Station North",
  "firmware": "1.2.0"
}
```

### Submitting Sensor Readings
```json
POST /api/readings
Headers: { "x-device-key": "YOUR_DEVICE_API_KEY" }
Body: {
  "stationId": "AGR-001",
  "nitrogen": 65.2,
  "phosphorus": 32.1,
  "potassium": 120.5,
  "ph": 6.8,
  "moisture1": 42.3,
  "moisture2": 38.7,
  "soilTemp": 24.5,
  "airTemp": 28.3,
  "humidity": 65.2,
  "rainfall": 0,
  "light": 850,
  "wind": 12.3
}
```

### Heartbeat
```json
POST /api/stations/heartbeat
Headers: { "x-device-key": "YOUR_DEVICE_API_KEY" }
Body: {
  "stationId": "AGR-001",
  "battery": 85,
  "solarStatus": "charging",
  "uptime": 86400,
  "storageUsed": 12.5,
  "pendingSync": 0
}
```

---

## AI Analysis Engine

The AI service (`src/lib/ai-service.ts`) performs deterministic crop health analysis using sensor data:

### Metrics Calculated

| Metric | Range | Description |
|--------|-------|-------------|
| Crop Health | 0-100% | Overall plant health score |
| Disease Risk | 0-100% | Probability of disease occurrence |
| NDRE | 0-1 | Normalized Difference Red Edge index |
| Chlorophyll Stress | 0-1 | Stress affecting chlorophyll production |
| Water Stress | 0-1 | Insufficient or excess water stress |
| Nutrient Stress | 0-1 | NPK deficiency stress |
| Disease Probability | 0-1 | Likelihood of pathogen attack |
| Stress Level | low/medium/high | Overall stress classification |
| Confidence | 0-100% | Analysis confidence score |

### Crop-Specific Ranges

The engine has built-in optimal ranges for:
- **Tomato**: N 40-80, P 25-50, K 100-180, pH 6.0-7.0
- **Potato**: N 30-60, P 20-40, K 80-150, pH 5.0-6.5
- **Cotton**: N 35-70, P 15-35, K 60-120, pH 6.0-7.5
- **Rice**: N 50-90, P 20-45, K 80-160, pH 5.5-7.0
- **Wheat**: N 35-65, P 20-40, K 70-140, pH 6.0-7.5

---

## Simulation System

The simulation module (`src/lib/simulation.ts`) generates realistic test data for 6 scenarios:

| Scenario | What It Simulates |
|----------|-------------------|
| **Healthy** | Optimal sensor readings, low disease risk |
| **Disease** | High humidity, elevated temperature, disease indicators |
| **Low Moisture** | Drought conditions, low soil moisture |
| **Nutrient Deficiency** | Low NPK values, nutrient stress |
| **Station Offline** | Station goes offline, triggers offline alert |
| **Low Battery** | Battery drops below 20%, triggers low battery alert |

Each simulation creates:
- New sensor readings with realistic values
- AI analysis with appropriate health/risk scores
- Alerts with correct severity levels
- Device heartbeats with relevant status

---

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/dhruvkumar2107/agricultureee.git
cd agricultureee

# Install dependencies
npm install

# Set up database
npx prisma db push

# Seed the database
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXT_PUBLIC_APP_NAME="AgriSentinel"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DEVICE_API_KEY="your-device-api-key"
```

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@agrisentinel.com | password123 |
| Farmer | farmer@demo.com | password123 |
| FPO | fpo@demo.com | password123 |

The database comes pre-seeded with:
- 3 farms across Maharashtra, Karnataka, and Telangana
- 8 IoT stations (AGR-001 to AGR-008)
- 30 days of sensor readings (~28,800 records)
- 17 alerts of various types
- 21 AI analyses
- 5 multilingual voice alerts

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Add environment variables
5. Deploy

**Note**: Vercel uses serverless functions with no persistent filesystem. For production, replace `DATABASE_URL=file:./dev.db` with a cloud database like:
- [Turso](https://turso.tech/) (SQLite-compatible, free tier available)
- [PlanetScale](https://planetscale.com/) (MySQL-compatible)
- [Neon](https://neon.tech/) (PostgreSQL-compatible)

### Manual Deployment

```bash
npm run build
npm start
```

---

## Future Scope

- **Mobile App**: React Native companion app for farmers
- **Push Notifications**: Firebase Cloud Messaging for real-time alerts
- **Weather API Integration**: OpenWeatherMap for weather forecasting
- **Satellite Imagery**: NDVI analysis from satellite data
- **Market Prices**: Real-time crop market price integration
- **Government Schemes**: Subsidy and scheme information for farmers
- **Multi-language UI**: Full UI translation in Hindi, Kannada, Telugu
- **Offline-First PWA**: Progressive Web App for areas with poor connectivity
- **Drone Integration**: Automated field scanning via drones
- **Blockchain**: Supply chain tracking from farm to fork

---

## License

This project is built for educational and agricultural technology purposes.

---

**AgriSentinel** — Empowering Indian farmers with data-driven agriculture.
