/** Access logs — matches `GET /access/logs/me` (resident) */
export interface AccessLogDto {
  id: string;
  communityId: string;
  userId: string | null;
  accessTokenId: string | null;
  deviceId: string | null;
  action: 'ENTRY' | 'EXIT' | 'DENIED';
  credentialType: 'QR' | 'PASSWORD' | 'RFID' | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

/** Access tokens list — matches `GET /access/tokens` */
export interface AccessTokenSummaryDto {
  id: string;
  type: string;
  methods: { qr: boolean; password: boolean; rfid: boolean };
  guestName: string | null;
  validFrom: string;
  validTo: string | null;
  status: string;
  createdAt: string;
}

/** `POST /access/tokens` — matches Nest `CreateAccessTokenDto` */
export interface CreateAccessTokenRequest {
  type: 'TEMPORARY' | 'PERMANENT' | 'EVENT';
  methods: { qr: boolean; password: boolean; rfid: boolean };
  guestName?: string;
  validFrom?: string;
  validTo?: string | null;
  keypadPassword?: string;
}

/** Plain token is returned once from `POST /access/tokens` (6-digit numeric string). */
export interface CreateAccessTokenResponse {
  token: string;
  tokenId: string;
  expiresAt: string | null;
  methods: { qr: boolean; password: boolean; rfid: boolean };
  guestName: string | null;
  type: string;
  warning: string;
}

/** `POST /access/tokens/:id/revoke` */
export interface RevokeAccessTokenResponse {
  id: string;
  status: string;
}
