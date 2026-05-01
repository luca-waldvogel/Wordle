# Wordle Starter

Simple full-stack Wordle app.

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- Database: MongoDB
- Auth: JWT

---

## Folder Structure

```text
frontend/
  index.html
  style.css
  script.js
  config.example.js

backend/
  src/
  .env.example
  package.json

README.md
```

---

## Local Setup

### 1. Clone repository

```bash
git clone <repo-url>
cd <project-folder>
```

---

### 2. Create backend environment file

```bash
cd backend
cp .env.example .env
```

#### Edit `.env`

##### Option 1 - Local MongoDB

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/wordle
JWT_SECRET=your_secret_here
```

##### Option 2 - MongoDB Atlas (recommended)

```env
PORT=5000
MONGO_URI=mongodb+srv://your-user:your-password@your-cluster.mongodb.net/wordle
JWT_SECRET=your_secret_here
```

---

### 3. Create frontend config

```bash
cd ../frontend
cp config.example.js config.js
```

#### Edit `config.js`

##### Option 1 - Local backend

```js
window.API_BASE_URL = "http://localhost:5000";
```

##### Option 2 - Your deployed backend

```js
window.API_BASE_URL = "https://your-backend-url.onrender.com";
```

---

### 4. Start MongoDB (only if using local DB)

If you use MongoDB Atlas, skip this step.

```bash
net start MongoDB
```

If you get a permission error, open powershell as admin and run the command again.

---

### 5. Install and run backend

```bash
cd ../backend
npm install
npm start
```

---

### 6. Open the app in your browser:

```text
http://localhost:5000
```

## Successful Startup

If the backend starts correctly, you should see something like this:

```text
MongoDB connected
Seeded word list
Server running on http://localhost:5000
```

---

## MongoDB

Collections are created automatically:

- users
- words
- gameresults

Word list is seeded on backend start.

---

## Important

Do NOT commit:

```text
backend/.env
frontend/config.js
```

Keep:

```text
backend/.env.example
frontend/config.example.js
```
