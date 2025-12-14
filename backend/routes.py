from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel
from typing import Optional, List, Any
import time
import csv
import io

from database import get_pool
from auth import verify_password, get_password_hash, create_access_token, verify_token

router = APIRouter(prefix="/api")


# ============ Pydantic Models ============

class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    email: str
    division: str
    password: str


class FormIdRequest(BaseModel):
    formid: str


class LayerByIdRequest(BaseModel):
    formid: str
    id: int


class ColumnRequest(BaseModel):
    formid: str
    columnid: str


class CreateTableRequest(BaseModel):
    division: str
    layername: str
    layertype: str
    columes: List[dict]


class SaveLayerRequest(BaseModel):
    formid: str
    geojson: str
    dataarr: str


class UpdateLayerRequest(BaseModel):
    formid: str
    id: int
    geojson: Optional[str] = None
    dataarr: str


class DeleteRowRequest(BaseModel):
    formid: str
    id: int


class UpdateStyleRequest(BaseModel):
    formid: str
    layerid: int
    layerstyle: str


class AddColumnRequest(BaseModel):
    formid: str
    col_name: str
    col_type: str
    col_desc: str


class DeleteColumnRequest(BaseModel):
    formid: str
    col_id: str


class UpdateColumnRequest(BaseModel):
    col_id: str
    col_name: str


class SearchRequest(BaseModel):
    formid: str
    columnid: str
    keyword: str


class CountLayerRequest(BaseModel):
    formid: str
    groupby: str
    type: str
    col_id: Optional[str] = None


class ListLayerByDivRequest(BaseModel):
    auth: str
    division: str


class EditUserRequest(BaseModel):
    id: int
    username: str
    email: str
    division: str
    auth: str


class DeleteUserRequest(BaseModel):
    id: int


# ============ Auth Endpoints ============

