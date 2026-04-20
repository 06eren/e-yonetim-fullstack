import fs from 'fs';

async function testSmsOtp() {
  const envContent = fs.readFileSync('.env', 'utf-8');
  const getEnvValue = (key) => {
      const match = envContent.match(new RegExp(`^${key}="(.*?)"`, 'm'));
      return match ? match[1] : null;
  };

  const usercode = getEnvValue("NETGSM_USERNAME");
  const password = getEnvValue("NETGSM_PASSWORD");
  const msgheader = getEnvValue("NETGSM_HEADER");
  const appkey = getEnvValue("NETGSM_APPKEY") || "01007a72af089606218e04d553a740f5"; // Env'de yoksa kendi appkey'iniz
  
  const contactNumber = "05510739380"; // Istediğiniz Numara
  const otp = "123456";

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
           <![CDATA[e-Yonetim test kodunuz: ${otp}]]>
       </msg>
       <no>${contactNumber}</no>
   </body>
</mainbody>`;

  console.log("NetGSM OTP API Istegi Atiliyor... (.env bilgileri ile)");
  console.log(`Gonderilen numara: ${contactNumber}, Kullanici: ${usercode}, Header: ${msgheader}`);
  
  try {
    const response = await fetch('https://api.netgsm.com.tr/sms/send/otp', {
      method: "POST",
      headers: {
        'Content-Type': 'application/xml'
      },
      body: xmlData
    });

    const responseText = await response.text();
    console.log("Ham Yanıt:", responseText);

    if (responseText.includes("<code>0</code>")) {
      console.log("✅ SMS successfully sent to:", contactNumber);
    } else {
      console.log("❌ Failed to send OTP.");
    }
  } catch (error) {
    console.error("Error sending SMS:", error.message);
  }
}

testSmsOtp();
