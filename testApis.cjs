(async()=>{
  try{
    const base = process.env.BASE_URL || 'http://localhost:5000';
    const loginRes = await fetch(base + '/api/auth/admin-login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email:'admin1@uni.edu', password:'admin123' }) });
    const loginJson = await loginRes.json();
    if(!loginRes.ok){ console.error('Admin login failed', loginJson); process.exit(1);}    
    const token = loginJson.token;
    console.log('Admin token obtained');
    const headers = { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` };
    const endpoints = ['/api/students','/api/classes','/api/attendance?date='+new Date().toISOString().split('T')[0], '/api/exams','/api/grades/','/api/fees','/api/notifications','/api/parent-messages','/api/leaves'];
    for(const ep of endpoints){
      try{
        const res = await fetch(base + ep, { headers });
        const txt = await res.text();
        console.log('\nGET', ep, '=>', res.status);
        console.log(txt.slice(0,500));
      }catch(e){ console.error('Fetch error',ep,e.message); }
    }
  }catch(e){ console.error('Test error', e.message); }
})();
