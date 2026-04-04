# 🚀 Deployment Guide — AWS Cloud Club MNNIT Website

> **Stack:** Next.js 16 · pnpm · Docker · Nginx · Ubuntu Server  
> **Strategy:** Docker container (recommended) + Nginx reverse proxy  
> Your project already has `output: "standalone"` and a production-ready `Dockerfile` — use them!

---

## ⚡ Minimum Recommended Instance

| Spec | Minimum (Prod) | Free Tier (Testing only) |
|---|---|---|
| **Instance Type** | `t3.small` | `t2.micro` + swap |
| **RAM** | 2 GB | 1 GB + 2 GB swap |
| **vCPU** | 2 | 1 |
| **Storage** | 20 GB gp3 | 20 GB gp2 |
| **Est. Cost** | ~$15–17/month | Free (12 months) |

> ⚠️ `t2.micro` will OOM during Docker builds. Use a swap file (see Step 2) if you must use it.

---

## Table of Contents

1. [Launch AWS EC2 Instance](#1-launch-aws-ec2-instance)
2. [Connect to Your Server](#2-connect-to-your-server)
3. [Install Docker](#3-install-docker)
4. [Upload / Clone the Project](#4-upload--clone-the-project)
5. [Configure Environment Variables](#5-configure-environment-variables)
6. [Build & Run with Docker](#6-build--run-with-docker)
7. [Port & Firewall](#7-port--firewall)
8. [Nginx Reverse Proxy](#8-nginx-reverse-proxy)
9. [HTTPS with Certbot (Optional but Recommended)](#9-https-with-certbot-optional-but-recommended)
10. [Auto-start on Reboot](#10-auto-start-on-reboot)
11. [Useful Docker Commands](#11-useful-docker-commands)
12. [Debugging Common Errors](#12-debugging-common-errors)

---

## 1. Launch AWS EC2 Instance

### Step 1 — Sign in to AWS Console

Go to [https://console.aws.amazon.com](https://console.aws.amazon.com) and sign in.

Select your preferred **region** (top-right corner) — choose one close to your users, e.g.:
- `ap-south-1` — **Mumbai** (best for Indian users ✅)
- `us-east-1` — Virginia (global default)

---

### Step 2 — Open EC2 Dashboard

1. In the search bar, type **EC2** and click it
2. Click **"Launch instance"** (orange button)

---

### Step 3 — Configure the Instance

Fill in the following settings:

#### Name
```
aws-mnnit-web
```

#### Application and OS Image (AMI)
- Select **Ubuntu**
- Choose: **Ubuntu Server 22.04 LTS (HVM), SSD Volume Type**
- Architecture: **64-bit (x86)**

#### Instance Type
| Recommendation | Type | RAM | vCPU |
|---|---|---|---|
| ✅ Prod (recommended) | `t3.small` | 2 GB | 2 |
| 🆓 Free tier (testing) | `t2.micro` | 1 GB | 1 |

#### Key Pair (for SSH access)
1. Click **"Create new key pair"**
2. Name it: `aws-mnnit-key`
3. Key pair type: **RSA**
4. Private key file format: **`.pem`** (for Linux/Mac/WSL) or **`.ppk`** (for PuTTY on Windows)
5. Click **"Create key pair"** — it auto-downloads to your machine
6. **Move it to a safe location** and set permissions:
   ```bash
   # On Windows WSL / Linux / Mac
   mv ~/Downloads/aws-mnnit-key.pem ~/.ssh/
   chmod 400 ~/.ssh/aws-mnnit-key.pem
   ```

#### Network Settings — Security Group

Click **"Edit"** next to Network settings. Create a new security group with these **inbound rules**:

| Type | Protocol | Port | Source | Purpose |
|---|---|---|---|---|
| SSH | TCP | **22** | My IP (or 0.0.0.0/0) | Remote access |
| HTTP | TCP | **80** | 0.0.0.0/0 | Web traffic |
| HTTPS | TCP | **443** | 0.0.0.0/0 | Secure web traffic |
| Custom TCP | TCP | **3000** | My IP only | Direct app testing |

> ⚠️ **Never** open port 22 to `0.0.0.0/0` in production — restrict SSH to your IP.

#### Configure Storage
- Size: **20 GiB** (minimum)
- Volume type: **gp3** (faster and cheaper than gp2)

---

### Step 4 — Launch

Click **"Launch instance"**. Wait ~1 minute for the state to show **✅ Running**.

---

### Step 5 — Assign an Elastic IP (Recommended)

A regular EC2 instance gets a new public IP every reboot. An **Elastic IP** is a fixed static IP.

1. In EC2 sidebar → **Elastic IPs** → **Allocate Elastic IP address** → **Allocate**
2. Select the new IP → **Actions** → **Associate Elastic IP address**
3. Select your instance (`aws-mnnit-web`) → **Associate**

> 💡 Elastic IPs are **free** while associated with a running instance. You're billed only if the instance is stopped.

---

## 2. Connect to Your Server

Update system packages first (always do this on a fresh server):

### Option A — AWS Console (easiest, no key needed)

1. Select your instance in EC2 dashboard
2. Click **"Connect"** → **"EC2 Instance Connect"** tab → **"Connect"**
3. A browser-based terminal opens — no SSH key required!

### Option B — SSH from Terminal (recommended for regular use)

```bash
ssh -i ~/.ssh/aws-mnnit-key.pem ubuntu@your-elastic-ip
```

> The default username for Ubuntu AMIs is always `ubuntu` (not `root` or `ec2-user`).

### Option C — SSH from Windows (PowerShell)

```powershell
ssh -i C:\Users\Lenovo\.ssh\aws-mnnit-key.pem ubuntu@your-elastic-ip
```

Once connected, run the initial setup:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git wget unzip ufw
```

#### (Free tier only) Add a 2 GB swap file to prevent OOM crashes

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Verify swap:
```bash
free -h
```

---

## 3. Install Docker

Your project uses Docker, so you **do not need Node.js or pnpm on the server** — Docker handles everything inside a container.

### Install Docker Engine

```bash
# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up the stable repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
```

### Allow running Docker without sudo (optional but convenient)

```bash
sudo usermod -aG docker $USER
newgrp docker   # apply group change in current session
```

### Verify Docker is running

```bash
docker --version
sudo systemctl status docker
```

---

## 4. Upload / Clone the Project

### Option A — Clone from GitHub (Recommended)

```bash
cd ~
git clone https://github.com/AWS-Cloud-Club-MNNIT/aws-mnnit-web.git
cd aws-mnnit-web
```

If your repo is **private**, generate a GitHub Personal Access Token and clone like this:

```bash
git clone https://<YOUR_USERNAME>:<YOUR_TOKEN>@github.com/AWS-Cloud-Club-MNNIT/aws-mnnit-web.git
```

### Option B — Upload files manually via SCP (from your local machine)

Run this **on your local Windows machine** (PowerShell):

```powershell
scp -r C:\Users\Lenovo\Downloads\aws-mnnit-web your-username@your-server-ip:~/aws-mnnit-web
```

Then SSH back in and navigate to the folder:

```bash
cd ~/aws-mnnit-web
```

---

## 5. Configure Environment Variables

Your `.env` file is **excluded from Docker builds and Git** (see `.dockerignore`). You must create it manually on the server.

```bash
cd ~/aws-mnnit-web
cp .env.example .env
nano .env
```

Fill in your real values. At minimum, the following are **required**:

```env
# MongoDB connection string (use MongoDB Atlas for production)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/aws-cloud-club

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Auth & security
ADMIN_EMAIL=awscloudclubmnnit@gmail.com
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=a_very_long_random_string_here

# Your public domain or IP
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

Save with `Ctrl+O`, exit with `Ctrl+X`.

> ⚠️ **Important:** Do NOT commit `.env` to Git. It contains secrets.

---

## 6. Build & Run with Docker

### Build the Docker image

This will take a few minutes on first run (it installs deps and builds the Next.js app inside the container):

```bash
cd ~/aws-mnnit-web
docker build -t aws-mnnit-web .
```

You should see output ending with something like:
```
Successfully built abc123def456
Successfully tagged aws-mnnit-web:latest
```

### Run the container

```bash
docker run -d \
  --name aws-mnnit-web \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  aws-mnnit-web
```

**What these flags mean:**
- `-d` — run in background (detached)
- `--name aws-mnnit-web` — give the container a name
- `--restart unless-stopped` — auto-restart on crash or reboot
- `-p 3000:3000` — map server port 3000 → container port 3000
- `--env-file .env` — inject your environment variables

### Verify it's running

```bash
docker ps
```

You should see your container listed. Test it:

```bash
curl http://localhost:3000
```

If you see HTML, your app is running. 🎉

---

## 7. Port & Firewall

### Allow traffic on port 3000 (temporary, before Nginx)

```bash
sudo ufw allow 3000/tcp
sudo ufw allow ssh      # CRITICAL: don't lock yourself out
sudo ufw enable
sudo ufw status
```

### Test from your browser

Open: `http://your-server-ip:3000`

> Once Nginx is configured, you can close port 3000 to the public:
> ```bash
> sudo ufw delete allow 3000/tcp
> ```

---

## 8. Nginx Reverse Proxy

Nginx sits in front of your app and forwards requests from port 80/443 to Docker on port 3000. This is the standard production setup.

### Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Create a site configuration

```bash
sudo nano /etc/nginx/sites-available/aws-mnnit-web
```

#### Option A — IP-based (no domain)

```nginx
server {
    listen 80;
    server_name your-server-ip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Option B — Domain-based (recommended)

Replace `your-domain.com` with your actual domain:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    # Increase upload limit (for image uploads)
    client_max_body_size 20M;

    # Performance: Serve static assets directly from Nginx
    location /_next/static {
        alias /home/ubuntu/aws-mnnit-web/.next/static;
        expires 365d;
        access_log off;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable the site

```bash
# Create symlink to enable the site
sudo ln -s /etc/nginx/sites-available/aws-mnnit-web /etc/nginx/sites-enabled/

# Remove the default site (optional but clean)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx config for syntax errors
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Allow HTTP/HTTPS through firewall

```bash
sudo ufw allow 'Nginx Full'   # allows port 80 and 443
```

Now visit `http://your-domain.com` or `http://your-server-ip` — it should show your app!

---

## 9. HTTPS with Certbot (Optional but Recommended)

HTTPS is **strongly recommended** — browsers show warnings on HTTP sites.

> ⚠️ You need a **real domain name** pointing to your server's IP for this to work. Won't work with bare IP addresses.

### Install Certbot via Snap (Official Method)

```bash
sudo apt update
sudo apt install -y snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### Obtain and install a free SSL certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts:
- Enter your email
- Agree to terms of service
- Choose to redirect HTTP → HTTPS (option 2, recommended)

Certbot will automatically modify your Nginx config to add HTTPS.

### Test auto-renewal

Certificates expire every 90 days — Certbot renews automatically. Test it:

```bash
sudo certbot renew --dry-run
```

---

## 10. Auto-start on Reboot

You already passed `--restart unless-stopped` to `docker run`, so your container **automatically restarts** after:
- A crash
- A server reboot
- Docker daemon restart

Verify this setting:
```bash
docker inspect aws-mnnit-web | grep RestartPolicy -A 3
```

Make Docker itself start on boot:
```bash
sudo systemctl enable docker
```

---

## 11. Useful Docker Commands

### View real-time logs

```bash
docker logs -f aws-mnnit-web
```

### View last 100 lines of logs

```bash
docker logs --tail 100 aws-mnnit-web
```

### Stop the container

```bash
docker stop aws-mnnit-web
```

### Start a stopped container

```bash
docker start aws-mnnit-web
```

### Restart the container

```bash
docker restart aws-mnnit-web
```

### Get a shell inside the container (for debugging)

```bash
docker exec -it aws-mnnit-web sh
```

### Remove old container (before re-deploying a new build)

```bash
docker stop aws-mnnit-web
docker rm aws-mnnit-web
```

### Check container resource usage (CPU/RAM)

```bash
docker stats aws-mnnit-web
```

---

### 🔄 Redeployment Workflow

When you push updates to GitHub and want to redeploy:

```bash
cd ~/aws-mnnit-web

# 1. Pull latest code
git pull origin main

# 2. Stop and remove old container
docker stop aws-mnnit-web
docker rm aws-mnnit-web

# 3. Rebuild image (only changed layers re-build — fast)
docker build -t aws-mnnit-web .

# 4. Run new container
docker run -d \
  --name aws-mnnit-web \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  aws-mnnit-web
```

> 💡 You can save this as a shell script `deploy.sh` to run with a single command.

---

## 12. Debugging Common Errors

### ❌ Container exits immediately after starting

```bash
docker logs aws-mnnit-web
```

Look for error lines at the bottom. Most common causes:
- Missing environment variables (e.g., `MONGODB_URI` not set or wrong)
- Typo in `.env` file
- MongoDB Atlas IP whitelist — add your server's IP in Atlas → Network Access

---

### ❌ `docker: command not found`

Docker is not installed. Go back to [Step 3](#3-install-docker).

---

### ❌ Port 3000 already in use

```bash
sudo lsof -i :3000
```

Kill whatever is using it:
```bash
sudo kill -9 <PID>
```

Or use a different port (`-p 3001:3000`) and update Nginx accordingly.

---

### ❌ Nginx `502 Bad Gateway`

Your app isn't running on port 3000. Check:

```bash
docker ps                        # is container running?
docker logs aws-mnnit-web        # any errors?
curl http://localhost:3000       # does it respond locally?
```

---

### ❌ Images not loading (Cloudinary / Unsplash)

In `next.config.ts`, ensure the hostname is in `remotePatterns`. Your config already has:
- `images.unsplash.com` ✅
- `res.cloudinary.com` ✅

If you add any new image sources, rebuild the image.

---

### ❌ `NEXT_PUBLIC_APP_URL` still shows `localhost`

Update the value in your `.env` on the server and **rebuild the Docker image** — `NEXT_PUBLIC_*` variables are baked in at build time.

```bash
nano .env
# Update NEXT_PUBLIC_APP_URL=https://your-domain.com

docker stop aws-mnnit-web && docker rm aws-mnnit-web
docker build -t aws-mnnit-web .
docker run -d --name aws-mnnit-web --restart unless-stopped -p 3000:3000 --env-file .env aws-mnnit-web
```

---

### ❌ `Permission denied` on `.next` folder

The Dockerfile creates a `nextjs` system user for security. If you see permission errors:

```bash
docker exec -it aws-mnnit-web sh
ls -la .next/
```

If ownership is wrong, you likely modified the Dockerfile. Keep these lines as-is:
```dockerfile
RUN chown nextjs:nodejs .next
USER nextjs
```

---

### ❌ `git pull` rejected / merge conflict

```bash
git fetch origin
git reset --hard origin/main    # discard local changes, match remote exactly
```

> ⚠️ This will delete any local-only changes on the server. Always keep secrets in `.env`, not in tracked files.

---

## Quick Reference

| Task | Command |
|---|---|
| Build image | `docker build -t aws-mnnit-web .` |
| Run container | `docker run -d --name aws-mnnit-web --restart unless-stopped -p 3000:3000 --env-file .env aws-mnnit-web` |
| View logs | `docker logs -f aws-mnnit-web` |
| Restart app | `docker restart aws-mnnit-web` |
| Shell access | `docker exec -it aws-mnnit-web sh` |
| Check Nginx | `sudo nginx -t && sudo systemctl reload nginx` |
| Check firewall | `sudo ufw status` |
| Renew SSL | `sudo certbot renew` |

---

*Generated for: AWS Cloud Club MNNIT Website · Next.js 16 · pnpm · Docker · Ubuntu*
