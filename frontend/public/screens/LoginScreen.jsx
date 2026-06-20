const NS_LOGIN = window.MTRSDesignSystemUltraTechCement_660dc9;

function LoginScreen({ onLogin }) {
  const { Logo, Input } = NS_LOGIN;
  const [mode, setMode] = React.useState('signin');
  const [empId, setEmpId] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState('');
  const [ready, setReady] = React.useState(false);

  const [recoveryLoading, setRecoveryLoading] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState('');
  const [resetToken, setResetToken] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
  const [resetMsg, setResetMsg] = React.useState('');
  const [resetErr, setResetErr] = React.useState('');
  const [resetRequested, setResetRequested] = React.useState(false);

  const [reqSent, setReqSent] = React.useState(false);
  const [reqLoading, setReqLoading] = React.useState(false);
  const [reqError, setReqError] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpVerified, setOtpVerified] = React.useState(false);
  const [otp, setOtp] = React.useState('');
  const [otpCooldown, setOtpCooldown] = React.useState(0);
  const [accessForm, setAccessForm] = React.useState({
    full_name: '',
    employee_id: '',
    email: '',
    mobile_number: '',
    department: '',
    requested_role: 'requester',
    reason: '',
    password: '',
    confirm_password: '',
  });

  React.useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = 'var(--brand-black)';
    return () => { document.body.style.background = prev; };
  }, []);

  React.useEffect(() => {
    const s = document.createElement('style');
    s.id = 'tims-login-anim';
    s.textContent = `
      @keyframes lgnUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      @keyframes lgnLeft { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
      @keyframes lgnPulse { 0%,100% { opacity:.18; transform:scale(1); } 50% { opacity:.18; transform:scale(1.06); } }
      @keyframes lgnFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
      @keyframes lgnSpin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      .lgn-up { animation: lgnUp 0.48s cubic-bezier(0.16,1,0.3,1) both; }
      .lgn-left { animation: lgnLeft 0.5s cubic-bezier(0.16,1,0.3,1) both; }
    `;
    if (!document.getElementById('tims-login-anim')) document.head.appendChild(s);
    return () => { const el = document.getElementById('tims-login-anim'); if (el) el.remove(); };
  }, []);

  React.useEffect(() => {
    let imgLoaded = false;
    let timerDone = false;
    const tryReady = () => { if (imgLoaded && timerDone) setReady(true); };
    const img = new Image();
    img.onload = img.onerror = () => { imgLoaded = true; tryReady(); };
    img.src = '/assets/ultratech-logo.png';
    const timer = setTimeout(() => { timerDone = true; tryReady(); }, 500);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search || '');
    const token = params.get('reset_token');
    if (token) {
      setMode('forgot');
      setResetToken(token);
      setResetRequested(false);
      setResetMsg('Enter a new password for your account.');
    }
  }, []);

  React.useEffect(() => {
    if (!otpCooldown) return undefined;
    const timer = setInterval(() => setOtpCooldown(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

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

  const friendly = (err, fallback) => {
    const msg = err && err.message ? err.message : fallback;
    return window.timsFriendlyError ? window.timsFriendlyError(msg, fallback) : msg;
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!empId.trim() || !pw) {
      setLoginError('Please enter your Employee ID and password.');
      return;
    }
    setLoading(true);
    try {
      await ensureApi();
      await window.API.login(empId.trim(), pw);
      await onLogin();
    } catch (err) {
      window.API?.logout?.();
      const msg = friendly(err, 'Invalid employee ID or password.');
      if (!/invalid employee id or password|incorrect employee id or password/i.test(msg)) {
        console.error('Login flow failed:', err);
      }
      setLoginError(msg);
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

  const Select = ({ label, value, onChange, options }) => (
    <div>
      <Label>{label}</Label>
      <select value={value} onChange={onChange} style={{ width:'100%', height:38, padding:'0 10px', border:'1px solid var(--border-default)', borderRadius:'var(--radius-md)', fontFamily:'var(--font-sans)', fontSize:13.5, background:'#fff', color:'var(--text-default)', outline:'none' }}>
        <option value="">Select...</option>
        {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
      </select>
    </div>
  );

  const Notice = ({ tone = 'danger', children }) => (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:tone === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)', border:`1px solid ${tone === 'success' ? 'var(--success-border)' : 'var(--danger-border,var(--danger-bg))'}`, borderRadius:'var(--radius-md)' }}>
      <Icon name={tone === 'success' ? 'check_circle' : 'alert_triangle'} size={14} color={tone === 'success' ? 'var(--success-solid)' : 'var(--danger-solid)'} style={{ flexShrink:0 }} />
      <span style={{ fontSize:12.5, color:tone === 'success' ? 'var(--success-text)' : 'var(--danger-text)', lineHeight:1.4 }}>{children}</span>
    </div>
  );

  const setAccess = (key) => (e) => {
    setReqError('');
    setOtpVerified(false);
    if (key !== 'mobile_number') setOtpSent(false);
    setAccessForm(prev => ({ ...prev, [key]: e && e.target ? e.target.value : e }));
  };

  const accessPayload = () => ({
    employee_id: accessForm.employee_id.trim(),
    full_name: accessForm.full_name.trim(),
    email: accessForm.email.trim(),
    mobile_number: accessForm.mobile_number.trim(),
    password: accessForm.password,
    department: accessForm.department,
    requested_role: accessForm.requested_role,
    reason: accessForm.reason.trim() || null,
  });

  const validateAccessForm = () => {
    if (!accessForm.full_name.trim() || !accessForm.employee_id.trim() || !accessForm.email.trim() || !accessForm.mobile_number.trim() || !accessForm.department || !accessForm.requested_role || !accessForm.password) {
      return 'Please complete all required fields.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accessForm.email.trim())) return 'Enter a valid work email address.';
    if (accessForm.password !== accessForm.confirm_password) return 'Password and confirm password must match.';
    return '';
  };

  const sendOtp = async () => {
    setReqError('');
    const validation = validateAccessForm();
    if (validation) {
      setReqError(validation);
      return;
    }
    setReqLoading(true);
    try {
      await ensureApi();
      await window.API.sendAccessOtp(accessPayload());
      setOtpSent(true);
      setOtpVerified(false);
      setOtpCooldown(30);
    } catch (err) {
      setReqError(friendly(err, 'Could not send OTP.'));
    } finally {
      setReqLoading(false);
    }
  };

  const verifyOtp = async () => {
    setReqError('');
    if (!otp.trim()) {
      setReqError('Enter the OTP sent to your mobile number.');
      return;
    }
    setReqLoading(true);
    try {
      await ensureApi();
      await window.API.verifyAccessOtp(accessForm.email.trim(), accessForm.mobile_number.trim(), otp.trim());
      setOtpVerified(true);
    } catch (err) {
      setReqError(friendly(err, 'Could not verify OTP.'));
    } finally {
      setReqLoading(false);
    }
  };

  const submitAccessRequest = async () => {
    setReqError('');
    const validation = validateAccessForm();
    if (validation) {
      setReqError(validation);
      return;
    }
    if (!otpVerified) {
      setReqError('Verify your mobile number before submitting the access request.');
      return;
    }
    setReqLoading(true);
    try {
      await ensureApi();
      await window.API.submitAccessRequest(accessPayload());
      setReqSent(true);
      setAccessForm({ full_name: '', employee_id: '', email: '', mobile_number: '', department: '', requested_role: 'requester', reason: '', password: '', confirm_password: '' });
      setOtp('');
      setOtpSent(false);
      setOtpVerified(false);
    } catch (err) {
      setReqError(friendly(err, 'Could not submit access request.'));
    } finally {
      setReqLoading(false);
    }
  };

  const sendPasswordReset = async () => {
    setResetErr('');
    setResetMsg('');
    if (!resetEmail.trim()) {
      setResetErr('Enter your registered email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) {
      setResetErr('Enter a valid email address.');
      return;
    }
    setRecoveryLoading(true);
    try {
      await ensureApi();
      const res = await window.API.forgotPassword(resetEmail.trim());
      setResetToken('');
      setResetRequested(true);
      if (res.delivery_configured === false) {
        setResetErr(res.message || 'Email delivery is not configured. Please contact admin.');
      } else {
        setResetMsg(res.message || 'If this email is registered, reset instructions have been sent.');
      }
    } catch (err) {
      setResetErr(friendly(err, 'Could not start password reset.'));
    } finally {
      setRecoveryLoading(false);
    }
  };

  const completePasswordReset = async () => {
    setResetErr('');
    setResetMsg('');
    if (!resetToken.trim()) {
      setResetErr('Open the reset link from your email, then enter your new password.');
      return;
    }
    if (!newPassword || !confirmNewPassword) {
      setResetErr('Enter and confirm your new password.');
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
      setResetToken('');
      setNewPassword('');
      setConfirmNewPassword('');
      setResetRequested(false);
      setPw('');
      setMode('signin');
      if (window.history && window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err) {
      setResetErr(friendly(err, 'Could not reset password. The link may be expired.'));
    } finally {
      setRecoveryLoading(false);
    }
  };

  const features = [
    { icon: 'wrench', text: 'Tools tracked in real-time' },
    { icon: 'clipboard', text: 'Digital requisitions & approvals' },
    { icon: 'activity', text: 'Calibration & compliance records' },
  ];

  return (
    <div className="tims-login" style={{ height:'100dvh', minHeight:0, display:'flex', borderTop:'var(--brand-accent-line)', overflow:'hidden' }}>
      <div className="tims-login-brand" style={{ width:'42%', minWidth:340, background:'var(--brand-black)', display:'flex', flexDirection:'column', padding:'52px 52px 36px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-100, right:-100, width:360, height:360, borderRadius:'50%', background:'rgba(245,197,24,0.07)', animation:'lgnPulse 4.5s ease-in-out infinite' }} />
        <div style={{ position:'absolute', bottom:-80, left:-80, width:260, height:260, borderRadius:'50%', background:'rgba(245,197,24,0.05)', animation:'lgnPulse 5.5s ease-in-out 1s infinite' }} />
        {[[38,'52%',6,6,'lgnFloat 3s ease-in-out infinite'],[80,'68%',4,4,'lgnFloat 4s ease-in-out 0.7s infinite'],[28,'28%',3,3,'lgnFloat 3.5s ease-in-out 1.3s infinite']].map(([r,t,w,h,anim],i) => (
          <div key={i} style={{ position:'absolute', right:r, top:t, width:w, height:h, borderRadius:'50%', background:'rgba(245,197,24,0.45)', animation:anim, pointerEvents:'none' }} />
        ))}
        <div style={{ position:'absolute', bottom:120, right:36, width:80, height:80, borderRadius:'50%', border:'1px dashed rgba(245,197,24,0.12)', animation:'lgnSpin 20s linear infinite', pointerEvents:'none' }} />

        {ready && <div>
          <div className="lgn-left" style={{ animationDelay:'0s', marginBottom:44 }}>
            <Logo variant="login" logoSrc="/assets/ultratech-logo.png" />
          </div>
          <div className="lgn-left" style={{ animationDelay:'0.08s', marginBottom:36 }}>
            <div style={{ fontSize:11.5, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--brand-yellow)' }}>Inventory Management System</div>
          </div>
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
          (c) 2026 UltraTech Cement Ltd. - Aditya Birla Group
        </div>
      </div>

      <div className="tims-login-panel" style={{ flex:1, minHeight:0, background:'#f5f6f8', display:'flex', flexDirection:'column', justifyContent:mode === 'signin' ? 'center' : 'flex-start', alignItems:'center', padding:mode === 'signup' ? '24px 60px 36px' : '28px 60px', overflowY:'auto', overflowX:'hidden' }}>
        {ready && <div style={{ width:'100%', maxWidth:520, paddingBottom:mode === 'signup' ? 16 : 0 }}>
          {mode !== 'forgot' && (
            <div className="lgn-up" style={{ animationDelay:'0.05s', display:'flex', background:'#e8eaed', borderRadius:10, padding:4, marginBottom:30, gap:4 }}>
              {[['signin','Sign In'],['signup','Request Access']].map(([m, label]) => (
                <button key={m} onClick={() => { setMode(m); setLoginError(''); setReqError(''); }}
                  style={{ flex:1, padding:'10px 0', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'var(--font-sans)', fontSize:13.5, fontWeight:mode===m?700:400, color:mode===m?'#fff':'var(--text-muted)', background:mode===m?'var(--brand-black)':'transparent', transition:'all 0.2s' }}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {mode === 'signin' && (
            <div className="lgn-up" key="signin" style={{ animationDelay:'0.1s', maxWidth:420, margin:'0 auto' }}>
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
                {loginError && <Notice>{loginError}</Notice>}
                <div style={{ textAlign:'right', marginTop:-6 }}>
                  <button type="button" onClick={() => setMode('forgot')}
                    style={{ border:'none', background:'transparent', color:'var(--text-muted)', fontSize:12.5, cursor:'pointer', fontFamily:'var(--font-sans)', textDecoration:'underline', textUnderlineOffset:3 }}>
                    Forgot username or password?
                  </button>
                </div>
                <Btn type="submit" disabled={loading} style={{ marginTop:4 }}>
                  {loading ? 'Signing in...' : 'Sign In ->'}
                </Btn>
              </form>
              <p style={{ textAlign:'center', fontSize:11.5, color:'var(--text-subtle)', marginTop:22 }}>Authorised plant personnel only</p>
            </div>
          )}

          {mode === 'signup' && (
            <div className="lgn-up" key="signup" style={{ animationDelay:'0.1s' }}>
              {reqSent ? (
                <div style={{ textAlign:'center', maxWidth:420, margin:'0 auto' }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--success-bg)', display:'grid', placeItems:'center', margin:'0 auto 18px' }}>
                    <Icon name="check_circle" size={28} color="var(--success-solid)" />
                  </div>
                  <h2 style={{ margin:'0 0 8px', fontSize:22, fontWeight:800, color:'var(--text-strong)' }}>Request submitted!</h2>
                  <p style={{ margin:'0 0 24px', fontSize:13.5, color:'var(--text-muted)', lineHeight:1.55 }}>Your verified access request has been sent to the admin for review.</p>
                  <button onClick={() => { setMode('signin'); setReqSent(false); setReqError(''); }} style={{ width:'100%', padding:'10px', border:'1px solid var(--border-default)', borderRadius:'var(--radius-md)', background:'transparent', color:'var(--text-muted)', fontSize:13.5, fontFamily:'var(--font-sans)', cursor:'pointer' }}>Back to Sign In</button>
                </div>
              ) : (
                <>
                  <h2 style={{ margin:'0 0 5px', fontSize:23, fontWeight:800, color:'var(--text-strong)', letterSpacing:'-0.02em' }}>Request access</h2>
                  <p style={{ margin:'0 0 20px', fontSize:13.5, color:'var(--text-muted)' }}>Verify your mobile number, then admin approval activates the account.</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <Input label="Full Name" required placeholder="e.g. Anil Kumar" value={accessForm.full_name} onChange={setAccess('full_name')} />
                      <Input label="Employee ID" required placeholder="EMP1011" value={accessForm.employee_id} onChange={setAccess('employee_id')} />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <Input label="Work Email" type="email" required placeholder="name@ultratech.com" value={accessForm.email} onChange={setAccess('email')} />
                      <Input label="Mobile Number" required placeholder="9876543210" value={accessForm.mobile_number} onChange={setAccess('mobile_number')} />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <Select label="Department" value={accessForm.department} onChange={setAccess('department')} options={['Maintenance','Mechanical','E&I','Civil','Process']} />
                      <Select label="Requested Role" value={accessForm.requested_role} onChange={setAccess('requested_role')} options={[{value:'requester',label:'Requester'},{value:'maintenance_staff',label:'Staff'},{value:'dept_head',label:'Head'}]} />
                    </div>
                    <Input label="Reason" placeholder="Access reason or designation" value={accessForm.reason} onChange={setAccess('reason')} />
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <Input label="Password" type="password" required placeholder="Create a password" value={accessForm.password} onChange={setAccess('password')} />
                      <Input label="Confirm Password" type="password" required placeholder="Re-enter password" value={accessForm.confirm_password} onChange={setAccess('confirm_password')} />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) auto auto', gap:10, alignItems:'end' }}>
                      <Input label="Mobile OTP" value={otp} onChange={e => { setOtp(e.target.value); setReqError(''); }} placeholder={otpSent ? 'Enter OTP' : 'Send OTP first'} />
                      <button type="button" disabled={reqLoading || otpCooldown > 0} onClick={sendOtp}
                        style={{ height:38, padding:'0 12px', border:'1px solid var(--border-default)', borderRadius:'var(--radius-md)', background:'var(--surface-card)', color:'var(--text-default)', fontFamily:'var(--font-sans)', fontSize:12.5, fontWeight:700, cursor:reqLoading || otpCooldown > 0 ? 'default' : 'pointer', whiteSpace:'nowrap' }}>
                        {otpCooldown > 0 ? `Resend ${otpCooldown}s` : otpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                      <button type="button" disabled={reqLoading || !otpSent || otpVerified} onClick={verifyOtp}
                        style={{ height:38, padding:'0 12px', border:'none', borderRadius:'var(--radius-md)', background:otpVerified ? 'var(--success-bg)' : 'var(--brand-black)', color:otpVerified ? 'var(--success-text)' : '#fff', fontFamily:'var(--font-sans)', fontSize:12.5, fontWeight:700, cursor:reqLoading || !otpSent || otpVerified ? 'default' : 'pointer', whiteSpace:'nowrap' }}>
                        {otpVerified ? 'Verified' : 'Verify'}
                      </button>
                    </div>
                    {otpSent && !otpVerified && <Notice tone="success">OTP sent to your mobile number.</Notice>}
                    {otpVerified && <Notice tone="success">Mobile number verified.</Notice>}
                    {reqError && <Notice>{reqError}</Notice>}
                    <Btn style={{ marginTop:4 }} disabled={reqLoading || !otpVerified} onClick={submitAccessRequest}>{reqLoading ? 'Working...' : 'Submit Request'}</Btn>
                  </div>
                </>
              )}
            </div>
          )}

          {mode === 'forgot' && (
            <div className="lgn-up" key="forgot" style={{ animationDelay:'0.05s', maxWidth:420, margin:'0 auto' }}>
              <button onClick={() => { setMode('signin'); setResetErr(''); setResetMsg(''); }}
                style={{ border:'none', background:'transparent', color:'var(--text-muted)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-sans)', display:'flex', alignItems:'center', gap:5, marginBottom:22, padding:0 }}>
                Back to Sign In
              </button>
              <h2 style={{ margin:'0 0 5px', fontSize:23, fontWeight:800, color:'var(--text-strong)', letterSpacing:'-0.02em' }}>Reset password</h2>
              <p style={{ margin:'0 0 22px', fontSize:13.5, color:'var(--text-muted)', lineHeight:1.55 }}>
                {resetToken ? 'Create a new password from the secure reset link sent to your email.' : 'Enter your registered email. If it matches an active account, reset instructions will be sent.'}
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {!resetToken && (
                  <>
                    <Input label="Registered Email" required type="email" value={resetEmail} onChange={e => { setResetEmail(e.target.value); setResetErr(''); }} error={resetErr && !resetRequested ? resetErr : ''} placeholder="name@ultratech.com" data-autofocus />
                    <Btn disabled={recoveryLoading} onClick={sendPasswordReset}>{recoveryLoading ? 'Sending...' : 'Send Reset Link'}</Btn>
                  </>
                )}
                {resetToken && (
                  <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:4 }}>
                    <Input label="New Password" type="password" required value={newPassword} onChange={e => { setNewPassword(e.target.value); setResetErr(''); }} placeholder="Use upper, lower, number, special char" />
                    <Input label="Confirm New Password" type="password" required value={confirmNewPassword} onChange={e => { setConfirmNewPassword(e.target.value); setResetErr(''); }} placeholder="Re-enter new password" />
                    <Btn disabled={recoveryLoading} onClick={completePasswordReset}>{recoveryLoading ? 'Resetting...' : 'Reset Password'}</Btn>
                  </div>
                )}
                {resetMsg && <Notice tone="success">{resetMsg}</Notice>}
                {resetErr && <Notice>{resetErr}</Notice>}
              </div>
            </div>
          )}
        </div>}
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen });
