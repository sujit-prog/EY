# TIARA - Tata Intelligent Agent for Real-world Agents

[![EY Techathon 6.0](https://img.shields.io/badge/EY%20Techathon-6.0-blue)](https://www.ey.com/en_in/techathon)
[![Agentic AI](https://img.shields.io/badge/Agentic-AI-green)](https://github.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

> **An intelligent multi-agent AI system revolutionizing personal loan sales through conversational banking**

Built for **EY Techathon 6.0 - BFSI Challenge**

---

## 🎥 Demo Video
👇 Click the thumbnail image to watch video on youtube
<a href="https://www.youtube.com/watch?v=Q7WrrYIBrxM">
  <img src="https://img.youtube.com/vi/Q7WrrYIBrxM/maxresdefault.jpg" alt="TIARA" width="560">
</a>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution Architecture](#solution-architecture)
- [Agentic AI Workflow](#agentic-ai-workflow)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [User Journey](#user-journey)
- [Underwriting Logic](#underwriting-logic)
- [Test Scenarios](#test-scenarios)
- [Project Structure](#project-structure)
- [Team](#team)
- [Contact](#contact)

---
## Overview

**TIARA** (Tata Intelligent Agent for Real-world Agents) is a next-generation conversational AI system that transforms the personal loan sales process. Built on a multi-agent architecture, TIARA orchestrates specialized AI agents to deliver a seamless, human-like loan application experience from initial conversation to sanction letter generation.

### Challenge Context

**EY Techathon 6.0 - BFSI Track: Tata Capital**

Tata Capital, a leading NBFC, aims to increase personal loan sales through an AI-driven web chatbot. The challenge requires building an agentic AI solution where a Master Agent coordinates multiple Worker Agents to handle the complete loan journey - from discovery to approval.

---

## Problem Statement

### Business Objective
Improve personal loan sales success rate through an AI-driven conversational approach that:
- Engages customers landing via digital ads/marketing emails
- Understands customer needs and convinces them to take personal loans
- Completes end-to-end process: verification → underwriting → sanction letter generation

### Key Requirements
1. **Master Agent**: Orchestrates conversation flow and coordinates worker agents
2. **Worker Agents**:
   - **Sales Agent**: Negotiates terms, discusses amount/tenure/rates
   - **Verification Agent**: Confirms KYC details and document uploads
   - **Underwriting Agent**: Validates eligibility based on credit rules
   - **Sanction Generator**: Creates automated PDF approval letters

---

## Solution Architecture
```
              ┌─────────────────────────────────────────────────────────────────┐
              │                          TIARA System                           │
              │                   (Master Agent Controller)                     │
              │              Powered by Google Gemini 2.5 Flash                 │
              └────────────────────────┬────────────────────────────────────────┘
                                       │
                      ┌────────────────┼────────────────┐
                      │                │                │
                      ▼                ▼                ▼
              ┌───────────────┐ ┌──────────────┐ ┌──────────────┐
              │ Discovery     │ │ Sales Agent  │ │ Verification │
              │ & Welcome     │ │ (Negotiation)│ │ Agent (KYC)  │
              │ (Master)      │ │              │ │              │
              └───────────────┘ └──────────────┘ └──────────────┘
                      │                │                │
                      └────────────────┼────────────────┘
                                       ▼
                      ┌────────────────────────────────┐
                      │    Underwriting Agent          │
                      │    (Credit Evaluation)         │
                      └────────────────┬───────────────┘
                                       ▼
                      ┌────────────────────────────────┐
                      │   Sanction Letter Generator    │
                      │   (PDF Generation - pdf-lib)   │
                      └────────────────────────────────┘
```
---

## Agentic AI Workflow

### Stage-by-Stage Journey

#### **Stage 1: Welcome & Authentication**
- Master Agent greets the customer
- Phone number collection & OTP verification
- Customer profile retrieval from mock CRM

#### **Stage 2: Discovery**
- Master Agent understands loan requirements
- Extracts: Purpose, Amount, Preferred Tenure
- Natural language understanding for amount detection (₹3 lakhs, 300000, etc.)

#### **Stage 3: Sales**
- **Sales Agent** presents personalized loan offer
- Shows EMI calculations with tenure options (36/48/60 months)
- Handles negotiation and customer objections
- Displays credit score and affordability ratios

#### **Stage 4: Verification**
- **Verification Agent** requests KYC documents
- Document upload interface: Aadhaar, PAN, Salary Slip (conditional)
- Real-time upload validation

#### **Stage 5: Underwriting**
- **Underwriting Agent** evaluates eligibility
- Credit score verification (min 700/900)
- Pre-approved limit checks
- EMI-to-salary ratio validation (max 50%)

#### **Stage 6: Sanction**
- **Sanction Generator** creates PDF offer letter
- Instant download with loan details
- Unique Loan ID generation

---

## Key Features

### 🎭 Multi-Agent Orchestration
- **Master Agent** seamlessly coordinates 4 specialized worker agents
- Intelligent stage transitions based on conversation context
- Agent handoff notifications for transparency

### 💬 Human-Like Conversation
- Natural language understanding using Google Gemini 2.5 Flash
- Context-aware responses with conversation memory
- Smart amount/tenure extraction from free-form text

### 📊 Intelligent Underwriting
```javascript
Approval Rules:
✓ Amount ≤ Pre-approved Limit → Instant Approval
✓ Amount ≤ 2× Limit + Salary Slip → Conditional Approval
✗ Amount > 2× Limit → Rejection
✗ Credit Score < 700 → Rejection
✗ EMI > 50% Salary → Rejection
```

### 🌐 Multi-Language Support
- English, Hindi, Odia, Tamil, Malayalam, Marathi, Kannada, Bengali
- Language switcher in chat interface

### 📄 Automated Sanction Letters
- PDF generation with loan details
- Downloadable offer letters
- Professional formatting with Tata Capital branding

---

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Modern icon library

### Backend
- **Next.js API Routes** - Serverless functions
- **OpenRouter API** - AI model orchestration
- **Google Gemini 2.5 Flash Lite** - Conversational AI

### Document Generation
- **PDFKit** - PDF creation library
- **Canvas-based** rendering for professional documents

### State Management
- **React Hooks** (useState, useEffect, useRef)
- **localStorage** - Session persistence
- Server-side memory store for conversation history

---

## Installation & Setup

### Prerequisites
```bash
Node.js 18.x or higher
npm or yarn package manager
```

### Clone Repository
```bash
git clone https://github.com/sujit-prog/EY.git
cd EY
```

### Install Dependencies
```bash
npm install
# or
yarn install
```

### Environment Variables
Create a `.env.local` file:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Run Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm start
```

---

## User Journey

### Step-by-Step Flow

1. **Landing** 
   - Customer arrives via marketing campaign
   - TIARA welcomes with friendly greeting

2. **Authentication**
   - Phone number input: `9337236782`
   - OTP verification (any 4-digit code accepted in demo)

3. **Conversation**
   ```
   User: "I need a loan for education"
   TIARA: "Great! How much are you looking to borrow?"
   
   User: "3 lakhs"
   TIARA: "Based on your profile, we can offer ₹3 lakhs at 10.5% p.a..."
   ```

4. **Negotiation**
   - EMI calculations shown
   - Tenure options presented
   - Customer can adjust terms

5. **Document Upload**
   - Aadhaar Card ✓
   - PAN Card ✓
   - Salary Slip (if amount > pre-approved limit) ✓

6. **Instant Decision**
   - Underwriting completes in seconds
   - Approval/rejection notification

7. **Sanction Letter**
   - PDF download with full loan details
   - Unique Loan ID for reference

---

## Underwriting Logic

### Approval Matrix

| Scenario | Amount | Credit Score | Salary Slip | EMI Ratio | Decision |
|----------|--------|--------------|-------------|-----------|----------|
| **Instant** | ≤ Pre-approved | ≥ 700 | Not Required | ≤ 50% | ✅ APPROVED |
| **Conditional** | ≤ 2× Limit | ≥ 700 | **Required** | ≤ 50% | ✅ APPROVED |
| **High Amount** | > 2× Limit | Any | Any | Any | ❌ REJECTED |
| **Low Credit** | Any | < 700 | Any | Any | ❌ REJECTED |
| **High EMI** | Any | ≥ 700 | Yes | > 50% | ❌ REJECTED |

### Example Calculations
```
Customer: Dharmendra Mahanta
Salary: ₹60,000/month
Pre-approved: ₹4.5 lakhs
Credit Score: 780/900

Scenario 1: ₹3 lakhs request
→ Within limit → Instant Approval ✅

Scenario 2: ₹7 lakhs request  
→ < 2× limit (₹9L) → Needs salary slip
→ EMI: ₹16,500 (27.5% of salary) → Approved ✅

Scenario 3: ₹10 lakhs request
→ > 2× limit → Rejected ❌
```

---

## Test Scenarios

### Pre-Configured Test Users

| Phone | Name | Salary | Credit | Pre-approved | Scenario |
|-------|------|--------|--------|--------------|----------|
| `9876543210` | Rahul Sharma | ₹75K | 820 | ₹6L | Instant Approval |
| `9337236782` | Dharmendra Mahanta | ₹60K | 780 | ₹4.5L | Conditional |
| `9876543214` | Vikram Singh | ₹55K | 650 | ₹2L | Low Credit Score |
| `9876543212` | Amit Patel | ₹125K | 850 | ₹10L | Premium Customer |

### Testing Flows

**Flow 1: Instant Approval**
```
Phone: 9876543210
Amount: ₹4 lakhs
Expected: Approved without salary slip
```

**Flow 2: Salary Slip Required**
```
Phone: 9337236782  
Amount: ₹7 lakhs
Expected: Approved after salary slip upload
```

**Flow 3: Rejection - Amount**
```
Phone: 9876543216
Amount: ₹10 lakhs
Expected: Rejected (exceeds 2× limit)
```

---

## Project Structure

```
EY/
├── app/
│   ├── page.tsx              # Main chat interface
│   ├── layout.tsx            # Root layout
│   └── api/
│       └── chat/
│           └── route.ts      # Multi-agent orchestration logic
├── components/
│   └── chat/
│       ├── ChatShell.tsx     # Main chat UI component
│       ├── MessageBubble.tsx # Individual message rendering
│       └── StageIndicator.tsx # Visual stage progress
├── lib/
│   ├── users.ts              # Mock CRM data (10 customers)
│   ├── prompts.ts            # Agent system prompts
│   ├── emi.ts                # EMI calculation utilities
│   ├── pdf.ts                # Sanction letter generator
│   ├── memory.ts             # Session state management
│   ├── loanConfig.ts         # Interest rates & terms
│   └── openrouter.ts         # AI model configuration
├── public/                   # Static assets
├── .env.local               # Environment variables
└── README.md                # This file
```

---

## Team

**Team Name**: Veggies

**Team Members**:
| Avatar | Name | Role | GitHub |
|--------|------|------|--------|
| <img src="https://github.com/dharmendra-007.png" width="30" height="30" style="border-radius: 50%"> | [Dharmendra Mahanta](https://github.com/dharmendra-007) | Backend Development | [@dharmendra-007](https://github.com/dharmendra-007)
| <img src="https://github.com/sujit-prog.png" width="30" height="30" style="border-radius: 50%"> | [Sujit Kumar Sha](https://github.com/sujit-prog) | Frontend Development | [@sujit-prog](https://github.com/sujit-prog)
| <img src="https://github.com/Al-Pa-Na.png" width="30" height="30" style="border-radius: 50%"> | [Alpana Mohanty](https://github.com/Al-Pa-Na) | Agentic AI Backend Development | [@Al-Pa-Na](https://github.com/Al-Pa-Na)
| <img src="https://github.com/aditipanda01.png" width="30" height="30" style="border-radius: 50%"> | [Aditi Panda](https://github.com/aditipanda01) | Backend,system integration| [@aditipanda01](https://github.com/aditipanda01)
| <img src="https://github.com/preranadas03.png" width="30" height="30" style="border-radius: 50%"> | [Prerana Priyadarsini Das](https://github.com/preranadas03) | Business Logic & Rule Design | [@preranadas03](https://github.com/preranadas03)

**Institution**: Veer Surendra Sai University Of Technology, Burla, Sambalpur

**Hackathon**: EY Techathon 6.0 - BFSI Challenge

---

## Key Learnings

### Agentic AI Design Principles
1. **Clear Agent Boundaries**: Each agent has a specific, well-defined role
2. **Master Orchestration**: Central controller manages workflow transitions
3. **Context Preservation**: Conversation history maintained across agents
4. **Error Handling**: Graceful degradation when agents fail
5. **Human-in-the-Loop**: User controls pace of conversation

### Technical Achievements
- ✅ Implemented multi-agent orchestration with 4 specialized AIs
- ✅ Built intelligent underwriting with 5+ business rules
- ✅ Created natural language understanding for loan parameters
- ✅ Developed real-time document upload simulation
- ✅ Generated professional PDF sanction letters
- ✅ Achieved sub-2-second response times

---

## Edge Cases Handled

| Edge Case | Handling Strategy |
|-----------|------------------|
| **User uploads wrong document** | Re-upload prompt with clear instructions |
| **Amount in different formats** | Regex patterns for lakhs/L/numbers |
| **Tenure not specified** | Default to 48 months, allow adjustment |
| **Network failure** | Error message with retry option |
| **Invalid phone number** | Validation before OTP generation |
| **Borderline credit score** | Clear rejection message with reason |
| **Multiple loan requests** | Session isolation via unique IDs |

---

## Future Enhancements

- [ ] **Voice Integration**: Speech-to-text for hands-free interaction
- [ ] **Live Credit Bureau API**: Real-time credit score fetching
- [ ] **Co-applicant Support**: Joint loan applications
- [ ] **EMI Calculator Widget**: Interactive affordability tool
- [ ] **WhatsApp Integration**: Loan application via messaging
- [ ] **Predictive Analytics**: ML-based approval likelihood
- [ ] **Regional Language NLP**: Advanced multilingual support
- [ ] **Video KYC**: Live verification for high-value loans

---

## Contact

For queries regarding this project:

**Email**: [dev.dharmendra.m@gmail.com](mailto:dev.dharmendra.m@gmail.com)  
**LinkedIn**: [@dharmendram007](https://www.linkedin.com/in/dharmendram007/)  
**GitHub**: [@dharmendra-007](https://github.com/dharmendra-007) 

---

<div align="center">

**Built with ❤️ for EY Techathon 6.0**

*Empowering India's Digital Future Through Agentic AI*

</div>