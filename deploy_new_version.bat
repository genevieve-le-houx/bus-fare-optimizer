pnpm build
git add -f dist && git commit -m "new dist"
git subtree push --prefix dist origin gh-pages