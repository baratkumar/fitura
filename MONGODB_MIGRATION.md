# MongoDB Migration Complete

The project has been successfully migrated from PostgreSQL to MongoDB with Mongoose.

## What Changed

### 1. Dependencies
- ✅ Removed: `pg` and `@types/pg`
- ✅ Added: `mongoose`

### 2. Database Connection
- **File**: `lib/db.ts`
- Uses MongoDB connection string from `MONGODB_URI` or `DATABASE_URL` environment variable
- Implements connection caching for Next.js serverless environments
- Default connection: `mongodb://localhost:27017/fitura`

### 3. Data Models (Mongoose Schemas)
Created three Mongoose models:
- **`lib/models/Membership.ts`** - Membership plans
- **`lib/models/Client.ts`** - Client/member information
- **`lib/models/Attendance.ts`** - Attendance records

### 4. Store Files Updated
All store files now use MongoDB:
- ✅ `lib/clientStore.ts` - Uses Mongoose Client model
- ✅ `lib/membershipStore.ts` - Uses Mongoose Membership model
- ✅ `lib/attendanceStore.ts` - Uses Mongoose Attendance model

### 5. API Routes Updated
All API routes updated to work with MongoDB:
- ✅ `app/api/clients/route.ts` - String IDs instead of integers
- ✅ `app/api/clients/[id]/route.ts` - String IDs
- ✅ `app/api/memberships/route.ts` - MongoDB error codes
- ✅ `app/api/memberships/[id]/route.ts` - String IDs
- ✅ `app/api/attendance/route.ts` - String IDs
- ✅ `app/api/attendance/[id]/route.ts` - String IDs
- ✅ `app/api/dashboard/stats/route.ts` - MongoDB aggregation queries
- ✅ `app/api/test-db/route.ts` - MongoDB connection test
- ✅ `app/api/init-db/route.ts` - MongoDB initialization

### 6. Removed Files
- ❌ `lib/tableNames.ts` - No longer needed (MongoDB uses collections, not tables)

### 7. Type Updates
- ✅ `lib/clientStore.types.ts` - Client ID changed from `number` to `string`

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

This will install `mongoose` and remove `pg` if it's still in node_modules.

### 2. Set Up MongoDB Connection

Add to your `.env.local` file:
```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/fitura

# OR use DATABASE_URL (will be used if MONGODB_URI is not set)
DATABASE_URL=mongodb://localhost:27017/fitura
```

### 3. MongoDB Options

**Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/fitura
```

**MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitura?retryWrites=true&w=majority
```

**MongoDB with Authentication:**
```env
MONGODB_URI=mongodb://username:password@host:port/database
```

### 4. Initialize Database

Visit or call:
```
GET http://localhost:3000/api/init-db
```

This will:
- Connect to MongoDB
- Create default membership plans (Monthly, Quarterly, Yearly, Day Pass, Trial)

### 5. Test Connection

Visit:
```
GET http://localhost:3000/api/test-db
```

## Key Differences from PostgreSQL

1. **IDs**: MongoDB uses ObjectIds (strings) instead of integers
2. **No Foreign Keys**: MongoDB doesn't enforce foreign key constraints (handled in application code)
3. **No Tables**: MongoDB uses collections (similar to tables but schema-less)
4. **Error Codes**: 
   - PostgreSQL: `23505` (unique violation) → MongoDB: `11000`
   - PostgreSQL: `23503` (foreign key) → MongoDB: No equivalent (check in code)
5. **Queries**: Use Mongoose methods instead of SQL
6. **Aggregations**: Use MongoDB aggregation pipeline instead of SQL GROUP BY

## Data Migration

If you have existing PostgreSQL data, you'll need to:
1. Export data from PostgreSQL
2. Transform the data format (IDs, dates, etc.)
3. Import into MongoDB

This migration script is not included - you'll need to create it based on your specific data structure.

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Set up MongoDB connection string in `.env.local`
3. ✅ Start MongoDB (if using local instance)
4. ✅ Run the app: `npm run dev`
5. ✅ Initialize database: Visit `/api/init-db`
6. ✅ Test connection: Visit `/api/test-db`

## Troubleshooting

**Connection Issues:**
- Verify MongoDB is running (if local)
- Check connection string format
- Ensure network access (for cloud MongoDB)

**Type Errors:**
- Make sure `mongoose` is installed: `npm install mongoose`
- Restart TypeScript server in your IDE

**Data Not Showing:**
- Run `/api/init-db` to create default data
- Check MongoDB connection
- Verify collections exist in MongoDB

## Support

For MongoDB-specific issues:
- MongoDB Documentation: https://docs.mongodb.com/
- Mongoose Documentation: https://mongoosejs.com/docs/



