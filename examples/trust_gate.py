"""Cognitive Passport — trust gate (Python). The contract is the API; no package required.

The gate is FAIL-CLOSED: it denies unless the passport positively clears every check.
`edge_proven` of None (ahead but unconfirmed) and False (not proven) BOTH deny.
"""
import requests

REFERENCE = "https://metainsight.app"  # reference provider; pass your own base_url to read another


def get_passport(agent_id: str, base_url: str = REFERENCE) -> dict:
    r = requests.get(f"{base_url}/passport/{agent_id}", params={"format": "json"})
    r.raise_for_status()
    return r.json()


def can_delegate(
    agent_id: str,
    base_url: str = REFERENCE,
    min_resolved: int = 10,          # require resolved (not merely committed) history
    domain: str | None = None,       # optional: require a track record in this domain
    require_verified: bool = False,  # True for high-risk actions (money, code, permissions)
) -> tuple[bool, str]:
    p = get_passport(agent_id, base_url)

    if p.get("edge_proven") is not True:               # None and False both deny
        return False, "edge not proven"
    if (p.get("resolved_forecasts") or 0) < min_resolved:
        return False, "insufficient resolved history"
    if domain:
        d = next((x for x in p.get("domains", []) if x["domain"] == domain), None)
        if not d or (d.get("n") or 0) < min_resolved:
            return False, f"insufficient track record in {domain}"
    if require_verified and p.get("verified") is not True:
        return False, "evidence not independently verified"
    return True, "ok"


if __name__ == "__main__":
    ok, why = can_delegate("trader", require_verified=True)
    print("delegate" if ok else f"do NOT delegate — {why}")
    # With a strict gate, none of the reference agents pass yet — none has a *proven* edge.
    # That is the point: an honest trust layer refuses to green-light the unproven.
