import { env } from "@/server/lib/env";
import { assertTrGsm } from "@/server/lib/sms/phone";

export async function sendNetgsmSms(input: { telefon: string; message: string }) {
  // .env üzerinden bilgileri alıyoruz. AppKey de eklendi.
  const usercode = env.NETGSM_USERNAME;
  const password = env.NETGSM_PASSWORD;
  const msgheader = env.NETGSM_HEADER ?? "ADRTURKLTD.";
  const appkey = process.env.NETGSM_APPKEY ?? "01007a72af089606218e04d553a740f5";

  if (!usercode || !password) {
    console.warn("[netgsm] NETGSM_USERNAME/NETGSM_PASSWORD eksik. SMS gonderimi atlandi.");
    if (process.env.NODE_ENV === "production") {
      return { success: false as const, responseCode: "ENV_MISSING", raw: "" };
    }
    return { success: true as const, skipped: true as const };
  }

  const gsmno = assertTrGsm(input.telefon);

  // OTP XML Formatı
  const xmlData = `<?xml version="1.0"?>
<mainbody>
   <header>
       <usercode>${usercode}</usercode>
       <password>${password}</password>
       <msgheader>${msgheader}</msgheader>
       <appkey>${appkey}</appkey> 
   </header>
   <body>
       <msg>
           <![CDATA[${input.message}]]>
       </msg>
       <no>${gsmno}</no>
   </body>
</mainbody>`;

  let responseText = "";
  try {
    const res = await fetch("https://api.netgsm.com.tr/sms/send/otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/xml"
      },
      body: xmlData
    });
    
    responseText = await res.text();
  } catch (err) {
    console.error("[netgsm] Ag hatasi:", err);
    return { success: false as const, responseCode: "NETWORK_ERROR", raw: "" };
  }

  // XML'den <code> değerini çıkaralım (Bağımlılık kullanmamak için Regex pratik bir çözüm)
  const codeMatch = responseText.match(/<code>(.*?)<\/code>/);
  const code = codeMatch ? codeMatch[1] : null;

  if (code === "0") {
    console.log("[netgsm] OTP SMS Basarili:", { responseCode: code, gsmno });
    return { success: true as const, jobId: "otp-success", responseCode: code, raw: responseText };
  }

  // Hata durumunda <error> etiketini çıkaralım
  const errMatch = responseText.match(/<error>(.*?)<\/error>/);
  const errorMsg = errMatch ? errMatch[1] : "Bilinmeyen Hata";

  console.error("[netgsm] OTP SMS Basarisiz:", { code, errorMsg, raw: responseText });
  return { success: false as const, responseCode: code || "UNKNOWN", raw: responseText };
}
