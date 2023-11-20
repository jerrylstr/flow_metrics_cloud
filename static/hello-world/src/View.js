import React, { useEffect, useState } from "react";
import { view, invoke } from "@forge/bridge";

function View() {
  const [context, setContext] = useState();
  const [projectConfigState, setProjectConfigState] = useState(0);
  const [data, setData] = useState(null);
  const [issuesData, setIssuesData] = useState(null)


  function countIssueTypes(data) {
    console.error('data',data)
    const issueTypeCounts = [];

    for (let i = 0; i < data.length; i++) {
      const issueType = data[i].fields.issuetype?.name;
      const index = issueTypeCounts.findIndex((item) => item.issueType === issueType);

      if (index === -1) {
        issueTypeCounts.push({ issueType, count: 1 });
      } else {
        issueTypeCounts[index].count++;
      }
    }

    return issueTypeCounts;
  }


  useEffect(async () => {
    invoke("fetchStorage").then((storageData) => {
      setProjectConfigState(storageData || 0);
    });
  }, []);

  useEffect(async () => {
    invoke("fetchIssuesFromJql").then((data) => {
      const issueTypeCounts = countIssueTypes(data);
      // console.error(issueTypeCounts)

      setIssuesData(issueTypeCounts || 0);
    });
  }, []);

  useEffect(() => {
    view.getContext().then(setContext);
  }, []);

  if (!context || !issuesData) {
    return "Loading...";
  }

  return (
    <div>
      <>The current selected filter is </>
      {JSON.stringify(context.extension.gadgetConfiguration.filter.label)}
      <>It contains: {issuesData.map
        (item => <div>{item.issueType}: {item.count}</div>)
      }</>
    </div>
  );
}

export default View;
