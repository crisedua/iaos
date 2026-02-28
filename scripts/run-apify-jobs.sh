#!/usr/bin/env bash
set -euo pipefail

BASE_URL="https://api.apify.com/v2"
ACTOR="compass~crawler-google-places"
OUTPUT_DIR="/c/ClaudeCode/outputs/leads/gmap-extracts/2026-02-25/raw"
TIMEOUT_SECONDS=600   # 10 minutes per job
POLL_INTERVAL=15

# Capture token explicitly
TOKEN=$(printenv APIFY_TOKEN)
if [[ -z "$TOKEN" ]]; then
  echo "ERROR: APIFY_TOKEN not set"
  exit 1
fi

CURL_OPTS="--ssl-no-revoke --max-time 30 -s"

# Job definitions: "job_num|query|category|city|existing_run_id|existing_dataset_id"
# For job 01, we already have a running run from the test: iXszKKmdBidxNuuGP / SoU9f5BooUZK0JgKp
declare -a JOBS=(
  "01|dentista Santiago|dentistas|Santiago|iXszKKmdBidxNuuGP|SoU9f5BooUZK0JgKp"
  "02|dentista Viña del Mar|dentistas|Viña del Mar||"
  "03|dentista Valparaíso|dentistas|Valparaíso||"
  "04|abogado Santiago|abogados|Santiago||"
  "05|abogado Viña del Mar|abogados|Viña del Mar||"
  "06|abogado Valparaíso|abogados|Valparaíso||"
  "07|clínica médica Santiago|clinicas|Santiago||"
  "08|clínica médica Viña del Mar|clinicas|Viña del Mar||"
  "09|clínica médica Valparaíso|clinicas|Valparaíso||"
  "10|inmobiliaria Santiago|inmobiliarias|Santiago||"
  "11|inmobiliaria Viña del Mar|inmobiliarias|Viña del Mar||"
  "12|inmobiliaria Valparaíso|inmobiliarias|Valparaíso||"
)

# Node.js helper: count array length from JSON file
node_count() {
  local file="$1"
  node -e "
    const fs=require('fs');
    try {
      const d=JSON.parse(fs.readFileSync('${file}','utf8'));
      console.log(Array.isArray(d) ? d.length : 0);
    } catch(e) { console.log(0); }
  "
}

# Results accumulator
RESULTS=()

