"""
Script to recreate layer tables with proper PostGIS geometry columns
"""

import asyncio
import asyncpg
from config import get_settings

async def fix_layer_tables():
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
        print("🔧 Fixing layer tables with PostGIS geometry...")

        # Get all layers
        layers = await conn.fetch("SELECT formid, layername, layertype FROM layer_name")

        for layer in layers:
            formid = layer['formid']
            layername = layer['layername']
            layertype = layer['layertype']

            # Map layertype to PostGIS geometry type
            geom_type = {
                'point': 'POINT',
                'linestring': 'LINESTRING',
                'polygon': 'POLYGON'
            }.get(layertype, 'POINT')

            # Drop old table if exists
            old_table = f"data_{formid}"
            await conn.execute(f"DROP TABLE IF EXISTS {old_table}")

            # Check if correct table exists
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
                # Create table with PostGIS geometry
                await conn.execute(f"""
                    CREATE TABLE {formid} (
                        id SERIAL PRIMARY KEY,
                        refid TEXT,
                        geom GEOMETRY({geom_type}, 4326),
                        ts TIMESTAMP DEFAULT NOW(),
                        style TEXT
                    )
                """)
                print(f"  ✅ Created table: {formid}")

            # Get column definitions
            columns = await conn.fetch(
                "SELECT col_id, col_type FROM layer_column WHERE formid = $1",
                formid
            )

            # Add columns if they don't exist
            for col in columns:
                col_id = col['col_id']
                col_type = col['col_type']

                # Map column types
                pg_type = {
                    'varchar': 'TEXT',
                    'integer': 'INTEGER',
                    'decimal': 'NUMERIC',
                    'date': 'DATE',
                    'boolean': 'BOOLEAN'
                }.get(col_type, 'TEXT')

                # Check if column exists
                col_exists = await conn.fetchval(
                    """
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns
                        WHERE table_name = $1 AND column_name = $2
                    )
                    """,
                    formid, col_id
                )

                if not col_exists:
                    await conn.execute(f"ALTER TABLE {formid} ADD COLUMN {col_id} {pg_type}")

            # Insert sample data
            data_count = await conn.fetchval(f"SELECT COUNT(*) FROM {formid}")

            if data_count == 0:
                if formid == 'schools_001':
                    # Schools as points
                    schools = [
                        {"name": "โรงเรียนเทศบาล 1", "lat": 18.7883, "lng": 98.9853, "students": 450, "address": "ตำบลช้างเผือก"},
                        {"name": "โรงเรียนเทศบาล 2", "lat": 18.7920, "lng": 98.9890, "students": 380, "address": "ตำบลช้างเผือก"},
                        {"name": "โรงเรียนเทศบาล 3", "lat": 18.7850, "lng": 99.0100, "students": 520, "address": "ตำบลช้างเผือก"},
                        {"name": "โรงเรียนเทศบาล 4", "lat": 18.7950, "lng": 98.9750, "students": 410, "address": "ตำบลช้างเผือก"},
                        {"name": "โรงเรียนเทศบาล 5", "lat": 18.7800, "lng": 98.9950, "students": 490, "address": "ตำบลช้างเผือก"},
                    ]

                    for school in schools:
                        await conn.execute(
                            f"""INSERT INTO {formid} (refid, geom, name, address, students, latitude, longitude)
                                VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4, $5, $6, $7, $8)""",
                            f"ref{school['lng']}{school['lat']}", school['lng'], school['lat'],
                            school['name'], school['address'], school['students'],
                            school['lat'], school['lng']
                        )

                elif formid == 'hospitals_001':
                    hospitals = [
                        {"name": "โรงพยาบาลเทศบาล", "lat": 18.7900, "lng": 98.9900, "beds": 50, "type": "โรงพยาบาลชุมชน"},
                        {"name": "คลินิกเทศบาล 1", "lat": 18.7860, "lng": 98.9820, "beds": 10, "type": "คลินิก"},
                        {"name": "คลินิกเทศบาล 2", "lat": 18.7940, "lng": 99.0050, "beds": 10, "type": "คลินิก"},
                        {"name": "สถานีอนามัย", "lat": 18.7820, "lng": 98.9880, "beds": 15, "type": "สถานีอนามัย"},
                    ]

                    for hospital in hospitals:
                        await conn.execute(
                            f"""INSERT INTO {formid} (refid, geom, name, type, beds, phone, latitude, longitude)
                                VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4, $5, $6, $7, $8, $9)""",
                            f"ref{hospital['lng']}{hospital['lat']}", hospital['lng'], hospital['lat'],
                            hospital['name'], hospital['type'], hospital['beds'], "053-123456",
                            hospital['lat'], hospital['lng']
                        )

                elif formid == 'parks_001':
                    # Parks as polygons
                    parks = [
                        {"name": "สวนสาธารณะหนองบัวหลวง", "area": 12000, "facilities": "ลานออกกำลังกาย, สนามเด็กเล่น",
                         "wkt": "POLYGON((98.9850 18.7890, 98.9880 18.7890, 98.9880 18.7860, 98.9850 18.7860, 98.9850 18.7890))"},
                        {"name": "สวนสาธารณะเทศบาล", "area": 15000, "facilities": "ลานออกกำลังกาย, สนามเด็กเล่น, ห้องน้ำ",
                         "wkt": "POLYGON((99.0000 18.7950, 99.0030 18.7950, 99.0030 18.7920, 99.0000 18.7920, 99.0000 18.7950))"},
                    ]

                    for park in parks:
                        await conn.execute(
                            f"""INSERT INTO {formid} (refid, geom, name, area, facilities)
                                VALUES ($1, ST_GeomFromText($2, 4326), $3, $4, $5)""",
                            f"ref{park['name']}", park['wkt'],
                            park['name'], park['area'], park['facilities']
                        )

                elif formid == 'roads_001':
                    roads = [
                        {"name": "ถนนช้างเผือก", "length": 2.5, "width": 12, "condition": "ดี",
                         "wkt": "LINESTRING(98.9800 18.7850, 98.9850 18.7880, 98.9900 18.7920, 98.9950 18.7950)"},
                        {"name": "ถนนสุเทพ", "length": 3.2, "width": 10, "condition": "ดี",
                         "wkt": "LINESTRING(98.9850 18.7800, 98.9870 18.7850, 98.9890 18.7900, 98.9900 18.7950)"},
                    ]

                    for road in roads:
                        await conn.execute(
                            f"""INSERT INTO {formid} (refid, geom, name, length, width, condition)
                                VALUES ($1, ST_GeomFromText($2, 4326), $3, $4, $5, $6)""",
                            f"ref{road['name']}", road['wkt'],
                            road['name'], road['length'], road['width'], road['condition']
                        )

                elif formid == 'temples_001':
                    temples = [
                        {"name": "วัดช้างเผือก", "lat": 18.7870, "lng": 98.9840, "monks": 12, "year": 1850},
                        {"name": "วัดพระธาตุ", "lat": 18.7910, "lng": 99.0020, "monks": 25, "year": 1720},
                        {"name": "วัดประตูเชียง", "lat": 18.7840, "lng": 98.9920, "monks": 8, "year": 1900},
                        {"name": "วัดเจดีย์หลวง", "lat": 18.7920, "lng": 98.9860, "monks": 30, "year": 1650},
                    ]

                    for temple in temples:
                        await conn.execute(
                            f"""INSERT INTO {formid} (refid, geom, name, monks, established, latitude, longitude)
                                VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4, $5, $6, $7, $8)""",
                            f"ref{temple['lng']}{temple['lat']}", temple['lng'], temple['lat'],
                            temple['name'], temple['monks'], temple['year'],
                            temple['lat'], temple['lng']
                        )

                final_count = await conn.fetchval(f"SELECT COUNT(*) FROM {formid}")
                print(f"  ✅ {layername}: {final_count} records")

        print("\n📊 Summary:")
        for layer in layers:
            formid = layer['formid']
            layername = layer['layername']
            count = await conn.fetchval(f"SELECT COUNT(*) FROM {formid}")
            print(f"   - {layername} ({formid}): {count} feature(s)")

        return True

    except Exception as e:
        print(f"❌ Error fixing layer tables: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(fix_layer_tables())
