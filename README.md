# [CUI - a terminal styled website](https://cyouryuu.github.io/CUI)

Highly customizable, easy-to-use, and terminal styled website template, powered by [Vite](https://vitejs.dev).

After you cloned this repository, simply run `npm install` > `npm run build` > `npm run preview` and start editing `config.json` to build your website!

## Deploy on Github

You can simply deploy this Vite app by creating a github repository in minutes.

1. Replace `repository_name` in `vite.config.ts` with your repository name.
```typescript
export default defineConfig({
  base: process.env.GITHUB_PAGES ? "/repository_name" : "./"
})
```
2. To get permission to auto deploy this app when `git push`, you need provide a created *fine-grained personal access token*. For details, see ["About personal access tokens"](https://docs.github.com/ja/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens). 
If you already have one, named `token_name`, change `${{ secrets.GITHUB_TOKEN }}` to `${{ secrets.token_name }}` in `.github/workflows/deploy.yml`.
3. In `.gitignore`, make sure `/node_modules` and `/dist` have been included.
```bash
node_modules
dist
```
4. Create your repository in GitHub, and `url` of your site should be like `https://username.github.io/repository_name/`. Then push local repository to GitHub as follows.
```bash
cd /path/to/repository
git init
git add .
git status
git commit
git remote add origin git@github.com:username/repository_name.git
git branch -M main
git push -u origin main
```
5. Make sure `Workflow permissions` have been approved (under repository's `Settings` > `Actions` > `General`).
6. Check the `gh-pages` branch has been created and set to its `/(root)` on `GitHub Pages`.
7. Confirm `Actions` workflow have been completed.
8. Go repository's `Settings`, then `Pages` in sidebar, and click on `Visit site`.

## Credit

Based on nasan016's [webshell](https://github.com/nasan016/webshell)
