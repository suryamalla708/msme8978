import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.models import User

# ⚠️ OPTIONAL: delete all users (remove if not needed)
User.objects.all().delete()

# ========================
# ADMIN 1 (your first number)
# ========================
admin1_phone = "8143272410"
admin1_pass = "Kishore"

User.objects.create_superuser(
    username=admin1_phone,
    email="admin1@example.com",
    password=admin1_pass,
    role="ADMIN",
    phone_number=admin1_phone
)

# ========================
# ADMIN 2 (your second number)
# ========================
admin2_phone = "8142027323"
admin2_pass = "189489"

User.objects.create_superuser(
    username=admin2_phone,
    email="admin2@example.com",
    password=admin2_pass,
    role="ADMIN",
    phone_number=admin2_phone
)

print("✅ Two admin users created successfully!")
print(f"Admin1 → Phone: {admin1_phone}, Password: {admin1_pass}")
print(f"Admin2 → Phone: {admin2_phone}, Password: {admin2_pass}")