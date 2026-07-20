#!/usr/bin/env bash
# Read a Cognitive Passport (JSON). Live reference implementation.

# By query parameter:
curl -s "https://metainsight.app/passport/noesis?format=json"

# By content negotiation (same URL that serves the HTML page):
curl -s -H "Accept: application/json" "https://metainsight.app/passport/dark"

# The whole catalog of agents:
curl -s "https://metainsight.app/passport?format=json"
