import json

with open('/Users/marquis/public-sector/admin/Public Sector Backend.postman_collection (4).json', 'r') as f:
    collection = json.load(f)

def extract_endpoints(items, path=""):
    for item in items:
        if "item" in item:
            extract_endpoints(item["item"], path + "/" + item["name"])
        elif "request" in item:
            req = item["request"]
            if req["method"] == "GET":
                url = req.get("url", {})
                if isinstance(url, dict) and "query" in url:
                    queries = [q["key"] for q in url["query"] if not q.get("disabled", False)]
                    if queries:
                        raw_url = url.get("raw", "")
                        print(f"{raw_url.split('?')[0]} => {queries}")

extract_endpoints(collection["item"])
