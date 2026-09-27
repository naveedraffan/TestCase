const axios = require('axios');

const {
  JIRA_BASE_URL,
  JIRA_EMAIL,
  JIRA_API_TOKEN,
  JIRA_PROJECT_KEY,
  JIRA_ISSUE_TYPE,
} = process.env;

function isConfigured() {
  return Boolean(JIRA_BASE_URL && JIRA_EMAIL && JIRA_API_TOKEN && JIRA_PROJECT_KEY);
}

function client() {
  return axios.create({
    baseURL: JIRA_BASE_URL.replace(/\/+$/, ''),
    auth: { username: JIRA_EMAIL, password: JIRA_API_TOKEN },
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Create a Jira issue for a failed test result.
 * @param {{ caseTitle: string, runName: string, projectName: string, comment: string, tester: string }} data
 * @returns {Promise<{ key: string, url: string }>}
 */
async function createIssueForFailure(data) {
  if (!isConfigured()) {
    throw new Error('Jira is not configured. Set JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY in .env');
  }

  const summary = `Test failure: ${data.caseTitle}`;
  const descriptionLines = [
    `Test case *${data.caseTitle}* failed during run *${data.runName}* (project: ${data.projectName}).`,
    data.tester ? `Reported by: ${data.tester}` : null,
    data.comment ? `\nDetails:\n${data.comment}` : null,
  ].filter(Boolean);

  const payload = {
    fields: {
      project: { key: JIRA_PROJECT_KEY },
      summary,
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: descriptionLines.join('\n') }],
          },
        ],
      },
      issuetype: { name: JIRA_ISSUE_TYPE || 'Bug' },
    },
  };

  const res = await client().post('/rest/api/3/issue', payload);
  const key = res.data.key;
  const url = `${JIRA_BASE_URL.replace(/\/+$/, '')}/browse/${key}`;
  return { key, url };
}

module.exports = { isConfigured, createIssueForFailure };
