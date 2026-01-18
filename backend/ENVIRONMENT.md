# Backend environment variables

Set these in Railway (production) and in your local shell or `.env` file.

Required
- `DATABASE_URL` = `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
- `FRONTEND_URLS` = comma-separated list of allowed origins
  - Example: `https://zo-r-pizza.vercel.app,http://localhost:3000`

Optional
- `PORT` = `5001`
- `NODE_ENV` = `development` or `production`
- `ALLOW_LOCALHOST_ORIGIN` = `true` to allow `http://localhost:*` in production
