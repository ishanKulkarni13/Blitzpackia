# Backpack Blitz

Next.js version of the Backpack Blitz MVP for IEEE Day, VIT Pune.

## Local setup

From this directory:

```powershell
Set-Location D:\projects\Backpack-Blitz\next
npm install
Copy-Item .env.example .env
```

Set these values in `.env`:

- `DATABASE_URL`: Neon pooled PostgreSQL connection string.
- `DIRECT_URL`: Neon direct/unpooled connection string for migrations. It can be the same value for development if the provider permits it.
- `ADMIN_PASSWORD`: password used at `/admin`.
- `ADMIN_SESSION_SECRET`: long random value used to sign the admin cookie.

Then initialize the database:

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
```

Run the app:

```powershell
npm run dev
```

Open `http://localhost:3000`. The admin page is intentionally not linked from the game; enter `http://localhost:3000/admin` manually.

## Database scripts

- `npm run db:generate` generates Prisma Client.
- `npm run db:migrate` applies checked-in migrations with `prisma migrate deploy`.
- `npm run db:seed` idempotently seeds the VIT Pune branch list.
- `npm run db:studio` opens Prisma Studio.

Scores without a phone number are independent entries. A normalized phone number identifies one current best score: a higher retry updates it, while an equal or lower retry leaves the existing score unchanged. Phone numbers are only returned by authenticated admin endpoints and are never included in public leaderboard responses.

## Validation

```powershell
npm run lint
npm run build
```
