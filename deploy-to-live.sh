#!/bin/bash
# SeaTrace - Deploy to Live Script
# This script helps you push to Git and deploy to Render + Vercel

echo "=========================================="
echo "SeaTrace - Live Deployment Helper"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Git repository not initialized${NC}"
    echo "Initializing Git repository..."
    git init
    echo ""
fi

# Check if remote exists
if ! git remote | grep -q "origin"; then
    echo -e "${YELLOW}⚠️  No Git remote configured${NC}"
    echo ""
    echo "Please add your GitHub repository:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo ""
    read -p "Have you added the remote? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Please add remote and run this script again${NC}"
        exit 1
    fi
fi

# Generate secret key if needed
if [ ! -f ".secret_key_generated" ]; then
    echo -e "${GREEN}🔑 Generating secret key...${NC}"
    python generate-secret-key.py > .secret_key.txt
    touch .secret_key_generated
    echo -e "${GREEN}✅ Secret key saved to .secret_key.txt${NC}"
    echo ""
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}📝 Found uncommitted changes${NC}"
    echo ""
    git status --short
    echo ""
    read -p "Do you want to commit and push? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${GREEN}📦 Staging changes...${NC}"
        git add .
        
        echo ""
        read -p "Enter commit message (or press Enter for default): " commit_msg
        if [ -z "$commit_msg" ]; then
            commit_msg="Deploy SeaTrace to production - $(date +%Y-%m-%d)"
        fi
        
        echo ""
        echo -e "${GREEN}💾 Committing changes...${NC}"
        git commit -m "$commit_msg"
        
        echo ""
        echo -e "${GREEN}🚀 Pushing to GitHub...${NC}"
        CURRENT_BRANCH=$(git branch --show-current)
        if [ -z "$CURRENT_BRANCH" ]; then
            git branch -M main
            CURRENT_BRANCH="main"
        fi
        
        git push -u origin $CURRENT_BRANCH
        
        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
            echo ""
            echo "=========================================="
            echo "Next Steps:"
            echo "=========================================="
            echo ""
            echo "1. Deploy Backend to Render:"
            echo "   → Go to: https://dashboard.render.com"
            echo "   → Follow: RENDER_DEPLOYMENT.md"
            echo ""
            echo "2. Deploy Frontend to Vercel:"
            echo "   → Go to: https://vercel.com/dashboard"
            echo "   → Follow: VERCEL_DEPLOYMENT.md"
            echo ""
            echo "3. Your secret key is in: .secret_key.txt"
            echo "   Use it in Render environment variables"
            echo ""
        else
            echo -e "${RED}❌ Failed to push to GitHub${NC}"
            echo "Please check your Git credentials and try again"
            exit 1
        fi
    else
        echo -e "${YELLOW}⏭️  Skipping commit${NC}"
    fi
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
    echo ""
    read -p "Do you want to push anyway? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        CURRENT_BRANCH=$(git branch --show-current)
        if [ -z "$CURRENT_BRANCH" ]; then
            git branch -M main
            CURRENT_BRANCH="main"
        fi
        git push -u origin $CURRENT_BRANCH
    fi
fi

echo ""
echo "=========================================="
echo "Deployment Checklist:"
echo "=========================================="
echo ""
echo "✅ Code pushed to GitHub"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. BACKEND (Render):"
echo "   - Go to: https://dashboard.render.com"
echo "   - New → Web Service"
echo "   - Connect GitHub repo"
echo "   - Root Directory: backend"
echo "   - Build: pip install -r requirements.txt"
echo "   - Start: python start.py"
echo "   - Add SECRET_KEY from .secret_key.txt"
echo ""
echo "2. FRONTEND (Vercel):"
echo "   - Go to: https://vercel.com/dashboard"
echo "   - Add New → Project"
echo "   - Connect GitHub repo"
echo "   - Root Directory: seatrace-frontend"
echo "   - Add environment variables with Render URL"
echo ""
echo "3. CONNECT:"
echo "   - Update CORS_ORIGINS in Render with Vercel URL"
echo ""
echo "📚 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""

