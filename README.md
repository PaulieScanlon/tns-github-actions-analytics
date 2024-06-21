<p align="center">
  <a href="https://thenewstack.io/how-to-use-github-actions-and-apis-to-surface-important-data/">
    <img alt="paulie.dev" src="https://cdn.thenewstack.io/media/2024/06/70c2a9c7-tns-google-analytics-report-featured-image-1024x538.jpg" />
  </a>
</p>

<br />

# Google Analytics to Slack Notification using GitHub Actions

The steps to create the required Google Project, Slack Webhook and GitHub Action are detailed in the following article on The New Stack: [How To Use GitHub Actions and APIs to Surface Important Data](https://thenewstack.io/how-to-use-github-actions-and-apis-to-surface-important-data/)

## Getting started

1. Clone the repository
2. Rename `.env.example` to `.env`
3. Update the following variables
   - `SLACK_WEBHOOK_URL`
   - `GA4_PROPERTY_ID`
   - `GOOGLE_APPLICATION_CREDENTIALS_BASE64`
4. Install dependencies (uses npm)
   - `npm install`

## Development

To invoke the function manually from your local development environment you can run the following in your terminal.

```shell
node src/index.js
```

### Creating a base64 URL

The Google Application credentials are in `.json` format. To use them in a `.env` you can convert them to a base64 string by running the following in your terminal.

```shell
cat name-of-creds-file.json | base64

```

When saving the resulting string in your `.env` file be sure you wrap it with quotations, e.g. `GOOGLE_APPLICATION_CREDENTIALS_BASE64="abc123..."`

### Cron syntax

The GitHub Action in this repo is scheduled to run each Friday at 10am UTC. A [schedule](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule) uses [POSIX cron syntax](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html#tag_20_25_07), e.g.

```yml
on:
  schedule:
    - cron: '0 10 * * 5' # Runs every Friday at 10 AM UTC
```

### Manual trigger

The GitHub Action in this repo contains the following which allows you trigger the workflow manually from the GitHub UI.

```yml
on:
  ...
    - ...
  workflow_dispatch: # Allows manual triggering
```
