import fs from 'fs';

async function testSms() {
    const envContent = fs.readFileSync('.env', 'utf-8');
    const getEnvValue = (key) => {
        const match = envContent.match(new RegExp(`^${key}="(.*?)"`, 'm'));
        return match ? match[1] : null;
    };

    const usercode = getEnvValue("NETGSM_USERNAME") || "5437130857";
    const password = getEnvValue("NETGSM_PASSWORD") || "Ee145045**";
    const msgheader = getEnvValue("NETGSM_HEADER") || "HEDABILISIM";
    const gsmno = "05510739480"; // User requested: 0551 073 94 80

    const apiUrl = "https://api.netgsm.com.tr/sms/send/get";
    const requestData = new URLSearchParams({
        usercode: usercode,
        password: password,
        gsmno: gsmno,
        message: "Test message e-yonetim",
        msgheader: msgheader,
        dil: "TR",
    });

    try {
        let res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: requestData.toString(),
        });
        console.log("Status GET API (via POST):", res.status);
        console.log("Response GET API:", await res.text());
        console.log("Test was made with:", {usercode, password, msgheader, gsmno});
    } catch (e) {
        console.error("Fetch Error:", e.message);
    }
}
testSms();
