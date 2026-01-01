# Late API - Social Account Connection Guide

This guide explains how to connect Instagram and TikTok accounts to Pose & Poise using the Late API OAuth flow.

## Prerequisites

### 1. Add Late API Key to Environment

Add your Late API key to `.env.local`:

```bash
# Late API Configuration
LATE_API_KEY=sk_d2a1dc5a342950371539eec7f70419478a4ce1e479cc684ef7a7f41ddd2d4255
LATE_PROFILE_ID=69568fa185cefc061f3f7a32
```

> **Note:** Replace with your actual API key from [Late Dashboard](https://getlate.dev)

---

## OAuth Connection Flow

### Step 1: Generate an OAuth Connection URL

Call the Late API endpoint to generate a connection URL for the social platform.

**Request:**

```
GET https://getlate.dev/api/v1/connect/{platform}?profileId={profileId}
```

**Headers:**
- `Authorization: Bearer sk_your_api_key`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `profileId` | string | Yes | Profile ID to group the account under |

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platform` | string | Yes | Social platform: `instagram` or `tiktok` |

**Example cURL - Instagram:**

```bash
curl -X GET "https://getlate.dev/api/v1/connect/instagram?profileId=69568fa185cefc061f3f7a32" \
-H "Authorization: Bearer sk_d2a1dc5a342950371539eec7f70419478a4ce1e479cc684ef7a7f41ddd2d4255"
```

**Example cURL - TikTok:**

```bash
curl -X GET "https://getlate.dev/api/v1/connect/tiktok?profileId=69568fa185cefc061f3f7a32" \
-H "Authorization: Bearer sk_d2a1dc5a342950371539eec7f70419478a4ce1e479cc684ef7a7f41ddd2d4255"
```

**Example Response:**

```json
{
  "authUrl": "https://www.instagram.com/oauth/authorize?client_id=...&redirect_uri=...&scope=...",
  "state": "..."
}
```

---

### Step 2: Redirect User to the `connect_url`

Once you have the `connect_url`, redirect the user to authenticate and grant permissions.

```tsx
const ConnectSocialButton = ({ connectUrl, platform }) => {
  return (
    <a href={connectUrl} target="_blank" rel="noopener noreferrer">
      <button>Connect {platform}</button>
    </a>
  );
};
```

---

### Step 3: Handle the Webhook (Optional)

After successful connection, Late sends a webhook to confirm. The webhook contains:
- `platform` - The social platform connected
- `username` - The user's handle on that platform
- `profile_id` - The profile the account was added to

Configure your backend to receive webhook events at your designated endpoint.

---

### Step 4: Verify the Account is Connected

Retrieve connected social accounts to confirm the connection:

**Request:**

```
GET https://getlate.dev/api/v1/accounts?profileId=69568fa185cefc061f3f7a32
```

**Example cURL:**

```bash
curl -X GET "https://getlate.dev/api/v1/accounts?profileId=69568fa185cefc061f3f7a32" \
-H "Authorization: Bearer sk_d2a1dc5a342950371539eec7f70419478a4ce1e479cc684ef7a7f41ddd2d4255"
```

**Example Response:**

```json
{
  "accounts": [
    {
      "_id": "695694184207e06f4ca83704",
      "platform": "instagram",
      "username": "poseandpoise",
      "displayName": "John Lister",
      "isActive": true,
      "profileUrl": "https://instagram.com/poseandpoise",
      "profilePicture": "https://...",
      "tokenExpiresAt": "2026-03-02T15:34:48.856Z"
    },
    {
      "_id": "6956917d4207e06f4ca83702",
      "platform": "tiktok",
      "username": "posenpoise",
      "displayName": "posenpoise",
      "isActive": true,
      "profileUrl": "https://tiktok.com/@posenpoise",
      "profilePicture": "https://...",
      "tokenExpiresAt": "2026-01-02T15:23:41.874Z"
    }
  ]
}
```

---

## Full Implementation Example

### React Component

```tsx
import { useEffect, useState } from "react";

interface SocialAccount {
  _id: string;
  platform: string;
  username: string;
  displayName: string;
  profileUrl: string;
  profilePicture: string;
  isActive: boolean;
}

const ConnectSocialAccounts = () => {
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch existing connected accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("/api/social/accounts");
        const data = await response.json();
        setAccounts(data.accounts || []);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  // Generate connection URL for a platform
  const generateConnectUrl = async (platform: "instagram" | "tiktok") => {
    try {
      const response = await fetch("/api/social/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      const data = await response.json();
      
      if (platform === "instagram") {
        setInstagramUrl(data.connect_url);
      } else {
        setTiktokUrl(data.connect_url);
      }
      
      // Open in new window
      window.open(data.connect_url, "_blank");
    } catch (error) {
      console.error("Error generating connect URL:", error);
    }
  };

  const instagramAccount = accounts.find(a => a.platform === "instagram");
  const tiktokAccount = accounts.find(a => a.platform === "tiktok");

  return (
    <div>
      <h3>Connected Social Accounts</h3>
      
      {/* Instagram */}
      <div>
        {instagramAccount ? (
          <p>✅ Instagram: @{instagramAccount.username}</p>
        ) : (
          <button onClick={() => generateConnectUrl("instagram")}>
            Connect Instagram
          </button>
        )}
      </div>

      {/* TikTok */}
      <div>
        {tiktokAccount ? (
          <p>✅ TikTok: @{tiktokAccount.username}</p>
        ) : (
          <button onClick={() => generateConnectUrl("tiktok")}>
            Connect TikTok
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectSocialAccounts;
```

---

## Key Points

1. **OAuth Flow Required**: Users must authenticate via the `connect_url` to grant permissions
2. **Profiles**: Accounts can be grouped under specific profiles for organization
3. **Token Expiration**: Monitor `tokenExpiresAt` - tokens need refreshing before expiry
4. **Webhooks**: Set up webhook handling for real-time connection confirmations
5. **API Endpoints**:
   - Generate connect URL: `POST /v1/social-accounts/connect`
   - Get accounts: `GET /v1/accounts` or `GET /v1/accounts?profileId=xxx`
   - Get profiles: `GET /v1/profiles`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on `/social-accounts` | Use `/accounts` endpoint instead |
| Token expired | Redirect user to reconnect via new `connect_url` |
| Account not appearing | Check webhook logs or poll `/accounts` endpoint |

