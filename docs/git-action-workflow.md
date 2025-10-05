# GitHub Actions Workflow Documentation

## Overview

This document explains the CI/CD pipeline for the Ecommerce NestJS application using GitHub Actions. The workflow automates the build, test, and deployment process for both pull requests and main branch pushes.

## Workflow File Location

```
.github/workflows/deploy.yml
```

## Workflow Name

```yaml
name: ecommerce-nestjs-deployment
```

## Triggers

The workflow is triggered by:

### Pull Request Events
- **Target Branch**: `main`
- **Actions**: Opening, synchronizing, or reopening pull requests

### Push Events
- **Target Branch**: `main`
- **Actions**: Direct pushes to the main branch

```yaml
on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]
```

## Concurrency Control

The workflow uses concurrency control to prevent multiple deployments from running simultaneously:

```yaml
concurrency:
  group: deploy-main
  cancel-in-progress: true
```

- **Group**: `deploy-main` - Groups all workflow runs together
- **Cancel in Progress**: `true` - Cancels previous runs when a new one starts

## Environment Variables

### Global Environment Variables

```yaml
env:
  IMAGE_REF: ${{ secrets.DOCKER_REGISTRY }}/${{ secrets.DOCKER_IMAGE }}
```

- **IMAGE_REF**: Complete Docker image reference combining registry and image name

## Required Secrets

The workflow requires the following secrets to be configured in the GitHub repository:

| Secret Name | Description | Usage |
|-------------|-------------|--------|
| `DOCKER_REGISTRY` | Docker registry URL | Container registry hostname |
| `DOCKER_IMAGE` | Docker image name | Image repository name |
| `DOCKER_TOKEN` | Docker registry access token | Authentication for pushing/pulling images |
| `DOCKER_USERNAME` | Docker registry username | Authentication for registry login |
| `ENV_PRODUCTION` | Production environment variables | Application configuration |
| `EC2_PUBLIC_DNS` | EC2 instance public DNS/IP | Deployment target server |
| `EC2_USER` | EC2 instance username | SSH connection user |
| `EC2_SSH_KEY` | EC2 SSH private key | Server authentication |

## Jobs Overview

The workflow consists of three main jobs:

1. **`ci_pr`** - Continuous Integration for Pull Requests
2. **`cd_main`** - Continuous Deployment for Main Branch
3. **`deploy_ec2`** - Deploy to EC2 Server

## Job 1: CI for Pull Requests (`ci_pr`)

### Purpose
Validates pull requests by building Docker images without pushing them to the registry.

### Conditions
- Only runs when `github.event_name == 'pull_request'`
- Runs on `ubuntu-latest`

### Steps

#### 1. Checkout Code
```yaml
- uses: actions/checkout@v4
```

#### 2. Setup Docker Buildx
```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
```

#### 3. Compute PR Tag
```yaml
- name: Compute PR tag
  id: prmeta
  run: echo "tag=pr-${{ github.event.pull_request.number }}" >> "$GITHUB_OUTPUT"
```
- Creates a unique tag for the PR: `pr-{PR_NUMBER}`

#### 4. Create Environment File
```yaml
- name: Create .env (not used at runtime, but kept for your build if needed)
  run: |
    printf '%s\n' "${{ secrets.ENV_PRODUCTION }}" > .env
```

