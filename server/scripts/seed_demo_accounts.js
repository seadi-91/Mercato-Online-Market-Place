const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const { randomUUID } = require('crypto');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function seed() {
  const authClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.AUTH_DB_NAME || 'mercatox_auth_db'
  });

  const usersClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.USERS_DB_NAME || 'mercatox_users_db'
  });

  await authClient.connect();
  await usersClient.connect();

  const accounts = [
    {
      email: 'customer@gmail.com',
      phoneNumber: '+251911000003',
      password: 'customer123',
      role: 'CUSTOMER',
      fullName: 'Demo Customer',
      shopName: null,
      businessType: null,
    },
    {
      email: 'suplayer@gmail.com',
      phoneNumber: '+251911000004',
      password: '12345678',
      role: 'SUPPLIER',
      fullName: 'Abyssinia Raw Materials Supplier',
      shopName: 'Abyssinia Industrial Supply',
      businessType: 'B2B Wholesale Raw Materials Supplier',
    }
  ];

  for (const acc of accounts) {
    const existing = await authClient.query('SELECT * FROM users WHERE LOWER(email) = $1', [acc.email.toLowerCase()]);
    let userId;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(acc.password, salt);

    if (existing.rows.length === 0) {
      userId = randomUUID();
      await authClient.query(`
        INSERT INTO users (id, email, "phoneNumber", "passwordHash", role, "isActive", "authProvider", "failedLoginAttempts", "lockoutRounds", "lockedUntil", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, true, 'local', 0, 0, null, NOW(), NOW())
      `, [userId, acc.email.toLowerCase(), acc.phoneNumber, passwordHash, acc.role]);
      console.log(`Created user in auth db: ${acc.email} (${userId})`);
    } else {
      userId = existing.rows[0].id;
      await authClient.query(`
        UPDATE users 
        SET "passwordHash" = $1, "isActive" = true, "failedLoginAttempts" = 0, "lockoutRounds" = 0, "lockedUntil" = null, "updatedAt" = NOW()
        WHERE id = $2
      `, [passwordHash, userId]);
      console.log(`Updated user password & unlocked in auth db: ${acc.email} (${userId})`);
    }

    // Ensure profile exists in users_db
    const existingProfile = await usersClient.query('SELECT * FROM profiles WHERE "userId" = $1', [userId]);
    if (existingProfile.rows.length === 0) {
      const profileId = randomUUID();
      await usersClient.query(`
        INSERT INTO profiles (
          id, "userId", role, "fullName", "phoneNumber", "alternatePhone", email,
          "shopName", "businessType", city, "subCity", "specificLocation",
          "isVerifiedMerchant", "merchantKycStatus", "isActive", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $5, $6,
          $7, $8, 'Addis Ababa', 'Kirkos', 'Mercato Commercial Zone',
          $9, $10, true, NOW(), NOW()
        )
      `, [
        profileId,
        userId,
        acc.role,
        acc.fullName,
        acc.phoneNumber,
        acc.email,
        acc.shopName,
        acc.businessType,
        acc.role === 'SUPPLIER',
        acc.role === 'SUPPLIER' ? 'APPROVED' : 'NONE'
      ]);
      console.log(`Created profile in users db for: ${acc.email}`);
    } else {
      console.log(`Profile already exists in users db for: ${acc.email}`);
    }
  }

  // Also unlock all other demo users (admin, seller)
  await authClient.query(`
    UPDATE users 
    SET "isActive" = true, "failedLoginAttempts" = 0, "lockoutRounds" = 0, "lockedUntil" = null 
    WHERE email IN ('admin@gmail.com', 'seller@gmail.com')
  `);
  console.log('Admin and seller reset & unlocked.');

  await authClient.end();
  await usersClient.end();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
