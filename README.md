# tns-github-actions-analytics

- [slack-github-action](https://github.com/slackapi/slack-github-action)
- [Creating a JavaScript action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)
- [GitHub Actions Toolkit](https://github.com/actions/toolkit)

## Uses vercel/ncc

Install vercel/ncc globally so you can run the compile script.

```shell
npm i -g @vercel/ncc
```

## Compile

This step compiles index.js and outputs it to `dist/index.js` along with `licenses.txt`

```shell
npm run compile
```
