  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import {getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js"

const firebaseConfig = {
    apiKey: "AIzaSyBLK2UbEdzPa7rpiGf6A0AJO6S7jvUqDxk",
    authDomain: "vimana-construction-e6a4a.firebaseapp.com",
    projectId: "vimana-construction-e6a4a",
    storageBucket: "vimana-construction-e6a4a.firebasestorage.app",
    messagingSenderId: "1058890052113",
    appId: "1:1058890052113:web:8e02824eee430b52d2f7b0"
};

// Initialize Firebase FIRST
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function doSignup(){
  const now=Date.now();
  const errEl=document.getElementById('login-err');
  const lockEl=document.getElementById('login-lock');
  const btn=document.getElementById('login-btn');
  // Lockout
  if(now<lockUntil){
    lockEl.style.display='block';
    return;
  }
  const email=document.getElementById('login-user').value.trim();
  const password=document.getElementById('login-pass').value;
  if(!email||!password){errEl.textContent='Please enter both username and password.';errEl.style.display='block';return;}
  btn.textContent='Verifying…';btn.disabled=true;


 const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  const user = userCredential.user;

  if(user){
    failCount=0;
    errEl.style.display='none';lockEl.style.display='none';
    closeLogin();showActions();
  } else {
    failCount++;
    document.getElementById('login-pass').value='';
    if(failCount>=5){
      lockUntil=Date.now()+60000;
      errEl.style.display='none';
      lockEl.style.display='block';
      if(lockInterval)clearInterval(lockInterval);
      lockInterval=setInterval(()=>{
        const rem=Math.ceil((lockUntil-Date.now())/1000);
        document.getElementById('lock-timer').textContent=rem>0?rem:0;
        if(Date.now()>=lockUntil){clearInterval(lockInterval);lockEl.style.display='none';failCount=0;}
      },1000);
    } else {
      const left=5-failCount;
      document.getElementById('attempts-left').textContent=`${left} attempt${left!==1?'s':''} remaining before lockout.`;
      errEl.style.display='block';
    }
  }
}


// VERY IMPORTANT
// expose function to HTML onclick
window.doSignup = doSignup;