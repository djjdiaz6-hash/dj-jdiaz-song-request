// Netlify serverless function.
// Runs on Netlify's own servers, not in the guest's browser — so Apple's
// iTunes servers never see an "iPhone" request and never try to redirect
// into the Music app. This replaces the external proxy entirely.

exports.handler = async function (event) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  const term = (event.queryStringParameters && event.queryStringParameters.term) || "";

  if (!term.trim()) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ results: [] }),
    };
  }

  try {
    const upstreamUrl =
      "https://itunes.apple.com/search?term=" +
      encodeURIComponent(term) +
      "&media=music&entity=song&limit=8";

    const upstreamRes = await fetch(upstreamUrl);
    const data = await upstreamRes.json();

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: corsHeaders,
      body: JSON.stringify({ results: [], error: "search_failed" }),
    };
  }
};
