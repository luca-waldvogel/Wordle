# Wordle Starter

> The repository is linked to a [Jira Board](https://lucabenjaminwaldvogel.atlassian.net/jira/software/projects/WOR/boards/34) but access is needed.

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

JWT_SECRET can be any random string, it is used to sign the JWT tokens for authentication. For production, use a strong secret and keep it private.

You can generate a secure secret with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run the command in your terminal and copy the output into the JWT_SECRET variable.

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

If you get a permission error, open powershell terminal as admin and run the command again.

---

### 5. Install and run backend

```bash
cd ../backend
npm install
npm start
```

---

## Tests

The backend has 10 Jest unit tests covering `evaluateGuess`, `authMiddleware`, and `seedWords`. They only depend on the backend npm packages, and they do not require MongoDB because the database calls are mocked.

Run them from `backend/`:

```bash
npm install
npm test
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
