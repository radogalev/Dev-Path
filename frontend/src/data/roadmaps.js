export const learningRoadmaps = {
  frontend: {
    title: "Frontend Engineer",
    description: "Build modern, performant, accessible web interfaces",
    color: "blue",
    milestones: [
      {
        id: 1,
        title: "Web Foundations",
        description: "Understand how the web works and build static pages",
        lectures: [
          { id: 1, title: "How the Internet Works: HTTP Request Lifecycle", duration: "25 min", type: "video" },
          { id: 2, title: "DNS Resolution & Domain Management", duration: "20 min", type: "video" },
          { id: 3, title: "How Browsers Render Pages (DOM, CSSOM, Paint)", duration: "25 min", type: "video" },
          { id: 4, title: "HTML5 Document Structure & Semantic Tags", duration: "25 min", type: "interactive" },
          { id: 5, title: "HTML Forms, Inputs & Client-Side Validation", duration: "30 min", type: "interactive" },
          { id: 6, title: "HTML Tables, Media Elements & Embedding", duration: "20 min", type: "interactive" },
          { id: 7, title: "CSS Selectors & Specificity", duration: "25 min", type: "video" },
          { id: 8, title: "CSS Box Model & Spacing (Margin, Padding, Border)", duration: "20 min", type: "interactive" },
          { id: 9, title: "CSS Typography, Colors & Custom Properties", duration: "25 min", type: "video" },
          { id: 10, title: "CSS Positioning, Z-Index & Stacking Contexts", duration: "25 min", type: "interactive" },
          { id: 11, title: "Flexbox Layout System", duration: "30 min", type: "interactive" },
          { id: 12, title: "CSS Grid Layout System", duration: "30 min", type: "interactive" },
          { id: 13, title: "Media Queries & Responsive Breakpoints", duration: "25 min", type: "video" },
          { id: 14, title: "Mobile-First Design Principles", duration: "20 min", type: "video" },
          { id: 15, title: "Web Accessibility: ARIA Roles & Screen Readers", duration: "25 min", type: "interactive" },
          { id: 16, title: "Responsive Portfolio Website (Pure HTML/CSS)", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 2,
        title: "JavaScript Core",
        description: "Master the language that powers the web",
        lectures: [
          { id: 17, title: "Variables, Data Types & Type Coercion", duration: "25 min", type: "video" },
          { id: 18, title: "Control Flow: Conditionals & Loops", duration: "20 min", type: "interactive" },
          { id: 19, title: "Functions, Scope & Closures", duration: "30 min", type: "video" },
          { id: 20, title: "Arrays & Array Methods (map, filter, reduce)", duration: "30 min", type: "interactive" },
          { id: 21, title: "Objects, Destructuring & Spread Operator", duration: "25 min", type: "interactive" },
          { id: 22, title: "DOM Selection & Traversal (querySelector, children, parentNode)", duration: "25 min", type: "video" },
          { id: 23, title: "DOM Manipulation: Creating, Updating & Removing Elements", duration: "30 min", type: "interactive" },
          { id: 24, title: "Event Handling & Event Delegation", duration: "25 min", type: "interactive" },
          { id: 25, title: "Error Handling with try/catch & Custom Errors", duration: "20 min", type: "video" },
          { id: 26, title: "The Event Loop, Call Stack & Task Queue", duration: "25 min", type: "video" },
          { id: 27, title: "Promises & Promise Chaining", duration: "30 min", type: "interactive" },
          { id: 28, title: "Fetch API & HTTP Requests from the Browser", duration: "25 min", type: "interactive" },
          { id: 29, title: "Async/Await Patterns & Error Handling", duration: "25 min", type: "video" },
          { id: 30, title: "ES6+ Modules: Import, Export & Module Patterns", duration: "20 min", type: "video" },
          { id: 31, title: "Template Literals, Arrow Functions & Default Parameters", duration: "20 min", type: "interactive" },
          { id: 32, title: "Interactive Weather Dashboard with API Integration", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 3,
        title: "Professional Tooling",
        description: "Work like a production engineer",
        lectures: [
          { id: 33, title: "Git Basics: Init, Add, Commit & Push", duration: "25 min", type: "video" },
          { id: 34, title: "Git Branching, Merging & Conflict Resolution", duration: "30 min", type: "interactive" },
          { id: 35, title: "GitHub: Pull Requests, Code Reviews & Collaboration", duration: "25 min", type: "interactive" },
          { id: 36, title: "npm & package.json: Dependency Management", duration: "25 min", type: "video" },
          { id: 37, title: "Vite: Project Setup, Dev Server & Build Process", duration: "30 min", type: "interactive" },
          { id: 38, title: "Webpack Fundamentals: Loaders, Plugins & Bundling", duration: "30 min", type: "video" },
          { id: 39, title: "ESLint: Configuration, Rules & Auto-fixing", duration: "20 min", type: "interactive" },
          { id: 40, title: "Prettier & Consistent Code Formatting", duration: "15 min", type: "interactive" },
          { id: 41, title: "Chrome DevTools: Elements, Console & Network Tab", duration: "25 min", type: "video" },
          { id: 42, title: "Chrome DevTools: Performance & Memory Profiling", duration: "25 min", type: "video" },
          { id: 43, title: "Refactor Portfolio Project with Professional Tooling", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 4,
        title: "React Ecosystem",
        description: "Build modern component-based applications",
        lectures: [
          { id: 44, title: "JSX Syntax & Component Fundamentals", duration: "25 min", type: "video" },
          { id: 45, title: "Props, Children & Component Composition", duration: "25 min", type: "interactive" },
          { id: 46, title: "useState Hook & Controlled Components", duration: "30 min", type: "interactive" },
          { id: 47, title: "useEffect Hook: Side Effects & Cleanup", duration: "30 min", type: "video" },
          { id: 48, title: "useRef, useMemo & useCallback Hooks", duration: "25 min", type: "interactive" },
          { id: 49, title: "Building Custom Hooks", duration: "25 min", type: "interactive" },
          { id: 50, title: "React Router: Setup, Routes & Link Navigation", duration: "25 min", type: "video" },
          { id: 51, title: "React Router: Nested Routes, Params & Protected Routes", duration: "30 min", type: "interactive" },
          { id: 52, title: "Context API for Global State Management", duration: "25 min", type: "video" },
          { id: 53, title: "Redux Toolkit: Store, Slices & Async Thunks", duration: "35 min", type: "interactive" },
          { id: 54, title: "Data Fetching with TanStack Query (React Query)", duration: "30 min", type: "interactive" },
          { id: 55, title: "React Forms: Controlled Inputs, Validation & Submission", duration: "25 min", type: "interactive" },
          { id: 56, title: "Component Optimization: React.memo, lazy & Suspense", duration: "25 min", type: "video" },
          { id: 57, title: "Admin Dashboard Application", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 5,
        title: "Advanced Frontend Engineering",
        description: "Production-grade frontend systems",
        lectures: [
          { id: 58, title: "TypeScript Basics: Types, Interfaces & Generics", duration: "35 min", type: "video" },
          { id: 59, title: "TypeScript with React: Typing Props, Hooks & Events", duration: "30 min", type: "interactive" },
          { id: 60, title: "Unit Testing with Jest: Setup, Matchers & Mocks", duration: "30 min", type: "interactive" },
          { id: 61, title: "Component Testing with React Testing Library", duration: "30 min", type: "interactive" },
          { id: 62, title: "End-to-End Testing with Playwright", duration: "30 min", type: "video" },
          { id: 63, title: "Advanced Accessibility: WCAG 2.1 Compliance & Auditing", duration: "25 min", type: "video" },
          { id: 64, title: "Frontend Architecture: Feature-Based Folder Structure", duration: "25 min", type: "video" },
          { id: 65, title: "Micro-Frontends & Module Federation", duration: "30 min", type: "interactive" },
          { id: 66, title: "Web Performance: Core Web Vitals & Lighthouse Optimization", duration: "30 min", type: "video" },
          { id: 67, title: "Progressive Web Apps: Service Workers & Offline Support", duration: "30 min", type: "interactive" },
          { id: 68, title: "Production-Ready E-commerce Frontend", duration: "2 hrs", type: "project" }
        ]
      }
    ]
  },

  backend: {
    title: "Backend Engineer",
    description: "Design scalable APIs and server-side systems",
    color: "green",
    milestones: [
      {
        id: 1,
        title: "Programming Foundations",
        description: "Build a solid base in programming and computer science",
        lectures: [
          { id: 1, title: "Python Syntax, Variables & Data Types", duration: "25 min", type: "video" },
          { id: 2, title: "Control Flow: Conditionals, Loops & Comprehensions", duration: "25 min", type: "interactive" },
          { id: 3, title: "Functions, Decorators & Generators", duration: "30 min", type: "video" },
          { id: 4, title: "Arrays, Linked Lists & Hash Maps", duration: "30 min", type: "interactive" },
          { id: 5, title: "Stacks, Queues & Trees", duration: "30 min", type: "video" },
          { id: 6, title: "Sorting Algorithms: Bubble, Merge & Quick Sort", duration: "30 min", type: "interactive" },
          { id: 7, title: "Searching Algorithms: Binary Search & Graph Traversal", duration: "25 min", type: "video" },
          { id: 8, title: "Big O Notation & Time/Space Complexity", duration: "25 min", type: "video" },
          { id: 9, title: "OOP: Classes, Inheritance & Polymorphism", duration: "30 min", type: "interactive" },
          { id: 10, title: "OOP: Encapsulation, Abstraction & Design Principles", duration: "25 min", type: "video" },
          { id: 11, title: "File I/O & Error Handling in Python", duration: "20 min", type: "interactive" },
          { id: 12, title: "CLI Task Manager Application", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 2,
        title: "Backend Fundamentals",
        description: "Build and structure server-side applications",
        lectures: [
          { id: 13, title: "Node.js Runtime: Event Loop & Non-Blocking I/O", duration: "25 min", type: "video" },
          { id: 14, title: "Node.js Modules: CommonJS vs ES Modules", duration: "20 min", type: "video" },
          { id: 15, title: "Express.js: Routing, Middleware & Request Handling", duration: "30 min", type: "interactive" },
          { id: 16, title: "Express.js: Error Handling & Validation Middleware", duration: "25 min", type: "interactive" },
          { id: 17, title: "REST API Design: Resources, Verbs & Status Codes", duration: "25 min", type: "video" },
          { id: 18, title: "REST API: Pagination, Filtering & Sorting", duration: "25 min", type: "interactive" },
          { id: 19, title: "API Documentation with Swagger/OpenAPI", duration: "20 min", type: "video" },
          { id: 20, title: "MVC Architecture: Models, Views & Controllers", duration: "25 min", type: "video" },
          { id: 21, title: "Service Layer Pattern & Business Logic Separation", duration: "25 min", type: "interactive" },
          { id: 22, title: "Environment Variables & Configuration Management", duration: "20 min", type: "video" },
          { id: 23, title: "Blog REST API with Full CRUD", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 3,
        title: "Databases",
        description: "Design, query and optimize data storage",
        lectures: [
          { id: 24, title: "Relational Database Concepts & PostgreSQL Setup", duration: "25 min", type: "video" },
          { id: 25, title: "SQL: SELECT, INSERT, UPDATE, DELETE", duration: "30 min", type: "interactive" },
          { id: 26, title: "SQL: JOINs, Subqueries & Aggregate Functions", duration: "30 min", type: "interactive" },
          { id: 27, title: "Schema Design: Tables, Constraints & Data Types", duration: "25 min", type: "video" },
          { id: 28, title: "Database Normalization (1NF, 2NF, 3NF)", duration: "25 min", type: "video" },
          { id: 29, title: "Indexes: B-Tree, Hash & Composite Indexes", duration: "25 min", type: "video" },
          { id: 30, title: "Relationships: One-to-Many, Many-to-Many & Foreign Keys", duration: "25 min", type: "interactive" },
          { id: 31, title: "Database Migrations with Knex or Alembic", duration: "25 min", type: "interactive" },
          { id: 32, title: "ORMs: Sequelize, Prisma or SQLAlchemy Basics", duration: "30 min", type: "video" },
          { id: 33, title: "MongoDB: Documents, Collections & CRUD Operations", duration: "30 min", type: "interactive" },
          { id: 34, title: "MongoDB: Aggregation Pipeline & Indexing", duration: "25 min", type: "interactive" },
          { id: 35, title: "When to Use SQL vs NoSQL", duration: "20 min", type: "video" },
          { id: 36, title: "Full CRUD API with PostgreSQL & MongoDB", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 4,
        title: "Authentication & Security",
        description: "Protect users and secure your APIs",
        lectures: [
          { id: 37, title: "Password Hashing: bcrypt & Salt Rounds", duration: "20 min", type: "video" },
          { id: 38, title: "JWT: Structure, Signing & Verification", duration: "25 min", type: "video" },
          { id: 39, title: "JWT: Access Tokens, Refresh Tokens & Token Rotation", duration: "25 min", type: "interactive" },
          { id: 40, title: "Session-Based Authentication & Cookie Security", duration: "25 min", type: "interactive" },
          { id: 41, title: "OAuth 2.0 & Social Login (Google, GitHub)", duration: "30 min", type: "video" },
          { id: 42, title: "Role-Based Access Control (RBAC)", duration: "25 min", type: "interactive" },
          { id: 43, title: "OWASP Top 10: SQL Injection & XSS Prevention", duration: "25 min", type: "video" },
          { id: 44, title: "OWASP Top 10: CSRF, Broken Auth & Security Headers", duration: "25 min", type: "interactive" },
          { id: 45, title: "Rate Limiting, CORS & Input Sanitization", duration: "20 min", type: "video" },
          { id: 46, title: "HTTPS, TLS & Certificate Management", duration: "20 min", type: "video" },
          { id: 47, title: "Secure Authentication System with OAuth & RBAC", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 5,
        title: "Scalable Systems",
        description: "Build for high availability and performance",
        lectures: [
          { id: 48, title: "Caching Strategies: In-Memory, CDN & HTTP Cache", duration: "25 min", type: "video" },
          { id: 49, title: "Redis: Data Types, Commands & Use Cases", duration: "30 min", type: "interactive" },
          { id: 50, title: "Redis: Session Storage & Cache Invalidation", duration: "25 min", type: "interactive" },
          { id: 51, title: "Message Queues: RabbitMQ / Bull for Background Jobs", duration: "30 min", type: "video" },
          { id: 52, title: "WebSockets & Real-Time Communication", duration: "25 min", type: "interactive" },
          { id: 53, title: "Docker: Images, Containers & Dockerfile", duration: "30 min", type: "video" },
          { id: 54, title: "Docker Compose: Multi-Container Applications", duration: "25 min", type: "interactive" },
          { id: 55, title: "CI/CD: GitHub Actions Workflow Configuration", duration: "25 min", type: "video" },
          { id: 56, title: "CI/CD: Automated Testing, Linting & Deployment", duration: "25 min", type: "interactive" },
          { id: 57, title: "API Testing: Unit Tests with Jest/Pytest", duration: "25 min", type: "interactive" },
          { id: 58, title: "API Testing: Integration Tests & Supertest", duration: "25 min", type: "interactive" },
          { id: 59, title: "Logging, Monitoring & Error Tracking (Winston, Sentry)", duration: "25 min", type: "video" },
          { id: 60, title: "Load Balancing & Horizontal Scaling Concepts", duration: "20 min", type: "video" },
          { id: 61, title: "Scalable Production API with Caching, Queues & CI/CD", duration: "2 hrs", type: "project" }
        ]
      }
    ]
  },

  fullstack: {
    title: "Full Stack Software Engineer",
    description: "Build complete end-to-end web applications",
    color: "indigo",
    milestones: [
      {
        id: 1,
        title: "Web & Programming Foundations",
        description: "Build your first web pages and learn to code",
        lectures: [
          { id: 1, title: "HTML5 Semantic Structure & Document Outline", duration: "25 min", type: "video" },
          { id: 2, title: "HTML Forms, Inputs & Accessibility Attributes", duration: "25 min", type: "interactive" },
          { id: 3, title: "CSS Box Model, Flexbox & Grid Essentials", duration: "30 min", type: "interactive" },
          { id: 4, title: "Responsive Design with Media Queries", duration: "25 min", type: "video" },
          { id: 5, title: "JavaScript Variables, Data Types & Operators", duration: "25 min", type: "video" },
          { id: 6, title: "JavaScript Functions, Arrays & Objects", duration: "30 min", type: "interactive" },
          { id: 7, title: "DOM Manipulation & Event Handling", duration: "30 min", type: "interactive" },
          { id: 8, title: "Async JavaScript: Promises, Fetch & async/await", duration: "30 min", type: "video" },
          { id: 9, title: "Git: Commits, Branches & GitHub Collaboration", duration: "25 min", type: "interactive" },
          { id: 10, title: "Interactive Multi-Page Website", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 2,
        title: "Backend Systems",
        description: "Build server-side APIs and connect to databases",
        lectures: [
          { id: 11, title: "Node.js Runtime & Module System", duration: "25 min", type: "video" },
          { id: 12, title: "Express.js: Routing & Middleware", duration: "30 min", type: "interactive" },
          { id: 13, title: "REST API Design: HTTP Methods & Status Codes", duration: "25 min", type: "video" },
          { id: 14, title: "Request Validation & Error Handling Middleware", duration: "25 min", type: "interactive" },
          { id: 15, title: "PostgreSQL: Setup, SQL Queries & Joins", duration: "30 min", type: "video" },
          { id: 16, title: "Database Schema Design & Migrations", duration: "25 min", type: "interactive" },
          { id: 17, title: "ORM Integration (Prisma or Sequelize)", duration: "30 min", type: "interactive" },
          { id: 18, title: "File Uploads & Static Asset Serving", duration: "20 min", type: "video" },
          { id: 19, title: "Full CRUD Backend API with Database", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 3,
        title: "Frontend Frameworks",
        description: "Build dynamic user interfaces with React",
        lectures: [
          { id: 20, title: "React Components, JSX & Props", duration: "25 min", type: "video" },
          { id: 21, title: "React State Management with useState", duration: "25 min", type: "interactive" },
          { id: 22, title: "useEffect: Side Effects & Data Fetching", duration: "25 min", type: "interactive" },
          { id: 23, title: "React Router: Navigation & Route Parameters", duration: "25 min", type: "video" },
          { id: 24, title: "Context API & Lifting State Up", duration: "25 min", type: "interactive" },
          { id: 25, title: "Connecting React to Backend APIs (Axios/Fetch)", duration: "30 min", type: "interactive" },
          { id: 26, title: "Form Handling, Validation & User Feedback", duration: "25 min", type: "interactive" },
          { id: 27, title: "Loading States, Error Boundaries & UX Patterns", duration: "25 min", type: "video" },
          { id: 28, title: "React Frontend Connected to Backend API", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 4,
        title: "Authentication & User Management",
        description: "Secure your application with proper auth flows",
        lectures: [
          { id: 29, title: "Password Hashing & Secure User Registration", duration: "25 min", type: "video" },
          { id: 30, title: "JWT: Token Generation, Storage & Expiry", duration: "25 min", type: "interactive" },
          { id: 31, title: "Login/Logout Flow & Protected API Routes", duration: "25 min", type: "interactive" },
          { id: 32, title: "Frontend Auth: Protected Routes & Token Refresh", duration: "30 min", type: "interactive" },
          { id: 33, title: "Role-Based Access Control (Admin vs User)", duration: "25 min", type: "video" },
          { id: 34, title: "OAuth 2.0: Social Login Integration", duration: "25 min", type: "video" },
          { id: 35, title: "Authenticated Full Stack Application", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 5,
        title: "Deployment & Production",
        description: "Ship your application to the real world",
        lectures: [
          { id: 36, title: "Environment Variables & Configuration Secrets", duration: "20 min", type: "video" },
          { id: 37, title: "Docker: Containerizing Frontend & Backend", duration: "30 min", type: "interactive" },
          { id: 38, title: "Cloud Deployment: Vercel, Railway or AWS", duration: "30 min", type: "video" },
          { id: 39, title: "CI/CD Pipelines: Automated Testing & Deployment", duration: "25 min", type: "interactive" },
          { id: 40, title: "Database Hosting & Managed Services", duration: "20 min", type: "video" },
          { id: 41, title: "Monitoring, Logging & Error Tracking", duration: "25 min", type: "video" },
          { id: 42, title: "System Design Basics: Scaling & Architecture", duration: "30 min", type: "video" },
          { id: 43, title: "Performance Optimization: Caching & Lazy Loading", duration: "25 min", type: "interactive" },
          { id: 44, title: "Deployed Full SaaS Application", duration: "2 hrs", type: "project" }
        ]
      }
    ]
  },

  mobile: {
    title: "Mobile Engineer",
    description: "Build native and cross-platform mobile apps",
    color: "yellow",
    milestones: [
      {
        id: 1,
        title: "Programming Foundations",
        description: "Core programming skills for mobile development",
        lectures: [
          { id: 1, title: "JavaScript/TypeScript Fundamentals for Mobile", duration: "30 min", type: "video" },
          { id: 2, title: "OOP Principles: Classes, Inheritance & Interfaces", duration: "25 min", type: "interactive" },
          { id: 3, title: "Async Programming: Callbacks, Promises & async/await", duration: "25 min", type: "video" },
          { id: 4, title: "Data Structures for Mobile: Lists, Maps & Trees", duration: "25 min", type: "interactive" },
          { id: 5, title: "JSON Parsing, API Data Handling & Local Storage", duration: "25 min", type: "interactive" },
          { id: 6, title: "Mobile UI/UX Principles & Platform Guidelines", duration: "20 min", type: "video" },
          { id: 7, title: "Simple Mobile Logic App (Calculator/Converter)", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 2,
        title: "React Native Core",
        description: "Build cross-platform mobile interfaces",
        lectures: [
          { id: 8, title: "React Native Setup: Expo vs Bare Workflow", duration: "25 min", type: "video" },
          { id: 9, title: "Core Components: View, Text, Image & ScrollView", duration: "25 min", type: "interactive" },
          { id: 10, title: "Styling: StyleSheet, Flexbox & Platform-Specific Styles", duration: "30 min", type: "interactive" },
          { id: 11, title: "Lists: FlatList, SectionList & Performance Optimization", duration: "25 min", type: "video" },
          { id: 12, title: "Navigation: React Navigation Stack & Tab Navigators", duration: "30 min", type: "interactive" },
          { id: 13, title: "Navigation: Drawer, Deep Linking & Params", duration: "25 min", type: "interactive" },
          { id: 14, title: "State Management: useState, Context & Zustand", duration: "30 min", type: "video" },
          { id: 15, title: "Forms: TextInput, Validation & Keyboard Handling", duration: "25 min", type: "interactive" },
          { id: 16, title: "API Integration: Fetch, Axios & Loading States", duration: "25 min", type: "interactive" },
          { id: 17, title: "Error Handling & Crash Reporting in Mobile", duration: "20 min", type: "video" },
          { id: 18, title: "Feature-Based Mobile App (Task Manager)", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 3,
        title: "Native Capabilities & Device APIs",
        description: "Access device hardware and platform features",
        lectures: [
          { id: 19, title: "Camera Access & Image Picker Integration", duration: "25 min", type: "interactive" },
          { id: 20, title: "Geolocation & Maps Integration", duration: "25 min", type: "interactive" },
          { id: 21, title: "Push Notifications: Setup, Permissions & Handling", duration: "30 min", type: "video" },
          { id: 22, title: "Local Notifications & Scheduling", duration: "20 min", type: "interactive" },
          { id: 23, title: "AsyncStorage & Secure Storage for Offline Data", duration: "25 min", type: "interactive" },
          { id: 24, title: "SQLite & Local Database for Offline-First Apps", duration: "30 min", type: "video" },
          { id: 25, title: "Biometric Authentication (Face ID / Fingerprint)", duration: "20 min", type: "video" },
          { id: 26, title: "Animations: Animated API & Reanimated Library", duration: "30 min", type: "interactive" },
          { id: 27, title: "Native Modules & Bridging (Linking Native Code)", duration: "25 min", type: "video" },
          { id: 28, title: "Production-Ready Mobile App with Device Features", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 4,
        title: "Testing & Quality Assurance",
        description: "Ensure app reliability on all devices",
        lectures: [
          { id: 29, title: "Unit Testing with Jest for React Native", duration: "25 min", type: "interactive" },
          { id: 30, title: "Component Testing with React Native Testing Library", duration: "25 min", type: "interactive" },
          { id: 31, title: "End-to-End Testing with Detox", duration: "30 min", type: "video" },
          { id: 32, title: "Debugging: React Native Debugger & Flipper", duration: "25 min", type: "interactive" },
          { id: 33, title: "Performance Profiling & Memory Leak Detection", duration: "25 min", type: "video" },
          { id: 34, title: "Tested & Debugged Mobile Application", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 5,
        title: "Publishing & Optimization",
        description: "Ship to app stores and optimize for users",
        lectures: [
          { id: 35, title: "App Performance: Bundle Size & Hermes Engine", duration: "25 min", type: "video" },
          { id: 36, title: "Image Optimization & Lazy Loading Screens", duration: "20 min", type: "interactive" },
          { id: 37, title: "App Store Deployment: iOS (TestFlight & App Store Connect)", duration: "30 min", type: "video" },
          { id: 38, title: "Google Play Deployment: Signing, Bundling & Listing", duration: "25 min", type: "video" },
          { id: 39, title: "Over-the-Air Updates with EAS Update", duration: "20 min", type: "interactive" },
          { id: 40, title: "App Security: Certificate Pinning & Data Encryption", duration: "25 min", type: "video" },
          { id: 41, title: "Analytics & User Behavior Tracking", duration: "20 min", type: "interactive" },
          { id: 42, title: "Published Cross-Platform App on Both Stores", duration: "2 hrs", type: "project" }
        ]
      }
    ]
  },

  data: {
    title: "Data Scientist -> ML Engineer",
    description: "Analyze data and build intelligent systems",
    color: "purple",
    milestones: [
      {
        id: 1,
        title: "Python & Math Foundations",
        description: "Master the language and math behind data science",
        lectures: [
          { id: 1, title: "Python Syntax, Data Types & Control Flow", duration: "25 min", type: "video" },
          { id: 2, title: "Python Functions, List Comprehensions & Generators", duration: "25 min", type: "interactive" },
          { id: 3, title: "Python OOP: Classes, Inheritance & Magic Methods", duration: "25 min", type: "video" },
          { id: 4, title: "Vectors, Matrices & Matrix Operations", duration: "30 min", type: "interactive" },
          { id: 5, title: "Eigenvalues, Eigenvectors & Dimensionality", duration: "25 min", type: "video" },
          { id: 6, title: "Descriptive Statistics: Mean, Median, Variance & Std Dev", duration: "25 min", type: "interactive" },
          { id: 7, title: "Probability Distributions: Normal, Binomial & Poisson", duration: "25 min", type: "video" },
          { id: 8, title: "Hypothesis Testing: t-tests, p-values & Confidence Intervals", duration: "30 min", type: "interactive" },
          { id: 9, title: "Correlation, Covariance & Statistical Significance", duration: "25 min", type: "video" },
          { id: 10, title: "Calculus for ML: Derivatives, Gradients & Chain Rule", duration: "30 min", type: "video" },
          { id: 11, title: "Statistical Analysis Notebook with Real Data", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 2,
        title: "Data Analysis & Visualization",
        description: "Clean, explore and present data effectively",
        lectures: [
          { id: 12, title: "NumPy: Arrays, Broadcasting & Vectorized Operations", duration: "30 min", type: "interactive" },
          { id: 13, title: "NumPy: Linear Algebra & Random Number Generation", duration: "25 min", type: "interactive" },
          { id: 14, title: "Pandas: Series, DataFrames & Data Loading (CSV, JSON, SQL)", duration: "30 min", type: "video" },
          { id: 15, title: "Pandas: Filtering, Grouping & Aggregation", duration: "30 min", type: "interactive" },
          { id: 16, title: "Pandas: Merging, Joining & Reshaping DataFrames", duration: "25 min", type: "interactive" },
          { id: 17, title: "Data Cleaning: Missing Values, Outliers & Type Casting", duration: "30 min", type: "interactive" },
          { id: 18, title: "Feature Engineering: Encoding, Scaling & Transformation", duration: "30 min", type: "video" },
          { id: 19, title: "Matplotlib: Line, Bar, Scatter & Histogram Plots", duration: "25 min", type: "interactive" },
          { id: 20, title: "Seaborn: Statistical Visualization & Heatmaps", duration: "25 min", type: "interactive" },
          { id: 21, title: "Plotly: Interactive Dashboards & Charts", duration: "25 min", type: "video" },
          { id: 22, title: "Exploratory Data Analysis on a Real-World Dataset", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 3,
        title: "Machine Learning",
        description: "Build models that learn from data",
        lectures: [
          { id: 23, title: "ML Workflow: Train/Test Split, Cross-Validation & Pipelines", duration: "25 min", type: "video" },
          { id: 24, title: "Linear Regression: Cost Function & Gradient Descent", duration: "30 min", type: "interactive" },
          { id: 25, title: "Polynomial & Regularized Regression (Ridge, Lasso)", duration: "25 min", type: "video" },
          { id: 26, title: "Logistic Regression & Binary Classification", duration: "25 min", type: "interactive" },
          { id: 27, title: "Decision Trees & Random Forests", duration: "30 min", type: "video" },
          { id: 28, title: "Support Vector Machines (SVM)", duration: "25 min", type: "interactive" },
          { id: 29, title: "K-Nearest Neighbors & Naive Bayes", duration: "25 min", type: "video" },
          { id: 30, title: "Unsupervised Learning: K-Means & DBSCAN Clustering", duration: "30 min", type: "interactive" },
          { id: 31, title: "Dimensionality Reduction: PCA & t-SNE", duration: "25 min", type: "video" },
          { id: 32, title: "Model Evaluation: Accuracy, Precision, Recall, F1 & ROC-AUC", duration: "25 min", type: "interactive" },
          { id: 33, title: "Hyperparameter Tuning: Grid Search & Random Search", duration: "25 min", type: "interactive" },
          { id: 34, title: "Scikit-Learn: Building Complete ML Pipelines", duration: "30 min", type: "interactive" },
          { id: 35, title: "Ensemble Methods: Boosting (XGBoost, LightGBM)", duration: "30 min", type: "video" },
          { id: 36, title: "Predictive ML Model on Tabular Data", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 4,
        title: "Deep Learning",
        description: "Build neural networks for complex problems",
        lectures: [
          { id: 37, title: "Neural Network Fundamentals: Perceptrons & Activation Functions", duration: "25 min", type: "video" },
          { id: 38, title: "Backpropagation & Gradient Descent Optimizers (SGD, Adam)", duration: "30 min", type: "video" },
          { id: 39, title: "PyTorch: Tensors, Autograd & Model Building", duration: "35 min", type: "interactive" },
          { id: 40, title: "PyTorch: DataLoaders, Training Loops & GPU Training", duration: "30 min", type: "interactive" },
          { id: 41, title: "CNNs: Convolutional Layers, Pooling & Image Classification", duration: "30 min", type: "video" },
          { id: 42, title: "Transfer Learning: Fine-Tuning Pretrained Models (ResNet, VGG)", duration: "25 min", type: "interactive" },
          { id: 43, title: "RNNs & LSTMs: Sequence Modeling", duration: "30 min", type: "video" },
          { id: 44, title: "Transformers & Attention Mechanism Fundamentals", duration: "30 min", type: "video" },
          { id: 45, title: "NLP: Tokenization, Word Embeddings & Sentiment Analysis", duration: "30 min", type: "interactive" },
          { id: 46, title: "NLP: Text Classification with Hugging Face Transformers", duration: "30 min", type: "interactive" },
          { id: 47, title: "Regularization: Dropout, Batch Norm & Data Augmentation", duration: "25 min", type: "video" },
          { id: 48, title: "GANs: Generative Adversarial Networks Basics", duration: "25 min", type: "video" },
          { id: 49, title: "Deep Learning Application (Image or Text)", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 5,
        title: "MLOps & Production ML",
        description: "Deploy, monitor and maintain ML systems",
        lectures: [
          { id: 50, title: "Model Serialization: Pickle, ONNX & TorchScript", duration: "25 min", type: "video" },
          { id: 51, title: "Building ML APIs with FastAPI or Flask", duration: "30 min", type: "interactive" },
          { id: 52, title: "Docker for ML: Containerizing Models & Dependencies", duration: "25 min", type: "interactive" },
          { id: 53, title: "Experiment Tracking with MLflow or Weights & Biases", duration: "25 min", type: "video" },
          { id: 54, title: "Data Versioning with DVC", duration: "20 min", type: "interactive" },
          { id: 55, title: "Model Monitoring: Drift Detection & Performance Decay", duration: "25 min", type: "video" },
          { id: 56, title: "CI/CD for ML: Automated Retraining Pipelines", duration: "25 min", type: "interactive" },
          { id: 57, title: "Cloud ML Services: AWS SageMaker / GCP Vertex AI Overview", duration: "25 min", type: "video" },
          { id: 58, title: "A/B Testing & Model Rollout Strategies", duration: "20 min", type: "video" },
          { id: 59, title: "Deployed ML API with Monitoring & Versioning", duration: "2 hrs", type: "project" }
        ]
      }
    ]
  },

  database: {
    title: "Database Engineer",
    description: "Design and optimize high-performance data systems",
    color: "pink",
    milestones: [
      {
        id: 1,
        title: "Database Fundamentals",
        description: "Understand relational data modeling and SQL",
        lectures: [
          { id: 1, title: "Relational Database Concepts & ACID Properties", duration: "25 min", type: "video" },
          { id: 2, title: "SQL: SELECT Statements, WHERE & ORDER BY", duration: "25 min", type: "interactive" },
          { id: 3, title: "SQL: INSERT, UPDATE, DELETE & UPSERT", duration: "20 min", type: "interactive" },
          { id: 4, title: "SQL: JOINs (INNER, LEFT, RIGHT, FULL OUTER)", duration: "30 min", type: "interactive" },
          { id: 5, title: "SQL: Subqueries, CTEs & Window Functions", duration: "30 min", type: "interactive" },
          { id: 6, title: "SQL: Aggregate Functions, GROUP BY & HAVING", duration: "25 min", type: "interactive" },
          { id: 7, title: "Schema Design: Data Types, Constraints & Defaults", duration: "25 min", type: "video" },
          { id: 8, title: "Entity-Relationship Diagrams & Modeling Techniques", duration: "25 min", type: "video" },
          { id: 9, title: "Normalization: 1NF, 2NF, 3NF & When to Denormalize", duration: "30 min", type: "video" },
          { id: 10, title: "Relationships: One-to-One, One-to-Many & Many-to-Many", duration: "25 min", type: "interactive" },
          { id: 11, title: "Design a Normalized Relational Database Schema", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 2,
        title: "Advanced SQL & Query Optimization",
        description: "Write performant queries and optimize data access",
        lectures: [
          { id: 12, title: "B-Tree Indexes: How They Work & When to Use Them", duration: "25 min", type: "video" },
          { id: 13, title: "Composite Indexes, Partial Indexes & Covering Indexes", duration: "25 min", type: "interactive" },
          { id: 14, title: "EXPLAIN & ANALYZE: Reading Query Execution Plans", duration: "30 min", type: "interactive" },
          { id: 15, title: "Query Optimization: Avoiding Full Scans & N+1 Problems", duration: "25 min", type: "video" },
          { id: 16, title: "Transactions: Isolation Levels & Locking Strategies", duration: "30 min", type: "video" },
          { id: 17, title: "Deadlocks: Detection, Prevention & Resolution", duration: "25 min", type: "interactive" },
          { id: 18, title: "Stored Procedures, Functions & Triggers", duration: "30 min", type: "interactive" },
          { id: 19, title: "Views, Materialized Views & Query Caching", duration: "25 min", type: "video" },
          { id: 20, title: "Partitioning: Range, List & Hash Partitioning", duration: "25 min", type: "video" },
          { id: 21, title: "Connection Pooling & Database Performance Tuning", duration: "25 min", type: "interactive" },
          { id: 22, title: "Performance-Optimized Database with Benchmarks", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 3,
        title: "NoSQL & Document Databases",
        description: "Work with non-relational data storage systems",
        lectures: [
          { id: 23, title: "NoSQL Overview: Document, Key-Value, Column & Graph", duration: "25 min", type: "video" },
          { id: 24, title: "MongoDB: Collections, Documents & CRUD Operations", duration: "30 min", type: "interactive" },
          { id: 25, title: "MongoDB: Aggregation Pipeline & Lookups", duration: "30 min", type: "interactive" },
          { id: 26, title: "MongoDB: Indexing Strategies & Performance", duration: "25 min", type: "video" },
          { id: 27, title: "Redis: Data Types (Strings, Lists, Sets, Hashes)", duration: "25 min", type: "interactive" },
          { id: 28, title: "Redis: Pub/Sub, Streams & Caching Patterns", duration: "25 min", type: "interactive" },
          { id: 29, title: "Graph Databases: Neo4j Fundamentals & Cypher Queries", duration: "25 min", type: "video" },
          { id: 30, title: "Choosing the Right Database for Your Use Case", duration: "20 min", type: "video" },
          { id: 31, title: "Multi-Database Application (SQL + NoSQL)", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 4,
        title: "Distributed Databases & High Availability",
        description: "Scale databases across multiple nodes",
        lectures: [
          { id: 32, title: "CAP Theorem & Consistency Models", duration: "25 min", type: "video" },
          { id: 33, title: "Replication: Leader-Follower & Multi-Leader Strategies", duration: "30 min", type: "video" },
          { id: 34, title: "Sharding: Horizontal Partitioning & Shard Keys", duration: "25 min", type: "interactive" },
          { id: 35, title: "Consensus Algorithms: Raft & Paxos Overview", duration: "25 min", type: "video" },
          { id: 36, title: "Backup Strategies: Full, Incremental & Point-in-Time Recovery", duration: "25 min", type: "interactive" },
          { id: 37, title: "Disaster Recovery & Failover Automation", duration: "25 min", type: "video" },
          { id: 38, title: "Database Monitoring: Metrics, Alerts & Slow Query Logs", duration: "25 min", type: "interactive" },
          { id: 39, title: "Database Security: Encryption, Access Control & Auditing", duration: "25 min", type: "video" },
          { id: 40, title: "Distributed Data System with Replication & Failover", duration: "2 hrs", type: "project" }
        ]
      }
    ]
  },

  cloud: {
    title: "Cloud & DevOps Engineer",
    description: "Deploy, scale, and automate infrastructure",
    color: "blue",
    milestones: [
      {
        id: 1,
        title: "Linux & Networking Foundations",
        description: "Master the OS and network layer that runs the cloud",
        lectures: [
          { id: 1, title: "Linux Command Line: Navigation, Files & Permissions", duration: "25 min", type: "interactive" },
          { id: 2, title: "Linux: Package Management, Services & Cron Jobs", duration: "25 min", type: "interactive" },
          { id: 3, title: "Shell Scripting: Variables, Loops & Automation", duration: "30 min", type: "interactive" },
          { id: 4, title: "Networking: IP Addressing, Subnets & Routing", duration: "25 min", type: "video" },
          { id: 5, title: "Networking: DNS, Load Balancers & Reverse Proxies", duration: "25 min", type: "video" },
          { id: 6, title: "SSH: Key-Based Authentication & Tunneling", duration: "20 min", type: "interactive" },
          { id: 7, title: "Git: Branching Strategies & Team Workflows", duration: "25 min", type: "interactive" },
          { id: 8, title: "Nginx/Apache: Web Server Configuration & Virtual Hosts", duration: "25 min", type: "video" },
          { id: 9, title: "Linux Server Setup & Configuration Project", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 2,
        title: "Cloud Provider (AWS)",
        description: "Launch and manage cloud infrastructure",
        lectures: [
          { id: 10, title: "AWS Account Setup, IAM Users, Roles & Policies", duration: "25 min", type: "interactive" },
          { id: 11, title: "EC2: Instance Types, AMIs & Launch Configuration", duration: "30 min", type: "interactive" },
          { id: 12, title: "EC2: Security Groups, Elastic IPs & Auto Scaling", duration: "25 min", type: "interactive" },
          { id: 13, title: "S3: Buckets, Policies, Versioning & Static Hosting", duration: "25 min", type: "interactive" },
          { id: 14, title: "VPC: Subnets, Route Tables, Internet & NAT Gateways", duration: "30 min", type: "video" },
          { id: 15, title: "RDS: Managed Databases, Backups & Read Replicas", duration: "25 min", type: "video" },
          { id: 16, title: "Lambda: Serverless Functions & Event Triggers", duration: "25 min", type: "interactive" },
          { id: 17, title: "CloudFront CDN & Route 53 DNS Configuration", duration: "25 min", type: "video" },
          { id: 18, title: "Cloud Security: KMS Encryption & Secrets Manager", duration: "25 min", type: "video" },
          { id: 19, title: "AWS Cost Management & Billing Alerts", duration: "15 min", type: "video" },
          { id: 20, title: "Deploy Full Web Application to AWS", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 3,
        title: "Containers & Orchestration",
        description: "Package and run applications anywhere",
        lectures: [
          { id: 21, title: "Docker: Images, Containers & Dockerfile Syntax", duration: "30 min", type: "video" },
          { id: 22, title: "Docker: Multi-Stage Builds & Image Optimization", duration: "25 min", type: "interactive" },
          { id: 23, title: "Docker Compose: Multi-Container Applications & Networking", duration: "30 min", type: "interactive" },
          { id: 24, title: "Docker: Volumes, Bind Mounts & Data Persistence", duration: "20 min", type: "interactive" },
          { id: 25, title: "Container Registries: Docker Hub, ECR & GHCR", duration: "20 min", type: "video" },
          { id: 26, title: "Kubernetes Architecture: Pods, Nodes & Control Plane", duration: "30 min", type: "video" },
          { id: 27, title: "Kubernetes: Deployments, Services & ConfigMaps", duration: "30 min", type: "interactive" },
          { id: 28, title: "Kubernetes: Ingress Controllers & Load Balancing", duration: "25 min", type: "interactive" },
          { id: 29, title: "Kubernetes: Helm Charts & Package Management", duration: "25 min", type: "interactive" },
          { id: 30, title: "Kubernetes: Scaling, Rolling Updates & Health Checks", duration: "25 min", type: "video" },
          { id: 31, title: "Containerized Microservice Application on Kubernetes", duration: "2 hrs", type: "project" }
        ]
      },
      {
        id: 4,
        title: "Infrastructure as Code & CI/CD",
        description: "Automate everything from testing to deployment",
        lectures: [
          { id: 32, title: "Terraform: HCL Syntax, Providers & Resources", duration: "30 min", type: "video" },
          { id: 33, title: "Terraform: State Management, Modules & Workspaces", duration: "30 min", type: "interactive" },
          { id: 34, title: "Terraform: Provisioning AWS Infrastructure End-to-End", duration: "30 min", type: "interactive" },
          { id: 35, title: "Ansible: Playbooks, Roles & Configuration Management", duration: "25 min", type: "video" },
          { id: 36, title: "GitHub Actions: Workflow Syntax & Job Configuration", duration: "25 min", type: "interactive" },
          { id: 37, title: "GitHub Actions: Automated Testing, Linting & Build", duration: "25 min", type: "interactive" },
          { id: 38, title: "GitHub Actions: Deployment to Cloud & Container Registry", duration: "25 min", type: "interactive" },
          { id: 39, title: "GitOps: ArgoCD & Declarative Deployment Patterns", duration: "25 min", type: "video" },
          { id: 40, title: "Monitoring: Prometheus Metrics & Grafana Dashboards", duration: "30 min", type: "interactive" },
          { id: 41, title: "Logging: ELK Stack (Elasticsearch, Logstash, Kibana)", duration: "25 min", type: "video" },
          { id: 42, title: "Alerting: PagerDuty, OpsGenie & Incident Management", duration: "20 min", type: "video" },
          { id: 43, title: "Fully Automated Deployment Pipeline with IaC & Monitoring", duration: "2 hrs", type: "project" }
        ]
      }
    ]
  }
}
