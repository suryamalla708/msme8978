import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from api.models import User
if not User.objects.filter(username="admin").exists():
    User.objects.create_superuser("admin", "admin@example.com", "Kishore", role="ADMIN", phone_number="8143272410")
    print("Admin user created: admin / Kishore (Phone: 8143272410)")
else:
    print("Admin user already exists")
