"""
Script to create sample layer data for testing
"""

import asyncio
import asyncpg
from config import get_settings

async def create_sample_data():
    settings = get_settings()

    # Connect to database
    conn = await asyncpg.connect(
        host=settings.pg_host,
        port=settings.pg_port,
        user=settings.pg_user,
        password=settings.pg_password,
        database=settings.pg_name
    )

    try:
        print("🔧 Creating sample layers...")

        # Sample layers data
        sample_layers = [
            {
                'formid': 'schools_001',
                'layername': 'โรงเรียนในเขตเทศบาล',
                'division': 'กองการศึกษา',
                'layertype': 'point'
            },
            {
                'formid': 'hospitals_001',
                'layername': 'สถานพยาบาล',
                'division': 'กองสาธารณสุข',
                'layertype': 'point'
            },
            {
                'formid': 'parks_001',
                'layername': 'สวนสาธารณะ',
                'division': 'กองช่าง',
                'layertype': 'polygon'
            },
            {
                'formid': 'roads_001',
                'layername': 'ถนนสายหลัก',
                'division': 'กองช่าง',
                'layertype': 'linestring'
            },
            {
                'formid': 'temples_001',
                'layername': 'วัดในเขตเทศบาล',
                'division': 'สำนักปลัด',
                'layertype': 'point'
            },
        ]

        for layer in sample_layers:
            # Check if layer exists
            existing = await conn.fetchrow(
                "SELECT id FROM layer_name WHERE formid = $1",
                layer['formid']
            )

            if existing:
                print(f"⏭️  Layer '{layer['layername']}' already exists")
                continue

            # Insert layer
            await conn.execute(
                """
                INSERT INTO layer_name (formid, layername, division, layertype, ts)
                VALUES ($1, $2, $3, $4, NOW())
                """,
                layer['formid'],
                layer['layername'],
                layer['division'],
                layer['layertype']
            )
            print(f"✅ Created layer: {layer['layername']}")

        print("\n📊 Summary:")
        total_layers = await conn.fetchval("SELECT COUNT(*) FROM layer_name")
        print(f"   Total layers in database: {total_layers}")

        # Display layers by division
        divisions = await conn.fetch(
            """
            SELECT division, COUNT(*) as count
            FROM layer_name
            GROUP BY division
            ORDER BY division
            """
        )

        print("\n📁 Layers by division:")
        for div in divisions:
            print(f"   - {div['division']}: {div['count']} layer(s)")

        return True

    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        return False
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(create_sample_data())