#### 5. Build Docker Image
```yaml
- name: Build image (no push, load to daemon)
  uses: docker/build-push-action@v6
  with:
    context: .
    file: ./Dockerfile
    push: false
    load: true
    tags: prtest:${{ steps.prmeta.outputs.tag }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**Key Features:**
- `push: false` - Image is not pushed to registry
- `load: true` - Image is loaded into Docker daemon for testing
- Uses GitHub Actions cache for faster builds

## Job 2: CD for Main Branch (`cd_main`)

### Purpose
Builds and pushes Docker images to the registry when changes are merged to main.

### Conditions
- Only runs when `github.event_name == 'push'`
- Runs on `ubuntu-latest`
- Requires `contents: read` and `packages: write` permissions

### Outputs
- `tag`: Generated image tag
- `image_ref`: Complete image reference

### Steps

#### 1. Checkout Code
```yaml
- uses: actions/checkout@v4
```

#### 2. Compute Tags and Image Reference
```yaml
- name: Compute tags
  id: meta
  run: |
    SHORT_SHA="${GITHUB_SHA::7}"
    echo "tag=sha-${SHORT_SHA}" >> "$GITHUB_OUTPUT"
    REG_LOWER="$(echo "${{ secrets.DOCKER_REGISTRY }}" | tr '[:upper:]' '[:lower:]')"
    IMG_LOWER="$(echo "${{ secrets.DOCKER_IMAGE }}"   | tr '[:upper:]' '[:lower:]')"
    echo "image_ref=${REG_LOWER}/${IMG_LOWER}" >> "$GITHUB_OUTPUT"
```

**Tag Strategy:**
- Format: `sha-{7-character-commit-hash}`
- Converts registry and image names to lowercase for Docker compatibility

#### 3. Setup Docker Buildx
```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
```

#### 4. Login to Container Registry
```yaml
- name: Login to container registry with PAT
  run: |
    REG_LOWER="$(echo "${{ secrets.DOCKER_REGISTRY }}" | tr '[:upper:]' '[:lower:]')"
    echo "${{ secrets.DOCKER_TOKEN }}" | docker login "$REG_LOWER" \
      -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
```

#### 5. Create Environment File
```yaml
- name: Create .env (not used at runtime, but kept for your build if needed)
  run: |
    printf '%s\n' "${{ secrets.ENV_PRODUCTION }}" > .env
```

#### 6. Build and Push Image
```yaml
- name: Build & Push image
  uses: docker/build-push-action@v6
  with:
    context: .
    file: ./Dockerfile
    push: true
    tags: |
      ${{ steps.meta.outputs.image_ref }}:${{ steps.meta.outputs.tag }}
      ${{ steps.meta.outputs.image_ref }}:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**Key Features:**
- Creates two tags: specific SHA tag and `latest`
- Uses GitHub Actions cache for optimization
- Pushes to configured registry

## Job 3: Deploy to EC2 (`deploy_ec2`)

### Purpose
Deploys the built Docker image to an EC2 server.

### Dependencies
- Requires `cd_main` job to complete successfully
- Only runs after successful image build and push

### Environment Variables
```yaml
env:
  REMOTE_HOST: ${{ secrets.EC2_PUBLIC_DNS }}
  REMOTE_USER: ${{ secrets.EC2_USER }}
  TAG: ${{ needs.cd_main.outputs.tag }}
```

### Steps

#### 1. Compute Registry/Image (Lowercase)
```yaml
- name: Compute registry/image (lowercase)
  id: reg
  run: |
    echo "reg=$(echo "${{ secrets.DOCKER_REGISTRY }}" | tr '[:upper:]' '[:lower:]')" >> "$GITHUB_OUTPUT"
    echo "img=$(echo "${{ secrets.DOCKER_IMAGE }}"   | tr '[:upper:]' '[:lower:]')" >> "$GITHUB_OUTPUT"
```

#### 2. Setup SSH Private Key
```yaml
- name: Write SSH private key to ~/.ssh and lock perms
  run: |
    umask 077
    mkdir -p ~/.ssh
    printf '%s' "${{ secrets.EC2_SSH_KEY }}" > ~/.ssh/ci_key
    tr -d '\r' < ~/.ssh/ci_key > ~/.ssh/ci_key.tmp && mv ~/.ssh/ci_key.tmp ~/.ssh/ci_key
    chmod 600 ~/.ssh/ci_key
    ssh-keygen -y -f ~/.ssh/ci_key >/dev/null 2>&1 || { echo "Invalid SSH key"; exit 1; }
```

**Security Features:**
- Sets restrictive umask (077)
- Removes carriage returns for cross-platform compatibility
- Sets proper file permissions (600)
- Validates SSH key format

