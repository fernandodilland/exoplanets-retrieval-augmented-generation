"""
Script de prueba para verificar Argon2id hash
"""
from app.utils.security import verify_password, hash_password

# Hash de ejemplo de la base de datos
stored_hash = "$argon2id$v=19$m=16,t=2,p=1$VEdrTXhaYzQyZ2oySmhJaQ$wmi+s1r7RpjJPt8Iy6I8+g"

# Contraseña de prueba - necesitas saber cuál es la contraseña original
# Por ahora probamos con algunas comunes
test_passwords = [
    "admin",
    "password",
    "123456",
    "admin123",
    "test",
]

print("=" * 60)
print("PRUEBA DE VERIFICACIÓN ARGON2ID")
print("=" * 60)
print(f"\nHash almacenado: {stored_hash}")
print("\nProbando contraseñas comunes...")

for password in test_passwords:
    result = verify_password(password, stored_hash)
    status = "✓ CORRECTA" if result else "✗ Incorrecta"
    print(f"  {status}: '{password}'")

print("\n" + "=" * 60)
print("GENERACIÓN DE NUEVO HASH")
print("=" * 60)

# Generar un nuevo hash para referencia
new_password = "admin"
new_hash = hash_password(new_password)
print(f"\nNuevo hash para '{new_password}':")
print(f"  {new_hash}")
print(f"\nVerificación del nuevo hash: {verify_password(new_password, new_hash)}")
print("\n" + "=" * 60)
