# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the backend directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
# We assume requirements.txt is inside the backend folder based on previous steps
RUN pip install --no-cache-dir -r requirements.txt

# Make port 5000 available to the world outside this container
# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define environment variable
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PORT=5000

# Run app.py when the container launches
# Use shell form to allow variable expansion for $PORT
CMD gunicorn -k eventlet -w 1 -b 0.0.0.0:$PORT app:app
