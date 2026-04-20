import fs from 'fs';

async function testSms() {
    const envContent = fs.readFileSync('.env', 'utf-8');
    const getEnvValue = (key) => {
        const match = envContent.match(new RegExp(`^${key}="(.*?)"`, 'm'));
        return match ? match[1] : null;
    };

    const usercode = getEnvValue("NETGSM_USERNAME") || "5437130857";
    const password = getEnvValue("NETGSM_PASSWORD") || "Ee145045**";
    const authHeader = Buffer.from(`${usercode}:${password}`).toString("base64");

    const apiUrl = "https://api.netgsm.com.tr/sms/rest/v2/send";
    const payload = {
        msgheader: getEnvValue("NETGSM_HEADER") || "HEDABILISIM",
        messages: [{ msg: "Test mesaj", no: "5437130857" }],
        encoding: "TR",
        iysfilter: "0"
    };

    try {
        let res = await fetch(apiUrl, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Basic ${authHeader}`
            },
            body: JSON.stringify(payload),
        });
        console.log("Status REST:", res.status);
        console.log("Response REST:", await res.text());
        console.log("Test was made with:", {usercode, password});
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}
testSms();
