# Docker Deployment Guide

This guide explains how to deploy the ecommerce application using Docker.

## Prerequisites

- Docker and Docker Compose installed on your server
- Git access to the repository

## Deployment Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ecom
```

### 2. Environment Setup

Create an `.env` file based on the example:

```bash
cp .env.example .env
```

Modify the `.env` file with your actual configuration. Make sure to change:

- Database credentials (`DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DATABASE_URL`)
- Set secure JWT secret keys (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`)
- Configure email settings (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, etc.)

Example:

```
# Generate strong random secrets for JWT
JWT_ACCESS_SECRET=generated_secure_secret_key_1
JWT_REFRESH_SECRET=generated_secure_secret_key_2
```

### 3. Build and Start the Containers

```bash
docker-compose up -d
```

This command builds the application image and starts both the application and PostgreSQL database in detached mode.

### 4. Run Database Migrations

After the containers are running:

```bash
docker-compose exec app npx prisma migrate deploy
```

### 5. Initialize Seed Data (Optional)

If you need to seed your database with initial data:

```bash
docker-compose exec app npm run init-seed-data
```

### 6. Create Permissions (Optional)

If you need to initialize permissions:

```bash
docker-compose exec app npm run create-permissions
```

## Securing Sensitive Information

1. **Never commit your `.env` file to version control**

   - Make sure `.env` is included in your `.gitignore` file

2. **Use environment-specific variables**

   - Create different `.env.production`, `.env.development` files as needed
   - Only copy the appropriate file to `.env` for your environment

3. **For production deployment**
   - Consider using Docker secrets for highly sensitive values
   - Use a vault service for API keys and credentials in large-scale deployments

## Maintenance

### Viewing Logs

```bash
# View logs for all services
docker-compose logs

# View logs for a specific service
docker-compose logs app
docker-compose logs postgres
```

### Updating the Application

To update the application:

```bash
git pull origin main
docker-compose build app
docker-compose up -d app
```

### Backing Up the Database

```bash
docker-compose exec postgres pg_dump -U $DB_USER $DB_NAME > backup.sql
```

### Scaling (Basic)

For a simple scaling solution, update the `docker-compose.yml` file:

```yaml
app:
  deploy:
    replicas: 3
```

For more advanced scaling, consider using Docker Swarm or Kubernetes.

## Troubleshooting

1. If the app can't connect to the database, check:

   - Ensure the PostgreSQL container is running: `docker-compose ps`
   - Verify the database URL in your `.env` file
   - Make sure the credentials match between DATABASE*URL and the DB*\* variables

2. For permission issues with volumes:

   - Check the ownership of mounted volumes
   - You might need to run `chown -R` commands on the host

3. For migration failures:
   - Check the database connection
   - Ensure the schema is compatible with the migrations
