[README.md](https://github.com/user-attachments/files/30692343/README.md)
# DualForge — Enterprise E-Commerce Platform with Real-Time Analytics & Dynamic Product Management

> **Course:** Java Full Stack  
> **Program:** EWDP — Ethnotech Work Force Development Program  
> **Institution:** Ethnotech Academic Solutions Private Limited in association with Madanapalle Institute of Technology & Science, Andhra Pradesh  

---

## 👥 DualForge Engineering Team & Contributions

| S.No | Name | Roll Number | Role | Key Contributions |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **M. Madhu Teja** | 23691A3762 | **Team Lead & Full Stack Architect** | System architecture, JWT security design, Cart & Order services, React SPA integration, AI decision chatbot, smart size calculator. |
| 2 | **K. Madhu** | 23691A3761 | **Frontend Engineer** | Catalog layout, responsive glassmorphism CSS, comparison matrix modal UI, product card components. |
| 3 | **A. Hemanth Reddy** | 23691A3747 | **Backend Developer** | REST controller endpoints, Product & Cart services, JPA repository queries, Maven build setup. |
| 4 | **V. Govardhan** | 23691A3738 | **Database Engineer** | Relational JPA schema design, H2 entity mapping, initial database seeding logic (60+ products). |
| 5 | **B. Harsha Vardhan** | 23691A3740 | **Security Specialist** | Spring Security filter chain, BCrypt password encoder, OTP verification service, role permission enforcement. |
| 6 | **S. Harinath Reddy** | 23691A3738 | **QA & NoSQL Integration** | MongoDB review persistence driver, JUnit 5 unit test cases, Mockito backend API validation. |

---

## 🚀 Key Features

1. **AI Shopping Decision Assistant:** Natural language query chatbot parsing budget constraints & intent (e.g. *"I have ₹5000. I need headphones for gaming"*).
2. **Product Comparison Matrix:** Side-by-side spec comparison table for up to 4 items with automated **🤖 AI Value Recommendation**.
3. **Smart Size Recommendation Calculator:** Computes exact UK & apparel sizes based on body length (cm) and fit preferences (`Slim`, `Regular`, `Loose`).
4. **Prevent Wrong Product Variant Orders:** Enforces mandatory size/color variant selection with pre-add confirmation modals.
5. **AI Coupon Optimizer:** Auto-detects and applies maximum discount code (`FLAGSHIP20` for 20% off) with 1-click execution.
6. **Shop-by-Budget Bundle Generator:** Multi-category product bundle maker fitting target user budgets.
7. **DualForge Trust Score (94/100) & Eco Ratings:** Verified seller audit badges and Sustainability Eco Impact breakdown.
8. **60+ Seeding Catalog:** Populated dataset spanning Electronics, Audio, Laptops, Sports Footwear, Hoodies, Jackets, Smartwatches, and Accessories.

---

## 🛠️ Technology Stack

* **Frontend:** React 18, Vite 5, Lucide React, Custom Glassmorphism Vanilla CSS, React Context API.
* **Backend:** Spring Boot 3.3.4, Java 21, Spring Security, JJWT (JSON Web Tokens).
* **Database Layer:** Spring Data JPA + H2 (Transactional), MongoDB (Customer Product Reviews).
* **Testing:** JUnit 5, Mockito.

---

## 💻 How to Run Locally

### Prerequisites
* JDK 21
* Node.js v18+ & npm
* Apache Maven 3.9+

### Option 1: Quick Launcher (Windows)
Double-click **`run_project.bat`** in the project root directory.

### Option 2: Manual Start

1. **Backend (Port 8085):**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Frontend (Port 5173):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📄 License & Academic Attribution
Developed as part of the **EWDP Java Full Stack Capstone Project** by Ethnotech Academic Solutions Pvt Ltd & Madanapalle Institute of Technology & Science, Andhra Pradesh.
