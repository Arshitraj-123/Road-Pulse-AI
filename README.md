# Road Pulse AI

Road Pulse AI is an intelligent, role-based platform designed to bridge the gap between citizens, municipal authorities, and contractors for efficient road maintenance and infrastructure management. By leveraging predictive insights and strict role-based access control (RBAC), Road Pulse AI streamlines the process from damage reporting to final repair.

## 🚀 Features

### 1. Citizen Portal
- **Gamified Reporting**: Citizens can easily report road damages (potholes, edge failures, etc.) using geo-tagged reports and earn reward points/badges for community contributions.
- **OTP Verification**: Secure passwordless/OTP-based phone and email verification during signup and login.
- **Real-Time Tracking**: Citizens can track the status of their submitted reports.

### 2. Municipal Officer Dashboard
- **Comprehensive Analytics**: Interactive charts (Recharts) displaying predictive insights, damage breakdown by type, and resolution rates.
- **Contractor Management**: A dedicated scorecard evaluating contractors based on SLA compliance, average fix days, and resolution rates.
- **Approval Workflow**: Officers can review, approve, or reject contractor portal access requests directly from the dashboard.
- **Alert System**: Automated alerts for new reports, contractor requests, and SLA breaches.

### 3. Contractor Portal
- **Access Requests**: Contractors can request access by selecting their specific municipality and uploading their license documents.
- **Work Queue (Coming Soon)**: Approved contractors can view their assigned tasks, manage their repair queues, and update ticket statuses.
- **Performance Tracking**: Contractors are graded on their SLA compliance and overall resolution rate.

## 🔄 Contractor Approval Workflow

The following diagram illustrates the complete Role-Based Access Control (RBAC) flow from a contractor requesting access to a municipal officer approving it.

```mermaid
flowchart TD
    %% Define Styles
    classDef contractor fill:#0f5132,color:#fff,stroke:none,rx:8px,ry:8px,padding:10px
    classDef municipal fill:#084298,color:#fff,stroke:none,rx:8px,ry:8px
    classDef waiting fill:#664d03,color:#fff,stroke:none,rx:8px,ry:8px
    classDef rejection fill:#842029,color:#fff,stroke:none,rx:8px,ry:8px
    classDef decision fill:#41464b,color:#fff,stroke:none,rx:8px,ry:8px
    
    subgraph Contractor Action
        A1["Fill access request form<br><small>Company, license, municipality</small>"]:::contractor
        A2["Submit request<br><small>POST /api/auth/contractor/request</small>"]:::contractor
        A3["Sees pending screen<br><small>/contractor/pending</small>"]:::waiting
        
        A4["Approval email received<br><small>Sets password via link</small>"]:::contractor
        A5["Logs in for first time<br><small>/login/contractor</small>"]:::contractor
        A6["Enters work queue<br><small>/contractor/queue</small>"]:::contractor
    end
    
    subgraph Municipal Action
        M1["New request notification<br><small>Red badge on dashboard</small>"]:::municipal
        M2["Reviews contractor request<br><small>Dashboard → Contractors tab</small>"]:::municipal
        M3["Approve or Reject?<br><small>PATCH /api/municipal/contractors/:id</small>"]:::decision
        M4["Rejection email sent<br><small>Reason included</small>"]:::rejection
        M5["Assigns tickets to contractor<br><small>Contractor ID saved to reports</small>"]:::municipal
    end

    A1 --> A2
    A2 --> A3
    A2 -- "request sent to<br>their municipality" --> M1
    
    M1 --> M2
    M2 --> M3
    
    M3 -- "Reject" --> M4
    M3 -- "Approve" --> A4
    
    A4 --> A5
    A5 --> A6
    
    M5 -- "tickets appear<br>in queue" --> A6
```

## 🛠 Tech Stack

**Frontend**
- **Framework**: React 18 with Vite
- **Routing**: `@tanstack/react-router`
- **Styling**: Tailwind CSS + Framer Motion for micro-animations
- **Charts**: Recharts
- **State Management**: Zustand (for auth, theme, and notifications)

**Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT) & bcrypt for password hashing
- **Services**: Twilio (SMS OTP) & Nodemailer (Email OTP) mocks/integrations

## 💻 Running the Project Locally

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port `27017` or a MongoDB URI)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Arshitraj-123/Road-Pulse-AI.git
   cd Road-Pulse-AI
   ```

2. **Install Frontend Dependencies & Start**
   ```bash
   npm install
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

3. **Install Backend Dependencies & Start**
   ```bash
   cd backend
   npm install
   
   // Create a .env file based on environment variables needed
   // (e.g., PORT=5000, MONGO_URI=mongodb://127.0.0.1:27017/roadpulse, JWT_SECRET, etc.)
   
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`.*

4. **Seed the Database (Optional)**
   You can run the provided seed scripts inside `backend/src/scripts` to populate the database with a default municipal officer, dummy contractors, and sample damage reports to explore the dashboard.

## 🔒 Role-Based Architecture
The application strictly segregates data:
- **Citizens** cannot view municipal dashboards.
- **Municipal Officers** only see data, contractors, and reports mapped to their specific `municipalityId`.
- **Contractors** cannot view other contractors' queues.
- API endpoints are protected using robust JWT verification and role-checking middleware.

---
*Built with ❤️ for better roads.*
