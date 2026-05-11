# Project Proposal Report: Karya Sathi - Intelligent Task Management System

## 1. Abstract
Karya Sathi is a comprehensive, sophisticated Task Management System designed to optimize workflow delegation, assign tasks intelligently based on personnel skills, and maximize team productivity. The proposed system features an advanced algorithmic approach towards task distribution, preventing employee burnout through dynamic workload calculation while ensuring critical tasks are prioritized effectively.

## 2. Problem Statement
In traditional organizations, task assignment is primarily a manual operation that relies heavily on an administrator’s intuition. This typically leads to three major bottlenecks:
1.  **Improper Skill Matching:** Tasks may be assigned to employees who lack the exact skills required, delaying project timelines.
2.  **Uneven Workload Distribution:** Some employees may face excessive workloads while others remain underutilized, increasing burnout rates.
3.  **Inefficient Priority Handling:** High-priority tasks might get queued behind lower priority ones, missing critical deadlines.

## 3. Proposed Solution
Karya Sathi mitigates these issues by providing a full-stack, data-driven system. It incorporates intelligent algorithms for real-time optimal task routing based on active work hours constraint and explicit skill intersection matching, completely automating the delegation process.

### 4. Core Algorithms and Computational Logic
A primary focus of this project is the integration of algorithmic efficiency in resource management.

#### 4.1. Intelligent Task Assignment & Load Balancing Algorithm
The auto-assignment mechanism solves a resource allocation problem by applying filtering and greedy optimization techniques in sequence:
-   **Skill-Intersection Filtering (O(U * S)):** The system first performs a strict evaluation of required task skills against employee competencies. User profiles are discarded if they fail the `skills.every()` set subset condition.
-   **Greedy High-Priority Allocation:** For `High` or `Medium` priority tasks, the algorithm greedily searches for the first eligible employee who has zero active `in-progress` tasks, optimizing for immediate execution.
-   **Dynamic Workload Calculation (Min-Load Heuristic):** If no idle employee is found, the system performs a temporal calculation:
    *   Iterates through all pending and active tasks of eligible users.
    *   Calculates `Elapsed Hours` strictly based on the ISO timestamp difference between `startedAt` and current system time.
    *   Computes `Remaining Workload` = max(0, `Estimated Hours` - `Elapsed Hours`).
    *   Finds the user $u$ with the global minimum $\sum$ Remaining Workload.
    *   Time Complexity: O(U * T) where U is eligible users and T is their active tasks.

#### 4.2. Priority Queue Algorithm
Tasks are not simply stored but logically ordered for the employee dashboard:
-   **Weight Assignation Function:** Priorities map to scalar weights (`High: 3, Medium: 2, Low: 1`).
-   **Sorting Logic:** The queue mechanism sorts the active task collections descending based on the numerical weight, guaranteeing that an employee always tackles the highest weighted task natively on their user view.

#### 4.3. Progress Tracking Algorithm
Provides mathematical progression metrics rather than discrete jumps:
-   Calculates active task duration continuously.
-   Progress $\ P = (\frac{Elapsed\ Hours}{Estimated\ Hours}) \times 100\ \%$.
-   Tracks overtime conditions if Elapsed Hours surpass Estimated Hours.

#### 4.4. MongoDB Aggregation Pipeline for Analytics
To prevent memory leaks and N+1 query problems in data visualization, an internal NoSQL aggregation pipeline acts on the dashboard:
-   Utilizes `$lookup` constraints for Left Outer Joins between the `Users` and `Tasks` collections.
-   Applies `$project` and internal array `$filter` conditionally matching statuses (`completed`, `pending`) to aggregate exact statistics in a single rapid database operation.

## 5. Technology Stack & Architecture

### Backend (RESTful Web Services)
-   **Runtime:** Node.js
-   **Framework:** Express.js (MVC Pattern Architecture)
-   **Database:** MongoDB via Mongoose ORM
-   **Security:** Hash-based cryptography (bcryptjs) & stateless authorization tokens (JWT).
-   **Notifications:** Asynchronous SMTP Email Dispatcher (Nodemailer).
-   **Validation:** Strict schema typecasting via Joi.
-   **API Design:** Fully documented via Swagger (`swagger-jsdoc`/`UI`).

### Frontend (Single Page Application)
-   **UI Framework:** React.js (Vite Toolchain)
-   **Routing Mechanism:** React Router DOM (Private & Guarded Routes)
-   **Charting:** Recharts.js for visualization logic.
-   **HTTP Client:** Axios with dynamic interceptors.
-   **Styling:** Modern scalable Vanilla CSS.

## 6. Access Control & System Modules
-   **Administrator Module:** Grants oversight. Capabilities include full CRUD over organizational data, global dashboard viewing, automated tracking, and initiating the routing protocol.
-   **Employee Module:** Contains focused queue-based dashboards, task progress state machines (`pending` $\rightarrow$ `in-progress` $\rightarrow$ `completed`), and personal statistic reports.
-   **Middleware Security layer:** Checks incoming packet signatures against server-side keys to prevent Privilege Escalation.

## 7. Setup & Installation Guide

### Prerequisites
-   Node.js (v18+ recommended)
-   MongoDB (Locally or remote cluster URI)

### Full Stack Startup

You can use the backend script to run both servers concurrently:
1. Navigate to the `backend` directory.
   ```bash
   cd backend
   ```
2. Install dependencies for the backend.
   ```bash
   npm install
   ```
3. Navigate to the frontend directory and install dependencies.
   ```bash
   cd "../hello frontend/frontend"
   npm install
   ```
4. Configure Environment variables:
   - Create a `.env` in `backend` with `PORT`, `MONGO_URI`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`.
   - Create a `.env` in `hello frontend/frontend` with `VITE_API_URL` pointing to the backend (e.g. `http://localhost:5000/api`).
5. Go back to the `backend` directory, and run the complete application:
   ```bash
   npm run dev:all
   ```

### API Documentation
The backend endpoints are comprehensively documented via Swagger. Navigate to `http://localhost:<PORT>/api-docs` to interact and evaluate the schemas internally.
