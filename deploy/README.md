# Deployment Guide - EC2 Single Instance

This guide describes how to deploy the Resume Builder Pro to a single EC2 instance using Docker Compose.

## Prerequisites

- EC2 instance (Ubuntu 22.04 LTS recommended)
- SSH access to the instance
- Docker and Docker Compose installed
- Domain name (optional, for production)

## EC2 Instance Setup

### 1. Launch EC2 Instance

- **Instance Type**: t3.medium or larger (minimum 2GB RAM, 2 vCPU)
- **OS**: Ubuntu 22.04 LTS
- **Storage**: 20GB minimum
- **Security Group**: Open ports:
  - 22 (SSH)
  - 3000 (Frontend)
  - 3001 (Backend API)
  - 8000 (Parser Service)
  - 4000 (Renderer Service)

### 2. Install Docker and Docker Compose

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in for group changes
exit
```

### 3. Clone Repository

```bash
# Install Git if not present
sudo apt-get install git -y

# Clone repository
git clone <your-repo-url> resume-builder
cd resume-builder
```

## Deployment Steps

### Option 1: Build Images Locally on EC2

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Option 2: Build Images and Push to Registry (Recommended)

#### Build and Push Images

```bash
# Tag images for your registry (replace with your registry)
docker build -f Dockerfile.frontend -t your-registry/resume-frontend:latest .
docker build -f backend/Dockerfile -t your-registry/resume-api:latest ./backend
docker build -f parse-service/Dockerfile -t your-registry/resume-parser:latest ./parse-service
docker build -f renderer/Dockerfile -t your-registry/resume-renderer:latest ./renderer

# Push to registry
docker push your-registry/resume-frontend:latest
docker push your-registry/resume-api:latest
docker push your-registry/resume-parser:latest
docker push your-registry/resume-renderer:latest
```

#### Update docker-compose.yml for Registry

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  frontend:
    image: your-registry/resume-frontend:latest
    # ... rest of config

  api:
    image: your-registry/resume-api:latest
    # ... rest of config

  parser:
    image: your-registry/resume-parser:latest
    # ... rest of config

  renderer:
    image: your-registry/resume-renderer:latest
    # ... rest of config
```

Then deploy:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Environment Configuration

### Create Environment File (Optional)

Create `.env` file:

```bash
# Frontend
VITE_API_URL=http://your-domain.com:3001

# Backend API
NODE_ENV=production
PARSER_SERVICE_URL=http://parser:8000

# Parser
OPENAI_API_KEY=your-openai-key-if-needed

# Renderer
NODE_ENV=production
```

Update `docker-compose.yml` to use env file:

```yaml
services:
  frontend:
    env_file: .env
    # ...
```

## Nginx Reverse Proxy (Optional but Recommended)

For production, use Nginx as a reverse proxy:

### Install Nginx

```bash
sudo apt-get install nginx -y
```

### Configure Nginx

Create `/etc/nginx/sites-available/resume-builder`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Parser Service (if exposed)
    location /parse {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Renderer Service (if exposed)
    location /render {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/resume-builder /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## Monitoring and Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f parser
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart api
```

### Update Deployment

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose build
docker-compose up -d

# Or if using registry
docker-compose pull
docker-compose up -d
```

### Backup Uploads Volume

```bash
# Create backup
docker run --rm -v resume-builder_uploads:/data -v $(pwd):/backup ubuntu tar czf /backup/uploads-backup-$(date +%Y%m%d).tar.gz /data

# Restore backup
docker run --rm -v resume-builder_uploads:/data -v $(pwd):/backup ubuntu tar xzf /backup/uploads-backup-YYYYMMDD.tar.gz -C /
```

## Health Checks

### Check Service Health

```bash
# Frontend
curl http://localhost:3000

# Backend API
curl http://localhost:3001/health

# Parser
curl http://localhost:8000/health

# Renderer
curl http://localhost:4000/health
```

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs

# Check container status
docker-compose ps

# Check resource usage
docker stats
```

### Port Conflicts

If ports are already in use:

```bash
# Find process using port
sudo lsof -i :3000

# Kill process or change port in docker-compose.yml
```

### Out of Memory

If Puppeteer (renderer) fails:

```bash
# Increase shared memory in docker-compose.yml
services:
  renderer:
    shm_size: '4gb'  # Increase from 2gb
```

### Disk Space

```bash
# Clean up unused Docker resources
docker system prune -a

# Check disk usage
df -h
```

## Production Checklist

- [ ] EC2 instance with sufficient resources (2GB+ RAM, 2+ vCPU)
- [ ] Security groups configured
- [ ] Docker and Docker Compose installed
- [ ] All services building successfully
- [ ] Environment variables configured
- [ ] Nginx reverse proxy configured (optional)
- [ ] SSL certificate installed (optional)
- [ ] Domain name configured (optional)
- [ ] Monitoring/logging setup
- [ ] Backup strategy for uploads volume
- [ ] Health checks passing

## Scaling Considerations

For higher traffic, consider:

1. **Load Balancer**: Use AWS ALB in front of multiple EC2 instances
2. **RDS**: Move to managed database if storing resume data
3. **S3**: Store uploaded files in S3 instead of local volume
4. **ECS/EKS**: Migrate to container orchestration for better scaling
5. **CDN**: Use CloudFront for frontend static assets

## Support

For issues, check:
- Docker Compose logs: `docker-compose logs`
- Service health endpoints
- EC2 instance system logs: `sudo journalctl -u docker`

