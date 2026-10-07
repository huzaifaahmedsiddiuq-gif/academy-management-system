async function verifyBundle() {
  const html = await fetch('https://academy-management-system-gamma.vercel.app/?t=' + Date.now(), {
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
  }).then(r => r.text());
  const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
  console.log('Deployed Bundle:', jsMatch ? jsMatch[1] : 'None');
  if (jsMatch) {
    const code = await fetch('https://academy-management-system-gamma.vercel.app' + jsMatch[1]).then(r => r.text());
    console.log('Includes cachedStudent:', code.includes('cachedStudent'));
    console.log('Includes authStudentId:', code.includes('authStudentId'));
  }
}
verifyBundle();
