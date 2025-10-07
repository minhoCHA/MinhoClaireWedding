// rsvp.js — Netlify Function (POST / .netlify/functions/rsvp)
// 시간복잡도: 입력 파싱/검증 O(n) (문자열 길이 합), INSERT O(1)
// 공간복잡도: 요청당 O(1)

import { neon } from "@netlify/neon";

// env NETLIFY_DATABASE_URL 을 자동으로 사용
const sql = neon();

const required = ["name", "email", "attendance"];

export async function handler(event) {
  // CORS 프리플라이트
  if (event.httpMethod === "OPTIONS") {
    return resp(200, {}, cors());
  }
  if (event.httpMethod !== "POST") {
    return resp(405, { ok: false, error: "Method Not Allowed" });
  }

  const payload = safeJSON(event.body);

  // 필수 필드 검증
  for (const k of required) {
    if (!payload?.[k] || String(payload[k]).trim() === "") {
      return resp(400, { ok: false, error: `Missing field: ${k}` });
    }
  }
  if (!["Yes", "No", "Maybe"].includes(String(payload.attendance))) {
    return resp(400, { ok: false, error: "Invalid attendance" });
  }

  const ua = event.headers["user-agent"] || "";
  const referrer = payload.referrer || event.headers["referer"] || "";

  // SQL 파라미터 바인딩으로 안전하게 insert
  await sql/* sql */`
    INSERT INTO rsvp
      (name,email,city_state,attendance,adults,kids,diet,contact_pref,notes,
       guest_token,utm_source,utm_medium,utm_campaign,referrer,ua)
    VALUES
      (${payload.name}, ${payload.email}, ${payload.city_state || ""},
       ${payload.attendance}, ${Number(payload.adults || 0)}, ${Number(payload.kids || 0)},
       ${payload.diet || ""}, ${payload.contact || ""}, ${payload.notes || ""},
       ${payload.guest_token || ""}, ${payload.utm_source || ""}, ${payload.utm_medium || ""},
       ${payload.utm_campaign || ""}, ${referrer}, ${ua}
      );
  `;

  return resp(200, { ok: true });
}

function safeJSON(s) { try { return s ? JSON.parse(s) : {}; } catch { return {}; } }
function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  };
}
function resp(code, body, headers = cors()) {
  return { statusCode: code, headers, body: JSON.stringify(body || {}) };
}
