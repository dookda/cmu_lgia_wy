"""
Script to create sample geometry data for layers
Creates actual data tables and populates them with GeoJSON
"""

import asyncio
import asyncpg
import json
from config import get_settings

async def create_geometry_data():
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
        print("🗺️  Creating geometry data for layers...")

        # Get all layers
        layers = await conn.fetch("SELECT formid, layername, layertype FROM layer_name")

        for layer in layers:
            formid = layer['formid']
            layername = layer['layername']
            layertype = layer['layertype']

            # Create dynamic table name
            table_name = f"data_{formid}"

            # Check if table exists
            table_exists = await conn.fetchval(
                """
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_name = $1
                )
                """,
                table_name
            )

            if not table_exists:
                # Create table
                await conn.execute(f"""
                    CREATE TABLE {table_name} (
                        id SERIAL PRIMARY KEY,
                        geojson TEXT,
                        properties JSONB,
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                """)
                print(f"  ✅ Created table: {table_name}")

            # Check if data exists
            data_count = await conn.fetchval(f"SELECT COUNT(*) FROM {table_name}")

            if data_count > 0:
                print(f"  ⏭️  {layername} already has {data_count} records")
                continue

            # Insert sample data based on layer type
            if formid == 'schools_001':
                # Sample schools in Chiang Mai area
                schools = [
                    {"name": "โรงเรียนเทศบาล 1", "lat": 18.7883, "lng": 98.9853, "students": 450},
                    {"name": "โรงเรียนเทศบาล 2", "lat": 18.7920, "lng": 98.9890, "students": 380},
                    {"name": "โรงเรียนเทศบาล 3", "lat": 18.7850, "lng": 99.0100, "students": 520},
                    {"name": "โรงเรียนเทศบาล 4", "lat": 18.7950, "lng": 98.9750, "students": 410},
                    {"name": "โรงเรียนเทศบาล 5", "lat": 18.7800, "lng": 98.9950, "students": 490},
                ]

                for school in schools:
                    geojson = json.dumps({
                        "type": "Point",
                        "coordinates": [school["lng"], school["lat"]]
                    })
                    properties = json.dumps({
                        "name": school["name"],
                        "students": school["students"],
                        "address": f"ตำบลช้างเผือก อำเภอเมือง จังหวัดเชียงใหม่"
                    })
                    await conn.execute(
                        f"INSERT INTO {table_name} (geojson, properties) VALUES ($1, $2)",
                        geojson, properties
                    )

            elif formid == 'hospitals_001':
                # Sample hospitals
                hospitals = [
                    {"name": "โรงพยาบาลเทศบาล", "lat": 18.7900, "lng": 98.9900, "beds": 50, "type": "โรงพยาบาลชุมชน"},
                    {"name": "คลินิกเทศบาล 1", "lat": 18.7860, "lng": 98.9820, "beds": 10, "type": "คลินิก"},
                    {"name": "คลินิกเทศบาล 2", "lat": 18.7940, "lng": 99.0050, "beds": 10, "type": "คลินิก"},
                    {"name": "สถานีอนามัย", "lat": 18.7820, "lng": 98.9880, "beds": 15, "type": "สถานีอนามัย"},
                ]

                for hospital in hospitals:
                    geojson = json.dumps({
                        "type": "Point",
                        "coordinates": [hospital["lng"], hospital["lat"]]
                    })
                    properties = json.dumps({
                        "name": hospital["name"],
                        "type": hospital["type"],
                        "beds": hospital["beds"],
                        "phone": "053-123456"
                    })
                    await conn.execute(
                        f"INSERT INTO {table_name} (geojson, properties) VALUES ($1, $2)",
                        geojson, properties
                    )

            elif formid == 'parks_001':
                # Sample parks (polygons)
                parks = [
                    {
                        "name": "สวนสาธารณะหนองบัวหลวง",
                        "coords": [
                            [98.9850, 18.7890],
                            [98.9880, 18.7890],
                            [98.9880, 18.7860],
                            [98.9850, 18.7860],
                            [98.9850, 18.7890]
                        ],
                        "area": 12000
                    },
                    {
                        "name": "สวนสาธารณะเทศบาล",
                        "coords": [
                            [99.0000, 18.7950],
                            [99.0030, 18.7950],
                            [99.0030, 18.7920],
                            [99.0000, 18.7920],
                            [99.0000, 18.7950]
                        ],
                        "area": 15000
                    },
                ]

                for park in parks:
                    geojson = json.dumps({
                        "type": "Polygon",
                        "coordinates": [park["coords"]]
                    })
                    properties = json.dumps({
                        "name": park["name"],
                        "area": park["area"],
                        "facilities": "ลานออกกำลังกาย, สนามเด็กเล่น, ห้องน้ำ"
                    })
                    await conn.execute(
                        f"INSERT INTO {table_name} (geojson, properties) VALUES ($1, $2)",
                        geojson, properties
                    )

            elif formid == 'roads_001':
                # Sample roads (linestrings)
                roads = [
                    {
                        "name": "ถนนช้างเผือก",
                        "coords": [
                            [98.9800, 18.7850],
                            [98.9850, 18.7880],
                            [98.9900, 18.7920],
                            [98.9950, 18.7950]
                        ],
                        "length": 2.5,
                        "width": 12
                    },
                    {
                        "name": "ถนนสุเทพ",
                        "coords": [
                            [98.9850, 18.7800],
                            [98.9870, 18.7850],
                            [98.9890, 18.7900],
                            [98.9900, 18.7950]
                        ],
                        "length": 3.2,
                        "width": 10
                    },
                ]

                for road in roads:
                    geojson = json.dumps({
                        "type": "LineString",
                        "coordinates": road["coords"]
                    })
                    properties = json.dumps({
                        "name": road["name"],
                        "length": road["length"],
                        "width": road["width"],
                        "condition": "ดี"
                    })
                    await conn.execute(
                        f"INSERT INTO {table_name} (geojson, properties) VALUES ($1, $2)",
                        geojson, properties
                    )

            elif formid == 'temples_001':
                # Sample temples
                temples = [
                    {"name": "วัดช้างเผือก", "lat": 18.7870, "lng": 98.9840, "monks": 12, "year": 1850},
                    {"name": "วัดพระธาตุ", "lat": 18.7910, "lng": 99.0020, "monks": 25, "year": 1720},
                    {"name": "วัดประตูเชียง", "lat": 18.7840, "lng": 98.9920, "monks": 8, "year": 1900},
                    {"name": "วัดเจดีย์หลวง", "lat": 18.7920, "lng": 98.9860, "monks": 30, "year": 1650},
                ]

                for temple in temples:
                    geojson = json.dumps({
                        "type": "Point",
                        "coordinates": [temple["lng"], temple["lat"]]
                    })
                    properties = json.dumps({
                        "name": temple["name"],
                        "monks": temple["monks"],
                        "established": temple["year"]
                    })
                    await conn.execute(
                        f"INSERT INTO {table_name} (geojson, properties) VALUES ($1, $2)",
                        geojson, properties
                    )

            # Count inserted records
            final_count = await conn.fetchval(f"SELECT COUNT(*) FROM {table_name}")
            print(f"  ✅ {layername}: {final_count} records")

        print("\n�� Summary:")
        for layer in layers:
            formid = layer['formid']
            layername = layer['layername']
            table_name = f"data_{formid}"
            count = await conn.fetchval(f"SELECT COUNT(*) FROM {table_name}")
            print(f"   - {layername}: {count} feature(s)")

        return True

    except Exception as e:
        print(f"❌ Error creating geometry data: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(create_geometry_data())
