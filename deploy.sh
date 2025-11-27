#!/bin/bash

# 🚀 MindMetric Deployment Helper Script
# This script helps you deploy MindMetric to production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🧠 MindMetric Deployment Helper 🚀      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

print_success "Git is installed"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not a git repository. Run 'git init' first."
    exit 1
fi

print_success "Git repository initialized"

# Menu
echo ""
echo "What would you like to do?"
echo ""
echo "1) Push to GitHub (first time)"
echo "2) Push updates to GitHub"
echo "3) Check deployment status"
echo "4) View deployment guide"
echo "5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        print_info "Setting up GitHub repository..."
        echo ""
        read -p "Enter your GitHub username: " github_username
        read -p "Enter your repository name [mindmetric]: " repo_name
        repo_name=${repo_name:-mindmetric}
        
        # Check if remote already exists
        if git remote | grep -q "^origin$"; then
            print_warning "Remote 'origin' already exists. Removing..."
            git remote remove origin
        fi
        
        # Add remote
        git remote add origin "https://github.com/${github_username}/${repo_name}.git"
        print_success "Remote added: https://github.com/${github_username}/${repo_name}.git"
        
        # Check current branch
        current_branch=$(git branch --show-current)
        print_info "Current branch: $current_branch"
        
        # Push to GitHub
        echo ""
        print_info "Pushing to GitHub..."
        git push -u origin $current_branch
        
        if [ $? -eq 0 ]; then
            print_success "Code pushed to GitHub successfully!"
            echo ""
            print_info "Next steps:"
            echo "1. Go to https://github.com/${github_username}/${repo_name}"
            echo "2. Verify all files are uploaded"
            echo "3. Follow the deployment guide in DEPLOYMENT.md"
        else
            print_error "Failed to push to GitHub"
            exit 1
        fi
        ;;
        
    2)
        print_info "Pushing updates to GitHub..."
        
        # Check for changes
        if [ -z "$(git status --porcelain)" ]; then
            print_warning "No changes to commit"
            exit 0
        fi
        
        # Show status
        git status
        
        echo ""
        read -p "Do you want to commit these changes? (y/n): " commit_choice
        
        if [ "$commit_choice" = "y" ]; then
            read -p "Enter commit message: " commit_message
            
            git add .
            git commit -m "$commit_message"
            
            print_success "Changes committed"
            
            echo ""
            read -p "Push to GitHub? (y/n): " push_choice
            
            if [ "$push_choice" = "y" ]; then
                git push
                print_success "Updates pushed to GitHub!"
            fi
        fi
        ;;
        
    3)
        print_info "Checking deployment status..."
        echo ""
        
        # Check git status
        echo "📊 Git Status:"
        git status -s
        echo ""
        
        # Check remotes
        echo "🔗 Git Remotes:"
        git remote -v
        echo ""
        
        # Check last commit
        echo "📝 Last Commit:"
        git log -1 --oneline
        echo ""
        
        print_info "To view full deployment guide, run: cat DEPLOYMENT.md"
        ;;
        
    4)
        print_info "Opening deployment guide..."
        if command -v cat &> /dev/null; then
            cat DEPLOYMENT.md
        else
            print_error "Cannot display guide. Please open DEPLOYMENT.md manually"
        fi
        ;;
        
    5)
        print_info "Exiting..."
        exit 0
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_success "Done! 🎉"

