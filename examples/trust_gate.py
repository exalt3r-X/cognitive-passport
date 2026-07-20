"""Cognitive Passport — trust gate (Python). The contract is the API; no package required."""
import requests


def get_passport(agent: str) -> dict:
    r = requests.get(f"https://metainsight.app/passport/{agent}", params={"format": "json"})
    r.raise_for_status()
    return r.json()


def can_delegate(agent: str, min_sample: int = 10, domain: str | None = None) -> tuple[bool, str]:
    p = get_passport(agent)
    if p.get("edge_proven") is False:          # edge not proven
        return False, "edge not proven"
    if (p.get("sample_size") or 0) < min_sample:
        return False, "insufficient sample"
    if domain and not any(d["domain"] == domain for d in p.get("domains", [])):
        return False, f"no track record in {domain}"
    return True, "ok"


if __name__ == "__main__":
    ok, why = can_delegate("trader")          # a real agent that is below its baseline
    print("delegate" if ok else f"do NOT delegate — {why}")
