# ENV METASTORE_PATH /app/metastore, mount volume to /app/

FROM python:3.11-alpine

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

# Define environment variable
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

# Run app.py when the container launches
#CMD ["python", "app.py"]
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]