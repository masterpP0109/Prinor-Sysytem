# Shelf Shaper Sync - Offline Inventory Management System

An offline-first inventory management system built as a React web application for managing physical shelves and stock items without requiring an internet connection.

## System Overview

This is an **offline-first inventory management system** built as a React web application. It allows users to manage physical shelves and their stock items without requiring an internet connection, storing all data locally in the browser's localStorage.

## Core Technologies

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Query for data fetching (though primarily used for local state)
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner for toast messages

## Architecture

### Data Model

The system manages four main entities:

1. **Shelves** (`Shelf`): Physical storage locations
   - `id`: Unique identifier
   - `name`: Display name
   - `createdAt`: Timestamp

2. **Items** (`Item`): Products stored on shelves
   - `id`, `shelfId`: Unique ID and parent shelf reference
   - `name`, `price`: Product details
   - `initialQuantity`, `soldQuantity`, `remainingQuantity`: Stock tracking
   - `createdAt`: Timestamp

3. **Orders** (`Order`): Sales transactions (currently unused in UI)
   - `id`, `itemId`, `itemName`: Transaction details
   - `quantity`, `totalPrice`: Sale amounts
   - `createdAt`: Timestamp

4. **Payments** (`Payment`): Cash flow tracking
   - `id`, `amount`, `method`: Payment details
   - `notes`: Optional description
   - `createdAt`: Timestamp

### Storage Layer (`src/lib/storage.ts`)

All data is persisted using browser localStorage with JSON serialization:

- **Generic Functions**: `getFromStorage<T>()` and `saveToStorage<T>()` handle CRUD operations
- **Entity-Specific Functions**: CRUD operations for shelves, items, orders, and payments
- **Calculations**:
  - `calculateShelfValue()`: Computes total, sold, and remaining value per shelf
  - `calculateTotalInventoryValue()`: Aggregates values across all shelves
  - `calculateExpectedCash()`: Calculates expected cash (total sales minus recorded payments)

### Application Structure

#### Routing (`src/App.tsx`)
- Root route (`/`) redirects to `/dashboard`
- Dashboard route (`/dashboard`) renders the main interface
- 404 handling for invalid routes

#### Main Dashboard (`src/pages/Dashboard.tsx`)
The primary interface featuring:
- **Header**: Title and "Add Shelf" button
- **Statistics Cards**: Overview of inventory values, sales, remaining stock, and expected cash
- **Two-Column Layout**:
  - Left: Shelves and their items
  - Right: Payments tracker

#### Components

**ShelfCard** (`src/components/ShelfCard.tsx`):
- Displays shelf name and summary statistics
- Collapsible to show/hide items
- Buttons for editing shelf, deleting shelf, and adding items
- Renders `ItemRow` components for each item

**ItemRow** (`src/components/ItemRow.tsx`):
- Shows item details (name, price, total value)
- Quantity controls for sold/remaining stock
- Edit mode for modifying item properties
- Delete functionality

**DashboardStats** (`src/components/DashboardStats.tsx`):
- Four metric cards showing key financial and inventory data
- Uses icons and color coding for visual distinction

**PaymentsSection** (`src/components/PaymentsSection.tsx`):
- Form for recording new payments (amount, method, notes)
- List of all recorded payments with delete functionality
- Shows total payments amount

**Dialog Components**:
- `AddShelfDialog`: Modal for creating/editing shelves
- `AddItemDialog`: Modal for adding new items to shelves

## Data Flow

1. **Initialization**: App loads and redirects to dashboard
2. **Data Loading**: Components fetch data from localStorage on mount
3. **User Interactions**:
   - Add/Edit/Delete shelves → Updates localStorage → Refreshes UI
   - Add items to shelves → Updates localStorage → Refreshes shelf display
   - Adjust item quantities → Updates sold/remaining → Recalculates values
   - Record payments → Updates payment list → Recalculates expected cash
4. **Real-time Updates**: All changes trigger UI refreshes via `refreshData()` callbacks

## Key Features

- **Offline-First**: No server dependency, all data stored locally
- **Hierarchical Organization**: Shelves contain items
- **Real-time Calculations**: Values update immediately on quantity changes
- **Dual Quantity Tracking**: Both sold and remaining quantities maintained
- **Payment Tracking**: Separate from sales for cash flow management
- **Responsive Design**: Works on desktop and mobile devices
- **Form Validation**: Input validation with error messages
- **Confirmation Dialogs**: Prevents accidental deletions

## Business Logic

- **Stock Management**: Items have initial quantity, track sold vs remaining
- **Value Calculations**: Price × quantity for totals, sold amounts, remaining values
- **Cash Reconciliation**: Expected cash = total sales value - recorded payments
- **Data Integrity**: Deleting shelves removes associated items

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

1. Clone the repository:
```sh
git clone <YOUR_GIT_URL>
cd shelf-shaper-sync
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

## Deployment

This project can be deployed using various platforms. For production deployment:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting platform (Netlify, Vercel, etc.)

## Usage

1. **Dashboard**: Overview of inventory and financial metrics
2. **Groceries**: Manage food and grocery items
3. **Gadgets**: Manage electronics and tech items
4. **Inventory**: General inventory management
5. **Counting**: Stock counting by shelf location
6. **Reports**: View stocktake reports and analytics

This system is designed for small retail operations or personal inventory tracking where offline capability and simplicity are prioritized over complex features like user accounts, multi-location support, or advanced reporting.