@router.post("/register")
async def register(req: RegisterRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        existing = await conn.fetchrow(
            "SELECT username FROM tb_user WHERE username = $1", req.username
        )
        if existing:
            return {"status": "error", "message": "existing user"}

        hashed = get_password_hash(req.password)
        await conn.execute(
            """INSERT INTO tb_user (username, email, division, pass, auth, ts) 
               VALUES ($1, $2, $3, $4, 'user', now())""",
            req.username, req.email, req.division, hashed
        )
        return {"status": "success", "message": "User registered"}


@router.post("/login")
async def login(req: LoginRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        user = await conn.fetchrow(
            "SELECT auth, pass, division FROM tb_user WHERE username = $1", req.username
        )
        if not user:
            raise HTTPException(status_code=400, detail="Cannot find user")

        if not verify_password(req.password, user["pass"]):
            raise HTTPException(status_code=405, detail="ชื่อหรือรหัสผ่านไม่ถูกต้อง")

        access_token = create_access_token(data={"username": req.username})
        return {
            "status": "success",
            "username": req.username,
            "role": user["auth"],
            "division": user["division"],
            "token": access_token
        }


@router.post("/verify_token")
async def verify_token_endpoint(user: dict = Depends(verify_token)):
    return {"status": "success", "message": "Token is valid"}


# ============ Layer Endpoints ============

@router.post("/list_layer")
async def list_layer():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM layer_name")
        return [dict(row) for row in rows]


@router.post("/list_layer_by_division")
async def list_layer_by_division(req: ListLayerByDivRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        if req.auth == "admin":
            rows = await conn.fetch("SELECT * FROM layer_name")
        elif req.auth == "user":
            return []
        else:
            rows = await conn.fetch(
                "SELECT * FROM layer_name WHERE division = $1", req.division
            )
        return [dict(row) for row in rows]


@router.post("/get_layer_description")
async def get_layer_description(req: FormIdRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM layer_name WHERE formid = $1", req.formid
        )
        return [dict(row) for row in rows]


@router.post("/load_column_description")
async def load_column_description(req: FormIdRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM layer_column WHERE formid = $1", req.formid
        )
        return [dict(row) for row in rows]


@router.post("/load_layer")
async def load_layer(req: FormIdRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            f"SELECT *, ST_AsGeoJSON(geom) as geojson FROM {req.formid} ORDER BY ts DESC"
        )
        return [dict(row) for row in rows]


@router.post("/load_layer_by_id")
async def load_layer_by_id(req: LayerByIdRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            f"SELECT *, ST_AsGeoJSON(geom) as geojson FROM {req.formid} WHERE id = $1",
            req.id
        )
        return [dict(row) for row in rows]


@router.post("/load_by_column_id")
async def load_by_column_id(req: ColumnRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            f"SELECT DISTINCT {req.columnid} FROM {req.formid}"
        )
        return [dict(row) for row in rows]


@router.post("/search")
async def search(req: SearchRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            f"SELECT *, ST_AsGeoJSON(geom) as geojson FROM {req.formid} WHERE {req.columnid} = $1",
            req.keyword
        )
        return [dict(row) for row in rows]


@router.post("/create_table")
async def create_table(req: CreateTableRequest):
    formid = f"fid_{int(time.time() * 1000)}"
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """INSERT INTO layer_name (formid, division, layername, layertype, ts) 
               VALUES ($1, $2, $3, $4, now())""",
            formid, req.division, req.layername, req.layertype
        )
        await conn.execute(
            f"""CREATE TABLE {formid} (
                id SERIAL NOT NULL PRIMARY KEY, 
                refid text, 
                geom GEOMETRY({req.layertype}, 4326), 
                ts timestamp, 
                style text
            )"""
        )
        for idx, col in enumerate(req.columes):
            col_id = f"{formid}_{idx}"
            col_type = col.get("column_type", "text")
            if col_type == "file":
                col_type = "text"
            await conn.execute(
                """INSERT INTO layer_column (formid, col_id, col_name, col_type, col_desc) 
                   VALUES ($1, $2, $3, $4, $5)""",
                formid, col_id, col["column_name"], col_type, col.get("column_desc", "")
            )
            await conn.execute(f"ALTER TABLE {formid} ADD COLUMN {col_id} {col_type}")

    return {"formid": formid}


@router.post("/save_layer")
async def save_layer(req: SaveLayerRequest):
    import json
    data_arr = json.loads(req.dataarr)
    refid = f"ref{int(time.time() * 1000)}"
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            f"INSERT INTO {req.formid} (refid, geom, ts) VALUES ($1, ST_GeomFromGeoJSON($2), now())",
            refid, req.geojson
        )
        for e in data_arr:
            if e.get("value"):
                val = e["value"] if e["value"] else "0"
                await conn.execute(
                    f"UPDATE {req.formid} SET {e['name']} = $1 WHERE refid = $2",
                    val, refid
                )
    return {"status": "saved"}


@router.post("/update_layer")
async def update_layer(req: UpdateLayerRequest):
    import json
    data_arr = json.loads(req.dataarr)
    pool = await get_pool()
    async with pool.acquire() as conn:
        for e in data_arr:
            if e.get("value"):
                val = e["value"] if e["value"] else "0"
                await conn.execute(
                    f"UPDATE {req.formid} SET {e['name']} = $1 WHERE id = $2",
                    val, req.id
                )
    return {"status": "updated"}


@router.post("/delete_row")
async def delete_row(req: DeleteRowRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(f"DELETE FROM {req.formid} WHERE id = $1", req.id)
    return {"status": "deleted"}


@router.post("/delete_layer")
async def delete_layer(req: FormIdRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM layer_name WHERE formid = $1", req.formid)
        await conn.execute("DELETE FROM layer_column WHERE formid = $1", req.formid)
        await conn.execute(f"DROP TABLE IF EXISTS {req.formid}")
    return {"status": "deleted"}


@router.post("/update_style")
async def update_style(req: UpdateStyleRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            f"UPDATE {req.formid} SET style = $1 WHERE id = $2",
            req.layerstyle, req.layerid
        )
    return {"status": "updated"}


@router.post("/add_column")
async def add_column(req: AddColumnRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT col_id FROM layer_column WHERE formid = $1 ORDER BY col_id",
            req.formid
        )
        max_idx = 0
        for row in rows:
            parts = row["col_id"].split("_")
            if len(parts) >= 3:
                try:
                    max_idx = max(max_idx, int(parts[2]))
                except ValueError:
                    pass
        col_id = f"{req.formid}_{max_idx + 1}"
        col_type = req.col_type if req.col_type != "file" else "text"

        await conn.execute(
            """INSERT INTO layer_column (formid, col_id, col_name, col_type, col_desc) 
               VALUES ($1, $2, $3, $4, $5)""",
            req.formid, col_id, req.col_name, col_type, req.col_desc
        )
        await conn.execute(f"ALTER TABLE {req.formid} ADD COLUMN {col_id} {col_type}")
    return {"status": "added"}


@router.post("/load_column")
async def load_column(req: FormIdRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM layer_column WHERE formid = $1", req.formid
        )
        return [dict(row) for row in rows]


@router.post("/delete_column")
async def delete_column(req: DeleteColumnRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "DELETE FROM layer_column WHERE formid = $1 AND col_id = $2",
            req.formid, req.col_id
        )
        await conn.execute(f"ALTER TABLE {req.formid} DROP COLUMN {req.col_id}")
    return {"status": "deleted"}


@router.post("/update_column")
async def update_column(req: UpdateColumnRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE layer_column SET col_name = $1 WHERE col_id = $2",
            req.col_name, req.col_id
        )
    return {"status": "updated"}


@router.post("/summarize_layer")
async def summarize_layer(req: FormIdRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        columns = await conn.fetch(
            "SELECT * FROM layer_column WHERE formid = $1", req.formid
        )
        col_exprs = []
        for col in columns:
            if col["col_type"] == "numeric":
                col_exprs.append(f"SUM({col['col_id']}) as {col['col_id']}")
            else:
                col_exprs.append(f"COUNT({col['col_id']}) as {col['col_id']}")

        if col_exprs:
            cols_str = ", ".join(col_exprs)
            sql = f"""
                WITH tb AS (SELECT *, DATE_TRUNC('month', ts) AS d FROM {req.formid})
                SELECT to_char(d, 'YYYY-MM') AS dt, {cols_str}
                FROM tb GROUP BY d
            """
            rows = await conn.fetch(sql)
            return [dict(row) for row in rows]
    return []


@router.post("/count_layer_by_formid")
async def count_layer_by_formid(req: CountLayerRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        if req.type == "count":
            if req.groupby == "day":
                sql = f"""
                    WITH tb(d) AS (SELECT date(ts) as d FROM {req.formid})
                    SELECT count(d) AS val, d AS dt FROM tb GROUP BY d
                """
            elif req.groupby == "month":
                sql = f"""
                    WITH tb(d) AS (SELECT DATE_TRUNC('month', ts) as d FROM {req.formid})
                    SELECT COUNT(d) AS val, to_char(d, 'YYYY-MM') AS dt FROM tb GROUP BY d ORDER BY d ASC
                """
            elif req.groupby == "year":
                sql = f"""
                    WITH tb(d) AS (SELECT DATE_TRUNC('year', ts) as d FROM {req.formid})
                    SELECT COUNT(d) AS val, d AS dt FROM tb GROUP BY d ORDER BY d ASC
                """
        elif req.type == "sum" and req.col_id:
            if req.groupby == "day":
                sql = f"""
                    WITH tb(d, dat) AS (SELECT date(ts) as d, {req.col_id} as dat FROM {req.formid})
                    SELECT sum(dat) AS val, d AS dt FROM tb GROUP BY d
                """
            elif req.groupby == "month":
                sql = f"""
                    WITH tb(d, dat) AS (SELECT DATE_TRUNC('month', ts) as d, {req.col_id} as dat FROM {req.formid})
                    SELECT SUM(dat) AS val, to_char(d, 'YYYY-MM') AS dt FROM tb GROUP BY d ORDER BY d ASC
                """
            elif req.groupby == "year":
                sql = f"""
                    WITH tb(d, dat) AS (SELECT DATE_TRUNC('year', ts) as d, {req.col_id} as dat FROM {req.formid})
                    SELECT SUM(dat) AS val, d AS dt FROM tb GROUP BY d ORDER BY d ASC
                """

        rows = await conn.fetch(sql)
        return [dict(row) for row in rows]


@router.get("/utm2latlng/{x}/{y}")
async def utm2latlng(x: float, y: float):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            f"""SELECT ST_X(ST_Transform(ST_GeomFromText('POINT({x} {y})', 32647), 4326)) as lng,
                       ST_Y(ST_Transform(ST_GeomFromText('POINT({x} {y})', 32647), 4326)) as lat"""
        )
        return dict(row)


# ============ User Management ============

@router.post("/listuser")
async def list_users():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT id, username, email, division, auth, TO_CHAR(ts, 'DD-MM-YYYY') as ts FROM tb_user"
        )
        return [dict(row) for row in rows]


@router.post("/edituser")
async def edit_user(req: EditUserRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """UPDATE tb_user SET username = $1, email = $2, division = $3, auth = $4 
               WHERE id = $5""",
            req.username, req.email, req.division, req.auth, req.id
        )
    return {"status": "updated"}


@router.post("/deleteuser")
async def delete_user(req: DeleteUserRequest):
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM tb_user WHERE id = $1", req.id)
    return {"status": "deleted"}


# ============ File Upload ============

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    division: str = Form(...),
    layername: str = Form(...),
    layertype: str = Form(...)
):
    formid = f"fid_{int(time.time() * 1000)}"
    content = await file.read()
    text = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))
    data = list(reader)

    if not data:
        raise HTTPException(status_code=400, detail="Empty CSV file")

    pool = await get_pool()
    async with pool.acquire() as conn:
        # Determine columns
        keys = list(data[0].keys())
        columns = []
        for idx, col_name in enumerate(keys):
            is_lat = col_name.lower() in ["ละติจูด", "latitude", "lat"]
            is_lng = col_name.lower() in ["ลองจิจูด", "longitude", "long", "lng"]
            col_type = "numeric" if is_lat or is_lng else "text"
            col_id = "lat" if is_lat else ("lng" if is_lng else f"{formid}_{idx}")
            columns.append({"col_id": col_id, "col_name": col_name, "col_type": col_type})

        # Create layer
        await conn.execute(
            """INSERT INTO layer_name (formid, division, layername, layertype, ts) 
               VALUES ($1, $2, $3, $4, now())""",
            formid, division, layername, layertype
        )
        await conn.execute(
            f"""CREATE TABLE {formid} (
                id SERIAL PRIMARY KEY, 
                refid text, 
                geom GEOMETRY({layertype}, 4326), 
                ts timestamp default now(), 
                style text
            )"""
        )

        for col in columns:
            await conn.execute(
                """INSERT INTO layer_column (formid, col_id, col_name, col_type, col_desc) 
                   VALUES ($1, $2, $3, $4, $5)""",
                formid, col["col_id"], col["col_name"], col["col_type"], col["col_name"]
            )
            await conn.execute(f"ALTER TABLE {formid} ADD COLUMN {col['col_id']} {col['col_type']}")

        # Insert data
        col_ids = [c["col_id"] for c in columns]
        for row in data:
            refid = f"ref{int(time.time() * 1000000)}"
            values = []
            for key, col in zip(keys, columns):
                val = row.get(key, "")
                if col["col_type"] == "numeric":
                    try:
                        values.append(float(val) if val else 0)
                    except ValueError:
                        values.append(0)
                else:
                    values.append(val)

            placeholders = ", ".join([f"${i+2}" for i in range(len(values))])
            await conn.execute(
                f"INSERT INTO {formid} (refid, {', '.join(col_ids)}) VALUES ($1, {placeholders})",
                refid, *values
            )

        # Update geometry if lat/lng exist
        has_lat = any(c["col_id"] == "lat" for c in columns)
        has_lng = any(c["col_id"] == "lng" for c in columns)
        if has_lat and has_lng:
            await conn.execute(
                f"UPDATE {formid} SET geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326) WHERE lat > 0 AND lng > 0"
            )

    return {"status": "success", "formid": formid}