for JOB_DEF in "${JOBS[@]}"; do
  IFS='|' read -r JOB_NUM QUERY CATEGORY CITY EXISTING_RUN_ID EXISTING_DATASET_ID <<< "$JOB_DEF"
  JOB_INT=$((10#$JOB_NUM))
  echo ""
  echo "======================================"
  echo "JOB $JOB_NUM: $QUERY"
  echo "======================================"

  DATA_FILE="$OUTPUT_DIR/job-${JOB_NUM}.json"
  META_FILE="$OUTPUT_DIR/job-${JOB_NUM}-meta.json"

  RUN_ID="$EXISTING_RUN_ID"
  DATASET_ID="$EXISTING_DATASET_ID"

  # Start a new run if we don't have an existing one
  if [[ -z "$RUN_ID" ]]; then
    # Build JSON payload via Node to handle special chars safely
    PAYLOAD=$(node -e "
      const q = process.argv[1];
      const payload = {
        searchStringsArray: [q],
        maxCrawledPlacesPerSearch: 100,
        language: 'es',
        countryCode: 'cl',
        includeReviews: false,
        maxReviews: 0,
        scrapeReviewerData: false,
        exportPlaceUrls: true
      };
      process.stdout.write(JSON.stringify(payload));
    " "$QUERY")

    echo "Starting actor run..."

    START_RESPONSE=$(curl $CURL_OPTS -X POST \
      "${BASE_URL}/acts/${ACTOR}/runs?token=${TOKEN}" \
      -H "Content-Type: application/json" \
      -d "$PAYLOAD")

    echo "Start response: ${START_RESPONSE:0:200}"

    RUN_ID=$(echo "$START_RESPONSE" | node -e "
      let d=''; process.stdin.on('data',c=>d+=c);
      process.stdin.on('end',()=>{
        try { const j=JSON.parse(d); console.log(j.data ? j.data.id : ''); }
        catch(e){ console.log(''); }
      });
    ")

    DATASET_ID=$(echo "$START_RESPONSE" | node -e "
      let d=''; process.stdin.on('data',c=>d+=c);
      process.stdin.on('end',()=>{
        try { const j=JSON.parse(d); console.log(j.data ? j.data.defaultDatasetId : ''); }
        catch(e){ console.log(''); }
      });
    ")

    if [[ -z "$RUN_ID" ]]; then
      echo "ERROR: Could not extract runId. Marking as FAILED."
      echo "[]" > "$DATA_FILE"
      node -e "
        const meta = {job:${JOB_INT},query:process.argv[1],category:process.argv[2],city:process.argv[3],runId:'',datasetId:'',status:'FAILED',rawCount:0};
        process.stdout.write(JSON.stringify(meta,null,2));
      " "$QUERY" "$CATEGORY" "$CITY" > "$META_FILE"
      RESULTS+=("${JOB_INT}|${QUERY}|FAILED|0")
      continue
    fi
  else
    echo "Reusing existing run: $RUN_ID / $DATASET_ID"
  fi

  echo "runId: $RUN_ID | datasetId: $DATASET_ID"

  # Poll for completion
  ELAPSED=0
  FINAL_STATUS="UNKNOWN"
  while [[ $ELAPSED -lt $TIMEOUT_SECONDS ]]; do
    sleep $POLL_INTERVAL
    ELAPSED=$((ELAPSED + POLL_INTERVAL))

    STATUS_RESPONSE=$(curl $CURL_OPTS "${BASE_URL}/actor-runs/${RUN_ID}?token=${TOKEN}")
    CURRENT_STATUS=$(echo "$STATUS_RESPONSE" | node -e "
      let d=''; process.stdin.on('data',c=>d+=c);
      process.stdin.on('end',()=>{
        try { const j=JSON.parse(d); console.log(j.data ? j.data.status : 'UNKNOWN'); }
        catch(e){ console.log('UNKNOWN'); }
      });
    ")

    echo "  [${ELAPSED}s] Status: $CURRENT_STATUS"

    if [[ "$CURRENT_STATUS" == "SUCCEEDED" || "$CURRENT_STATUS" == "FAILED" || "$CURRENT_STATUS" == "TIMED-OUT" || "$CURRENT_STATUS" == "ABORTED" ]]; then
      FINAL_STATUS="$CURRENT_STATUS"
      break
    fi
  done

  if [[ $ELAPSED -ge $TIMEOUT_SECONDS && "$FINAL_STATUS" == "UNKNOWN" ]]; then
    FINAL_STATUS="TIMED-OUT"
  fi

  if [[ "$FINAL_STATUS" != "SUCCEEDED" ]]; then
    echo "Job $JOB_NUM ended with status: $FINAL_STATUS. Saving empty array."
    echo "[]" > "$DATA_FILE"
    node -e "
      const meta = {job:${JOB_INT},query:process.argv[1],category:process.argv[2],city:process.argv[3],runId:'${RUN_ID}',datasetId:'${DATASET_ID}',status:'${FINAL_STATUS}',rawCount:0};
      process.stdout.write(JSON.stringify(meta,null,2));
    " "$QUERY" "$CATEGORY" "$CITY" > "$META_FILE"
    RESULTS+=("${JOB_INT}|${QUERY}|${FINAL_STATUS}|0")
    continue
  fi

  # Fetch dataset items
  echo "Fetching dataset items..."
  curl $CURL_OPTS \
    "${BASE_URL}/datasets/${DATASET_ID}/items?token=${TOKEN}&format=json&clean=true&limit=200" \
    > "$DATA_FILE"

  # Count records
  RAW_COUNT=$(node_count "$DATA_FILE")

  echo "Records fetched: $RAW_COUNT"

  # Save meta file
  node -e "
    const meta = {
      job: ${JOB_INT},
      query: process.argv[1],
      category: process.argv[2],
      city: process.argv[3],
      runId: '${RUN_ID}',
      datasetId: '${DATASET_ID}',
      status: '${FINAL_STATUS}',
      rawCount: ${RAW_COUNT}
    };
    process.stdout.write(JSON.stringify(meta,null,2));
  " "$QUERY" "$CATEGORY" "$CITY" > "$META_FILE"

  RESULTS+=("${JOB_INT}|${QUERY}|${FINAL_STATUS}|${RAW_COUNT}")
  echo "Job $JOB_NUM complete: $RAW_COUNT records saved."
done

echo ""
echo "======================================"
echo "ALL JOBS COMPLETE"
echo "======================================"
echo ""
echo "JOB_RESULTS_START"
echo "job_num|query|status|raw_count"
TOTAL=0
for R in "${RESULTS[@]}"; do
  echo "$R"
  COUNT=$(echo "$R" | cut -d'|' -f4)
  TOTAL=$((TOTAL + COUNT))
done
echo "JOB_RESULTS_END"
echo "TOTAL_RAW: $TOTAL"
