import https from 'https';

async function sendSms() {
  const username = "5437130857";
  const password = "5D8DF-2"; // Belirttiğin şifre

  const auth = Buffer.from(`${username}:${password}`).toString('base64');

  // Hata 51 (İYS Hatası) almamak için OTP endpoint'ini deniyoruz
  // OTP servisinde Türkçe karakter kullanılmaz, bilgin olsun.
  const postData = JSON.stringify({
    "msgheader": "HEDABILISIM",
    "msg": "Deneme mesaji - VPS Test",
    "no": "5510739380",
    "appname": "HedaBilisim-ODP"
  });

  const options = {
    hostname: 'api.netgsm.com.tr',
    path: '/sms/rest/v2/otp', // Daha esnek olan OTP endpoint'i
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => {
      console.log(`Durum Kodu: ${res.statusCode}`);
      try {
        const json = JSON.parse(body);
        console.log('Netgsm Yanıtı:', json);

        if (json.code === "00") {
          console.log("✅ Mesaj başarıyla gönderildi!");
        }
      } catch (e) {
        console.log('Ham Yanıt:', body);
      }
    });
  });

  req.on('error', (e) => console.error("Hata:", e.message));
  req.write(postData);
  req.end();
}

sendSms();
