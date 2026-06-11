# Smokehouse Testing & Validation Guide

This guide provides step-by-step instructions to boot, authenticate, and test all sections of the **BrisketLovers** Restaurant Management System.

---

## 1. How to Boot the System

Open two separate terminals:

### Terminal 1: Backend API
```bash
# Navigate to project root
cd "/home/sehrab/Desktop/my projects/BrisketLovers"

# Start the NestJS backend in development/watch mode
npm run start:dev
```
* The backend runs at `http://localhost:3000`.
* The interactive Swagger documentation is available at `http://localhost:3000/api`.

### Terminal 2: Frontend App
```bash
# Navigate to the frontend directory
cd "/home/sehrab/Desktop/my projects/BrisketLovers/frontend"

# Start the Vite React development server
npm run dev
```
* The frontend runs at `http://localhost:5173`.

---

## 2. Seeded Account Credentials

* **Superadmin Account:**
  * **Email:** `admin@brisketlovers.com`
  * **Password:** `Admin@123456`
  
* **Staff & Customer Accounts:**
  * Created dynamically via the UI (see step flows below).

---

## 3. Step-by-Step Test Flows

### Flow A: Customer Experience (Register, Order, & Track)
1. **Clear Storage:** Open `http://localhost:5173/` in your browser (preferably clear LocalStorage first or use Incognito).
2. **Registration:**
   * Click **Sign Up** in the navigation bar.
   * Register a customer account (e.g. Name: `John Customer`, Email: `john@gmail.com`, Password: `Password123`, Phone: `1234567890`).
   * The app will register you and automatically log you in.
3. **Browse Menu:**
   * Go to **Menu**.
   * Try searching for items or filtering by category pills (Starters, Main Courses, Desserts, Beverages).
4. **Ordering:**
   * Click **Add to Cart** on one or more items.
   * Go to the **Cart** (click the cart icon in the top right).
   * Adjust item quantities or remove items.
   * Click **Proceed to Checkout**.
5. **Checkout & Mock Payment:**
   * Enter a Delivery Address (e.g. `123 Smokehouse Road, Texas`) and optional Pitmaster Notes.
   * Click **Place Order & Proceed to Payment**.
   * Under **Simulate Card Payment**, fill in mock card details (e.g. Card Number: `4111 2222 3333 4444`, Expiry: `12/28`, CVC: `123`).
   * Click **Pay & Confirm Order**.
6. **Track Status:**
   * You will be redirected to the **Track Order** page showing a beautiful stepper tracker indicating `PENDING` -> `CONFIRMED` -> `PREPARING` -> `READY` -> `COMPLETED`.

---

### Flow B: Staff Operations (Live Queues & Menu Setup)
1. **Create a Staff Account:**
   * Log in as the **Superadmin** (see credentials above).
   * Go to the **Admin Dashboard** -> click the **Staff Team** tab.
   * Click **Create Staff Member** and fill out the details (e.g. Name: `Pitmaster Pete`, Email: `pete@brisketlovers.com`, Password: `PetePassword123`).
   * Logout.
2. **Staff Login:**
   * Log in at `http://localhost:5173/login` using the staff email and password.
   * You will be taken directly to the **Staff Dashboard**.
3. **Handle Live Orders:**
   * Click the **Active Orders** tab.
   * Locate the customer order created in Flow A.
   * Click **Confirm Order** (status becomes `CONFIRMED`).
   * Click **Start Preparing** (status becomes `PREPARING`).
   * Click **Mark Ready** (status becomes `READY`).
   * Click **Complete Order** (status becomes `COMPLETED`).
4. **Manage Menu Items:**
   * Go to the **Menu Management** tab.
   * Toggle the **In Stock / Out of Stock** slider for any menu item.
   * Click **Add Menu Item** to create a custom dish.
   * Click **Choose File** next to a dish to upload an image.

---

### Flow C: Superadmin Control Center (Analytics & Auditing)
1. **Admin Login:**
   * Log in at `http://localhost:5173/login` with `admin@brisketlovers.com` / `Admin@123456`.
2. **Check Analytics:**
   * View the **Analytics** tab to inspect:
     * Total Orders Placed.
     * Total Completed Revenue.
     * Active cooking staff count.
     * Graph bars indicating Popularity and Daily Checkouts.
3. **Staff Control:**
   * Go to the **Staff Team** tab.
   * Click **Disable** next to a staff member to block them from logging in, or click **Enable** to restore access.
4. **Audit Logs:**
   * Go to the **System Logs** tab.
   * Inspect the table showing timestamp, action type (`CREATE`, `UPDATE`, `DELETE`), and who made the change.
   * For updates, look at the **Updates** cell which lists exactly which fields changed (e.g., `price: 15.99 → 17.99`) side-by-side.
