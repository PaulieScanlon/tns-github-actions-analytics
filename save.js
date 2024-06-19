import dotenv from 'dotenv';
dotenv.config();
import { BetaAnalyticsDataClient } from '@google-analytics/data';
// https://github.com/googleapis/google-cloud-node/tree/main/packages/google-analytics-data

// console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);

const main = async () => {
  const analyticsDataClient = new BetaAnalyticsDataClient({
    keyFilename: 'tns-analytics-v2-1718794554679-16935f4da01c.json',
  });

  // const analyticsDataClient = new BetaAnalyticsDataClient();

  // console.log(analyticsDataClient);

  // https://developers.google.com/analytics/devguides/reporting/data/v1/property-id
  // copy the service account email address and add it to property access managment

  const [response] = await analyticsDataClient.runReport({
    property: `properties/${process.env.GA4_PROPERTY_ID}`,
    // docs: https://developers.google.com/analytics/devguides/reporting/data/v1
    // docs: https://developers.google.com/analytics/devguides/reporting/data/v1/rest
    // docs: https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema
    dateRanges: [
      {
        startDate: '7daysAgo',
        endDate: 'today',
      },
    ],
    dimensions: [
      {
        name: 'fullPageUrl',
      },
    ],
    metrics: [
      {
        name: 'activeUsers',
      },
    ],
    limit: 10,
    metricAggregations: ['MAXIMUM'],
  });

  const results = response.rows.map((row, index) => {
    const { dimensionValues, metricValues } = row;

    return `${index + 1}. ${dimensionValues[0].value} | x${metricValues[0].value}`;
  });

  console.log(results.join('\\n'));
};
main();

const init = async () => {
  try {
    // --- get data from Google Analytics

    //  --- post message to Slack
    fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '📊 7 Days Google Analytics Report',
              emoji: true,
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'Top ten page views.',
              emoji: true,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: '1. Item 1\n2. Item 2\n3. Item 3',
              },
            ],
          },
        ],
      }),
    });
  } catch (error) {
    console.error('///// error');
  }
};

// init();
