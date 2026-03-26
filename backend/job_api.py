import os

import serpapi
from dotenv import load_dotenv


load_dotenv()

api_key = os.getenv("SERPAPI_API_KEY")
if not api_key:
  raise RuntimeError(
    "Missing SERPAPI_API_KEY. Add it to your environment or backend/.env and rerun."
  )

client = serpapi.Client(api_key=api_key)

try:
  results = client.search(
    {
      "engine": "google_jobs",
      "q": "Barista",
      "location": "Austin, Texas, United States",
      "google_domain": "google.com",
      "hl": "en",
      "gl": "us",
    }
  )
except Exception as error:
  message = str(error)
  if "401" in message or "Unauthorized" in message:
    raise RuntimeError(
      "SerpApi rejected your key (401 Unauthorized). Check SERPAPI_API_KEY value."
    ) from error
  raise

jobs_results = results.get("jobs_results", [])
print(f"Found {len(jobs_results)} jobs")
for job in jobs_results:
  print (f"Title: {job.get('title')}"
         f"\nCompany: {job.get('company_name')}"
         f"\nLocation: {job.get('location')}"
         f"\nDescription: {job.get('description')[:100]}...\n")
