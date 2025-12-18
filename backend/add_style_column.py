"""
Script to add 'style' column to all existing layer tables that don't have it.
Run this to fix missing style columns in older tables.
"""

import asyncio
import asyncpg
from config import get_settings


async def add_style_column():
    settings = get_settings()

    conn = await asyncpg.connect(
        host=settings.pg_host,
        port=settings.pg_port,
        user=settings.pg_user,
        password=settings.pg_password,
        database=settings.pg_name
    )

    try:
        print("🔧 Adding 'style' column to all layer tables...")

        # Get all layers from layer_name table
        layers = await conn.fetch("SELECT formid, layername FROM layer_name")

        updated_count = 0
        for layer in layers:
            formid = layer['formid']
            layername = layer['layername']

            # Check if table exists
            table_exists = await conn.fetchval(
                """
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_name = $1
                )
                """,
                formid
            )

            if not table_exists:
                print(f"  ⚠️  Table '{formid}' does not exist, skipping...")
                continue

            # Check if 'style' column already exists
            style_exists = await conn.fetchval(
                """
                SELECT EXISTS (
                    SELECT FROM information_schema.columns
                    WHERE table_name = $1 AND column_name = 'style'
                )
                """,
                formid
            )

            if style_exists:
                print(f"  ✓ {layername} ({formid}): 'style' column already exists")
            else:
                # Add the style column
                await conn.execute(f"ALTER TABLE {formid} ADD COLUMN style TEXT")
                print(f"  ✅ {layername} ({formid}): Added 'style' column")
                updated_count += 1

        print(f"\n📊 Summary: Updated {updated_count} tables")
        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(add_style_column())
