(async () => {
  for (let i = 1; i <= 30; i++) {
    const res = await fetch('http://localhost:8080/service-a/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
    });
    console.log(i, res.status);
  }
})();