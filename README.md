# BeautyTry

BeautyTry is an interactive Virtual Try-On web application designed to help users find and apply their perfect cosmetic shade. It features a modern frontend powered by React and Vite, supported by a FastAPI Python backend, and uses Google Apps Script as a cloud database to seamlessly manage users, products, and favorites.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend:** Python, FastAPI, Uvicorn
- **Database:** Google Apps Script / Google Sheets

## Prerequisites

Ensure you have the following installed on your machine before running the project:
1. [Node.js](https://nodejs.org/) (v16 or higher)
2. [Python 3](https://www.python.org/downloads/) (v3.8 or higher)

## How to Run the Application

### Option 1: Quick Start (Windows)
If you are on a Windows machine, you can launch both the frontend and backend simultaneously using the provided batch script.
1. Simply double-click `auto_run.bat` in the root of the project.
2. It will automatically start the FastAPI backend in a new terminal and the React frontend in the current terminal.

---

### Option 2: Manual Start (Mac / Linux / Windows)

If you prefer to run the services manually, follow these steps:

#### 1. Start the Backend (FastAPI)
Open a terminal and navigate to the backend folder:
```bash
cd backend
```
*(Optional but recommended)* Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```
Install the dependencies (if you haven't already):
```bash
pip install fastapi uvicorn pydantic bcrypt httpx requests email-validator
```
Start the server:
```bash
python main.py
```
*The backend will run on `http://0.0.0.0:8000`.*

#### 2. Start the Frontend (React)
Open a **new** terminal and navigate to the frontend folder:
```bash
cd frontend
```
Install the node modules:
```bash
npm install
```
Start the development server:
```bash
npm run dev -- --host
```
*The frontend will run on your local network (e.g., `http://localhost:5173` or similar).*

## Features

- **Virtual Try-On:** Interactive interface to select and "apply" cosmetic shades.
- **Smart Recommendations:** Recommends "Best Matches" and "Other Recommendations" based on skin tone detection.
- **User Authentication:** Guest flow, Account Registration, and Login routing.
- **Favorites Management:** Save multiple shades to your profile and quickly jump back to them.
- **Admin Dashboard:** Role-based access control for managing users and product inventories.
- **Optimistic UI:** Lightning-fast, app-like responsiveness using local state caching synchronized quietly with the cloud backend.

