"""
Script para verificar la conexión a MySQL
"""
import asyncio
import aiomysql
from app.config import settings

async def test_connection():
    print("=" * 60)
    print("VERIFICACIÓN DE CONEXIÓN A MYSQL")
    print("=" * 60)
    print(f"\nHost: {settings.db_host}")
    print(f"Port: {settings.db_port}")
    print(f"User: {settings.db_user}")
    print(f"Database: {settings.db_name}")
    print(f"Password: {'*' * len(settings.db_password)}")
    print("\n" + "-" * 60)
    
    try:
        print("\n[1/3] Intentando conectar sin especificar base de datos...")
        pool = await aiomysql.create_pool(
            host=settings.db_host,
            port=settings.db_port,
            user=settings.db_user,
            password=settings.db_password,
            autocommit=True
        )
        
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT VERSION()")
                version = await cursor.fetchone()
                print(f"✓ Conexión exitosa!")
                print(f"  MySQL Version: {version[0]}")
                
                # Listar bases de datos
                print("\n[2/3] Bases de datos disponibles:")
                await cursor.execute("SHOW DATABASES")
                databases = await cursor.fetchall()
                for db in databases:
                    marker = "  ← TARGET" if db[0] == settings.db_name else ""
                    print(f"  - {db[0]}{marker}")
                
                # Verificar permisos
                print(f"\n[3/3] Verificando permisos del usuario '{settings.db_user}'...")
                await cursor.execute(
                    "SHOW GRANTS FOR %s@%s",
                    (settings.db_user, settings.db_host)
                )
                grants = await cursor.fetchall()
                print("  Permisos:")
                for grant in grants:
                    print(f"  - {grant[0]}")
        
        pool.close()
        await pool.wait_closed()
        
        print("\n" + "-" * 60)
        print("\n[TEST] Intentando conectar a la base de datos específica...")
        pool2 = await aiomysql.create_pool(
            host=settings.db_host,
            port=settings.db_port,
            user=settings.db_user,
            password=settings.db_password,
            db=settings.db_name,
            autocommit=True
        )
        
        async with pool2.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT DATABASE()")
                db = await cursor.fetchone()
                print(f"✓ Conectado a la base de datos: {db[0]}")
                
                # Listar tablas
                await cursor.execute("SHOW TABLES")
                tables = await cursor.fetchall()
                print(f"\nTablas en '{settings.db_name}':")
                if tables:
                    for table in tables:
                        print(f"  - {table[0]}")
                else:
                    print("  (Sin tablas)")
        
        pool2.close()
        await pool2.wait_closed()
        
        print("\n" + "=" * 60)
        print("✓ TODAS LAS PRUEBAS PASARON EXITOSAMENTE")
        print("=" * 60)
        
    except aiomysql.Error as e:
        print(f"\n✗ ERROR DE CONEXIÓN:")
        print(f"  Código: {e.args[0]}")
        print(f"  Mensaje: {e.args[1]}")
        print("\n" + "=" * 60)
        print("SOLUCIONES POSIBLES:")
        print("=" * 60)
        print("\n1. Verifica que MySQL/MariaDB esté corriendo:")
        print("   - Windows: net start MySQL")
        print("   - Linux: sudo systemctl start mysql")
        print("\n2. Verifica las credenciales en .env.development")
        print("\n3. Crea el usuario y la base de datos:")
        print(f"   CREATE DATABASE `{settings.db_name}`;")
        print(f"   CREATE USER '{settings.db_user}'@'localhost' IDENTIFIED BY 'tu_password';")
        print(f"   GRANT ALL PRIVILEGES ON `{settings.db_name}`.* TO '{settings.db_user}'@'localhost';")
        print("   FLUSH PRIVILEGES;")
        print("\n" + "=" * 60)
        
    except Exception as e:
        print(f"\n✗ ERROR INESPERADO: {type(e).__name__}")
        print(f"  {str(e)}")
        print("\n" + "=" * 60)

if __name__ == "__main__":
    asyncio.run(test_connection())