#### 3. Setup SSH Known Hosts
```yaml
- name: Add host to known_hosts (pin DNS host key)
  run: |
    mkdir -p ~/.ssh && chmod 700 ~/.ssh
    ssh-keygen -R "$REMOTE_HOST" 2>/dev/null || true
    ssh-keyscan -T 10 -p 22 -H "$REMOTE_HOST" >> ~/.ssh/known_hosts
    test -s ~/.ssh/known_hosts || { echo "Could not fetch SSH host key"; exit 1; }
```

**Security Features:**
- Removes any existing host key entries
- Scans and adds current host key
- Validates host key retrieval

#### 4. Create Deployment Script
Creates a comprehensive deployment script that:

- **Docker Installation**: Automatically installs Docker if not present
- **Docker Service Management**: Ensures Docker service is running with retry logic
- **Container Management**: Stops and removes existing containers
- **Image Deployment**: Pulls and runs the new image
- **Cleanup**: Removes unused Docker images

**Key Script Features:**

```bash
# Application naming
APP_NAME='ecom-app'

# Sudo detection
if [ "$(id -u)" -eq 0 ]; then SUDO=""; else SUDO="sudo"; fi

# Docker installation function
ensure_docker() {
  # Installs Docker using official Ubuntu repository
}

# Docker service management with retries
start_docker_with_retries() {
  # Ensures Docker service is active with multiple retry attempts
}

# Container deployment
- Logs into Docker registry
- Pulls the specified image tag
- Removes existing container if present
- Runs new container with restart policy
- Cleans up old images
```

#### 5. Execute Deployment
```yaml
- name: Copy & run deploy script on server
  run: |
    scp -i ~/.ssh/ci_key ./deploy.sh "$REMOTE_USER@$REMOTE_HOST:/tmp/deploy.sh"
    ssh -i ~/.ssh/ci_key "$REMOTE_USER@$REMOTE_HOST" "bash /tmp/deploy.sh && rm -f /tmp/deploy.sh"
```

**Process:**
1. Copies deployment script to EC2 server
2. Executes script remotely via SSH
3. Cleans up script file after execution

## Container Configuration

### Runtime Configuration
- **Container Name**: `ecom-app`
- **Restart Policy**: `unless-stopped`
- **Network**: Default Docker network
- **Ports**: As defined in Dockerfile

### Image Tagging Strategy
- **Development**: `pr-{PR_NUMBER}` for pull request builds
- **Production**: `sha-{7-char-commit-hash}` and `latest` for main branch

## Security Considerations

### Secrets Management
- All sensitive data stored as GitHub Secrets
- SSH private keys handled with proper permissions
- Docker registry credentials protected

### SSH Security
- Host key verification enabled
- Private key permissions restricted (600)
- Temporary script cleanup after execution

### Container Security
- Uses official base images
- Registry authentication required
- Container restart policies configured

## Monitoring and Troubleshooting

### Workflow Monitoring
- Check GitHub Actions tab for workflow status
- Review job logs for detailed execution information
- Monitor resource usage during builds

### Common Issues and Solutions

#### Build Failures
- Check Dockerfile syntax
- Verify environment variables
- Review dependency conflicts

#### Deployment Failures
- Verify EC2 server accessibility
- Check SSH key configuration
- Ensure Docker service is running

#### Registry Issues
- Verify registry credentials
- Check network connectivity
- Confirm registry permissions

## Optimization Features

### Caching
- GitHub Actions cache for Docker layers
- Speeds up subsequent builds
- Reduces build time and bandwidth usage

### Concurrency Control
- Prevents resource conflicts
- Ensures clean deployments
- Reduces server load

## Maintenance

### Regular Tasks
- Update action versions periodically
- Monitor secret expiration dates
- Review and update security configurations
- Clean up old Docker images on server

### Security Updates
- Rotate SSH keys regularly
- Update Docker registry credentials
- Review access permissions
- Monitor for security vulnerabilities

## Best Practices

### Environment Management
- Keep production secrets secure
- Use different configurations for different environments
- Document all required environment variables

### Version Control
- Tag releases appropriately
- Maintain clear commit messages
- Use pull requests for code review

### Deployment Strategy
- Test deployments in staging first
- Implement rollback procedures
- Monitor application health post-deployment
