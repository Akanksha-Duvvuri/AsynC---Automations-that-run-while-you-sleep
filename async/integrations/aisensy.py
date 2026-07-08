"""
integrations/aisensy.py — the first real "tool".

You've called this API from Apps Script for Uncanned; this is the
same campaign endpoint, just from Python. The user's decrypted
AiSensy key is passed in — this module never touches the database.

AiSensy campaign API payload:
{
    "apiKey": "...",
    "campaignName": "...",     # must exist in their AiSensy dashboard
    "destination": "91XXXXXXXXXX",
    "userName": "AsynC",
    "templateParams": ["val1", "val2"]   # fills {{1}}, {{2}} in the template
}
"""

import httpx

AISENSY_URL = "https://backend.aisensy.com/campaign/t1/api/v2"


def send_whatsapp(
    api_key: str,
    campaign_name: str,
    destination: str,
    template_params: list[str] | None = None,
) -> dict:
    """
    Send a WhatsApp message via an existing AiSensy campaign/template.
    Raises httpx.HTTPStatusError on failure so callers can log the run
    as 'failed' with the real reason.
    """
    payload = {
        "apiKey": api_key,
        "campaignName": campaign_name,
        "destination": destination,
        "userName": "AsynC",
        "templateParams": template_params or [],
    }

    with httpx.Client(timeout=15) as client:
        resp = client.post(AISENSY_URL, json=payload)
        resp.raise_for_status()
        return resp.json()
