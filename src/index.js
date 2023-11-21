import Resolver from '@forge/resolver';
import api, { route, storage } from '@forge/api';

const resolver = new Resolver();

const fetchFilters = async () => {
  let startAt = 0;
  const allFilters = [];

  while (true) {
    const response = await api.asUser().requestJira(route`/rest/api/3/filter/search?expand=jql&startAt=${startAt}`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    allFilters.push(...data.values);

    if (data.isLast) {
      break;
    }

    startAt += 50;
  }

  return allFilters;
}


async function getIssuesByJQL(jqlExpression) {
  let startAt = 0;
  const allIssues = [];
  while (true) {
  try {
    const requestBody = {
      context: {
        issues: {
          jql: {
            query: jqlExpression,
            startAt: startAt, // Start at the first issue
            maxResults: 1000, // Maximum number of issues to retrieve
            validation: 'strict'
          }
        }
      },
      expression: "issues"
    };

    const response = await api.asUser().requestJira(route`/rest/api/3/expression/eval`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      const data = await response.json();
      allIssues.push(...data.value);
      
      if (startAt > allIssues.length) {
        break;
      }
  
      startAt += 1000;
    } else {
      throw new Error(`Failed to fetch issues: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
    return allIssues;
}
}



const fetchFromJQL = async (jql) => {
  let startAt = 0;
  const allIssues = [];

  while (true) {
    var bodyData = `{
      "expand": [
        "names",
        "schema",
        "operations"
      ],
      "fields": [
        "summary",
        "status",
        "assignee",
        "issuetype"
      ],
      "fieldsByKeys": false,
      "jql": "${jql.replace(/"/g, '\\"')}",
      "maxResults": 100,
      "startAt": ${startAt}
    }`;

    const response = await api.asUser().requestJira(route`/rest/api/3/search`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: bodyData
    });

    const data = await response.json();
    allIssues.push(...data.issues);

    console.log('loop number', startAt, allIssues.length)

    if (startAt > allIssues.length) {
      break;
    }

    startAt += 100;
  }

  return allIssues;
}

resolver.define('fetchStorage', async (req) => {
  const storageData = await storage.get(`SELECTED_FILTER`);
  return storageData;
})

resolver.define('setStorage', async (req) => {
  console.log(req)
  await storage.set(`SELECTED_FILTER`, req);
  return req;
})

resolver.define('fetchIssuesFromJql', async (req) => {
  const statsData = await getIssuesByJQL(req.context.extension.gadgetConfiguration.filter.jql);
  return statsData;
})


resolver.define('getFilters', async (req) => {
  // console.log(req);

  const filters = await fetchFilters();

  const mappedFilters = filters.map(item => ({value: item.id, label: item.name, jql: item.jql}));
  
  // console.log(filters)
  // console.log(mappedFilters)
  return mappedFilters;
});

export const handler = resolver.getDefinitions();

