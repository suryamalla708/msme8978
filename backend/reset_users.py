import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.models import User

# Delete all existing users (Workers, Enterprises, and old Admins)
# This will cascade and delete their profiles, jobs, applications, tests, etc.
deleted_count, _ = User.objects.all().delete()
print(f"Deleted {deleted_count} users and associated data.")

# Create the new Admin user
admin_phone = "8143272410"
admin_pass = "Kishore"

User.objects.create_superuser("admin", "admin@example.com", admin_pass, role="ADMIN", phone_number=admin_phone)
print(f"Successfully created new Admin user => Phone: {admin_phone}, Password: {admin_pass}")
