import { env } from "@/server/lib/env";
import { assertTrGsm } from "@/server/lib/sms/phone";
import https from "https";

export async function sendNetgsmSms(input: { telefon: string; message: string }) {
  const username = env.NETGSM_USERNAME;
  const password = env.NETGSM_PASSWORD;
  const msgheader = env.NETGSM_HEADER ?? "HEDABILISIM";
  const appname = env.NETGSM_APPNAME ?? "HedaBilisim-ODP";

  if (!username || !password) {
    console.warn("[netgsm] NETGSM_USERNAME/NETGSM_PASSWORD eksik. SMS gonderimi atlandi.");
    return { success: false as const, responseCode: "ENV_MISSING", raw: "" };
  }

  // NetGSM REST v2 OTP: 10 haneli format bekleniyor (5xxxxxxxxx, başında 0 olmadan)
  const gsmno = assertTrGsm(input.telefon).replace(/^0/, "");

  // Basic Auth header (test-sms.mjs ile aynı yapı)
  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  const postData = JSON.stringify({
    msgheader,
    msg: input.message,
    no: gsmno,
    appname,
  });

  return new Promise<{ success: boolean; responseCode: string; raw: string }>((resolve) => {
    const options: https.RequestOptions = {
      hostname: "api.netgsm.com.tr",
      path: "/sms/rest/v2/otp",
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(body) as { code?: string; jobid?: string; error?: string };
          console.log("[netgsm] REST v2 Yanıtı:", json);

          if (json.code === "00") {
            console.log("[netgsm] SMS Basarili:", { gsmno, jobid: json.jobid });
            resolve({ success: true, responseCode: "00", raw: body });
          } else {
            console.error("[netgsm] SMS Basarisiz:", { code: json.code, error: json.error });
            resolve({ success: false, responseCode: json.code ?? "UNKNOWN", raw: body });
          }
        } catch {
          console.error("[netgsm] JSON parse hatasi:", body);
          resolve({ success: false, responseCode: "PARSE_ERROR", raw: body });
        }
      });
    });

    req.on("error", (err) => {
      console.error("[netgsm] Ag hatasi:", err.message);
      resolve({ success: false, responseCode: "NETWORK_ERROR", raw: "" });
    });

    req.write(postData);
    req.end();
  });
}
