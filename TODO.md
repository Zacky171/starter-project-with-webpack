# Deployment TODO Progress Tracker

## Original Plan Steps (from existing TODO.md):
1. [x] Initialize git repo and add remote origin
2. [ ] Update .gitignore to include dist/
3. [ ] Update package.json: add homepage, gh-pages devDep, deploy scripts
4. [x] Update webpack.common.js: add publicPath '/starter-project-with-webpack/' to HtmlWebpackPlugin
5. [ ] Install gh-pages dependency
6. [ ] Commit initial code and push to main
7. [ ] Run npm run build && npm run deploy
8. [ ] Update STUDENT.txt with deployment URL
9. [ ] Final commit/push of STUDENT.txt
10. [ ] Verify deployment at https://zacky171.github.io/starter-project-with-webpack/

## Detailed Breakdown Steps:
- Step 1: git init && git add . && git commit -m "Initial commit" && git branch -M main && git remote add origin https://github.com/Zacky171/starter-project-with-webpack.git && git push -u origin main
- Step 2: Edit .gitignore to add dist/
- Step 3: Edit package.json (homepage, scripts, devDeps)
- Step 4: npm install --save-dev gh-pages
- Step 5: git add . && git commit -m "Add gh-pages and configs" && git push
- Step 6: npm run build && npm run deploy
- Step 7: Edit STUDENT.txt with URL
- Step 8: git add . && git commit -m "Add deployment URL" && git push
- Step 9: Verify site

**Current Progress: Plan approved. Starting edits.**
