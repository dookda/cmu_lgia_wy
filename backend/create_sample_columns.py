"""
Script to create sample column definitions for layers
"""

import asyncio
import asyncpg
from config import get_settings

async def create_sample_columns():
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
        print("🔧 Creating sample column definitions...")

        # Column definitions for each layer
        column_definitions = [
            # Schools
            {'formid': 'schools_001', 'col_id': 'name', 'col_name': 'ชื่อโรงเรียน', 'col_type': 'varchar', 'col_desc': 'ชื่อโรงเรียน'},
            {'formid': 'schools_001', 'col_id': 'address', 'col_name': 'ที่อยู่', 'col_type': 'varchar', 'col_desc': 'ที่อยู่โรงเรียน'},
            {'formid': 'schools_001', 'col_id': 'students', 'col_name': 'จำนวนนักเรียน', 'col_type': 'integer', 'col_desc': 'จำนวนนักเรียนทั้งหมด'},
            {'formid': 'schools_001', 'col_id': 'latitude', 'col_name': 'ละติจูด', 'col_type': 'decimal', 'col_desc': 'พิกัดละติจูด'},
            {'formid': 'schools_001', 'col_id': 'longitude', 'col_name': 'ลองจิจูด', 'col_type': 'decimal', 'col_desc': 'พิกัดลองจิจูด'},

            # Hospitals
            {'formid': 'hospitals_001', 'col_id': 'name', 'col_name': 'ชื่อสถานพยาบาล', 'col_type': 'varchar', 'col_desc': 'ชื่อสถานพยาบาล'},
            {'formid': 'hospitals_001', 'col_id': 'type', 'col_name': 'ประเภท', 'col_type': 'varchar', 'col_desc': 'ประเภทสถานพยาบาล'},
            {'formid': 'hospitals_001', 'col_id': 'beds', 'col_name': 'จำนวนเตียง', 'col_type': 'integer', 'col_desc': 'จำนวนเตียงผู้ป่วย'},
            {'formid': 'hospitals_001', 'col_id': 'phone', 'col_name': 'เบอร์โทร', 'col_type': 'varchar', 'col_desc': 'หมายเลขโทรศัพท์'},
            {'formid': 'hospitals_001', 'col_id': 'latitude', 'col_name': 'ละติจูด', 'col_type': 'decimal', 'col_desc': 'พิกัดละติจูด'},
            {'formid': 'hospitals_001', 'col_id': 'longitude', 'col_name': 'ลองจิจูด', 'col_type': 'decimal', 'col_desc': 'พิกัดลองจิจูด'},

            # Parks
            {'formid': 'parks_001', 'col_id': 'name', 'col_name': 'ชื่อสวน', 'col_type': 'varchar', 'col_desc': 'ชื่อสวนสาธารณะ'},
            {'formid': 'parks_001', 'col_id': 'area', 'col_name': 'พื้นที่', 'col_type': 'decimal', 'col_desc': 'พื้นที่ (ตารางเมตร)'},
            {'formid': 'parks_001', 'col_id': 'facilities', 'col_name': 'สิ่งอำนวยความสะดวก', 'col_type': 'varchar', 'col_desc': 'สิ่งอำนวยความสะดวกในสวน'},

            # Roads
            {'formid': 'roads_001', 'col_id': 'name', 'col_name': 'ชื่อถนน', 'col_type': 'varchar', 'col_desc': 'ชื่อถนน'},
            {'formid': 'roads_001', 'col_id': 'length', 'col_name': 'ความยาว', 'col_type': 'decimal', 'col_desc': 'ความยาว (กิโลเมตร)'},
            {'formid': 'roads_001', 'col_id': 'width', 'col_name': 'ความกว้าง', 'col_type': 'decimal', 'col_desc': 'ความกว้าง (เมตร)'},
            {'formid': 'roads_001', 'col_id': 'condition', 'col_name': 'สภาพ', 'col_type': 'varchar', 'col_desc': 'สภาพถนน'},

            # Temples
            {'formid': 'temples_001', 'col_id': 'name', 'col_name': 'ชื่อวัด', 'col_type': 'varchar', 'col_desc': 'ชื่อวัด'},
            {'formid': 'temples_001', 'col_id': 'monks', 'col_name': 'จำนวนพระ', 'col_type': 'integer', 'col_desc': 'จำนวนพระสงฆ์'},
            {'formid': 'temples_001', 'col_id': 'established', 'col_name': 'ปีที่สร้าง', 'col_type': 'integer', 'col_desc': 'ปีที่สร้างวัด'},
            {'formid': 'temples_001', 'col_id': 'latitude', 'col_name': 'ละติจูด', 'col_type': 'decimal', 'col_desc': 'พิกัดละติจูด'},
            {'formid': 'temples_001', 'col_id': 'longitude', 'col_name': 'ลองจิจูด', 'col_type': 'decimal', 'col_desc': 'พิกัดลองจิจูด'},
        ]

        count = 0
        for col_def in column_definitions:
            # Check if column exists
            existing = await conn.fetchrow(
                "SELECT id FROM layer_column WHERE formid = $1 AND col_id = $2",
                col_def['formid'],
                col_def['col_id']
            )

            if existing:
                continue

            # Insert column definition
            await conn.execute(
                """
                INSERT INTO layer_column (formid, col_id, col_name, col_type, col_desc)
                VALUES ($1, $2, $3, $4, $5)
                """,
                col_def['formid'],
                col_def['col_id'],
                col_def['col_name'],
                col_def['col_type'],
                col_def['col_desc']
            )
            count += 1

        print(f"✅ Created {count} column definitions")

        # Summary
        total = await conn.fetchval("SELECT COUNT(*) FROM layer_column")
        print(f"   Total columns in database: {total}")

        # Show columns by layer
        layers = await conn.fetch(
            """
            SELECT ln.layername, COUNT(lc.id) as col_count
            FROM layer_name ln
            LEFT JOIN layer_column lc ON ln.formid = lc.formid
            GROUP BY ln.layername
            ORDER BY ln.layername
            """
        )

        print("\n📊 Columns by layer:")
        for layer in layers:
            print(f"   - {layer['layername']}: {layer['col_count']} column(s)")

        return True

    except Exception as e:
        print(f"❌ Error creating column definitions: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(create_sample_columns())
