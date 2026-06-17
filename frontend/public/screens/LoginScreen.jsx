const NS_LOGIN = window.MTRSDesignSystemUltraTechCement_660dc9;

function LoginScreen({ onLogin }) {
  const { Logo, Input } = NS_LOGIN;
  const [mode, setMode] = React.useState('signin'); // signin | signup | forgot
  const [empId, setEmpId] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState('');
  const [ready, setReady] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [resetInput, setResetInput] = React.useState('');
  const [forgotTab, setForgotTab] = React.useState('username');
  const [lookupInput, setLookupInput] = React.useState('');
  const [resetEmployeeId, setResetEmployeeId] = React.useState('');
  const [resetEmail, setResetEmail] = React.useState('');
  const [resetToken, setResetToken] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
  const [recoveredUsername, setRecoveredUsername] = React.useState(null);
  const [resetMsg, setResetMsg] = React.useState('');
  const [resetErr, setResetErr] = React.useState('');
  const [recoveryLoading, setRecoveryLoading] = React.useState(false);
  const [reqSent, setReqSent] = React.useState(false);
  const [reqLoading, setReqLoading] = React.useState(false);
  const [reqError, setReqError] = React.useState('');
  const [accessForm, setAccessForm] = React.useState({
    full_name: '',
    employee_id: '',
    email: '',
    department: '',
    requested_role: 'requester',
    password: '',
    confirm_password: '',
  });

  // Keep body dark so there's no light flash before panels paint
  React.useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = 'var(--brand-black)';
    return () => { document.body.style.background = prev; };
  }, []);

  React.useEffect(() => {
    const s = document.createElement('style');
    s.id = 'tims-login-anim';
    s.textContent = `
      @keyframes lgnUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      @keyframes lgnLeft { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
      @keyframes lgnPulse { 0%,100% { opacity:.18; transform:scale(1); } 50% { opacity:.18; transform:scale(1.06); } }
      @keyframes lgnFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
      @keyframes lgnSpin  { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      .lgn-up   { animation: lgnUp   0.48s cubic-bezier(0.16,1,0.3,1) both; }
      .lgn-left { animation: lgnLeft 0.5s  cubic-bezier(0.16,1,0.3,1) both; }
    `;
    if (!document.getElementById('tims-login-anim')) document.head.appendChild(s);
    return () => { const el = document.getElementById('tims-login-anim'); if (el) el.remove(); };
  }, []);

  // Delay content reveal until logo image is loaded AND minimum 0.75s has passed
  React.useEffect(() => {
    let imgLoaded = false;
    let timerDone = false;
    const tryReady = () => { if (imgLoaded && timerDone) setReady(true); };
    const img = new Image();
    img.onload = img.onerror = () => { imgLoaded = true; tryReady(); };
    img.src = '/assets/ultratech-logo.png';
    const timer = setTimeout(() => { timerDone = true; tryReady(); }, 750);
    return () => clearTimeout(timer);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      if (!window.API) {
        await new Promise((resolve, reject) => {
          const el = document.createElement('script');
          el.src = `/screens/Data.jsx?t=${Date.now()}`;
          el.onload = resolve;
          el.onerror = () => reject(new Error('Login service failed to load. Please refresh the page.'));
          document.head.appendChild(el);
        });
      }
      if (!window.API || typeof window.API.login !== 'function') {
        throw new Error('Login service is still loading. Please refresh the page and try again.');
      }
      await window.API.login(empId.trim(), pw);
      await onLogin();
    } catch (err) {
      window.API?.logout?.();
      setLoginError(err.message || 'Login failed. Check your credentials.');
      setLoading(false);
    }
  };

  const Btn = ({ children, onClick, type = 'button', disabled, style: s = {} }) => (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ height:44, border:'none', borderRadius:'var(--radius-md)', background:'var(--brand-black)', color:'#fff', fontSize:14, fontWeight:700, cursor: disabled ? 'default' : 'pointer', fontFamily:'var(--font-sans)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'opacity 0.15s', opacity: disabled ? 0.65 : 1, width:'100%', ...s }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.88'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = disabled ? '0.65' : '1'; }}>
      {children}
    </button>
  );

  const Label = ({ children }) => (
    <div style={{ fontSize:12, fontWeight:600, color:'var(--text-default)', marginBottom:5 }}>{children}</div>
  );

  const NativeSelect = ({ label, options }) => (
    <div>
      <Label>{label}</Label>
      <select style={{ width:'100%', height:38, padding:'0 10px', border:'1px solid var(--border-default)', borderRadius:'var(--radius-md)', fontFamily:'var(--font-sans)', fontSize:13.5, background:'#fff', color:'var(--text-default)', outline:'none' }}>
        <option value="">Select…</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  const setAccess = (key) => (e) => {
    setReqError('');
    setAccessForm(prev => ({ ...prev, [key]: e && e.target ? e.target.value : e }));
  };

  const submitAccessRequest = async () => {
    setReqError('');
    if (!accessForm.full_name.trim() || !accessForm.employee_id.trim() || !accessForm.email.trim() || !accessForm.department || !accessForm.password) {
      setReqError('Please complete all required fields.');
      return;
    }
    if (accessForm.password !== accessForm.confirm_password) {
      setReqError('Password and confirm password must match.');
      return;
    }
    setReqLoading(true);
    try {
      if (!window.API) {
        await new Promise((resolve, reject) => {
          const el = document.createElement('script');
          el.src = `/screens/Data.jsx?t=${Date.now()}`;
          el.onload = resolve;
          el.onerror = () => reject(new Error('Request service failed to load. Please refresh the page.'));
          document.head.appendChild(el);
        });
      }
      await window.API.submitAccessRequest({
        employee_id: accessForm.employee_id.trim(),
        full_name: accessForm.full_name.trim(),
        email: accessForm.email.trim(),
        password: accessForm.password,
        department: accessForm.department,
        requested_role: 'requester',
        reason: null,
      });
      setReqSent(true);
      setAccessForm({ full_name: '', employee_id: '', email: '', department: '', requested_role: 'requester', password: '', confirm_password: '' });
    } catch (err) {
      setReqError(err.message || 'Could not submit access request.');
    } finally {
      setReqLoading(false);
    }
  };

  const ensureApi = async () => {
    if (!window.API) {
      await new Promise((resolve, reject) => {
        const el = document.createElement('script');
        el.src = `/screens/Data.jsx?t=${Date.now()}`;
        el.onload = resolve;
        el.onerror = () => reject(new Error('Authentication service failed to load. Please refresh the page.'));
        document.head.appendChild(el);
      });
    }
  };

  const recoverUsername = async () => {
    setResetErr('');
    setResetMsg('');
    setRecoveredUsername(null);
    if (!lookupInput.trim()) {
      setResetErr('Enter your registered email or employee ID.');
      return;
    }
    setRecoveryLoading(true);
    try {
      await ensureApi();
      const res = await window.API.forgotUsername(lookupInput.trim());
      setRecoveredUsername(res);
      setResetMsg(`Your username is ${res.employee_id}.`);
    } catch (err) {
      setResetErr(err.message || 'No matching active account was found.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const sendPasswordReset = async () => {
    setResetErr('');
    setResetMsg('');
    if (!resetEmployeeId.trim()) {
      setResetErr('Enter your employee ID.');
      return;
    }
    setRecoveryLoading(true);
    try {
      await ensureApi();
      const res = await window.API.forgotPassword(resetEmployeeId.trim(), resetEmail.trim());
      if (res.reset_token) setResetToken(res.reset_token);
      setSent(true);
      setResetMsg(res.message || 'Reset instructions sent.');
    } catch (err) {
      setResetErr(err.message || 'Could not start password reset.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const completePasswordReset = async () => {
    setResetErr('');
    setResetMsg('');
    if (!resetToken.trim() || !newPassword || !confirmNewPassword) {
      setResetErr('Enter reset token, new password, and confirmation.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetErr('New password and confirmation must match.');
      return;
    }
    setRecoveryLoading(true);
    try {
      await ensureApi();
      const res = await window.API.resetPassword(resetToken.trim(), newPassword);
      setResetMsg(res.message || 'Password reset successfully. Sign in with the new password.');
      setSent(false);
      setResetToken('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPw('');
      setMode('signin');
    } catch (err) {
      setResetErr(err.message || 'Could not reset password.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const renderNativeSelect = (label, value, onChange, options) => (
    <div>
      <Label>{label}</Label>
      <select value={value} onChange={onChange} style={{ width:'100%', height:38, padding:'0 10px', border:'1px solid var(--border-default)', borderRadius:'var(--radius-md)', fontFamily:'var(--font-sans)', fontSize:13.5, background:'#fff', color:'var(--text-default)', outline:'none' }}>
        <option value="">Select...</option>
        {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
      </select>
    </div>
  );

  const features = [
    { icon: 'wrench',        text: 'Tools tracked in real-time' },
    { icon: 'clipboard',     text: 'Digital requisitions & approvals' },
    { icon: 'activity',      text: 'Calibration & compliance records' },
  ];

  return (
    <div className="tims-login" style={{ height:'100%', display:'flex', borderTop:'var(--brand-accent-line)', overflow:'hidden' }}>

      {/* ── Left brand panel ─────────────────────────────────── */}
      <div className="tims-login-brand" style={{ width:'42%', minWidth:340, background:'var(--brand-black)', display:'flex', flexDirection:'column', padding:'52px 52px 36px', position:'relative', overflow:'hidden' }}>
        {/* Decorative blobs — always visible as background */}
        <div style={{ position:'absolute', top:-100, right:-100, width:360, height:360, borderRadius:'50%', background:'rgba(245,197,24,0.07)', animation:'lgnPulse 4.5s ease-in-out infinite' }} />
        <div style={{ position:'absolute', bottom:-80, left:-80, width:260, height:260, borderRadius:'50%', background:'rgba(245,197,24,0.05)', animation:'lgnPulse 5.5s ease-in-out 1s infinite' }} />
        {[[38,'52%',6,6,'lgnFloat 3s ease-in-out infinite'],[80,'68%',4,4,'lgnFloat 4s ease-in-out 0.7s infinite'],[28,'28%',3,3,'lgnFloat 3.5s ease-in-out 1.3s infinite']].map(([r,t,w,h,anim],i) => (
          <div key={i} style={{ position:'absolute', right:r, top:t, width:w, height:h, borderRadius:'50%', background:'rgba(245,197,24,0.45)', animation:anim, pointerEvents:'none' }} />
        ))}
        <div style={{ position:'absolute', bottom:120, right:36, width:80, height:80, borderRadius:'50%', border:'1px dashed rgba(245,197,24,0.12)', animation:'lgnSpin 20s linear infinite', pointerEvents:'none' }} />

        {ready && <div>
          {/* Logo */}
          <div className="lgn-left" style={{ animationDelay:'0s', marginBottom:44 }}>
            <Logo variant="login" logoSrc="/assets/ultratech-logo.png" />
          </div>

          {/* Label */}
          <div className="lgn-left" style={{ animationDelay:'0.08s', marginBottom:36 }}>
            <div style={{ fontSize:11.5, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--brand-yellow)' }}>Inventory Management System</div>
          </div>

          {/* Feature bullets */}
          <div className="lgn-left" style={{ animationDelay:'0.16s', display:'flex', flexDirection:'column', gap:14 }}>
            {features.map(f => (
              <div key={f.text} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:'var(--radius-md)', background:'rgba(245,197,24,0.1)', border:'1px solid rgba(245,197,24,0.16)', display:'grid', placeItems:'center', flexShrink:0 }}>
                  <Icon name={f.icon} size={15} color="var(--brand-yellow)" />
                </div>
                <span style={{ fontSize:13.5, color:'rgba(255,255,255,0.62)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>}

        <div style={{ marginTop:'auto', fontSize:11.5, color:'rgba(255,255,255,0.28)', letterSpacing:'0.04em' }}>
          © 2026 UltraTech Cement Ltd. — Aditya Birla Group
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────── */}
      <div className="tims-login-panel" style={{ flex:1, background:'#f5f6f8', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'28px 60px', overflowY:'hidden' }}>
        {ready && <div style={{ width:'100%', maxWidth:420 }}>

          {/* Sign In / Sign Up toggle */}
          {mode !== 'forgot' && (
            <div className="lgn-up" style={{ animationDelay:'0.05s', display:'flex', background:'#e8eaed', borderRadius:10, padding:4, marginBottom:30, gap:4 }}>
              {[['signin','Sign In'],['signup','Request Access']].map(([m, label]) => (
                <button key={m} onClick={() => { setMode(m); setSent(false); setLoginError(''); setReqError(''); }}
                  style={{ flex:1, padding:'10px 0', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'var(--font-sans)', fontSize:13.5, fontWeight:mode===m?700:400, color:mode===m?'#fff':'var(--text-muted)', background:mode===m?'var(--brand-black)':'transparent', transition:'all 0.2s' }}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* ── Sign In ── */}
          {mode === 'signin' && (
            <div className="lgn-up" key="signin" style={{ animationDelay:'0.1s' }}>
              <h2 style={{ margin:'0 0 5px', fontSize:23, fontWeight:800, color:'var(--text-strong)', letterSpacing:'-0.02em' }}>Welcome back</h2>
              <p style={{ margin:'0 0 26px', fontSize:13.5, color:'var(--text-muted)' }}>Sign in with your employee credentials.</p>
              <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:15 }}>
                <Input label="Employee ID" required value={empId} onChange={e => { setEmpId(e.target.value); setLoginError(''); }} placeholder="e.g. USR001" data-autofocus />
                <div style={{ position:'relative' }}>
                  <Input label="Password" type={show?'text':'password'} required value={pw} onChange={e => { setPw(e.target.value); setLoginError(''); }} placeholder="Enter your password" />
                  <button type="button" onClick={() => setShow(!show)} tabIndex={-1}
                    style={{ position:'absolute', right:10, top:30, border:'none', background:'transparent', color:'var(--text-subtle)', cursor:'pointer', display:'flex' }}>
                    <Icon name={show?'eye_off':'eye'} size={16} />
                  </button>
                </div>
                {loginError && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'var(--danger-bg)', border:'1px solid var(--danger-border,var(--danger-bg))', borderRadius:'var(--radius-md)' }}>
                    <Icon name="alert_triangle" size={14} color="var(--danger-solid)" style={{ flexShrink:0 }} />
                    <span style={{ fontSize:12.5, color:'var(--danger-text)', lineHeight:1.4 }}>{loginError}</span>
                  </div>
                )}
                <div style={{ textAlign:'right', marginTop:-6 }}>
                  <button type="button" onClick={() => setMode('forgot')}
                    style={{ border:'none', background:'transparent', color:'var(--text-muted)', fontSize:12.5, cursor:'pointer', fontFamily:'var(--font-sans)', textDecoration:'underline', textUnderlineOffset:3 }}>
                    Forgot username or password?
                  </button>
                </div>
                <Btn type="submit" disabled={loading} style={{ marginTop:4 }}>
                  {loading ? 'Signing in…' : 'Sign In →'}
                </Btn>
              </form>
              <p style={{ textAlign:'center', fontSize:11.5, color:'var(--text-subtle)', marginTop:22 }}>Authorised plant personnel only</p>
            </div>
          )}

          {/* ── Request Access ── */}
          {mode === 'signup' && (
            <div className="lgn-up" key="signup" style={{ animationDelay:'0.1s' }}>
              {reqSent ? (
                <div style={{ textAlign:'center' }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--success-bg)', display:'grid', placeItems:'center', margin:'0 auto 18px' }}>
                    <Icon name="check_circle" size={28} color="var(--success-solid)" />
                  </div>
                  <h2 style={{ margin:'0 0 8px', fontSize:22, fontWeight:800, color:'var(--text-strong)' }}>Request submitted!</h2>
                  <p style={{ margin:'0 0 24px', fontSize:13.5, color:'var(--text-muted)', lineHeight:1.55 }}>Your access request has been sent to the admin for review. You'll be notified once approved.</p>
                  <button onClick={() => { setMode('signin'); setReqSent(false); setReqError(''); }} style={{ width:'100%', padding:'10px', border:'1px solid var(--border-default)', borderRadius:'var(--radius-md)', background:'transparent', color:'var(--text-muted)', fontSize:13.5, fontFamily:'var(--font-sans)', cursor:'pointer' }}>Back to Sign In</button>
                </div>
              ) : (
                <>
                  <h2 style={{ margin:'0 0 5px', fontSize:23, fontWeight:800, color:'var(--text-strong)', letterSpacing:'-0.02em' }}>Request access</h2>
                  <p style={{ margin:'0 0 22px', fontSize:13.5, color:'var(--text-muted)' }}>An admin will review and approve your request before you can sign in.</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <Input label="Full Name" required placeholder="e.g. Anil Kumar" value={accessForm.full_name} onChange={setAccess('full_name')} />
                      <Input label="Employee ID" required placeholder="EMP-1011" value={accessForm.employee_id} onChange={setAccess('employee_id')} />
                    </div>
                    <Input label="Work Email" type="email" required placeholder="name@ultratech.com" value={accessForm.email} onChange={setAccess('email')} />
                    {renderNativeSelect('Department', accessForm.department, setAccess('department'), ['Maintenance','Mechanical','E&I','Civil','Process'])}
                    <Input label="Password" type="password" required placeholder="Create a password" value={accessForm.password} onChange={setAccess('password')} />
                    <Input label="Confirm Password" type="password" required placeholder="Re-enter password" value={accessForm.confirm_password} onChange={setAccess('confirm_password')} />
                    {reqError && (
                      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'var(--danger-bg)', border:'1px solid var(--danger-border,var(--danger-bg))', borderRadius:'var(--radius-md)' }}>
                        <Icon name="alert_triangle" size={14} color="var(--danger-solid)" style={{ flexShrink:0 }} />
                        <span style={{ fontSize:12.5, color:'var(--danger-text)', lineHeight:1.4 }}>{reqError}</span>
                      </div>
                    )}
                    <Btn style={{ marginTop:4 }} disabled={reqLoading} onClick={submitAccessRequest}>{reqLoading ? 'Submitting...' : 'Submit Request'}</Btn>
                  </div>
                </>
              )}
              {recoveredUsername && <div style={{ marginTop:12, padding:'10px 12px', background:'var(--success-bg)', border:'1px solid var(--success-border)', borderRadius:'var(--radius-md)', color:'var(--success-text)', fontSize:12.5, lineHeight:1.45 }}>Username: <b>{recoveredUsername.employee_id}</b><br />Account: {recoveredUsername.full_name}</div>}
              {(sent || resetToken) && (
                <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:14 }}>
                  <Input label="Reset Token" required value={resetToken} onChange={e => { setResetToken(e.target.value); setResetErr(''); }} placeholder="Paste token from email or message" />
                  <Input label="New Password" type="password" required value={newPassword} onChange={e => { setNewPassword(e.target.value); setResetErr(''); }} placeholder="Use upper, lower, number, special char" />
                  <Input label="Confirm New Password" type="password" required value={confirmNewPassword} onChange={e => { setConfirmNewPassword(e.target.value); setResetErr(''); }} placeholder="Re-enter new password" />
                  <Btn disabled={recoveryLoading} onClick={completePasswordReset}>{recoveryLoading ? 'Resetting...' : 'Reset Password'}</Btn>
                </div>
              )}
              {resetMsg && <div style={{ marginTop:12, padding:'10px 12px', background:'var(--success-bg)', border:'1px solid var(--success-border)', borderRadius:'var(--radius-md)', color:'var(--success-text)', fontSize:12.5, lineHeight:1.45 }}>{resetMsg}</div>}
              {resetErr && <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'var(--danger-bg)', border:'1px solid var(--danger-border,var(--danger-bg))', borderRadius:'var(--radius-md)' }}><Icon name="alert_triangle" size={14} color="var(--danger-solid)" style={{ flexShrink:0 }} /><span style={{ fontSize:12.5, color:'var(--danger-text)', lineHeight:1.4 }}>{resetErr}</span></div>}
            </div>
          )}

          {/* ── Forgot ── */}
          {mode === 'forgot' && (
            <div className="lgn-up" key="forgot" style={{ animationDelay:'0.05s' }}>
              <button onClick={() => { setMode('signin'); setSent(false); }}
                style={{ border:'none', background:'transparent', color:'var(--text-muted)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-sans)', display:'flex', alignItems:'center', gap:5, marginBottom:22, padding:0 }}
                onMouseEnter={e => e.currentTarget.style.color='var(--text-strong)'}
                onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
                ← Back to Sign In
              </button>
              <h2 style={{ margin:'0 0 5px', fontSize:23, fontWeight:800, color:'var(--text-strong)', letterSpacing:'-0.02em' }}>Reset credentials</h2>
              <p style={{ margin:'0 0 26px', fontSize:13.5, color:'var(--text-muted)', lineHeight:1.55 }}>
                Enter your Employee ID or registered email. We'll send reset instructions to your inbox.
              </p>
              {!sent ? (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <Input label="Employee ID or Email" required value={resetInput} onChange={e => { setResetInput(e.target.value); setResetErr(''); }} error={resetErr} placeholder="USR001 or name@ultratech.com" data-autofocus />
                  <Btn disabled={recoveryLoading} onClick={async () => {
                    if (!resetInput.trim()) { setResetErr('Please enter your Employee ID or email'); return; }
                    const value = resetInput.trim();
                    setRecoveryLoading(true);
                    setResetErr('');
                    setResetMsg('');
                    try {
                      await ensureApi();
                      if (value.includes('@')) {
                        const found = await window.API.forgotUsername(value);
                        setRecoveredUsername(found);
                        setResetMsg(`Your username is ${found.employee_id}.`);
                      } else {
                        const res = await window.API.forgotPassword(value, '');
                        if (res.reset_token) setResetToken(res.reset_token);
                        setSent(true);
                        setResetMsg(res.message || 'Reset instructions sent.');
                      }
                    } catch (err) {
                      setResetErr(err.message || 'Could not recover credentials.');
                    } finally {
                      setRecoveryLoading(false);
                    }
                  }}>{recoveryLoading ? 'Checking...' : 'Recover Credentials'}</Btn>
                </div>
              ) : (
                <div style={{ padding:'20px 22px', background:'var(--success-bg)', border:'1px solid var(--success-border)', borderRadius:'var(--radius-md)', display:'flex', gap:12, alignItems:'flex-start' }}>
                  <Icon name="check_circle" size={18} color="var(--success-solid)" style={{ flexShrink:0, marginTop:1 }} />
                  <div>
                    <div style={{ fontSize:13.5, fontWeight:600, color:'var(--success-text)', marginBottom:3 }}>Instructions sent</div>
                    <div style={{ fontSize:12.5, color:'var(--success-text)', opacity:0.8 }}>Check your registered email. Contact your plant admin if you don't receive it.</div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>}
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen });
