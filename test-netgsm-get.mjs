async function testSms() {
    const requestData = new URLSearchParams({
        usercode: "5437130857",
        password: "Aa173680**",
        gsmno: "5437130857",
        message: "Test message",
        msgheader: "HEDABILISIM",
        dil: "TR",
    });
    const apiUrl = "https://api.netgsm.com.tr/sms/send/get?" + requestData.toString();

    try {
        let res = await fetch(apiUrl, {
            method: "GET",
        });
        console.log("Status:", res.status);
        console.log("Response GET:", await res.text());
    } catch (e) {
        console.error("Fetch Error:", e.message);
    }
}
testSms();
