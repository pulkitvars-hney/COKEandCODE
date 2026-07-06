# Project Access

## Root

Workspace path:

```powershell
C:\Users\nayal\Downloads\project  spotify
```

Backend path:

```powershell
C:\Users\nayal\Downloads\project  spotify\backend
```

## Run Backend

```powershell
cd "C:\Users\nayal\Downloads\project  spotify\backend"
npm run dev
```

Production-style start:

```powershell
cd "C:\Users\nayal\Downloads\project  spotify\backend"
npm start
```

Server runs on:

```text
http://localhost:3000
```

## Important Files

- `backend\server.js` starts the server and connects to the database.
- `backend\src\app.js` registers JSON parsing, cookies, and routes.
- `backend\src\database\db.js` connects MongoDB.
- `backend\src\routes\auth.routes.js` contains auth routes.
- `backend\src\routes\artist.routes.js` contains music upload routes.
- `backend\src\controllers\post.controller.js` handles register and login.
- `backend\src\controllers\music.controller.js` handles admin music upload.
- `backend\src\services\storage.services.js` uploads files to ImageKit.
- `backend\src\models\user.model.js` defines users.
- `backend\src\models\artist.models.js` defines uploaded music records.

## Environment Variables

Create `backend\.env` with these names:

```env
mongo_url=your_mongodb_connection_string
jwt_secret=your_jwt_secret
imagekit_private_key=your_imagekit_private_key
```

## API Routes

Auth:

```text
POST /api/auth/register
POST /api/auth/login
```

Music:

```text
POST /api/music/upload
```

The music upload route expects:

- Cookie: `token`
- User role in token: `admin`
- Multipart file field: `music`
- Body field: `title`

## Useful Search Commands

```powershell
rg "createMusic" backend
rg "uploadfile" backend
rg "router.post" backend\src
```
