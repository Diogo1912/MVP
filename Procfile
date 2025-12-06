web: . /opt/venv/bin/activate && cd backend && python manage.py migrate && python manage.py collectstatic --noinput && gunicorn golexai.wsgi:application --bind 0.0.0.0:$PORT
