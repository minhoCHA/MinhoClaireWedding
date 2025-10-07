import { useState } from "react";

export default function RsvpForm() {
  const [msg, setMsg] = useState("");

  async function onSubmit(e){
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());

    const qs = new URLSearchParams(window.location.search);
    data.guest_token  = data.guest_token  || qs.get("guest") || "";
    data.utm_source   = data.utm_source   || qs.get("utm_source") || "";
    data.utm_medium   = data.utm_medium   || qs.get("utm_medium") || "";
    data.utm_campaign = data.utm_campaign || qs.get("utm_campaign") || "";
    data.referrer     = document.referrer || "";

    const res  = await fetch("/.netlify/functions/rsvp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setMsg(json.ok ? "RSVP received. Thank you!" : (json.error || "Failed"));
    if (json.ok) e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h2>Pre-RSVP (Intent to Attend)</h2>
      <input name="name" placeholder="Name" required />
      <input type="email" name="email" placeholder="Email" required />
      <select name="attendance" required defaultValue="">
        <option value="" disabled>Select</option>
        <option>Yes</option><option>No</option><option>Maybe</option>
      </select>
      <input name="city_state" placeholder="City, State (US)" />
      <input type="number" name="adults" min="0" placeholder="Adults" />
      <input type="number" name="kids"   min="0" placeholder="Kids" />
      <input name="diet" placeholder="Diet/Allergies" />
      <select name="contact" defaultValue="Email">
        <option>Email</option><option>Text</option><option>KakaoTalk</option>
      </select>
      <textarea name="notes" rows="3" placeholder="Notes"></textarea>
      <button type="submit">Submit</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
