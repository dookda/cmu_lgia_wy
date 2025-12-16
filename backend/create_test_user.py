"""
Script to create a test user in the database
Username: test
Password: test1234
Role: user
"""

import asyncio
import asyncpg
from auth import get_password_hash
from config import get_settings

async def create_test_user():
    settings = get_settings()

    # Hash the password
    hashed_password = get_password_hash("test1234")

    # Connect to database
    conn = await asyncpg.connect(
        host=settings.pg_host,
        port=settings.pg_port,
        user=settings.pg_user,
        password=settings.pg_password,
        database=settings.pg_name
    )

    try:
        # Check if user already exists
        existing_user = await conn.fetchrow(
            "SELECT id FROM tb_user WHERE username = $1",
            "test"
        )

        if existing_user:
            print("❌ User 'test' already exists!")
            return False

        # Insert new user
        await conn.execute(
            """
            INSERT INTO tb_user (username, email, division, pass, auth, ts)
            VALUES ($1, $2, $3, $4, $5, NOW())
            """,
            "test",
            "test@lgia.local",
            "test_division",
            hashed_password,
            "user"
        )

        print("✅ Test user created successfully!")
        print("   Username: test")
        print("   Password: test1234")
        print("   Email: test@lgia.local")
        print("   Division: test_division")
        print("   Role: user")
        return True

    except Exception as e:
        print(f"❌ Error creating user: {e}")
        return False
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(create_test_user())
