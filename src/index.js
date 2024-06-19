import dotenv from 'dotenv';
dotenv.config();
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const init = async () => {
  try {
    // --- get data from Google Analytics
    // const analyticsDataClient = new BetaAnalyticsDataClient({
    //   keyFilename: 'tns-analytics-v2-1718794554679-16935f4da01c.json',
    // });
    const analyticsDataClient = new BetaAnalyticsDataClient();

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
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
        {
          name: 'pageTitle',
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

    const reportList = response.rows
      .map((row, index) => {
        const { dimensionValues, metricValues } = row;

        return `${index + 1}. <https://${dimensionValues[0].value}|${dimensionValues[1].value}> | *x${
          metricValues[0].value
        }*`;
      })
      .join('\\n')
      .replace(/\\n/g, '\n');

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
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: reportList,
              },
            ],
          },
        ],
      }),
    });
  } catch (error) {
    console.error('///// error');
    console.log(error);
  }
};

init();
