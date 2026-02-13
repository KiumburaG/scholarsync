# Supabase Setup Instructions

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: `scholarsync`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to you (e.g., US East, US West, Europe)
   - **Pricing Plan**: Free tier is perfect for development

## Step 2: Get Your Database Connection String

1. Once project is created, go to **Settings** → **Database**
2. Scroll to **Connection String** section
3. Select **URI** format
4. Copy the connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the password you created

## Step 3: Update Backend .env File

1. Open `/Users/Kiumbura/Desktop/Work/Projects/ScholarSync/scholarsync-backend/.env`
2. Replace the `DATABASE_URL` line with your Supabase connection string:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"
   ```

## Step 4: Run Database Migrations

Once you've updated the .env file, run:

```bash
cd /Users/Kiumbura/Desktop/Work/Projects/ScholarSync/scholarsync-backend
npm run prisma:generate
npx prisma migrate dev --name init
```

This will:
- Generate Prisma Client
- Create all tables in your Supabase database
- Set up the initial schema

## Step 5: Verify Connection

You can verify the connection by:

1. Running `npx prisma studio` - opens a GUI to view your database
2. Or check Supabase Dashboard → **Table Editor** to see your tables

## Optional: Get Supabase Storage Credentials

If you want to use Supabase Storage instead of AWS S3:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL**
   - **anon public** key
   - **service_role** key (keep this secret!)
3. Add to .env:
   ```
   SUPABASE_URL="https://xxx.supabase.co"
   SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_KEY="your-service-key"
   ```

---

## After Setup

Once you've completed these steps and run the migrations, come back and let me know. I'll mark Task #2 as complete and we'll continue with the remaining tasks.
