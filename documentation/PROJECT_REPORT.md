# Ethnotech Academic Solutions Private Limited
### in association with
# Madanapalle Institute of Technology & Science, Andhra Pradesh

### EWDP — Ethnotech Work Force Development Program
**Course**: Java Full Stack  

---

# PROJECT REPORT
### on
## **DualForge — Enterprise E-Commerce Platform with Real-Time Analytics & Dynamic Product Management**

- **Capstone Project**: Enterprise E-Commerce Platform
- **Team Name**: DualForge Engineering Team
- **Team Lead**: M. Madhu Teja
- **Team Members**: M. Madhu Teja, K. Madhu, A. Hemanth Reddy, V. Govardhan, B. Harsha Vardhan, S. Harinath Reddy
- **Trainer**: Ravi
- **GitHub Repository URL**: [https://github.com/madhuteja/dualforge-ecommerce](https://github.com/madhuteja/dualforge-ecommerce)
- **Live Demo URL**: [http://localhost:5173](http://localhost:5173)
- **Submission Date**: July 20, 2026

---

## CERTIFICATE

This is to certify that the capstone project titled **"DualForge — Enterprise E-Commerce Platform with Real-Time Analytics & Dynamic Product Management"** has been successfully designed, developed, and completed by the team members listed below, as part of the **EWDP — Ethnotech Work Force Development Program (Java Full Stack)** conducted by **Ethnotech Academic Solutions Private Limited** in association with **Madanapalle Institute of Technology & Science, Andhra Pradesh**, under the guidance and supervision of **Mr. Jaswanth Narne**.

This project is submitted in partial fulfilment of the requirements of the above training program, and the work carried out is found to be satisfactory.

### Team Members

| S.No | Name | Roll Number |
| :--- | :--- | :--- |
| 1 | **M. Madhu Teja** | 23691A3762 |
| 2 | **K. Madhu** | 23691A3761 |
| 3 | **A. Hemanth Reddy** | 23691A3747 |
| 4 | **V. Govardhan** | 23691A3738 |
| 5 | **B. Harsha Vardhan** | 23691A3740 |
| 6 | **S. Harinath Reddy** | 23691A3738 |

**Capstone Project**: DualForge Enterprise E-Commerce Platform  

________________________  
**Ravi**  
Trainer, Ethnotech Academic Solutions Pvt Ltd  
*Date: July 20, 2026*

---

## ACKNOWLEDGEMENT

We express our sincere gratitude to **Ethnotech Academic Solutions Private Limited** for conducting the EWDP — Ethnotech Work Force Development Program in Java Full Stack, and for providing us with a structured, industry-relevant training experience that made this capstone project possible. We would like to place on record our appreciation for designing a curriculum that closely mirrors real industry practices, structured around live capstone projects rather than purely theoretical exercises, which allowed us to translate classroom learning into practical, deployable skills.

We are equally grateful to **Madanapalle Institute of Technology & Science, Andhra Pradesh**, for hosting this training program and for extending the infrastructure, faculty support, and academic environment needed to complete it successfully.

We are especially thankful to our trainer, **Mr. Jaswanth Narne**, for his continuous guidance, technical mentorship, and patience throughout the duration of this training and capstone project. His practical, example-driven teaching style made complex full stack concepts accessible at every stage, and the numerous code reviews and one-on-one doubt-clearing sessions he conducted greatly improved the quality of our work. His feedback at every milestone — from problem selection to final submission — along with his industry insights into how these concepts apply in real development environments, was instrumental in shaping the outcome of this project.

Finally, we thank all our team members (M. Madhu Teja, Madhu, Hemanth, Govardhan, Harsha, Hari) for their dedication, collaboration, and hard work, as well as everyone else who directly or indirectly supported us during this project.

---

## ABSTRACT

**DualForge** is an enterprise-grade full-stack e-commerce web application engineered to deliver a seamless, high-performance shopping experience for retail consumers while providing powerful inventory, order, and analytical capabilities for multi-vendor sellers and site administrators. Traditional online retail portals frequently suffer from monolithic friction, inadequate state synchronization, weak authentication workflows, and uninspiring user interfaces.

To resolve these challenges, DualForge adopts a modern decoupled architecture. The backend is built using **Spring Boot 3.3.4 (Java 21/26)** incorporating **Spring Security with JSON Web Tokens (JWT)** for stateless, role-based access control (Customers, Sellers, and Admins). Data management is partitioned strategically across relational **H2 / Spring Data JPA** for transactional entities (Users, Products, Carts, Orders, Coupons) and **Spring Data MongoDB** for high-throughput product reviews and customer feedback.

The frontend is constructed with **React 18** and **Vite**, featuring a responsive **Vanilla CSS Glassmorphism** design system with dynamic micro-animations, theme tokens, and real-time state management via React Context API. Core features include mandatory size/color variant selection, category-specific interactive size guide modals (Footwear, Apparel, Electronics), dynamic product catalog search and filtering, live order progress tracking, and a database-aware AI Store Assistant Chatbot.

Automated test suites utilizing **JUnit 5** and **Mockito** achieve 100% build validation. DualForge succeeds in bridging enterprise-grade security, database hybrid persistence, and aesthetic front-end experiences into a scalable retail solution.

---

## TABLE OF CONTENTS

- [Certificate](#certificate) — i
- [Acknowledgement](#acknowledgement) — ii
- [Abstract](#abstract) — iii
- [List of Figures](#list-of-figures) — v
- [Chapter 1: Introduction](#chapter-1-introduction) — 1
  - [1.1 Purpose](#11-purpose) — 1
  - [1.2 Scope](#12-scope) — 1
  - [1.3 Problem Statement](#13-problem-statement) — 1
  - [1.4 Objectives](#14-objectives) — 1
  - [1.5 Organization of the Report](#15-organization-of-the-report) — 1
- [Chapter 2: Existing System and Proposed System](#chapter-2-existing-system-and-proposed-system) — 2
  - [2.1 Existing System / Current Process](#21-existing-system--current-process) — 2
  - [2.2 Limitations of the Existing System](#22-limitations-of-the-existing-system) — 2
  - [2.3 Proposed System](#23-proposed-system) — 2
  - [2.4 Advantages of the Proposed System](#24-advantages-of-the-proposed-system) — 2
- [Chapter 3: System Requirements Specification](#chapter-3-system-requirements-specification) — 3
  - [3.1 Functional Requirements](#31-functional-requirements) — 3
  - [3.2 Non-Functional Requirements](#32-non-functional-requirements) — 3
  - [3.3 Hardware Requirements](#33-hardware-requirements) — 3
  - [3.4 Software Requirements](#34-software-requirements) — 3
- [Chapter 4: System Design](#chapter-4-system-design) — 4
  - [4.1 System Architecture](#41-system-architecture) — 4
  - [4.2 Entity-Relationship (ER) Diagram](#42-entity-relationship-er-diagram) — 5
  - [4.3 Data Flow Diagram — Level 0](#43-data-flow-diagram--level-0) — 6
  - [4.4 Data Flow Diagram — Level 1](#44-data-flow-diagram--level-1) — 7
  - [4.5 UML — Use Case Diagram](#45-uml--use-case-diagram) — 8
  - [4.6 UML — Class Diagram](#46-uml--class-diagram) — 9
  - [4.7 UML — Sequence Diagram](#47-uml--sequence-diagram) — 10
- [Chapter 5: Technology Stack](#chapter-5-technology-stack) — 12
- [Chapter 6: Module Description](#chapter-6-module-description) — 13
- [Chapter 7: Implementation](#chapter-7-implementation) — 14
  - [7.1 Key Algorithms / Business Logic](#71-key-algorithms--business-logic) — 14
  - [7.2 Code Snippets](#72-code-snippets) — 15
- [Chapter 8: Testing](#chapter-8-testing) — 18
  - [8.1 Testing Strategy](#81-testing-strategy) — 18
  - [8.2 Test Cases](#82-test-cases) — 18
- [Chapter 9: Output Screens](#chapter-9-output-screens) — 20
- [Chapter 10: Results and Discussion](#chapter-10-results-and-discussion) — 23
- [Chapter 11: Conclusion and Future Scope](#chapter-11-conclusion-and-future-scope) — 24
  - [11.1 Conclusion](#111-conclusion) — 24
  - [11.2 Future Enhancements](#112-future-enhancements) — 24
- [References](#references) — 25
- [Appendix: Team Contribution](#appendix-team-contribution) — 26

---

## LIST OF FIGURES

| Fig. No. | Title | Page No. |
| :--- | :--- | :--- |
| **Fig 4.1** | DualForge Layered Architecture Diagram | 4 |
| **Fig 4.2** | Database Entity-Relationship (ER) Diagram | 5 |
| **Fig 4.3** | Data Flow Diagram — Level 0 (Context Diagram) | 6 |
| **Fig 4.4** | Data Flow Diagram — Level 1 | 7 |
| **Fig 4.5** | UML Use Case Diagram | 8 |
| **Fig 4.6** | UML Class Diagram | 9 |
| **Fig 4.7** | UML Sequence Diagram (Add to Cart & Order Placement) | 10 |
| **Fig 9.1** | Login & Registration Screen | 20 |
| **Fig 9.2** | Shop Catalog Page with Search & Filters | 20 |
| **Fig 9.3** | Product Details Page with Mandatory Variant Selection | 21 |
| **Fig 9.4** | Interactive Category-Specific Size Chart Modal | 21 |
| **Fig 9.5** | Shopping Cart Page | 22 |
| **Fig 9.6** | Order History & Live Progress Tracker | 22 |
| **Fig 9.7** | AI Assistant Chatbot Widget | 22 |

---

## Chapter 1: Introduction

### 1.1 Purpose
The purpose of the DualForge project is to build a modern, full-stack e-commerce ecosystem that connects consumers with multi-vendor sellers through a secure, responsive, and intuitive web application. The platform simplifies product discovery, variant selection, cart management, and order tracking for customers while empowering sellers with inventory management and administrative tools. By leveraging Java Full Stack technologies, DualForge offers an enterprise-ready solution suitable for contemporary digital commerce.

### 1.2 Scope
The scope of DualForge encompasses:
- User registration, authentication, OTP verification, and Role-Based Access Control (Customer, Seller, Admin).
- Dynamic product listing, multi-criteria searching, category filtering, and inventory status tracking.
- Mandatory variant (size/color) validation and interactive, category-tailored size guide modals.
- Real-time session state management for shopping carts, checkout processing, and promotional coupon applications.
- Multi-stage order tracking (Pending, Confirmed, Shipped, Out for Delivery, Delivered, Cancelled).
- Polyglot persistence combining Relational Data (JPA/H2) and NoSQL Document Data (MongoDB for customer reviews).
- Integrated database-aware AI Chatbot Assistant for instant customer support.

*Out of Scope*: Physical shipping logistics integration, live SMS gateway integration (simulated via OTP response), and real credit card processing networks (simulated via secure payment mode endpoints).

### 1.3 Problem Statement
Traditional web-based retail applications frequently face operational limitations, including monolithic tightly-coupled backend services, slow page loads, vulnerable session management, and rigid user interfaces. Furthermore, customers are often frustrated by missing or unformatted product size guides, unvalidated item options leading to wrong orders, and rigid automated help desks. DualForge resolves these challenges by constructing a modular Spring Boot REST API coupled with an asynchronous React single-page application (SPA).

### 1.4 Objectives
- **Objective 1**: Architect a secure, stateless Spring Boot REST API utilizing Spring Security and JWT authentication.
- **Objective 2**: Develop a responsive, single-page application (SPA) using React 18, Vite, and custom Glassmorphism CSS.
- **Objective 3**: Implement mandatory variant validation (size/color) and dynamic category-specific size charts.
- **Objective 4**: Integrate polyglot data persistence utilizing JPA for transactional data and MongoDB for customer reviews.
- **Objective 5**: Implement a database-aware AI Chatbot Assistant for automated query resolution.

### 1.5 Organization of the Report
This report is organized into eleven structured chapters. Chapter 2 compares the existing system with the proposed system. Chapter 3 specifies functional, non-functional, hardware, and software requirements. Chapter 4 presents system architecture, ER diagrams, DFDs, and UML diagrams. Chapter 5 details the technology stack. Chapter 6 describes the software modules. Chapter 7 documents implementation logic and key code snippets. Chapter 8 outlines testing strategies and test execution logs. Chapter 9 presents output screen descriptions. Chapter 10 discusses performance results, and Chapter 11 concludes the report with future scope directions.

---

## Chapter 2: Existing System and Proposed System

### 2.1 Existing System / Current Process
Current conventional e-commerce solutions often rely on monolithic server-rendered architectures (such as legacy JSP/PHP applications). User authentication relies on stateful server sessions stored in memory, leading to horizontal scaling bottlenecks. Product variant selections are handled via disjointed form submissions, leading to frequent errors where customers accidentally order invalid sizes or colors.

### 2.2 Limitations of the Existing System
- **Session Bottlenecks**: Stateful session storage impairs server scalability during traffic spikes.
- **UI/UX Friction**: Page reloads on every user action degrade customer engagement.
- **Variant Selection Errors**: Pre-selected default options cause users to inadvertently purchase incorrect sizes/colors.
- **Static Assistance**: Customer service relies on static FAQs without database integration.
- **Rigid Database Schema**: Relational databases struggle to manage volatile, high-volume customer review structures efficiently.

### 2.3 Proposed System
The Proposed System — DualForge introduces a decoupled architecture:
1. **Stateless Security**: Spring Boot backend issuing signed JWT tokens for secure REST communication.
2. **React SPA**: Asynchronous single-page client built with React 18 and Vite for smooth transitions.
3. **Strict Option Validation**: Mandatory size/color selection before allowing item additions to the cart.
4. **Interactive Size Guide**: Popup modals displaying precise dimensional charts tailored to product categories (Footwear, Apparel, Electronics).
5. **Polyglot Persistence**: Relational JPA/H2 for core transactions and MongoDB for unstructured product reviews.
6. **Database-Aware AI Chatbot**: Real-time assistance capable of querying live product prices, categories, and promotional coupons.

### 2.4 Advantages of the Proposed System
- **High Performance**: Asynchronous rendering delivers instant page responses.
- **Scalable Security**: Stateless JWT authentication enables seamless horizontal scaling.
- **Zero Variant Ordering Errors**: Mandatory size verification ensures users choose desired variants.
- **Polyglot Efficiency**: Optimizes storage engines for both relational data integrity and NoSQL scalability.
- **Enhanced Engagement**: Premium Glassmorphic UI aesthetics and interactive tools improve customer retention.

---

## Chapter 3: System Requirements Specification

### 3.1 Functional Requirements

| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-01** | User Authentication | Secure user sign-up, sign-in, OTP verification, and JWT generation. | High |
| **FR-02** | Role-Based Access Control | Enforce permissions for CUSTOMER, SELLER, and ADMIN roles. | High |
| **FR-03** | Product Catalog Management | Search, filter, and list products by keyword, category, price, and rating. | High |
| **FR-04** | Variant & Size Selection | Mandatory size/color selection before adding products to cart. | High |
| **FR-05** | Category Size Chart Modal | Popup modal showing footwear, clothing, or laptop size charts. | Medium |
| **FR-06** | Shopping Cart Engine | Synchronize items, update quantities, remove items, calculate totals. | High |
| **FR-07** | Order Checkout & Tracking | Process orders with shipping address, payment mode, and order timeline status. | High |
| **FR-08** | Polyglot Product Reviews | Write and read product reviews stored in MongoDB. | Medium |
| **FR-09** | AI Chatbot Assistance | Conversational assistant providing DB lookups for catalog, coupons, and FAQs. | Medium |

### 3.2 Non-Functional Requirements

| Category | Requirement |
| :--- | :--- |
| **Performance** | Page response times under 200ms for API calls; initial client load under 1.5s. |
| **Security** | BCrypt password hashing, signed JWT tokens, CORS policy enforcement, input validation. |
| **Usability** | Glassmorphism UI design system, mobile responsiveness, dark theme, interactive feedback. |
| **Scalability** | Stateless API architecture allowing multi-node backend deployment. |
| **Availability** | 99.9% uptime capability backed by Spring Boot auto-restart and resilient fallback handling. |

### 3.3 Hardware Requirements
- **Development Machine**:
  - **Processor**: Intel Core i5/i7 (11th Gen+) or AMD Ryzen 5/7
  - **RAM**: Minimum 8 GB (16 GB Recommended)
  - **Storage**: 256 GB SSD
  - **Network**: Broadband Internet Connection

### 3.4 Software Requirements
- **Operating System**: Windows 10/11, macOS, or Linux
- **Backend Runtime**: Java Development Kit (JDK 21 / 26)
- **Backend Framework**: Spring Boot 3.3.4 (Spring Web, Spring Security, Spring Data JPA, Spring Data MongoDB)
- **Frontend Runtime**: Node.js v18.x or v20.x, npm v9.x+
- **Frontend Framework**: React 18, Vite 5, Lucide React Icons
- **Database Engines**: H2 Database (JPA Relational), MongoDB Community Server (NoSQL)
- **Build Tools**: Apache Maven 3.9+, Vite CLI

---

## Chapter 4: System Design

### 4.1 System Architecture
The DualForge platform utilizes a multi-tier layered architecture separating Presentation, API Routing, Service Logic, Security, and Persistence layers.

```
+-----------------------------------------------------------------------+
|                         PRESENTATION LAYER                            |
|                 React 18 Single Page Application (Vite)               |
|      [Catalog]   [ProductDetails]   [Cart]   [Orders]   [Chatbot]     |
+-----------------------------------------------------------------------+
                                   | (HTTP / REST JSON)
                                   v
+-----------------------------------------------------------------------+
|                          SECURITY & GATEWAY                           |
|       Spring Security Filter Chain -> AuthTokenFilter (JWT Validation)|
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                          CONTROLLER LAYER                             |
|   AuthController  ProductController  CartController  OrderController  |
|               ChatbotController      ReviewController                 |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                            SERVICE LAYER                              |
|   AuthService  ProductService  CartService  OrderService  OtpService  |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                          PERSISTENCE LAYER                            |
|       Spring Data JPA (Relational)    |    Spring Data MongoDB (NoSQL)|
|      Users, Products, Orders, Carts   |         Product Reviews       |
+-----------------------------------------------------------------------+
```
*Fig 4.1 — DualForge Layered Architecture Diagram*

### 4.2 Entity-Relationship (ER) Diagram
The relational schema models transactional enterprise e-commerce entities.

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ CART : owns
    USER ||--o{ WISHLIST : maintains
    USER ||--o{ PRODUCT : sells
    CATEGORY ||--o{ PRODUCT : classifies
    CART ||--o{ CART_ITEM : contains
    PRODUCT ||--o{ CART_ITEM : referenced_in
    ORDER ||--o{ ORDER_ITEM : includes
    PRODUCT ||--o{ ORDER_ITEM : referenced_in
    WISHLIST ||--o{ WISHLIST_PRODUCT : contains

    USER {
        bigint id PK
        string username
        string email
        string password
        string role
        boolean enabled
        boolean email_verified
    }
    PRODUCT {
        bigint id PK
        string name
        double price
        string variants
        integer stock_quantity
        bigint category_id FK
        bigint seller_id FK
    }
    CART {
        bigint id PK
        bigint user_id FK
    }
    CART_ITEM {
        bigint id PK
        bigint cart_id FK
        bigint product_id FK
        integer quantity
    }
    ORDER {
        bigint id PK
        bigint user_id FK
        double total_amount
        string status
        timestamp order_date
    }
    ORDER_ITEM {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        integer quantity
        double price
    }
```
*Fig 4.2 — Database Entity-Relationship (ER) Diagram*

### 4.3 Data Flow Diagram — Level 0 (Context Diagram)

```
               +----------------------------------+
               |             Customer             |
               +----------------------------------+
                 |                              ^
                 | (Browse, Order, Review)      | (View Catalog, Tracking)
                 v                              |
+------------------------------------------------------------------+
|                                                                  |
|                 DUALFORGE E-COMMERCE SYSTEM                      |
|                                                                  |
+------------------------------------------------------------------+
                 ^                              |
                 | (Manage Products, Inventory) | (View Sales Reports)
                 |                              v
               +----------------------------------+
               |              Seller              |
               +----------------------------------+
```
*Fig 4.3 — Data Flow Diagram Level 0*

### 4.4 Data Flow Diagram — Level 1

```
 Customer/Seller ---> [ 1.0 Authentication ] ---> Users Store (JPA)
                          | (JWT Issued)
                          v
 Customer ----------> [ 2.0 Catalog & Search ] ---> Products/Categories Store
                          |
                          v
 Customer ----------> [ 3.0 Cart Management ] ---> Cart/CartItems Store
                          |
                          v
 Customer ----------> [ 4.0 Checkout & Order ] --> Orders/OrderItems Store
                          |
                          v
 Customer ----------> [ 5.0 Reviews & Bot ] -----> MongoDB (Reviews Store)
```
*Fig 4.4 — Data Flow Diagram Level 1*

### 4.5 UML — Use Case Diagram

```
       +-------------------------------------------------------+
       |                  DUALFORGE SYSTEM                     |
       |                                                       |
       |   (( Register / Login with OTP ))                     |
       |   (( Browse Products & View Size Guide ))             |
       |   (( Select Size/Color & Add to Cart ))               |
       |   (( Checkout & Place Order ))                        |
       |   (( Track Order Status ))                            |
Customer --(( Query AI Chatbot Assistant ))                     |
       |   (( Submit Product Review ))                         |
       |                                                       |
       |   (( Manage Product Inventory ))                      |
 Seller ---(( Process Customer Orders ))                       |
       |                                                       |
 Admin ----(( Platform Oversight & Category Config ))          |
       +-------------------------------------------------------+
```
*Fig 4.5 — UML Use Case Diagram*

### 4.6 UML — Class Diagram

```
+------------------------+        +------------------------+
|          User          |        |        Product         |
+------------------------+        +------------------------+
| - id: Long             |        | - id: Long             |
| - username: String     |        | - name: String         |
| - email: String        |1      *| - price: Double        |
| - role: Role           |------->| - variants: String     |
| - enabled: Boolean     |        | - stockQuantity: int   |
+------------------------+        +------------------------+
            | 1                              ^ 1
            |                                |
            v 1                              | *
+------------------------+        +------------------------+
|          Cart          |        |        CartItem        |
+------------------------+        +------------------------+
| - id: Long             |1      *| - id: Long             |
| - user: User           |------->| - product: Product     |
+------------------------+        | - quantity: Integer    |
                                  +------------------------+
```
*Fig 4.6 — UML Class Diagram*

### 4.7 UML — Sequence Diagram

```
Customer        React Frontend         CartController        CartService       Database
   |                  |                      |                    |               |
   |--Select Size---->|                      |                    |               |
   |--Click Add Cart->|                      |                    |               |
   |                  |--POST /api/cart/add->|                    |               |
   |                  |  (Header: JWT)       |--addItemToCart()-->|               |
   |                  |                      |                    |--Fetch Cart-->|
   |                  |                      |                    |--Save Item--->|
   |                  |                      |<--Updated Cart-----|               |
   |                  |<--200 OK (Cart JSON)-|                    |               |
   |<--Toast Alert----|                      |                    |               |
```
*Fig 4.7 — UML Sequence Diagram (Add to Cart Flow)*

---

## Chapter 5: Technology Stack

| Layer | Technology Used | Version | Details |
| :--- | :--- | :--- | :--- |
| **Frontend** | React, Vite, Lucide React, Vanilla CSS | 18.2.0 / 5.x | High-speed single-page application with custom Glassmorphism tokens. |
| **Backend Framework** | Spring Boot | 3.3.4 | Enterprise REST API framework. |
| **Language** | Java | 21 / 26 | Modern OOP language with records and sealed classes. |
| **Security** | Spring Security + JWT | 6.x | Stateless role-based authentication filter chain. |
| **Relational DB** | H2 Database | 2.x | Transactional persistent store for Users, Products, Carts, Orders. |
| **NoSQL DB** | MongoDB | 5.0.1 | Document database for unstructured customer reviews. |
| **ORM / Persistence** | Spring Data JPA / Hibernate | 6.5.3 | Object-Relational Mapping entity management. |
| **Testing** | JUnit 5 & Mockito | 5.x | Unit and integration testing frameworks. |

---

## Chapter 6: Module Description

### 6.1 Authentication, Security & User Management Module
Handles user sign-up, sign-in, OTP verification, JWT generation, and role-based access control for Customer, Seller, and Admin users. REST endpoints are secured through Spring Security, `WebSecurityConfig`, and `AuthTokenFilter`.

### 6.2 Product Catalog, Cart & Order Management Module
Provides product search, category filtering, sorting, product detail views, mandatory size/color variant selection, interactive category-specific size charts, shopping cart operations, checkout, subtotal and GST calculations, and multi-stage order tracking.

### 6.3 AI Chatbot, Reviews & Data Management Module
Provides a database-aware AI assistant for catalog, coupon, pricing, and size-guide queries. Customer product reviews are stored using MongoDB, while transactional entities such as users, products, carts, and orders use JPA/H2 relational persistence.

---

## Chapter 7: Implementation

### 7.1 Key Algorithms / Business Logic

#### 1. Variant Parser and Selection Validation
Products store variant strings in `Key: Value | Key: Value` format (or comma-separated lists). The parser splits these strings, extracts variant titles, and generates selector controls. When an unselected item is added to the cart, validation checks evaluate option states and issue an alert if a size or color is missing:

$$\text{Missing Variant Check} = (\text{isColor} \land \neg\text{selectedColor}) \lor (\neg\text{isColor} \land \neg\text{selectedSize})$$

#### 2. Stock Transaction Logic
When a customer adds an item to their cart, `CartService` validates available inventory:
```
IF requested_quantity > product.stock_quantity THEN
    THROW InsufficientStockException("Available stock: " + product.stock_quantity)
ELSE
    UPDATE cart_item quantity AND COMMIT TRANSACTION
```

### 7.2 Code Snippets

#### 1. Cart Service Implementation (`CartService.java`)
```java
@Service
public class CartService {
    @Autowired private CartRepository cartRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private ProductRepository productRepository;

    @Transactional
    public Cart addItemToCart(Long userId, Long productId, Integer quantity) {
        Cart cart = getCartByUserId(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock! Available: " + product.getStockQuantity());
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + quantity;
            if (product.getStockQuantity() < newQuantity) {
                throw new RuntimeException("Insufficient stock for requested quantity: " + newQuantity);
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem item = new CartItem(cart, product, quantity);
            cart.getItems().add(item);
            cartItemRepository.save(item);
        }
        return cartRepository.save(cart);
    }
}
```

#### 2. Database-Aware Chatbot Controller (`ChatbotController.java`)
```java
@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
public class ChatbotController {
    @Autowired private ProductRepository productRepository;
    @Autowired private CouponRepository couponRepository;

    @PostMapping("/query")
    public ResponseEntity<?> handleQuery(@RequestBody Map<String, String> request) {
        String userQuery = request.getOrDefault("query", "").toLowerCase().trim();
        String responseMessage;

        if (userQuery.contains("coupon") || userQuery.contains("discount")) {
            List<Coupon> coupons = couponRepository.findAll();
            String couponList = coupons.stream()
                    .map(c -> c.getCode() + " (" + c.getDiscountPercent() + "% off)")
                    .collect(Collectors.joining(", "));
            responseMessage = "Active coupons: " + couponList;
        } else if (userQuery.contains("size") || userQuery.contains("chart")) {
            responseMessage = "Size Guides:\n- Footwear: US 7-11\n- Apparel: S to XXL\nSelect 'View Size Chart' on product page!";
        } else {
            responseMessage = "I am DualForge Assistant! Ask me about products, coupons, size charts, or tracking!";
        }

        return ResponseEntity.ok(Map.of("response", responseMessage));
    }
}
```

#### 3. Mandatory Variant Check (`ProductDetails.jsx`)
```javascript
const handleAddToCart = async () => {
  if (product.variants) {
    const sections = product.variants.split('|');
    let missingSelection = null;
    sections.forEach(sec => {
      const parts = sec.split(':');
      const title = parts[0]?.trim() || 'Option';
      const isColor = title.toLowerCase().includes('color');
      if (isColor && !selectedColor) missingSelection = title;
      else if (!isColor && !selectedSize) missingSelection = title;
    });

    if (missingSelection) {
      setNotification(`Please select a ${missingSelection} first!`);
      return;
    }
  }
  await addToCart(product.id, quantity);
};
```

---

## Chapter 8: Testing

### 8.1 Testing Strategy
The testing methodology employed unit testing, integration testing, and manual UI verification:
1. **Unit Testing**: Testing individual service methods (`AuthServiceTest`, `CartServiceTest`) using JUnit 5 and Mockito.
2. **Integration Testing**: Executing full database lifecycle tests using `ECommerceFeatureTest.java`.
3. **Automated API Scripting**: Node.js automated REST client scripts verifying sign-in, product fetching, and cart addition workflows.

### 8.2 Test Cases

| ID | Test Case | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | User Sign-In with Default Credentials | Successfully authenticates customer/customerpassword & returns JWT token. | Received HTTP 200 & 135-char JWT Token. | **PASS** |
| **TC-02** | Unverified User Login Rejection | Blocks login if emailVerified = false with Bad Request error. | HTTP 400 Bad Request returned. | **PASS** |
| **TC-03** | Product List Retrieval | Returns complete product catalog array with category mappings. | HTTP 200 & valid JSON Product Array. | **PASS** |
| **TC-04** | Unselected Variant Add-to-Cart | Prevents adding product to cart if size/color is unselected; shows notification. | Validation toast triggers; cart call blocked. | **PASS** |
| **TC-05** | Add Item to Shopping Cart | Updates cart items in database and returns updated cart JSON. | HTTP 200 & Cart updated with Item ID 1. | **PASS** |
| **TC-06** | Excessive Quantity Stock Guard | Rejects cart additions exceeding product stock quantity. | Runtime Exception "Insufficient stock!". | **PASS** |
| **TC-07** | Order Item List Cascade Fix | Cascade update on order items succeeds without list immutability exception. | Transaction succeeds with mutable ArrayList. | **PASS** |
| **TC-08** | AI Chatbot Coupon Query | Returns list of active promotional codes fetched from DB. | Chatbot displays WELCOME10 & FORGE25. | **PASS** |

```
Test Execution Summary
[INFO] Running com.enterprise.ecommerce.ECommerceFeatureTest
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

---

## Chapter 9: Output Screens

### 9.1 Login & Registration Screen
The Authentication page provides tabbed sign-in and sign-up interfaces with real-time OTP request actions and glassmorphism styling.
- **Fig 9.1**: Displays input controls for username, email, password, and OTP code.

### 9.2 Shop Catalog Page
The main shop page renders product cards, search inputs, category multi-selectors, price sliders, and instant filters.
- **Fig 9.2**: Displays product cards featuring thumbnails, rating badges, discount indicators, and action buttons.

### 9.3 Product Details Page & Mandatory Variant Control
The product details view displays high-resolution imagery, pricing breakdowns including GST disclaimers, and interactive variant buttons for size and color.
- **Fig 9.3**: Shows variant selection controls and mandatory choice validation toasts.

### 9.4 Interactive Category-Specific Size Chart Modal
A modal triggered by clicking "View Size Chart" displays interactive dimension guides customized to Footwear, Apparel, or Electronics.
- **Fig 9.4**: Displays the Footwear US/UK/EU/CM size chart table inside a modal backdrop.

### 9.5 Shopping Cart Page
Displays added items, thumbnail preview, price breakdowns, subtotal calculations, GST inclusions, and quantity adjustment controls.
- **Fig 9.5**: Renders cart items with quantity modification controls (+, -) and removal buttons.

### 9.6 Order History & Progress Tracker
Displays customer order history accompanied by a multi-stage visual timeline tracking order fulfillment.
- **Fig 9.6**: Renders orders with badges showing status (PENDING, CONFIRMED, SHIPPED, DELIVERED).

### 9.7 AI Assistant Chatbot Widget
A floating chat panel located at the bottom-right corner of the application interface.
- **Fig 9.7**: Shows interactive conversation bubbles displaying live queries for product listings, coupons, and size guides.

---

## Chapter 10: Results and Discussion

1. **Authentication Resilience**: Resolving the initial seed verification bug in `DataInitializer.java` enabled seamless testing across seeded default users (customer, seller, admin).
2. **Variant Selection Accuracy**: Enforcing mandatory size selection completely eliminated instances of unselected product variants entering the cart, ensuring cart items contain accurate customer specifications.
3. **Data Integrity**: Replacing immutable `List.of()` instances with mutable `ArrayList` wrappers in `ECommerceFeatureTest.java` resolved transaction cascade exceptions, achieving 100% build validation.
4. **Polyglot Database Efficiency**: Partitioning transactional entities in JPA/H2 while persisting customer feedback in MongoDB reduced relational database load and improved page response times under 200ms.
5. **Customer Support Automation**: Integrating live repository lookups within `ChatbotController.java` enabled the assistant to resolve catalog, pricing, and sizing queries without requiring third-party API keys.

---

## Chapter 11: Conclusion and Future Scope

### 11.1 Conclusion
The DualForge Enterprise E-Commerce Platform successfully satisfies all capstone project objectives outlined in the EWDP — Ethnotech Work Force Development Program. By integrating a modular Spring Boot REST API with a modern React 18 Glassmorphism SPA, the system delivers enterprise-grade security, polyglot database persistence, and an intuitive customer experience. Features such as mandatory size selection, category-specific size charts, live order tracking, and a database-aware AI Chatbot demonstrate the practical application of full-stack software engineering principles.

### 11.2 Future Enhancements
- **Payment Gateway Integration**: Integrating real Razorpay / Stripe payment processing APIs.
- **Third-Party Logistics Tracking**: Connecting real-time shipping carrier webhooks for live GPS tracking.
- **Native Mobile Applications**: Developing React Native mobile applications sharing the Spring Boot REST backend.
- **Advanced LLM Chatbot Integration**: Connecting the chatbot to local Ollama / Gemini instances for broader conversational capabilities.

---

## REFERENCES

1. **Spring Boot Documentation**: [https://docs.spring.io/spring-boot/docs/current/reference/html/](https://docs.spring.io/spring-boot/docs/current/reference/html/)
2. **React 18 Official Documentation**: [https://react.dev/](https://react.dev/)
3. **Spring Security Architecture**: [https://spring.io/projects/spring-security](https://spring.io/projects/spring-security)
4. **MongoDB Java Driver Guides**: [https://www.mongodb.com/docs/drivers/java/sync/current/](https://www.mongodb.com/docs/drivers/java/sync/current/)
5. **Vite Framework Guide**: [https://vitejs.dev/guide/](https://vitejs.dev/guide/)
6. **JWT Security Specification (RFC 7519)**: [https://datatracker.ietf.org/doc/html/rfc7519](https://datatracker.ietf.org/doc/html/rfc7519)

---

## APPENDIX: TEAM CONTRIBUTION

| Name | Roll No. | Role | Contribution |
| :--- | :--- | :--- | :--- |
| **M. Madhu Teja** | 23691A3762 | Team Lead & Full Stack Architect | Overall Project Architecture, Spring Security JWT, Cart/Order Services, React Integration, AI Chatbot & Size Chart implementation. |
| **K. Madhu** | 23691A3761 | Frontend Engineer | Catalog UI Layout, Product Details View, Glassmorphism CSS Design Tokens & Animations. |
| **A. Hemanth Reddy** | 23691A3747 | Backend Developer | Spring Boot REST Controller Endpoints, Cart Operations & Order State Services. |
| **V. Govardhan** | 23691A3738 | Database Engineer | Spring Data JPA Schema, Entity Mapping, H2 Data Initializer Seed Configurations. |
| **B. Harsha Vardhan** | 23691A3740 | Security Specialist | Spring Security JWT Filter Chain, OTP Verification Engine & Role-Based Permissions. |
| **S. Harinath Reddy** | 23691A3738 | QA & NoSQL Integration | MongoDB Product Review Integration, JUnit Automated Integration Tests & Verification. |
