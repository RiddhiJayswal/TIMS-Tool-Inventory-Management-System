/* @ds-bundle: {"format":3,"namespace":"MTRSDesignSystemUltraTechCement_660dc9","components":[{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"Endorsement","sourcePath":"components/brand/Logo.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"EmptyState","sourcePath":"components/core/EmptyState.jsx"},{"name":"MetricCard","sourcePath":"components/core/MetricCard.jsx"},{"name":"PageHeader","sourcePath":"components/core/PageHeader.jsx"},{"name":"Spinner","sourcePath":"components/core/Spinner.jsx"},{"name":"PageLoader","sourcePath":"components/core/Spinner.jsx"},{"name":"STATUS_MAP","sourcePath":"components/core/StatusBadge.jsx"},{"name":"StatusBadge","sourcePath":"components/core/StatusBadge.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"Tabs","sourcePath":"components/data/Tabs.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Label","sourcePath":"components/forms/Input.jsx"},{"name":"Help","sourcePath":"components/forms/Input.jsx"},{"name":"RadioGroup","sourcePath":"components/forms/RadioGroup.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Toggle","sourcePath":"components/forms/Toggle.jsx"},{"name":"ConfirmDialog","sourcePath":"components/overlays/ConfirmDialog.jsx"},{"name":"Modal","sourcePath":"components/overlays/Modal.jsx"},{"name":"SlideOver","sourcePath":"components/overlays/SlideOver.jsx"}],"sourceHashes":{"components/brand/Logo.jsx":"82310c405f15","components/core/Badge.jsx":"71352f7a9220","components/core/Button.jsx":"94a52f281679","components/core/Card.jsx":"00187570c12d","components/core/EmptyState.jsx":"d680e7499da2","components/core/MetricCard.jsx":"6caa1df71d40","components/core/PageHeader.jsx":"e8542dc55b3e","components/core/Spinner.jsx":"3cfe3b12848e","components/core/StatusBadge.jsx":"ea51b2479005","components/data/DataTable.jsx":"0b5a21329b0a","components/data/Tabs.jsx":"295074b30061","components/feedback/Toast.jsx":"93fc7761bbf9","components/forms/Checkbox.jsx":"e0f38e6d52d6","components/forms/Input.jsx":"e7ce05e2758b","components/forms/RadioGroup.jsx":"b88032f17ae6","components/forms/Select.jsx":"b42813059b0b","components/forms/Textarea.jsx":"c65f2baeb536","components/forms/Toggle.jsx":"a33e3f2a13a0","components/overlays/ConfirmDialog.jsx":"75bf56ba7d1a","components/overlays/Modal.jsx":"c8455b1342a7","components/overlays/SlideOver.jsx":"fa75c4c49c5a","ui_kits/mtrs/AppShell.jsx":"22f8d8eca72b","ui_kits/mtrs/ApprovalsScreen.jsx":"4ea42f85e19f","ui_kits/mtrs/CalibrationScreen.jsx":"a79e2ed92c7b","ui_kits/mtrs/DashboardScreen.jsx":"eb8efe622c98","ui_kits/mtrs/Data.jsx":"78af82743d7e","ui_kits/mtrs/Icons.jsx":"ee6fe3cc4e69","ui_kits/mtrs/IssuanceScreen.jsx":"b088f42078c5","ui_kits/mtrs/LoginScreen.jsx":"fd5fcf01bcb3","ui_kits/mtrs/ReportsScreen.jsx":"24a56de7b752","ui_kits/mtrs/RequisitionsScreen.jsx":"ded7c89d75f8","ui_kits/mtrs/ReturnsScreen.jsx":"2c688e6db336","ui_kits/mtrs/StorageBinsScreen.jsx":"1eb3d17d0f13","ui_kits/mtrs/ToolsScreen.jsx":"aee01adea569","ui_kits/mtrs/UsersScreen.jsx":"408384d77eae"},"inlinedExternals":[],"unexposedExports":[{"name":"fieldShell","sourcePath":"components/forms/Input.jsx"},{"name":"useOverlay","sourcePath":"components/overlays/Modal.jsx"}]} */

(() => {

const __ds_ns = (window.MTRSDesignSystemUltraTechCement_660dc9 = window.MTRSDesignSystemUltraTechCement_660dc9 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Logo.jsx
try { (() => {
/**
 * MTRS brand lockup — pairs the official UltraTech / Aditya Birla logo asset
 * with the MTRS product wordmark. The logo image carries the brand red + yellow;
 * MTRS chrome stays black + (sparing) yellow elsewhere.
 *
 * `logoSrc` must point at the UltraTech logo PNG relative to the consuming page
 * (e.g. "../../assets/ultratech-logo.png" from a component card directory).
 */
function Logo({
  variant = 'sidebar',
  logoSrc = 'assets/ultratech-logo.png',
  showEndorsement = true
}) {
  const onDark = variant === 'sidebar' || variant === 'login';
  const big = variant === 'login';
  const imgH = big ? 96 : variant === 'mark' ? 40 : 40;
  const titleColor = onDark ? 'var(--brand-on-black)' : 'var(--text-strong)';
  const subColor = onDark ? 'var(--text-on-dark-muted)' : 'var(--text-muted)';
  const Img = /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: "UltraTech Cement \u2014 an Aditya Birla Group company",
    style: {
      height: imgH,
      width: 'auto',
      display: 'block',
      flexShrink: 0
    }
  });
  if (variant === 'mark') return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 7,
      padding: '3px 5px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, Img);
  if (big) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }
    }, Img, /*#__PURE__*/React.createElement("div", {
      style: {
        paddingLeft: 16,
        borderLeft: `1px solid ${onDark ? 'rgba(255,255,255,0.18)' : 'var(--border-default)'}`,
        lineHeight: 1.05
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-sans)',
        fontWeight: 800,
        letterSpacing: '0.02em',
        fontSize: 32,
        color: titleColor
      }
    }, "TIMS"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        color: subColor,
        marginTop: 4,
        fontWeight: 500
      }
    }, "Tool Inventory Management System")));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: "UltraTech Cement \u2014 an Aditya Birla Group company",
    style: {
      height: 38,
      width: 'auto',
      objectFit: 'contain',
      display: 'block',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingLeft: 10,
      borderLeft: `1px solid ${onDark ? 'rgba(255,255,255,0.18)' : 'var(--border-default)'}`,
      lineHeight: 1.1,
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 800,
      letterSpacing: '0.02em',
      fontSize: 16,
      color: titleColor
    }
  }, "TIMS"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: subColor,
      marginTop: 2,
      fontWeight: 500,
      lineHeight: 1.35
    }
  }, "Tool Inventory Management System")));
}

/** Small endorsement line: "An Aditya Birla Group company". */
function Endorsement({
  onDark = false
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      letterSpacing: '0.04em',
      color: onDark ? 'var(--text-on-dark-muted)' : 'var(--text-muted)'
    }
  }, "An Aditya Birla Group company");
}
Object.assign(__ds_scope, { Logo, Endorsement });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
/** Generic badge / tag / count pill. For domain statuses use StatusBadge instead. */
function Badge({
  children,
  tone = 'neutral',
  variant = 'soft',
  icon = null,
  style = {}
}) {
  const TONE = {
    success: {
      solid: 'var(--success-solid)',
      bg: 'var(--success-bg)',
      text: 'var(--success-text)',
      border: 'var(--success-border)'
    },
    warning: {
      solid: 'var(--warning-solid)',
      bg: 'var(--warning-bg)',
      text: 'var(--warning-text)',
      border: 'var(--warning-border)'
    },
    danger: {
      solid: 'var(--danger-solid)',
      bg: 'var(--danger-bg)',
      text: 'var(--danger-text)',
      border: 'var(--danger-border)'
    },
    info: {
      solid: 'var(--info-solid)',
      bg: 'var(--info-bg)',
      text: 'var(--info-text)',
      border: 'var(--info-border)'
    },
    neutral: {
      solid: 'var(--brand-black)',
      bg: 'var(--neutral-bg)',
      text: 'var(--neutral-text)',
      border: 'var(--neutral-border)'
    },
    accent: {
      solid: 'var(--brand-yellow)',
      bg: 'var(--role-admin-bg)',
      text: 'var(--role-admin-text)',
      border: 'var(--warning-border)'
    }
  };
  const t = TONE[tone] || TONE.neutral;
  const solid = variant === 'solid';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 'var(--radius-pill)',
      background: solid ? t.solid : t.bg,
      color: solid ? tone === 'accent' ? 'var(--brand-on-yellow)' : '#fff' : t.text,
      border: solid ? '1px solid transparent' : `1px solid ${t.border}`,
      fontFamily: 'var(--font-sans)',
      fontSize: 11,
      fontWeight: 600,
      lineHeight: 1.2,
      whiteSpace: 'nowrap',
      ...style
    }
  }, icon, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * MTRS Button — the one button primitive used everywhere.
 * Black is the workhorse fill; yellow is never a button background.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  iconRight = null,
  type = 'button',
  fullWidth = false,
  onClick,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      height: 32,
      padding: '0 12px',
      fontSize: 13,
      gap: 6
    },
    md: {
      height: 38,
      padding: '0 16px',
      fontSize: 14,
      gap: 8
    }
  };
  const s = sizes[size] || sizes.md;
  const variants = {
    primary: {
      background: 'var(--brand-black)',
      color: 'var(--brand-on-black)',
      border: '1px solid var(--brand-black)'
    },
    secondary: {
      background: 'var(--surface-card)',
      color: 'var(--text-default)',
      border: '1px solid var(--border-default)'
    },
    danger: {
      background: 'var(--danger-solid)',
      color: '#fff',
      border: '1px solid var(--danger-solid)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-default)',
      border: '1px solid transparent'
    }
  };
  const v = variants[variant] || variants.primary;
  const isDisabled = disabled || loading;
  const hoverBg = {
    primary: 'var(--brand-black-hover)',
    secondary: 'var(--surface-raised)',
    danger: '#B91C1C',
    ghost: 'var(--surface-raised)'
  }[variant];
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: isDisabled,
    onClick: onClick,
    onMouseEnter: e => {
      if (!isDisabled) e.currentTarget.style.background = hoverBg;
    },
    onMouseLeave: e => {
      if (!isDisabled) e.currentTarget.style.background = v.background;
    },
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      height: s.height,
      padding: s.padding,
      width: fullWidth ? '100%' : 'auto',
      fontFamily: 'var(--font-sans)',
      fontSize: s.fontSize,
      fontWeight: 600,
      lineHeight: 1,
      borderRadius: 'var(--radius-md)',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.55 : 1,
      transition: 'background var(--duration-fast) var(--ease-standard)',
      whiteSpace: 'nowrap',
      ...v,
      ...style
    }
  }, rest), loading && /*#__PURE__*/React.createElement(Spinner, {
    size: s.fontSize
  }), !loading && icon, children, !loading && iconRight);
}
function Spinner({
  size = 14
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    style: {
      animation: 'mtrs-spin 0.7s linear infinite'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9",
    stroke: "currentColor",
    strokeWidth: "3",
    opacity: "0.25"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 12a9 9 0 0 0-9-9",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("style", null, `@keyframes mtrs-spin{to{transform:rotate(360deg)}}`));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
/** Resting surface — the base container for panels, tables and forms. */
function Card({
  children,
  title,
  actions,
  padded = true,
  style = {},
  bodyStyle = {}
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-resting)',
      overflow: 'hidden',
      ...style
    }
  }, (title || actions) && /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      padding: '14px 20px',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, typeof title === 'string' ? /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 'var(--type-card-title-size)',
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, title) : title, actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, actions)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: padded ? '16px 20px' : 0,
      ...bodyStyle
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/EmptyState.jsx
try { (() => {
/** Empty / zero-result state. Stays informative — icon, message, optional action. */
function EmptyState({
  icon = null,
  title,
  message = null,
  action = null,
  tone = 'neutral',
  compact = false
}) {
  const color = tone === 'success' ? 'var(--success-solid)' : 'var(--text-subtle)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 8,
      padding: compact ? '24px 16px' : '48px 24px',
      color: 'var(--text-muted)'
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      color,
      opacity: 0.7,
      marginBottom: 2
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: tone === 'success' ? 'var(--success-text)' : 'var(--text-default)'
    }
  }, title), message && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)',
      maxWidth: 360
    }
  }, message), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, action));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/core/MetricCard.jsx
try { (() => {
/** Dashboard metric tile. Big figure + label + optional icon, with semantic emphasis. */
function MetricCard({
  label,
  value,
  icon = null,
  tone = 'default',
  subtext = null,
  action = null
}) {
  const TONE = {
    default: {
      border: 'var(--border-default)',
      bg: 'var(--surface-card)',
      fig: 'var(--text-strong)',
      chipBg: 'var(--surface-sunken)',
      chipFg: 'var(--text-muted)'
    },
    danger: {
      border: 'var(--danger-border)',
      bg: 'var(--danger-bg)',
      fig: 'var(--danger-text)',
      chipBg: '#fff',
      chipFg: 'var(--danger-solid)'
    },
    warning: {
      border: 'var(--warning-border)',
      bg: 'var(--warning-bg)',
      fig: 'var(--warning-text)',
      chipBg: '#fff',
      chipFg: 'var(--warning-solid)'
    },
    info: {
      border: 'var(--info-border)',
      bg: 'var(--info-bg)',
      fig: 'var(--info-text)',
      chipBg: '#fff',
      chipFg: 'var(--info-solid)'
    },
    success: {
      border: 'var(--success-border)',
      bg: 'var(--success-bg)',
      fig: 'var(--success-text)',
      chipBg: '#fff',
      chipFg: 'var(--success-solid)'
    }
  };
  const t = TONE[tone] || TONE.default;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      background: t.bg,
      border: `1px solid ${t.border}`,
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-resting)',
      padding: '16px 18px'
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 38,
      height: 38,
      flexShrink: 0,
      borderRadius: 'var(--radius-md)',
      background: t.chipBg,
      color: t.chipFg
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--type-metric-size)',
      lineHeight: 'var(--type-metric-lh)',
      fontWeight: 700,
      color: t.fig,
      fontVariantNumeric: 'tabular-nums'
    }
  }, value ?? '—'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, label), subtext && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-subtle)',
      marginTop: 4
    }
  }, subtext), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, action)));
}
Object.assign(__ds_scope, { MetricCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/MetricCard.jsx", error: String((e && e.message) || e) }); }

// components/core/PageHeader.jsx
try { (() => {
/** Top-of-page header: title + optional subtitle, right-aligned primary action. */
function PageHeader({
  title,
  subtitle = null,
  actions = null,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 4,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--type-page-title-size)',
      lineHeight: 'var(--type-page-title-lh)',
      fontWeight: 700,
      color: 'var(--text-strong)',
      letterSpacing: '-0.01em'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 13.5,
      color: 'var(--text-muted)'
    }
  }, subtitle)), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexShrink: 0
    }
  }, actions));
}
Object.assign(__ds_scope, { PageHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/PageHeader.jsx", error: String((e && e.message) || e) }); }

// components/core/Spinner.jsx
try { (() => {
/** Spinner + page-level loading state. */
function Spinner({
  size = 18,
  color = 'currentColor',
  label = null
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    style: {
      animation: 'mtrs-spin 0.7s linear infinite'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9",
    stroke: color,
    strokeWidth: "3",
    opacity: "0.2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 12a9 9 0 0 0-9-9",
    stroke: color,
    strokeWidth: "3",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("style", null, `@keyframes mtrs-spin{to{transform:rotate(360deg)}}`)), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, label));
}

/** Full-area loading block, e.g. while a page fetches. */
function PageLoader({
  label = 'Loading…'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      placeItems: 'center',
      minHeight: 240
    }
  }, /*#__PURE__*/React.createElement(Spinner, {
    size: 22,
    label: label
  }));
}
Object.assign(__ds_scope, { Spinner, PageLoader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Spinner.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusBadge.jsx
try { (() => {
/* Canonical MTRS status vocabulary → semantic token + icon + label.
   Status is NEVER conveyed by colour alone: each pairs colour with an icon AND text. */
const ICONS = {
  check: /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  }),
  clock: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7v5l3 2"
  })),
  alert: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 9v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 17h.01"
  })),
  x: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m6 6 12 12"
  })),
  arrow: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m12 5 7 7-7 7"
  })),
  dot: /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "5"
  }),
  ban: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m4.9 4.9 14.2 14.2"
  })),
  partial: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 3a9 9 0 0 1 0 18z",
    fill: "currentColor",
    stroke: "none"
  }))
};
const STATUS_MAP = {
  // Requisition
  pending: {
    tone: 'warning',
    icon: 'clock',
    label: 'Pending'
  },
  approved: {
    tone: 'info',
    icon: 'check',
    label: 'Approved'
  },
  rejected: {
    tone: 'danger',
    icon: 'x',
    label: 'Rejected'
  },
  issued: {
    tone: 'info',
    icon: 'arrow',
    label: 'Issued'
  },
  returned: {
    tone: 'success',
    icon: 'check',
    label: 'Returned'
  },
  cancelled: {
    tone: 'neutral',
    icon: 'ban',
    label: 'Cancelled'
  },
  // Tool
  active: {
    tone: 'success',
    icon: 'check',
    label: 'Active'
  },
  calibration_due: {
    tone: 'warning',
    icon: 'alert',
    label: 'Calibration Due'
  },
  damaged: {
    tone: 'danger',
    icon: 'alert',
    label: 'Damaged'
  },
  written_off: {
    tone: 'neutral',
    icon: 'ban',
    label: 'Written Off'
  },
  // Return condition
  good: {
    tone: 'success',
    icon: 'check',
    label: 'Good'
  },
  partial: {
    tone: 'warning',
    icon: 'partial',
    label: 'Partial'
  },
  missing: {
    tone: 'danger',
    icon: 'alert',
    label: 'Missing'
  },
  // Days / overdue
  on_time: {
    tone: 'success',
    icon: 'check',
    label: 'On Time'
  },
  due_today: {
    tone: 'warning',
    icon: 'clock',
    label: 'Due Today'
  },
  overdue: {
    tone: 'danger',
    icon: 'alert',
    label: 'Overdue'
  }
};
const TONE = {
  success: {
    bg: 'var(--success-bg)',
    text: 'var(--success-text)',
    border: 'var(--success-border)'
  },
  warning: {
    bg: 'var(--warning-bg)',
    text: 'var(--warning-text)',
    border: 'var(--warning-border)'
  },
  danger: {
    bg: 'var(--danger-bg)',
    text: 'var(--danger-text)',
    border: 'var(--danger-border)'
  },
  info: {
    bg: 'var(--info-bg)',
    text: 'var(--info-text)',
    border: 'var(--info-border)'
  },
  neutral: {
    bg: 'var(--neutral-bg)',
    text: 'var(--neutral-text)',
    border: 'var(--neutral-border)'
  }
};

/**
 * StatusBadge — the one way to render any MTRS status.
 * Colour + icon + label together, never colour alone.
 */
function StatusBadge({
  status,
  size = 'md'
}) {
  const cfg = STATUS_MAP[status] || {
    tone: 'neutral',
    icon: 'dot',
    label: String(status || '—').replace(/_/g, ' ')
  };
  const t = TONE[cfg.tone];
  const px = size === 'sm' ? {
    pad: '2px 8px',
    font: 11,
    ico: 11
  } : {
    pad: '3px 10px',
    font: 12,
    ico: 13
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: px.pad,
      borderRadius: 'var(--radius-pill)',
      background: t.bg,
      color: t.text,
      border: `1px solid ${t.border}`,
      fontFamily: 'var(--font-sans)',
      fontSize: px.font,
      fontWeight: 600,
      lineHeight: 1.1,
      whiteSpace: 'nowrap',
      textTransform: 'capitalize'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: px.ico,
    height: px.ico,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flexShrink: 0
    }
  }, ICONS[cfg.icon] || ICONS.dot), cfg.label);
}
Object.assign(__ds_scope, { STATUS_MAP, StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
/**
 * DataTable shell — sticky header, hover, optional zebra, right-aligned
 * numeric/currency, horizontal scroll on small screens, baked-in loading + empty states.
 *
 * columns: [{ key, header, align?, mono?, nowrap?, width?, render?(row) }]
 */
function DataTable({
  columns = [],
  rows = [],
  loading = false,
  empty = null,
  onRowClick = null,
  getRowTone = null,
  zebra = false,
  rowKey = (r, i) => r.id ?? i,
  stickyHeader = true,
  maxHeight = null
}) {
  const ROW_TONE = {
    danger: 'var(--danger-bg)',
    warning: 'var(--warning-bg)',
    success: 'var(--success-bg)',
    info: 'var(--info-bg)'
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "tims-data-table",
    style: {
      overflow: 'auto',
      maxHeight: maxHeight || 'none',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 14,
      minWidth: 'max-content'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      position: stickyHeader ? 'sticky' : 'static',
      top: 0,
      zIndex: 1,
      textAlign: c.align || 'left',
      padding: '10px 16px',
      whiteSpace: 'nowrap',
      background: 'var(--surface-raised)',
      borderBottom: '1px solid var(--border-default)',
      fontSize: 'var(--type-table-header-size)',
      fontWeight: 'var(--type-table-header-weight)',
      letterSpacing: 'var(--type-table-header-tracking)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      width: c.width || 'auto'
    }
  }, c.header)))), /*#__PURE__*/React.createElement("tbody", null, loading ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length,
    style: {
      padding: '40px 16px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Spinner, {
    size: 18,
    label: "Loading\u2026"
  }))) : rows.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length,
    style: {
      padding: 0
    }
  }, empty)) : rows.map((row, i) => {
    const tone = getRowTone ? getRowTone(row) : null;
    const toneBg = tone ? ROW_TONE[tone] : null;
    const baseBg = toneBg || (zebra && i % 2 ? 'var(--surface-raised)' : 'var(--surface-card)');
    return /*#__PURE__*/React.createElement("tr", {
      key: rowKey(row, i),
      onClick: onRowClick ? () => onRowClick(row) : undefined,
      style: {
        background: baseBg,
        cursor: onRowClick ? 'pointer' : 'default',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background var(--duration-fast)'
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = toneBg ? baseBg : 'var(--surface-sunken)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = baseBg;
      }
    }, columns.map(c => /*#__PURE__*/React.createElement("td", {
      key: c.key,
      "data-label": c.header || '',
      style: {
        padding: '11px 16px',
        textAlign: c.align || 'left',
        whiteSpace: c.nowrap ? 'nowrap' : 'normal',
        color: 'var(--text-default)',
        verticalAlign: 'middle',
        fontFamily: c.mono ? 'var(--font-mono)' : 'inherit',
        fontSize: c.mono ? 13 : 14,
        fontVariantNumeric: c.align === 'right' || c.mono ? 'tabular-nums' : 'normal'
      }
    }, c.render ? c.render(row) : row[c.key])));
  }))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/Tabs.jsx
try { (() => {
/** Pill-style segmented control used across Requisitions/Approvals/Issuance/Calibration/Reports. */
function Tabs({
  tabs = [],
  value,
  onChange,
  size = 'md'
}) {
  const px = size === 'sm' ? {
    pad: '5px 12px',
    font: 12
  } : {
    pad: '7px 14px',
    font: 13
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: 'inline-flex',
      gap: 2,
      padding: 3,
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)'
    }
  }, tabs.map(t => {
    const active = value === t.value;
    return /*#__PURE__*/React.createElement("button", {
      key: t.value,
      role: "tab",
      "aria-selected": active,
      onClick: () => onChange(t.value),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: px.pad,
        fontFamily: 'var(--font-sans)',
        fontSize: px.font,
        fontWeight: 600,
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        background: active ? 'var(--surface-card)' : 'transparent',
        color: active ? 'var(--text-strong)' : 'var(--text-muted)',
        boxShadow: active ? 'var(--shadow-resting)' : 'none',
        transition: 'background var(--duration-fast), color var(--duration-fast)',
        whiteSpace: 'nowrap'
      }
    }, t.label, t.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        padding: '1px 6px',
        borderRadius: 'var(--radius-pill)',
        fontVariantNumeric: 'tabular-nums',
        background: active ? t.tone === 'danger' ? 'var(--danger-bg)' : 'var(--surface-sunken)' : 'transparent',
        color: active ? t.tone === 'danger' ? 'var(--danger-text)' : 'var(--text-muted)' : 'var(--text-subtle)'
      }
    }, t.count));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
/** Single toast notification. Solid semantic fill, icon + message + dismiss. */
function Toast({
  type = 'success',
  message,
  onClose = null
}) {
  const TONE = {
    success: {
      bg: 'var(--success-solid)',
      icon: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
        d: "M20 6 9 17l-5-5"
      }))
    },
    error: {
      bg: 'var(--danger-solid)',
      icon: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "9"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m15 9-6 6M9 9l6 6"
      }))
    },
    warning: {
      bg: 'var(--warning-solid)',
      icon: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
        d: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 9v4"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 17h.01"
      }))
    },
    info: {
      bg: 'var(--info-solid)',
      icon: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "9"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 16v-4M12 8h.01"
      }))
    }
  };
  const t = TONE[type] || TONE.success;
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      minWidth: 280,
      maxWidth: 380,
      padding: '11px 14px',
      borderRadius: 'var(--radius-md)',
      background: t.bg,
      color: '#fff',
      boxShadow: 'var(--shadow-floating)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "17",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.3",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flexShrink: 0
    }
  }, t.icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 500,
      flex: 1,
      lineHeight: 1.35
    }
  }, message), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Dismiss",
    style: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      opacity: 0.8,
      cursor: 'pointer',
      display: 'flex',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  }))));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
/** Checkbox with label. Fills black when checked. */
function Checkbox({
  checked,
  onChange,
  label = null,
  disabled = false,
  id
}) {
  const cid = id || (label ? `cb-${String(label).replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: cid,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 9,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      width: 18,
      height: 18,
      flexShrink: 0,
      borderRadius: 'var(--radius-xs)',
      display: 'grid',
      placeItems: 'center',
      border: `2px solid ${checked ? 'var(--brand-black)' : 'var(--border-strong)'}`,
      background: checked ? 'var(--brand-black)' : 'var(--surface-card)',
      transition: 'background var(--duration-fast), border-color var(--duration-fast)'
    }
  }, checked && /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  })), /*#__PURE__*/React.createElement("input", {
    id: cid,
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: e => onChange(e.target.checked),
    style: {
      position: 'absolute',
      inset: 0,
      opacity: 0,
      cursor: 'inherit',
      margin: 0
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--text-default)'
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const fieldShell = error => ({
  width: '100%',
  height: 'var(--control-height-md)',
  padding: '0 12px',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  color: 'var(--text-strong)',
  background: 'var(--surface-card)',
  border: `1px solid ${error ? 'var(--danger-solid)' : 'var(--border-default)'}`,
  borderRadius: 'var(--radius-sm)',
  outline: 'none',
  transition: 'box-shadow var(--duration-fast), border-color var(--duration-fast)'
});
function Label({
  label,
  required,
  htmlFor
}) {
  if (!label) return null;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      display: 'block',
      fontSize: 12.5,
      fontWeight: 500,
      color: 'var(--text-default)',
      marginBottom: 6
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--danger-solid)',
      marginLeft: 2
    }
  }, "*"));
}
function Help({
  error,
  helper
}) {
  if (error) return /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      fontSize: 12,
      color: 'var(--danger-text)'
    }
  }, error);
  if (helper) return /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, helper);
  return null;
}

/** Labelled text input with error + helper + optional leading icon. */
function Input({
  label,
  id,
  required,
  error,
  helper,
  icon = null,
  style = {},
  ...rest
}) {
  const inputId = id || rest.name;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement(Label, {
    label: label,
    required: required,
    htmlFor: inputId
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--text-subtle)',
      display: 'flex'
    }
  }, icon), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    style: {
      ...fieldShell(error),
      paddingLeft: icon ? 32 : 12,
      ...style
    },
    onFocus: e => {
      e.target.style.boxShadow = 'var(--focus-ring)';
      e.target.style.borderColor = 'var(--focus-ring-color)';
    },
    onBlur: e => {
      e.target.style.boxShadow = 'none';
      e.target.style.borderColor = error ? 'var(--danger-solid)' : 'var(--border-default)';
    }
  }, rest))), /*#__PURE__*/React.createElement(Help, {
    error: error,
    helper: helper
  }));
}
Object.assign(__ds_scope, { Input, fieldShell, Label, Help });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/RadioGroup.jsx
try { (() => {
/** Radio group. options: [{value,label,hint?}]. Layout row or stack. */
function RadioGroup({
  name,
  value,
  onChange,
  options = [],
  layout = 'row',
  label = null
}) {
  return /*#__PURE__*/React.createElement("div", null, label && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 500,
      color: 'var(--text-default)',
      marginBottom: 8
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: layout === 'row' ? 'row' : 'column',
      gap: layout === 'row' ? 18 : 10,
      flexWrap: 'wrap'
    }
  }, options.map(opt => {
    const checked = value === opt.value;
    return /*#__PURE__*/React.createElement("label", {
      key: opt.value,
      style: {
        display: 'inline-flex',
        alignItems: 'flex-start',
        gap: 8,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'relative',
        width: 18,
        height: 18,
        flexShrink: 0,
        marginTop: 1,
        borderRadius: '50%',
        border: `2px solid ${checked ? 'var(--brand-black)' : 'var(--border-strong)'}`,
        display: 'grid',
        placeItems: 'center',
        transition: 'border-color var(--duration-fast)'
      }
    }, checked && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: '50%',
        background: 'var(--brand-black)'
      }
    }), /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: name,
      value: opt.value,
      checked: checked,
      onChange: () => onChange(opt.value),
      style: {
        position: 'absolute',
        inset: 0,
        opacity: 0,
        cursor: 'pointer',
        margin: 0
      }
    })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        color: 'var(--text-default)'
      }
    }, opt.label), opt.hint && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 12,
        color: 'var(--text-muted)',
        marginTop: 1
      }
    }, opt.hint)));
  })));
}
Object.assign(__ds_scope, { RadioGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/RadioGroup.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Labelled native select with chevron, error + helper. */
function Select({
  label,
  id,
  required,
  error,
  helper,
  children,
  style = {},
  ...rest
}) {
  const selId = id || rest.name;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Label, {
    label: label,
    required: required,
    htmlFor: selId
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: selId,
    style: {
      ...__ds_scope.fieldShell(error),
      appearance: 'none',
      WebkitAppearance: 'none',
      paddingRight: 34,
      cursor: 'pointer',
      ...style
    },
    onFocus: e => {
      e.target.style.boxShadow = 'var(--focus-ring)';
      e.target.style.borderColor = 'var(--focus-ring-color)';
    },
    onBlur: e => {
      e.target.style.boxShadow = 'none';
      e.target.style.borderColor = error ? 'var(--danger-solid)' : 'var(--border-default)';
    }
  }, rest), children), /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--text-muted)",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      position: 'absolute',
      right: 11,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6"
  }))), /*#__PURE__*/React.createElement(__ds_scope.Help, {
    error: error,
    helper: helper
  }));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Labelled multi-line textarea with error + helper. */
function Textarea({
  label,
  id,
  required,
  error,
  helper,
  rows = 3,
  style = {},
  ...rest
}) {
  const taId = id || rest.name;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Label, {
    label: label,
    required: required,
    htmlFor: taId
  }), /*#__PURE__*/React.createElement("textarea", _extends({
    id: taId,
    rows: rows,
    style: {
      ...__ds_scope.fieldShell(error),
      height: 'auto',
      padding: '9px 12px',
      resize: 'vertical',
      lineHeight: 1.4,
      ...style
    },
    onFocus: e => {
      e.target.style.boxShadow = 'var(--focus-ring)';
      e.target.style.borderColor = 'var(--focus-ring-color)';
    },
    onBlur: e => {
      e.target.style.boxShadow = 'none';
      e.target.style.borderColor = error ? 'var(--danger-solid)' : 'var(--border-default)';
    }
  }, rest)), /*#__PURE__*/React.createElement(__ds_scope.Help, {
    error: error,
    helper: helper
  }));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/forms/Toggle.jsx
try { (() => {
/** Switch toggle. Track turns black when on (yellow is reserved for accent, not fills). */
function Toggle({
  checked,
  onChange,
  label = null,
  disabled = false,
  id
}) {
  const tid = id || (label ? `tg-${String(label).replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: tid,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1
    }
  }, /*#__PURE__*/React.createElement("button", {
    id: tid,
    type: "button",
    role: "switch",
    "aria-checked": checked,
    disabled: disabled,
    onClick: () => !disabled && onChange(!checked),
    style: {
      position: 'relative',
      width: 38,
      height: 22,
      flexShrink: 0,
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      padding: 0,
      background: checked ? 'var(--brand-black)' : 'var(--border-strong)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background var(--duration-base) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 3,
      left: checked ? 19 : 3,
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
      transition: 'left var(--duration-base) var(--ease-standard)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--text-default)'
    }
  }, label));
}
Object.assign(__ds_scope, { Toggle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Toggle.jsx", error: String((e && e.message) || e) }); }

// components/overlays/Modal.jsx
try { (() => {
const {
  useEffect,
  useRef
} = React;
/** Shared escape + focus-trap behaviour for overlay surfaces. */
function useOverlay(open, onClose) {
  const ref = useRef(null);
  const prevFocus = useRef(null);
  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement;
    const onKey = e => {
      if (e.key === 'Escape') {
        onClose && onClose();
        return;
      }
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0],
          last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => {
      const target = ref.current && ref.current.querySelector('[data-autofocus],input,textarea,button');
      target && target.focus();
    }, 30);
    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
      if (prevFocus.current && prevFocus.current.focus) prevFocus.current.focus();
    };
  }, [open, onClose]);
  return ref;
}

/** Centered modal dialog. Shared scrim, ESC, click-outside, focus trap. */
function Modal({
  open,
  onClose,
  title,
  children,
  footer = null,
  width = 480,
  icon = null
}) {
  const ref = useOverlay(open, onClose);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    onMouseDown: e => {
      if (e.target === e.currentTarget) onClose();
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'var(--overlay-scrim)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      animation: 'mtrs-fade var(--duration-base) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      width: '100%',
      maxWidth: width,
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-floating)',
      overflow: 'hidden',
      animation: 'mtrs-pop var(--duration-base) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '15px 20px',
      borderBottom: '1px solid var(--border-subtle)',
      flexShrink: 0
    }
  }, icon, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 15.5,
      fontWeight: 600,
      color: 'var(--text-strong)',
      flex: 1
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: closeBtn
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 20px',
      overflowY: 'auto',
      flex: 1
    }
  }, children), footer && /*#__PURE__*/React.createElement("footer", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10,
      padding: '14px 20px',
      borderTop: '1px solid var(--border-subtle)',
      flexShrink: 0
    }
  }, footer)), /*#__PURE__*/React.createElement("style", null, `@keyframes mtrs-fade{from{opacity:0}to{opacity:1}}@keyframes mtrs-pop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}@media (prefers-reduced-motion: reduce){[style*="mtrs-fade"],[style*="mtrs-pop"]{animation:none!important}}`));
}
const closeBtn = {
  display: 'grid',
  placeItems: 'center',
  width: 28,
  height: 28,
  flexShrink: 0,
  border: 'none',
  background: 'transparent',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-muted)',
  cursor: 'pointer'
};
Object.assign(__ds_scope, { useOverlay, Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/Modal.jsx", error: String((e && e.message) || e) }); }

// components/overlays/ConfirmDialog.jsx
try { (() => {
/** Confirmation dialog built on Modal. Tone drives the confirm button + icon. */
function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  tone = 'info',
  loading = false,
  children = null
}) {
  const TONE = {
    info: {
      variant: 'primary',
      chip: 'var(--info-bg)',
      fg: 'var(--info-solid)'
    },
    danger: {
      variant: 'danger',
      chip: 'var(--danger-bg)',
      fg: 'var(--danger-solid)'
    },
    success: {
      variant: 'primary',
      chip: 'var(--success-bg)',
      fg: 'var(--success-solid)'
    },
    warning: {
      variant: 'primary',
      chip: 'var(--warning-bg)',
      fg: 'var(--warning-solid)'
    }
  };
  const t = TONE[tone] || TONE.info;
  const confirmVariant = tone === 'danger' ? 'danger' : 'primary';
  const icon = /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 30,
      height: 30,
      borderRadius: 'var(--radius-md)',
      background: t.chip,
      color: t.fg,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "17",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 9v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 17h.01"
  })));
  return /*#__PURE__*/React.createElement(__ds_scope.Modal, {
    open: open,
    onClose: onClose,
    title: title,
    icon: icon,
    width: 440,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(__ds_scope.Button, {
      variant: "secondary",
      onClick: onClose,
      disabled: loading
    }, "Cancel"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
      variant: confirmVariant,
      onClick: onConfirm,
      loading: loading
    }, confirmLabel))
  }, message && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      color: 'var(--text-default)',
      lineHeight: 1.5
    }
  }, message), children && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: message ? 14 : 0
    }
  }, children));
}
Object.assign(__ds_scope, { ConfirmDialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/ConfirmDialog.jsx", error: String((e && e.message) || e) }); }

// components/overlays/SlideOver.jsx
try { (() => {
/** Right-anchored drawer (used by the Add/Edit Tool and Storage Bin forms). */
function SlideOver({
  open,
  onClose,
  title,
  subtitle = null,
  children,
  footer = null,
  width = 560
}) {
  const ref = __ds_scope.useOverlay(open, onClose);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    onMouseDown: e => {
      if (e.target === e.currentTarget) onClose();
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'var(--overlay-scrim)',
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'mtrs-fade var(--duration-base) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      width: '100%',
      maxWidth: width,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-card)',
      boxShadow: 'var(--shadow-floating)',
      animation: 'mtrs-slide var(--duration-base) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      padding: '16px 22px',
      borderBottom: '1px solid var(--border-subtle)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 16,
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '3px 0 0',
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, subtitle)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 30,
      height: 30,
      flexShrink: 0,
      border: 'none',
      background: 'transparent',
      borderRadius: 'var(--radius-sm)',
      color: 'var(--text-muted)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 22px',
      overflowY: 'auto',
      flex: 1
    }
  }, children), footer && /*#__PURE__*/React.createElement("footer", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10,
      padding: '15px 22px',
      borderTop: '1px solid var(--border-subtle)',
      flexShrink: 0
    }
  }, footer)), /*#__PURE__*/React.createElement("style", null, `@keyframes mtrs-slide{from{transform:translateX(24px);opacity:.6}to{transform:none;opacity:1}}@media (prefers-reduced-motion: reduce){[style*="mtrs-slide"]{animation:none!important}}`));
}
Object.assign(__ds_scope, { SlideOver });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlays/SlideOver.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mtrs/AppShell.jsx
try { (() => {
const NS_SHELL = window.MTRSDesignSystemUltraTechCement_660dc9;
const NAV_GROUPS = [{
  label: 'Operations',
  items: [{
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard'
  }, {
    key: 'requisitions',
    label: 'My Requests',
    icon: 'clipboard'
  }, {
    key: 'approvals',
    label: 'Approvals',
    icon: 'check_square'
  }]
}, {
  label: 'Inventory',
  items: [{
    key: 'tools',
    label: 'Tools',
    icon: 'wrench'
  }, {
    key: 'issuance',
    label: 'Issue Tool',
    icon: 'arrow_right_circle'
  }, {
    key: 'returns',
    label: 'Returns',
    icon: 'arrow_left_circle'
  }]
}, {
  label: 'Admin',
  items: [{
    key: 'reports',
    label: 'Reports',
    icon: 'bar_chart'
  }, {
    key: 'calibration',
    label: 'Calibration',
    icon: 'activity'
  }, {
    key: 'bins',
    label: 'Storage Bins',
    icon: 'archive'
  }, {
    key: 'users',
    label: 'Users',
    icon: 'users'
  }]
}];
const ROLE_LABELS = {
  requester: 'Requester',
  dept_head: 'Dept Head',
  maintenance_staff: 'Maint. Staff',
  maintenance_admin: 'Admin'
};
const ROLE_TONE = {
  requester: {
    bg: 'var(--role-requester-bg)',
    fg: 'var(--role-requester-text)'
  },
  dept_head: {
    bg: 'var(--role-depthead-bg)',
    fg: 'var(--role-depthead-text)'
  },
  maintenance_staff: {
    bg: 'var(--role-maintenance-bg)',
    fg: 'var(--role-maintenance-text)'
  },
  maintenance_admin: {
    bg: 'var(--role-admin-bg)',
    fg: 'var(--role-admin-text)'
  }
};
function Sidebar({
  route,
  onNavigate,
  collapsed,
  onToggle
}) {
  const {
    Logo
  } = NS_SHELL;
  const toggleBtn = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    border: 'none',
    background: 'transparent',
    borderRadius: 'var(--radius-md)',
    color: 'rgba(255,255,255,0.55)',
    cursor: 'pointer',
    flexShrink: 0,
    padding: 0
  };
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: collapsed ? 64 : 224,
      flexShrink: 0,
      background: 'var(--brand-black)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      borderTop: 'var(--brand-accent-line)',
      transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: collapsed ? '14px 0' : '15px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: collapsed ? 'center' : 'space-between',
      gap: 8,
      minHeight: 66
    }
  }, collapsed ? /*#__PURE__*/React.createElement("button", {
    onClick: onToggle,
    title: "Expand sidebar",
    style: toggleBtn,
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "menu",
    size: 19,
    color: "rgba(255,255,255,0.75)"
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Logo, {
    variant: "sidebar",
    logoSrc: "../../assets/ultratech-logo.png"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: onToggle,
    title: "Collapse sidebar",
    style: toggleBtn,
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "menu",
    size: 18
  })))), /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: collapsed ? '14px 8px' : '14px 12px'
    }
  }, NAV_GROUPS.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.label,
    style: {
      marginBottom: collapsed ? 4 : 16
    }
  }, !collapsed && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.34)',
      padding: '0 10px 8px'
    }
  }, g.label), collapsed && /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'rgba(255,255,255,0.08)',
      margin: '4px 0 8px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, g.items.map(it => {
    const active = route === it.key;
    return /*#__PURE__*/React.createElement("button", {
      key: it.key,
      onClick: () => onNavigate(it.key),
      title: collapsed ? it.label : undefined,
      style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? 0 : 11,
        padding: collapsed ? '10px 0' : '9px 10px 9px 12px',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-sans)',
        fontSize: 13.5,
        fontWeight: 500,
        background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
        color: active ? '#fff' : 'rgba(255,255,255,0.66)',
        transition: 'background var(--duration-fast), color var(--duration-fast)'
      },
      onMouseEnter: e => {
        if (!active) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.color = '#fff';
        }
      },
      onMouseLeave: e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'rgba(255,255,255,0.66)';
        }
      }
    }, active && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: 0,
        width: 3,
        borderRadius: 3,
        background: 'var(--brand-yellow)',
        top: collapsed ? '50%' : 8,
        ...(collapsed ? {
          transform: 'translateY(-50%)',
          height: 20
        } : {
          bottom: 8
        })
      }
    }), /*#__PURE__*/React.createElement(Icon, {
      name: it.icon,
      size: 17,
      color: active ? 'var(--brand-yellow)' : 'currentColor'
    }), !collapsed && it.label);
  }))))));
}
function Navbar({
  user,
  notifs = [],
  onLogout
}) {
  const [open, setOpen] = React.useState(false);
  const [readIds, setReadIds] = React.useState(new Set());
  const tone = ROLE_TONE[user.role] || ROLE_TONE.requester;
  const notifRef = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const handler = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  const todayDate = notifs.length > 0 ? notifs[0].date : null;
  const tagged = notifs.map((n, i) => ({
    ...n,
    idx: i
  }));
  // New = today's unread; Earlier = older OR today's already-read (moves down when marked read)
  const newNotifs = tagged.filter(n => n.date === todayDate && !readIds.has(n.idx));
  const earlierNotifs = tagged.filter(n => n.date !== todayDate || readIds.has(n.idx));
  const unreadCount = tagged.filter(n => !readIds.has(n.idx)).length;
  const markRead = i => setReadIds(prev => new Set([...prev, i]));
  const markAllRead = () => setReadIds(new Set(notifs.map((_, i) => i)));
  const SectionLabel = ({
    label
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 14px 4px',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--text-subtle)',
      background: 'var(--surface-sunken)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, label);
  const NotifRow = ({
    n
  }) => {
    const isRead = readIds.has(n.idx);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '10px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: 9,
        alignItems: 'flex-start',
        background: isRead ? 'transparent' : 'rgba(250,196,0,0.04)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        marginTop: 5,
        flexShrink: 0,
        background: isRead ? 'transparent' : 'var(--brand-yellow)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 12.5,
        lineHeight: 1.4,
        color: isRead ? 'var(--text-subtle)' : 'var(--text-default)'
      }
    }, n.message), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--text-subtle)',
        marginTop: 4
      }
    }, n.date)), !isRead && /*#__PURE__*/React.createElement("button", {
      onClick: () => markRead(n.idx),
      title: "Mark as read",
      style: {
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: 'var(--text-subtle)',
        padding: 2,
        flexShrink: 0,
        display: 'flex',
        borderRadius: 'var(--radius-sm)'
      },
      onMouseEnter: e => {
        e.currentTarget.style.color = 'var(--success-solid)';
        e.currentTarget.style.background = 'var(--success-bg)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.color = 'var(--text-subtle)';
        e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check_circle",
      size: 15
    })));
  };
  return /*#__PURE__*/React.createElement("header", {
    style: {
      height: 'var(--navbar-height)',
      flexShrink: 0,
      background: 'var(--surface-card)',
      borderBottom: '1px solid var(--border-default)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 22px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--text-muted)'
    }
  }, "Tool Inventory Management System"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: notifRef,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(!open),
    style: {
      position: 'relative',
      display: 'grid',
      placeItems: 'center',
      width: 34,
      height: 34,
      border: 'none',
      background: open ? 'var(--surface-sunken)' : 'transparent',
      borderRadius: 'var(--radius-md)',
      color: 'var(--text-muted)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 18
  }), unreadCount > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 5,
      right: 5,
      minWidth: 15,
      height: 15,
      padding: '0 3px',
      borderRadius: 8,
      background: 'var(--danger-solid)',
      color: '#fff',
      fontSize: 9.5,
      fontWeight: 700,
      display: 'grid',
      placeItems: 'center',
      border: '1.5px solid var(--surface-card)'
    }
  }, unreadCount)), open && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 0,
      top: 40,
      width: 340,
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-floating)',
      zIndex: 40,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '11px 14px',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, "Notifications"), unreadCount > 0 ? /*#__PURE__*/React.createElement("button", {
    onClick: markAllRead,
    style: {
      fontSize: 11.5,
      color: 'var(--text-muted)',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      padding: 0
    },
    onMouseEnter: e => e.currentTarget.style.color = 'var(--text-strong)',
    onMouseLeave: e => e.currentTarget.style.color = 'var(--text-muted)'
  }, "Mark all read") : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 500,
      color: 'var(--success-text)',
      background: 'var(--success-bg)',
      padding: '2px 8px',
      borderRadius: 'var(--radius-pill)'
    }
  }, "All read")), notifs.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--text-subtle)',
      textAlign: 'center',
      padding: '24px 0'
    }
  }, "No notifications") : /*#__PURE__*/React.createElement(React.Fragment, null, newNotifs.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionLabel, {
    label: "New"
  }), newNotifs.map(n => /*#__PURE__*/React.createElement(NotifRow, {
    key: n.idx,
    n: n
  }))), earlierNotifs.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionLabel, {
    label: "Earlier"
  }), earlierNotifs.map(n => /*#__PURE__*/React.createElement(NotifRow, {
    key: n.idx,
    n: n
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      lineHeight: 1.25
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, user.full_name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--text-subtle)'
    }
  }, user.department)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: 'var(--radius-pill)',
      background: tone.bg,
      color: tone.fg
    }
  }, ROLE_LABELS[user.role])), /*#__PURE__*/React.createElement("button", {
    onClick: onLogout,
    title: "Logout",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      border: 'none',
      background: 'transparent',
      color: 'var(--text-muted)',
      fontSize: 13,
      cursor: 'pointer',
      padding: '7px 8px',
      borderRadius: 'var(--radius-md)'
    },
    onMouseEnter: e => {
      e.currentTarget.style.color = 'var(--danger-solid)';
      e.currentTarget.style.background = 'var(--danger-bg)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.color = 'var(--text-muted)';
      e.currentTarget.style.background = 'transparent';
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "logout",
    size: 16
  }), " Logout")));
}
function AppShell({
  user,
  route,
  onNavigate,
  notifs,
  onLogout,
  children
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  React.useEffect(() => {
    const s = document.createElement('style');
    s.id = 'tims-main-scroll';
    s.textContent = 'main::-webkit-scrollbar{width:5px;height:5px}main::-webkit-scrollbar-track{background:transparent}main::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.12);border-radius:10px}main::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,0.22)}';
    if (!document.getElementById('tims-main-scroll')) document.head.appendChild(s);
    return () => {
      const el = document.getElementById('tims-main-scroll');
      if (el) el.remove();
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: '100%',
      overflow: 'hidden',
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    route: route,
    onNavigate: onNavigate,
    collapsed: collapsed,
    onToggle: () => setCollapsed(c => !c)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(Navbar, {
    user: user,
    notifs: notifs,
    onLogout: onLogout
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '24px 26px',
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(0,0,0,0.12) transparent'
    }
  }, children)));
}
Object.assign(window, {
  AppShell
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mtrs/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mtrs/ApprovalsScreen.jsx
try { (() => {
const NS_APP = window.MTRSDesignSystemUltraTechCement_660dc9;

/* ── Helpers ─────────────────────────────────────────────────────── */
function parseDMY(s) {
  if (!s) return null;
  const mon = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11
  };
  const p = s.split(' ');
  return p.length === 3 ? new Date(+p[2], mon[p[1]], +p[0]) : null;
}
const TODAY = new Date('2026-06-14');
function getPriorityBadges(req) {
  const badges = [];
  const from = parseDMY(req.from);
  const to = parseDMY(req.to);
  const daysUntil = from ? (from - TODAY) / 86400000 : null;
  if (daysUntil !== null && daysUntil <= 0) badges.push({
    k: 'urgent',
    label: 'Urgent',
    bg: 'var(--danger-bg)',
    fg: 'var(--danger-text)'
  });else if (daysUntil !== null && daysUntil <= 2) badges.push({
    k: 'soon',
    label: 'Due Soon',
    bg: 'var(--warning-bg)',
    fg: 'var(--warning-text)'
  });
  if (req.qty >= 2) badges.push({
    k: 'hq',
    label: 'High Qty',
    bg: 'var(--warning-bg)',
    fg: 'var(--warning-text)'
  });
  if (from && to && (to - from) / 86400000 > 5) badges.push({
    k: 'ld',
    label: 'Long Duration',
    bg: 'var(--info-bg)',
    fg: 'var(--info-text)'
  });
  return badges;
}
function PriorityBadges({
  req
}) {
  const bs = getPriorityBadges(req);
  if (!bs.length) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      flexWrap: 'wrap'
    }
  }, bs.map(b => /*#__PURE__*/React.createElement("span", {
    key: b.k,
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      padding: '2px 7px',
      borderRadius: 'var(--radius-pill)',
      background: b.bg,
      color: b.fg,
      whiteSpace: 'nowrap'
    }
  }, b.label)));
}

/* ── Status timeline ─────────────────────────────────────────────── */
function StatusTimeline({
  status
}) {
  const rejected = status === 'rejected';
  const steps = [{
    key: 'pending',
    label: 'Requested',
    icon: 'clipboard'
  }, {
    key: 'approved',
    label: rejected ? 'Rejected' : 'Approved',
    icon: rejected ? 'x' : 'check_circle'
  }, {
    key: 'issued',
    label: 'Issued',
    icon: 'arrow_right_circle'
  }, {
    key: 'returned',
    label: 'Returned',
    icon: 'arrow_left_circle'
  }];
  const order = ['pending', 'approved', 'issued', 'returned'];
  const curIdx = order.indexOf(rejected ? 'approved' : status);
  const state = i => i < curIdx ? 'done' : i === curIdx ? rejected ? 'rejected' : 'active' : 'future';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      marginTop: 4
    }
  }, steps.map((s, i) => {
    const st = state(i);
    const dotBg = st === 'done' ? 'var(--success-solid)' : st === 'active' ? 'var(--brand-black)' : st === 'rejected' ? 'var(--danger-solid)' : 'var(--border-default)';
    const dotColor = st === 'future' ? 'var(--text-subtle)' : '#fff';
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: s.key
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        minWidth: 64
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 28,
        height: 28,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background: dotBg
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: s.icon,
      size: 13,
      color: dotColor
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        textAlign: 'center',
        color: st === 'future' ? 'var(--text-subtle)' : 'var(--text-muted)',
        fontWeight: st !== 'future' ? 600 : 400,
        lineHeight: 1.3
      }
    }, s.label)), i < steps.length - 1 && /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 2,
        marginTop: 13,
        background: state(i + 1) !== 'future' ? 'var(--success-solid)' : 'var(--border-subtle)'
      }
    }));
  }));
}

/* ── View Details modal ──────────────────────────────────────────── */
function ViewDetailsModal({
  req,
  onClose,
  effectiveStatus
}) {
  const {
    Modal,
    Button
  } = NS_APP;
  const status = effectiveStatus || req.status;
  const F = ({
    label,
    value,
    full
  }) => /*#__PURE__*/React.createElement("div", {
    style: full ? {
      gridColumn: '1/-1'
    } : {}
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: 'var(--text-subtle)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 600,
      marginBottom: 2
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: 'var(--text-default)'
    }
  }, value || '—'));
  return /*#__PURE__*/React.createElement(Modal, {
    open: true,
    onClose: onClose,
    title: "Request Details",
    width: 520,
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "Close")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(F, {
    label: "Requisition No.",
    value: /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'monospace'
      }
    }, req.requisition_number)
  }), /*#__PURE__*/React.createElement(F, {
    label: "Submitted",
    value: req.submitted
  }), /*#__PURE__*/React.createElement(F, {
    label: "Tool",
    value: /*#__PURE__*/React.createElement("strong", {
      style: {
        color: 'var(--text-strong)'
      }
    }, req.tool_name)
  }), /*#__PURE__*/React.createElement(F, {
    label: "Quantity",
    value: `${req.qty} unit${req.qty > 1 ? 's' : ''}`
  }), req.requester && /*#__PURE__*/React.createElement(F, {
    label: "Requested By",
    value: `${req.requester} (${req.dept})`
  }), /*#__PURE__*/React.createElement(F, {
    label: "Period",
    value: `${req.from} → ${req.to}`,
    full: !req.requester
  }), req.requester && /*#__PURE__*/React.createElement(F, {
    label: "Period",
    value: `${req.from} → ${req.to}`
  }), /*#__PURE__*/React.createElement(F, {
    label: "Purpose",
    value: req.purpose,
    full: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 16,
      borderTop: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--text-subtle)',
      marginBottom: 10
    }
  }, "Status Timeline"), /*#__PURE__*/React.createElement(StatusTimeline, {
    status: status
  })), getPriorityBadges(req).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      paddingTop: 14,
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--text-subtle)',
      marginRight: 4,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      alignSelf: 'center'
    }
  }, "Flags"), getPriorityBadges(req).map(b => /*#__PURE__*/React.createElement("span", {
    key: b.k,
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      padding: '3px 9px',
      borderRadius: 'var(--radius-pill)',
      background: b.bg,
      color: b.fg
    }
  }, b.label))));
}

/* ── Main screen ─────────────────────────────────────────────────── */
function ApprovalsScreen() {
  const {
    PageHeader,
    Card,
    Tabs,
    DataTable,
    Button,
    ConfirmDialog,
    Modal,
    Textarea,
    EmptyState
  } = NS_APP;
  const [tab, setTab] = React.useState('pending');
  const [approving, setApproving] = React.useState(null);
  const [rejecting, setRejecting] = React.useState(null);
  const [viewing, setViewing] = React.useState(null);
  const [reason, setReason] = React.useState('');
  const [reasonErr, setReasonErr] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [decisions, setDecisions] = React.useState({});
  const [deptFilter, setDeptFilter] = React.useState('all');
  const decided = s => window.MOCK.REQUISITIONS.filter(r => decisions[r.id] === s);
  const pending = window.MOCK.REQUISITIONS.filter(r => !decisions[r.id]);
  const depts = [...new Set(window.MOCK.REQUISITIONS.map(r => r.dept))];
  let base = tab === 'pending' ? pending : decided(tab);
  if (deptFilter !== 'all') base = base.filter(r => r.dept === deptFilter);
  const effectiveStatus = r => decisions[r.id] || 'pending';
  const doApprove = () => {
    setBusy(true);
    setTimeout(() => {
      setDecisions(p => ({
        ...p,
        [approving.id]: 'approved'
      }));
      setBusy(false);
      setApproving(null);
    }, 600);
  };
  const doReject = () => {
    if (!reason.trim()) {
      setReasonErr('Rejection reason is required');
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setDecisions(p => ({
        ...p,
        [rejecting.id]: 'rejected'
      }));
      setBusy(false);
      setRejecting(null);
      setReason('');
    }, 600);
  };
  const EMPTY_MSGS = {
    pending: {
      icon: 'check_square',
      title: 'All clear',
      msg: 'No requisitions are pending your approval.'
    },
    approved: {
      icon: 'check_circle',
      title: 'None approved yet',
      msg: 'Approved requests will appear here.'
    },
    rejected: {
      icon: 'x',
      title: 'No rejected requests',
      msg: 'Rejected requests will appear here.'
    }
  };
  const empty = EMPTY_MSGS[tab] || EMPTY_MSGS.pending;
  const tabStyle = val => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    fontWeight: tab === val ? 700 : 400,
    whiteSpace: 'nowrap',
    color: tab === val ? 'var(--text-strong)' : 'var(--text-muted)',
    background: tab === val ? 'var(--surface-card)' : 'transparent',
    boxShadow: tab === val ? 'var(--shadow-resting)' : 'none',
    transition: 'all 0.15s'
  });
  const countPill = (n, tone) => n > 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      padding: '1px 6px',
      borderRadius: 'var(--radius-pill)',
      background: tone === 'danger' ? 'var(--danger-solid)' : 'var(--surface-sunken)',
      color: tone === 'danger' ? '#fff' : 'var(--text-muted)',
      minWidth: 16,
      textAlign: 'center'
    }
  }, n) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Approvals",
    subtitle: "Review and action tool requisitions from your department"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 2,
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)',
      padding: 3
    }
  }, [{
    val: 'pending',
    label: 'Pending',
    count: pending.length,
    tone: ''
  }, {
    val: 'approved',
    label: 'Approved',
    count: decided('approved').length,
    tone: ''
  }, {
    val: 'rejected',
    label: 'Rejected',
    count: decided('rejected').length,
    tone: 'danger'
  }].map(t => /*#__PURE__*/React.createElement("button", {
    key: t.val,
    onClick: () => setTab(t.val),
    style: tabStyle(t.val)
  }, t.label, " ", countPill(t.count, t.tone)))), /*#__PURE__*/React.createElement("select", {
    value: deptFilter,
    onChange: e => setDeptFilter(e.target.value),
    style: {
      height: 34,
      padding: '0 10px',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      color: 'var(--text-default)',
      background: 'var(--surface-card)',
      cursor: 'pointer',
      outline: 'none'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "All Depts"), depts.map(d => /*#__PURE__*/React.createElement("option", {
    key: d,
    value: d
  }, d)))), /*#__PURE__*/React.createElement(Card, {
    padded: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: 'requisition_number',
      header: 'Request',
      nowrap: true,
      render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'monospace',
          fontSize: 12,
          color: 'var(--text-muted)',
          marginBottom: 2
        }
      }, r.requisition_number), /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          color: 'var(--text-strong)',
          fontSize: 13.5
        }
      }, r.tool_name), /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 3
        }
      }, /*#__PURE__*/React.createElement(PriorityBadges, {
        req: r
      })))
    }, {
      key: 'qty',
      header: 'Qty',
      align: 'right',
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 700,
          fontSize: 15
        }
      }, r.qty)
    }, {
      key: 'requester',
      header: 'Requested By',
      render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 600,
          color: 'var(--text-strong)'
        }
      }, r.requester), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11.5,
          color: 'var(--text-subtle)'
        }
      }, r.dept))
    }, {
      key: 'period',
      header: 'Period',
      nowrap: true,
      render: r => /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12.5,
          color: 'var(--text-muted)',
          lineHeight: 1.5
        }
      }, /*#__PURE__*/React.createElement("div", null, r.from), /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--text-subtle)'
        }
      }, "\u2192 ", r.to))
    }, {
      key: 'actions',
      header: '',
      nowrap: true,
      render: r => /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 6
        }
      }, /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        onClick: () => setViewing(r)
      }, "Details"), tab === 'pending' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        onClick: () => setApproving(r),
        style: {
          padding: '0 12px',
          height: 32,
          border: 'none',
          borderRadius: 'var(--radius-md)',
          background: 'var(--success-solid)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)'
        },
        onMouseEnter: e => e.currentTarget.style.opacity = '0.88',
        onMouseLeave: e => e.currentTarget.style.opacity = '1'
      }, "Approve"), /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          setRejecting(r);
          setReason('');
          setReasonErr('');
        },
        style: {
          padding: '0 12px',
          height: 32,
          border: '1px solid var(--danger-border,var(--danger-bg))',
          borderRadius: 'var(--radius-md)',
          background: 'var(--danger-bg)',
          color: 'var(--danger-text)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)'
        },
        onMouseEnter: e => {
          e.currentTarget.style.background = 'var(--danger-solid)';
          e.currentTarget.style.color = '#fff';
        },
        onMouseLeave: e => {
          e.currentTarget.style.background = 'var(--danger-bg)';
          e.currentTarget.style.color = 'var(--danger-text)';
        }
      }, "Reject")), tab !== 'pending' && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11.5,
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: 'var(--radius-pill)',
          background: tab === 'approved' ? 'var(--success-bg)' : 'var(--danger-bg)',
          color: tab === 'approved' ? 'var(--success-text)' : 'var(--danger-text)'
        }
      }, tab.charAt(0).toUpperCase() + tab.slice(1)))
    }],
    rows: base,
    empty: /*#__PURE__*/React.createElement(EmptyState, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: empty.icon,
        size: 30
      }),
      title: empty.title,
      message: empty.msg
    })
  })), /*#__PURE__*/React.createElement(ConfirmDialog, {
    open: !!approving,
    onClose: () => setApproving(null),
    onConfirm: doApprove,
    title: "Approve Requisition",
    tone: "success",
    confirmLabel: "Approve",
    loading: busy,
    message: approving ? `Approve '${approving.tool_name}' (×${approving.qty}) requested by ${approving.requester} (${approving.dept})?` : ''
  }), /*#__PURE__*/React.createElement(Modal, {
    open: !!rejecting,
    onClose: () => setRejecting(null),
    title: "Reject Requisition",
    width: 460,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => setRejecting(null)
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "danger",
      loading: busy,
      onClick: doReject
    }, "Reject Request"))
  }, rejecting && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 13px',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, rejecting.tool_name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)',
      marginTop: 2,
      fontFamily: 'monospace'
    }
  }, rejecting.requisition_number, " \xB7 ", rejecting.requester)), /*#__PURE__*/React.createElement(Textarea, {
    label: "Reason for rejection",
    required: true,
    rows: 3,
    value: reason,
    error: reasonErr,
    onChange: e => {
      setReason(e.target.value);
      setReasonErr('');
    },
    placeholder: "Provide a clear reason so the requester can understand the decision\u2026",
    "data-autofocus": true
  }))), viewing && /*#__PURE__*/React.createElement(ViewDetailsModal, {
    req: viewing,
    effectiveStatus: effectiveStatus(viewing),
    onClose: () => setViewing(null)
  }));
}
Object.assign(window, {
  ApprovalsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mtrs/ApprovalsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mtrs/CalibrationScreen.jsx
try { (() => {
const NS_CAL = window.MTRSDesignSystemUltraTechCement_660dc9;

/* Extend mock data with service partners */
const SERVICE_PARTNERS = ['Fluke India', 'Testronix Services', 'CalTech Solutions', 'Precision Lab'];
const CAL_DATA = (window.MOCK?.CALIBRATION || []).map((c, i) => ({
  ...c,
  service_partner: SERVICE_PARTNERS[i % SERVICE_PARTNERS.length],
  blocked: c.state === 'overdue'
}));

/* Mock calibration history per tool id */
const CAL_HISTORY = {
  51: [{
    id: 1,
    date: '14 Dec 2025',
    partner: 'Fluke India',
    cert_no: 'CERT-2025-0412',
    by: 'Rajesh Menon',
    notes: 'Regular 6-month calibration. All readings within tolerance.',
    file: 'cert_TL-0088_dec25.pdf'
  }, {
    id: 2,
    date: '16 Jun 2025',
    partner: 'Fluke India',
    cert_no: 'CERT-2025-0188',
    by: 'K. Iqbal',
    notes: 'Passed all standard tests.',
    file: 'cert_TL-0088_jun25.pdf'
  }, {
    id: 3,
    date: '18 Dec 2024',
    partner: 'Testronix Services',
    cert_no: 'CERT-2024-0390',
    by: 'Rajesh Menon',
    notes: 'Sensor adjusted. Calibrated as per IS 1248.',
    file: 'cert_TL-0088_dec24.pdf'
  }],
  52: [{
    id: 1,
    date: '18 Dec 2025',
    partner: 'Testronix Services',
    cert_no: 'CERT-2025-0398',
    by: 'Rajesh Menon',
    notes: 'Minor adjustment made to temperature sensor.',
    file: 'cert_TL-0102_dec25.pdf'
  }, {
    id: 2,
    date: '20 Jun 2025',
    partner: 'Testronix Services',
    cert_no: 'CERT-2025-0201',
    by: 'V. Krishnan',
    notes: 'Passed all tests.',
    file: 'cert_TL-0102_jun25.pdf'
  }],
  53: [{
    id: 1,
    date: '20 Jan 2026',
    partner: 'CalTech Solutions',
    cert_no: 'CERT-2026-0041',
    by: 'Rajesh Menon',
    notes: 'Annual calibration. Torque accuracy ±2%.',
    file: 'cert_TL-0142_jan26.pdf'
  }, {
    id: 2,
    date: '24 Jul 2025',
    partner: 'CalTech Solutions',
    cert_no: 'CERT-2025-0271',
    by: 'K. Iqbal',
    notes: 'Regular calibration completed.',
    file: 'cert_TL-0142_jul25.pdf'
  }],
  54: [{
    id: 1,
    date: '02 Mar 2026',
    partner: 'Precision Lab',
    cert_no: 'CERT-2026-0088',
    by: 'Rajesh Menon',
    notes: 'Calibrated as per manufacturer specs.',
    file: 'cert_TL-0319_mar26.pdf'
  }, {
    id: 2,
    date: '04 Sep 2025',
    partner: 'Precision Lab',
    cert_no: 'CERT-2025-0321',
    by: 'Anita Sharma',
    notes: 'All channels verified.',
    file: 'cert_TL-0319_sep25.pdf'
  }]
};

/* ── Status + Blocked badge cell ───────────────────────────────────── */
function CalDueCell({
  state,
  days,
  blocked
}) {
  const cfg = {
    on_time: {
      bg: 'var(--success-bg)',
      fg: 'var(--success-text)',
      icon: 'check_circle',
      label: `In ${days}d`
    },
    due_today: {
      bg: 'var(--warning-bg)',
      fg: 'var(--warning-text)',
      icon: 'clock',
      label: `Due in ${days}d`
    },
    overdue: {
      bg: 'var(--danger-bg)',
      fg: 'var(--danger-text)',
      icon: 'alert_triangle',
      label: `${Math.abs(days)}d overdue`
    }
  }[state];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 9px',
      borderRadius: 'var(--radius-pill)',
      background: cfg.bg,
      color: cfg.fg,
      fontSize: 11.5,
      fontWeight: 600,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: cfg.icon,
    size: 11
  }), " ", cfg.label), blocked && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--danger-bg)',
      color: 'var(--danger-text)',
      fontSize: 10.5,
      fontWeight: 700,
      whiteSpace: 'nowrap',
      letterSpacing: '0.02em'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 9
  }), " Blocked from Issue"));
}

/* ── Record Calibration Modal ──────────────────────────────────────── */
function RecordCalibrationModal({
  item,
  onClose
}) {
  const {
    Modal,
    Button,
    Input,
    Textarea
  } = NS_CAL;
  const [date, setDate] = React.useState('2026-06-14');
  const [partner, setPartner] = React.useState(item.service_partner || '');
  const [certNo, setCertNo] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const nextDue = React.useMemo(() => {
    const d = new Date(date);
    if (isNaN(d)) return '—';
    d.setDate(d.getDate() + item.freq);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }, [date, item.freq]);
  const InfoPill = ({
    label,
    value,
    danger
  }) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: 'var(--text-subtle)',
      marginBottom: 2,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 600
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: danger ? 'var(--danger-text)' : 'var(--text-default)'
    }
  }, value));
  return /*#__PURE__*/React.createElement(Modal, {
    open: true,
    onClose: onClose,
    title: "Record Calibration",
    width: 520,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      loading: busy,
      onClick: () => {
        setBusy(true);
        setTimeout(onClose, 700);
      }
    }, "Save Record"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: 14,
      padding: '14px 16px',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / 3'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: 'var(--text-subtle)',
      marginBottom: 2,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 600
    }
  }, "Tool Name"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, item.tool_name)), /*#__PURE__*/React.createElement(InfoPill, {
    label: "Tool Code",
    value: item.tool_code
  }), /*#__PURE__*/React.createElement(InfoPill, {
    label: "Frequency",
    value: `${item.freq} days`
  }), /*#__PURE__*/React.createElement(InfoPill, {
    label: "Last Calibrated",
    value: item.last
  }), /*#__PURE__*/React.createElement(InfoPill, {
    label: "Current Next Due",
    value: item.next,
    danger: item.state === 'overdue'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Calibration Date",
    required: true,
    type: "date",
    value: date,
    onChange: e => setDate(e.target.value)
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Service Partner",
    required: true,
    value: partner,
    onChange: e => setPartner(e.target.value),
    placeholder: "Vendor / lab name"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Certificate Number",
    value: certNo,
    onChange: e => setCertNo(e.target.value),
    placeholder: "e.g. CERT-2026-0412"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--text-default)',
      marginBottom: 6
    }
  }, "Certificate Upload"), /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      border: '1.5px dashed var(--border-default)',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      fontSize: 12.5,
      transition: 'border-color 0.15s'
    },
    onMouseEnter: e => e.currentTarget.style.borderColor = 'var(--brand-yellow)',
    onMouseLeave: e => e.currentTarget.style.borderColor = 'var(--border-default)'
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "download",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, "Upload PDF / image"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: ".pdf,.jpg,.png",
    style: {
      display: 'none'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement(Textarea, {
    label: "Notes",
    rows: 2,
    value: notes,
    onChange: e => setNotes(e.target.value),
    placeholder: "Observations, adjustments, certificate remarks\u2026"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '13px 16px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--info-bg)',
      border: '1px solid var(--info-border)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--info-text)',
      fontWeight: 600,
      opacity: 0.75
    }
  }, "NEXT CALIBRATION DUE (PREVIEW)"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--info-text)',
      marginTop: 2
    }
  }, "Based on calibration date + ", item.freq, "-day cycle")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 800,
      color: 'var(--info-text)'
    }
  }, nextDue)));
}

/* ── History Modal ─────────────────────────────────────────────────── */
function HistoryModal({
  item,
  onClose
}) {
  const {
    Modal,
    Button
  } = NS_CAL;
  const logs = CAL_HISTORY[item.id] || [];
  return /*#__PURE__*/React.createElement(Modal, {
    open: true,
    onClose: onClose,
    title: "Calibration History",
    width: 680,
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "Close")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 22,
      padding: '11px 14px',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)',
      marginBottom: 18
    }
  }, [['Tool', item.tool_name], ['Code', item.tool_code], ['Dept', item.dept], ['Frequency', `Every ${item.freq} days`]].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: 'var(--text-subtle)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 600
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--text-default)',
      marginTop: 2
    }
  }, v)))), logs.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      color: 'var(--text-subtle)',
      padding: '32px 0',
      fontSize: 13
    }
  }, "No calibration history recorded yet.") : /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--surface-sunken)',
      borderBottom: '1px solid var(--border-default)'
    }
  }, ['Date', 'Service Partner', 'Cert No.', 'Recorded By', 'Notes', 'File'].map((h, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    style: {
      padding: '9px 12px',
      textAlign: 'left',
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap'
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, logs.map((log, i) => /*#__PURE__*/React.createElement("tr", {
    key: log.id,
    style: {
      borderBottom: i < logs.length - 1 ? '1px solid var(--border-subtle)' : 'none',
      transition: 'background 0.1s'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-sunken)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 12px',
      whiteSpace: 'nowrap',
      fontWeight: 500,
      color: 'var(--text-default)'
    }
  }, log.date), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 12px',
      color: 'var(--text-default)'
    }
  }, log.partner), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 12px',
      fontFamily: 'monospace',
      fontSize: 12,
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap'
    }
  }, log.cert_no), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 12px',
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap'
    }
  }, log.by), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 12px',
      color: 'var(--text-muted)',
      maxWidth: 180
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, log.notes)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 12px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 12,
      color: 'var(--text-muted)',
      border: '1px solid var(--border-default)',
      background: 'transparent',
      borderRadius: 'var(--radius-sm)',
      padding: '3px 8px',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-sunken)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "download",
    size: 12
  }), " PDF"))))))));
}

/* ── Main screen ───────────────────────────────────────────────────── */
function CalibrationScreen() {
  const {
    PageHeader,
    Card,
    Tabs,
    DataTable,
    Button,
    EmptyState
  } = NS_CAL;
  const [search, setSearch] = React.useState('');
  const [deptFilter, setDeptFilter] = React.useState('all');
  const [partnerFilter, setPartnerFilter] = React.useState('all');
  const [tab, setTab] = React.useState('all');
  const [rec, setRec] = React.useState(null);
  const [hist, setHist] = React.useState(null);
  const depts = [...new Set(CAL_DATA.map(c => c.dept))];
  const partners = [...new Set(CAL_DATA.map(c => c.service_partner))];
  const stateMap = {
    overdue: ['overdue'],
    due_soon: ['due_today'],
    up_to_date: ['on_time']
  };
  const filtered = CAL_DATA.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.tool_name.toLowerCase().includes(q) || c.tool_code.toLowerCase().includes(q) || c.dept.toLowerCase().includes(q);
    return matchQ && (deptFilter === 'all' || c.dept === deptFilter) && (partnerFilter === 'all' || c.service_partner === partnerFilter) && (tab === 'all' || stateMap[tab].includes(c.state));
  });
  const cnt = k => CAL_DATA.filter(x => stateMap[k].includes(x.state)).length;
  const summaryCards = [{
    label: 'Overdue',
    value: cnt('overdue'),
    icon: 'alert_triangle',
    color: 'var(--danger-text)',
    bg: 'var(--danger-bg)'
  }, {
    label: 'Due Soon',
    value: cnt('due_soon'),
    icon: 'clock',
    color: 'var(--warning-text)',
    bg: 'var(--warning-bg)'
  }, {
    label: 'Up to Date',
    value: cnt('up_to_date'),
    icon: 'check_circle',
    color: 'var(--success-text)',
    bg: 'var(--success-bg)'
  }, {
    label: 'Blocked from Issue',
    value: CAL_DATA.filter(c => c.blocked).length,
    icon: 'x',
    color: 'var(--danger-text)',
    bg: 'var(--danger-bg)'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Calibration",
    subtitle: "Calibration schedule, service records and compliance tracking"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 14
    }
  }, summaryCards.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.label,
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 'var(--radius-md)',
      background: s.bg,
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: s.icon,
    size: 18,
    color: s.color
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--text-strong)',
      lineHeight: 1
    }
  }, s.value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)',
      marginTop: 3
    }
  }, s.label))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: 1,
      minWidth: 220
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 14,
    color: "var(--text-subtle)",
    style: {
      position: 'absolute',
      left: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: search,
    onChange: e => setSearch(e.target.value),
    placeholder: "Search tool code, name or department\u2026",
    style: {
      width: '100%',
      paddingLeft: 32,
      paddingRight: 12,
      height: 36,
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13.5,
      color: 'var(--text-default)',
      background: 'var(--surface-card)',
      outline: 'none',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("select", {
    value: deptFilter,
    onChange: e => setDeptFilter(e.target.value),
    style: {
      height: 36,
      padding: '0 12px',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13.5,
      color: 'var(--text-default)',
      background: 'var(--surface-card)',
      cursor: 'pointer',
      outline: 'none'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "All Depts"), depts.map(d => /*#__PURE__*/React.createElement("option", {
    key: d,
    value: d
  }, d))), /*#__PURE__*/React.createElement("select", {
    value: partnerFilter,
    onChange: e => setPartnerFilter(e.target.value),
    style: {
      height: 36,
      padding: '0 12px',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13.5,
      color: 'var(--text-default)',
      background: 'var(--surface-card)',
      cursor: 'pointer',
      outline: 'none'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "All Partners"), partners.map(p => /*#__PURE__*/React.createElement("option", {
    key: p,
    value: p
  }, p)))), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    tabs: [{
      value: 'all',
      label: 'All'
    }, {
      value: 'overdue',
      label: 'Overdue',
      count: cnt('overdue'),
      tone: 'danger'
    }, {
      value: 'due_soon',
      label: 'Due Soon',
      count: cnt('due_soon')
    }, {
      value: 'up_to_date',
      label: 'Up to Date',
      count: cnt('up_to_date')
    }]
  })), /*#__PURE__*/React.createElement(Card, {
    padded: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: 'tool_name',
      header: 'Tool',
      render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 600,
          color: 'var(--text-strong)'
        }
      }, r.tool_name), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'monospace',
          fontSize: 11.5,
          color: 'var(--text-muted)',
          marginTop: 1
        }
      }, r.tool_code))
    }, {
      key: 'dept',
      header: 'Dept',
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-muted)'
        }
      }, r.dept)
    }, {
      key: 'last',
      header: 'Schedule',
      render: r => /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12.5,
          lineHeight: 1.6
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--text-muted)'
        }
      }, r.last), /*#__PURE__*/React.createElement("div", {
        style: {
          color: r.state === 'overdue' ? 'var(--danger-text)' : 'var(--text-default)',
          fontWeight: 500
        }
      }, "\u2192 ", r.next))
    }, {
      key: 'service_partner',
      header: 'Service / Freq.',
      render: r => /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12.5,
          lineHeight: 1.6
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--text-default)'
        }
      }, r.service_partner), /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--text-muted)'
        }
      }, "Every ", r.freq, "d"))
    }, {
      key: 'state',
      header: 'Status',
      render: r => /*#__PURE__*/React.createElement(CalDueCell, {
        state: r.state,
        days: r.days,
        blocked: r.blocked
      })
    }, {
      key: 'actions',
      header: '',
      nowrap: true,
      render: r => /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 6
        }
      }, /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: r.state === 'overdue' ? 'primary' : 'secondary',
        onClick: () => setRec(r)
      }, "Record"), /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        onClick: () => setHist(r)
      }, "History"), /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary"
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "download",
        size: 13
      })))
    }],
    rows: filtered,
    getRowTone: r => r.state === 'overdue' ? 'danger' : null,
    empty: /*#__PURE__*/React.createElement(EmptyState, {
      tone: "success",
      compact: true,
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "check_circle",
        size: 24
      }),
      title: "Nothing found",
      message: "No tools match your current filters."
    })
  })), rec && /*#__PURE__*/React.createElement(RecordCalibrationModal, {
    item: rec,
    onClose: () => setRec(null)
  }), hist && /*#__PURE__*/React.createElement(HistoryModal, {
    item: hist,
    onClose: () => setHist(null)
  }));
}
Object.assign(window, {
  CalibrationScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mtrs/CalibrationScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mtrs/DashboardScreen.jsx
try { (() => {
const NS_DASH = window.MTRSDesignSystemUltraTechCement_660dc9;

/* ── Centred overlay panel ─────────────────────────────────────────── */
function CentrePanel({
  title,
  subtitle,
  onClose,
  children
}) {
  React.useEffect(() => {
    if (!document.getElementById('dp-anim')) {
      const s = document.createElement('style');
      s.id = 'dp-anim';
      s.textContent = '@keyframes dpBg{from{opacity:0}to{opacity:1}} @keyframes dpBox{from{opacity:0;transform:translateY(22px) scale(0.97)}to{opacity:1;transform:none}}';
      document.head.appendChild(s);
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      if (e.target === e.currentTarget) onClose();
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 60,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 28,
      animation: 'dpBg 0.18s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '90vw',
      maxWidth: 1100,
      height: '88vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-page,#f5f6f8)',
      borderRadius: 'var(--radius-xl,16px)',
      boxShadow: '0 32px 80px rgba(0,0,0,0.26), 0 8px 24px rgba(0,0,0,0.12)',
      overflow: 'hidden',
      animation: 'dpBox 0.24s cubic-bezier(0.34,1.1,0.64,1)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 28px',
      borderBottom: '1px solid var(--border-default)',
      background: 'var(--surface-card)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)',
      marginTop: 3
    }
  }, subtitle)), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 34,
      height: 34,
      border: '1px solid var(--border-default)',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 17
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: 28,
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(0,0,0,0.12) transparent'
    }
  }, children)));
}

/* ── Chip filter row ───────────────────────────────────────────────── */
function ChipGroup({
  label,
  value,
  onChange,
  options
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--text-subtle)',
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      flexShrink: 0
    }
  }, label), options.map(opt => {
    const active = value === opt.value;
    return /*#__PURE__*/React.createElement("button", {
      key: opt.value,
      onClick: () => onChange(opt.value),
      style: {
        padding: '4px 11px',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        minWidth: 0,
        background: active ? 'var(--brand-black)' : 'transparent',
        color: active ? '#fff' : 'var(--text-muted)',
        borderColor: active ? 'var(--brand-black)' : 'var(--border-default)',
        transition: 'background 0.13s, color 0.13s, border-color 0.13s'
      }
    }, opt.label);
  }));
}

/* ── Per-tool issuance breakdown modal ────────────────────────────── */
function ToolDetailModal({
  tool,
  onClose
}) {
  const issued = (window.MOCK.ACTIVE_ISSUANCES || []).filter(i => i.tool_code === tool.tool_code || i.tool_name === tool.name);
  const availCount = tool.available;
  const STATE_BADGE = {
    on_time: ['var(--success-bg)', 'var(--success-text)', 'On Time'],
    due_today: ['var(--warning-bg)', 'var(--warning-text)', 'Due Today'],
    overdue: ['var(--danger-bg)', 'var(--danger-text)', 'Overdue']
  };
  const SectionHead = ({
    label
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '9px 24px 7px',
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      color: 'var(--text-subtle)',
      background: 'var(--surface-sunken)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, label);
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      if (e.target === e.currentTarget) onClose();
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 70,
      background: 'rgba(0,0,0,0.32)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 48,
      animation: 'dpBg 0.15s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 640,
      maxHeight: '78vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-xl,16px)',
      boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
      overflow: 'hidden',
      animation: 'dpBox 0.2s cubic-bezier(0.34,1.1,0.64,1)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 24px',
      borderBottom: '1px solid var(--border-default)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'monospace',
      fontSize: 11,
      color: 'var(--text-subtle)',
      marginBottom: 3
    }
  }, tool.tool_code), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, tool.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 6,
      fontSize: 12,
      color: 'var(--text-muted)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      textTransform: 'capitalize'
    }
  }, tool.tool_type), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", null, "Bin: ", /*#__PURE__*/React.createElement("b", null, tool.bin)), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: tool.available > 0 ? 'var(--success-text)' : 'var(--danger-text)',
      fontWeight: 600
    }
  }, tool.available, " available"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-subtle)'
    }
  }, "/ ", tool.total, " total"))), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 32,
      height: 32,
      border: '1px solid var(--border-default)',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 16
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(0,0,0,0.1) transparent'
    }
  }, issued.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionHead, {
    label: `Issued — ${issued.length} unit${issued.length > 1 ? 's' : ''} out`
  }), issued.map((i, idx) => {
    const [bg, fg, lbl] = STATE_BADGE[i.state] || STATE_BADGE.on_time;
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '13px 24px',
        borderBottom: '1px solid var(--border-subtle)',
        background: i.state === 'overdue' ? 'var(--danger-bg)' : 'transparent'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'var(--surface-sunken)',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "user",
      size: 15,
      color: "var(--text-muted)"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        color: 'var(--text-strong)',
        fontSize: 13.5
      }
    }, i.issued_to), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--text-muted)',
        marginTop: 1
      }
    }, i.dept)), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'right',
        fontSize: 12,
        color: 'var(--text-muted)',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", null, "Issued: ", i.issued_on), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        color: i.state === 'overdue' ? 'var(--danger-text)' : 'inherit',
        marginTop: 2
      }
    }, "Due: ", i.due)), /*#__PURE__*/React.createElement("span", {
      style: {
        padding: '3px 10px',
        borderRadius: 'var(--radius-pill)',
        background: bg,
        color: fg,
        fontSize: 11.5,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        flexShrink: 0
      }
    }, lbl));
  })), availCount > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionHead, {
    label: `Available — ${availCount} unit${availCount > 1 ? 's' : ''} in stock`
  }), Array.from({
    length: availCount
  }, (_, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '13px 24px',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: 'var(--success-bg)',
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check_circle",
    size: 15,
    color: "var(--success-solid,var(--success-text))"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, "Unit #", issued.length + idx + 1, " \u2014 In storage (", tool.bin, ")")), /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '3px 10px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--success-bg)',
      color: 'var(--success-text)',
      fontSize: 11.5,
      fontWeight: 600
    }
  }, "Available")))), issued.length === 0 && availCount === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '32px 24px',
      textAlign: 'center',
      color: 'var(--text-subtle)',
      fontSize: 13
    }
  }, "No unit data available for this tool."))));
}
function DashboardScreen({
  onNavigate
}) {
  const {
    PageHeader,
    MetricCard,
    Card,
    EmptyState,
    Badge,
    DataTable,
    StatusBadge,
    Input
  } = NS_DASH;
  const s = window.MOCK.SUMMARY;
  const [activePanel, setActivePanel] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [fType, setFType] = React.useState('');
  const [fStatus, setFStatus] = React.useState('');
  const [fDept, setFDept] = React.useState('');
  const [fState, setFState] = React.useState('');
  const [selectedTool, setSelectedTool] = React.useState(null);
  const DEPTS = ['E&I', 'Mechanical', 'Civil', 'Process'];
  const openPanel = panel => {
    setActivePanel(panel);
    setSearch('');
    setFType('');
    setFStatus('');
    setFDept('');
    setFState('');
  };

  /* ── Filtered rows ─────────────────────────────────────────────── */
  const totalRows = window.MOCK.TOOLS.filter(t => {
    if (search && !`${t.name} ${t.tool_code}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (fType && t.tool_type !== fType) return false;
    if (fStatus && t.status !== fStatus) return false;
    if (fDept && t.department_access !== fDept) return false;
    return true;
  });
  const availRows = window.MOCK.TOOLS.filter(t => {
    if (t.available <= 0) return false;
    if (search && !`${t.name} ${t.tool_code}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (fType && t.tool_type !== fType) return false;
    if (fDept && t.department_access !== fDept) return false;
    return true;
  });
  const issuedRows = (window.MOCK.ACTIVE_ISSUANCES || []).filter(i => {
    if (search && !`${i.tool_name} ${i.issued_to} ${i.tool_code}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (fDept && i.dept !== fDept) return false;
    if (fState && i.state !== fState) return false;
    return true;
  });

  /* ── Panel definitions ─────────────────────────────────────────── */
  const STATE_BADGE = {
    on_time: ['var(--success-bg)', 'var(--success-text)', 'On Time'],
    due_today: ['var(--warning-bg)', 'var(--warning-text)', 'Due Today'],
    overdue: ['var(--danger-bg)', 'var(--danger-text)', 'Overdue']
  };
  const FilterBar = ({
    children
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: '16px 0 20px',
      borderBottom: '1px solid var(--border-subtle)',
      marginBottom: 16
    }
  }, children);
  const PANELS = {
    total: {
      title: 'All Tools',
      subtitle: `${s.total_tools.toLocaleString()} tools in catalogue`,
      content: /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 0
        }
      }, /*#__PURE__*/React.createElement(FilterBar, null, /*#__PURE__*/React.createElement(Input, {
        icon: /*#__PURE__*/React.createElement(Icon, {
          name: "search",
          size: 14
        }),
        placeholder: "Search name or code\u2026",
        value: search,
        onChange: e => setSearch(e.target.value)
      }), /*#__PURE__*/React.createElement(ChipGroup, {
        label: "Type",
        value: fType,
        onChange: setFType,
        options: [{
          value: '',
          label: 'All'
        }, {
          value: 'general',
          label: 'General'
        }, {
          value: 'specialized',
          label: 'Specialized'
        }]
      }), /*#__PURE__*/React.createElement(ChipGroup, {
        label: "Status",
        value: fStatus,
        onChange: setFStatus,
        options: [{
          value: '',
          label: 'All'
        }, {
          value: 'active',
          label: 'Active'
        }, {
          value: 'calibration_due',
          label: 'Cal Due'
        }, {
          value: 'damaged',
          label: 'Damaged'
        }]
      }), /*#__PURE__*/React.createElement(ChipGroup, {
        label: "Dept",
        value: fDept,
        onChange: setFDept,
        options: [{
          value: '',
          label: 'All'
        }, ...DEPTS.map(d => ({
          value: d,
          label: d
        }))]
      })), /*#__PURE__*/React.createElement(DataTable, {
        columns: [{
          key: 'tool_code',
          header: 'Code',
          mono: true,
          nowrap: true
        }, {
          key: 'name',
          header: 'Tool Name',
          render: t => /*#__PURE__*/React.createElement("span", {
            style: {
              fontWeight: 600,
              color: 'var(--text-strong)'
            }
          }, t.name)
        }, {
          key: 'tool_type',
          header: 'Type',
          render: t => /*#__PURE__*/React.createElement("span", {
            style: {
              textTransform: 'capitalize',
              color: 'var(--text-muted)'
            }
          }, t.tool_type)
        }, {
          key: 'dept',
          header: 'Dept Access',
          render: t => t.department_access || /*#__PURE__*/React.createElement("span", {
            style: {
              color: 'var(--text-subtle)'
            }
          }, "All")
        }, {
          key: 'avail',
          header: 'Avail / Total',
          align: 'right',
          nowrap: true,
          render: t => /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
            style: {
              color: t.available > 0 ? 'var(--success-text)' : 'var(--danger-text)'
            }
          }, t.available), /*#__PURE__*/React.createElement("span", {
            style: {
              color: 'var(--text-subtle)'
            }
          }, " / ", t.total))
        }, {
          key: 'status',
          header: 'Status',
          render: t => /*#__PURE__*/React.createElement(StatusBadge, {
            status: t.status,
            size: "sm"
          })
        }, {
          key: 'bin',
          header: 'Bin',
          mono: true,
          render: t => /*#__PURE__*/React.createElement("span", {
            style: {
              color: 'var(--text-muted)'
            }
          }, t.bin)
        }],
        rows: totalRows,
        onRowClick: t => setSelectedTool(t),
        empty: /*#__PURE__*/React.createElement(EmptyState, {
          icon: /*#__PURE__*/React.createElement(Icon, {
            name: "wrench",
            size: 28
          }),
          title: "No tools found",
          message: "Try adjusting your filters."
        })
      }))
    },
    available: {
      title: 'Available Tools',
      subtitle: `${s.available_tools.toLocaleString()} units ready to issue`,
      content: /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 0
        }
      }, /*#__PURE__*/React.createElement(FilterBar, null, /*#__PURE__*/React.createElement(Input, {
        icon: /*#__PURE__*/React.createElement(Icon, {
          name: "search",
          size: 14
        }),
        placeholder: "Search name or code\u2026",
        value: search,
        onChange: e => setSearch(e.target.value)
      }), /*#__PURE__*/React.createElement(ChipGroup, {
        label: "Type",
        value: fType,
        onChange: setFType,
        options: [{
          value: '',
          label: 'All'
        }, {
          value: 'general',
          label: 'General'
        }, {
          value: 'specialized',
          label: 'Specialized'
        }]
      }), /*#__PURE__*/React.createElement(ChipGroup, {
        label: "Dept",
        value: fDept,
        onChange: setFDept,
        options: [{
          value: '',
          label: 'All'
        }, ...DEPTS.map(d => ({
          value: d,
          label: d
        }))]
      })), /*#__PURE__*/React.createElement(DataTable, {
        columns: [{
          key: 'tool_code',
          header: 'Code',
          mono: true,
          nowrap: true
        }, {
          key: 'name',
          header: 'Tool Name',
          render: t => /*#__PURE__*/React.createElement("span", {
            style: {
              fontWeight: 600,
              color: 'var(--text-strong)'
            }
          }, t.name)
        }, {
          key: 'tool_type',
          header: 'Type',
          render: t => /*#__PURE__*/React.createElement("span", {
            style: {
              textTransform: 'capitalize',
              color: 'var(--text-muted)'
            }
          }, t.tool_type)
        }, {
          key: 'dept',
          header: 'Dept Access',
          render: t => t.department_access || /*#__PURE__*/React.createElement("span", {
            style: {
              color: 'var(--text-subtle)'
            }
          }, "All")
        }, {
          key: 'available',
          header: 'Available',
          align: 'right',
          render: t => /*#__PURE__*/React.createElement("span", {
            style: {
              fontWeight: 700,
              color: 'var(--success-text)',
              fontSize: 15
            }
          }, t.available)
        }, {
          key: 'total',
          header: 'Total',
          align: 'right',
          render: t => /*#__PURE__*/React.createElement("span", {
            style: {
              color: 'var(--text-muted)'
            }
          }, t.total)
        }, {
          key: 'bin',
          header: 'Bin',
          mono: true,
          render: t => /*#__PURE__*/React.createElement("span", {
            style: {
              color: 'var(--text-muted)'
            }
          }, t.bin)
        }],
        rows: availRows,
        onRowClick: t => setSelectedTool(t),
        empty: /*#__PURE__*/React.createElement(EmptyState, {
          icon: /*#__PURE__*/React.createElement(Icon, {
            name: "check_circle",
            size: 28
          }),
          title: "No available tools",
          message: "Try adjusting your filters."
        })
      }))
    },
    issued: {
      title: 'Currently Issued',
      subtitle: `${s.tools_issued} tools out in the field`,
      content: /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 0
        }
      }, /*#__PURE__*/React.createElement(FilterBar, null, /*#__PURE__*/React.createElement(Input, {
        icon: /*#__PURE__*/React.createElement(Icon, {
          name: "search",
          size: 14
        }),
        placeholder: "Search tool or employee\u2026",
        value: search,
        onChange: e => setSearch(e.target.value)
      }), /*#__PURE__*/React.createElement(ChipGroup, {
        label: "Dept",
        value: fDept,
        onChange: setFDept,
        options: [{
          value: '',
          label: 'All'
        }, ...DEPTS.map(d => ({
          value: d,
          label: d
        }))]
      }), /*#__PURE__*/React.createElement(ChipGroup, {
        label: "Status",
        value: fState,
        onChange: setFState,
        options: [{
          value: '',
          label: 'All'
        }, {
          value: 'on_time',
          label: 'On Time'
        }, {
          value: 'due_today',
          label: 'Due Today'
        }, {
          value: 'overdue',
          label: 'Overdue'
        }]
      })), /*#__PURE__*/React.createElement(DataTable, {
        columns: [{
          key: 'tool_code',
          header: 'Code',
          mono: true,
          nowrap: true
        }, {
          key: 'tool_name',
          header: 'Tool',
          render: i => /*#__PURE__*/React.createElement("span", {
            style: {
              fontWeight: 600,
              color: 'var(--text-strong)'
            }
          }, i.tool_name)
        }, {
          key: 'issued_to',
          header: 'Issued To',
          render: i => /*#__PURE__*/React.createElement("span", {
            style: {
              fontWeight: 500
            }
          }, i.issued_to)
        }, {
          key: 'dept',
          header: 'Dept',
          render: i => /*#__PURE__*/React.createElement("span", {
            style: {
              color: 'var(--text-muted)'
            }
          }, i.dept)
        }, {
          key: 'issued_on',
          header: 'Issued On',
          nowrap: true,
          render: i => /*#__PURE__*/React.createElement("span", {
            style: {
              color: 'var(--text-muted)',
              fontSize: 12
            }
          }, i.issued_on)
        }, {
          key: 'due',
          header: 'Due Date',
          nowrap: true,
          render: i => /*#__PURE__*/React.createElement("span", {
            style: {
              color: i.state === 'overdue' ? 'var(--danger-text)' : 'var(--text-muted)',
              fontWeight: i.state === 'overdue' ? 600 : 400,
              fontSize: 12
            }
          }, i.due)
        }, {
          key: 'state',
          header: 'Status',
          render: i => {
            const [bg, fg, lbl] = STATE_BADGE[i.state] || STATE_BADGE.on_time;
            return /*#__PURE__*/React.createElement("span", {
              style: {
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                background: bg,
                color: fg,
                fontSize: 11.5,
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }
            }, lbl);
          }
        }],
        rows: issuedRows,
        getRowTone: i => i.state === 'overdue' ? 'danger' : i.state === 'due_today' ? 'warning' : null,
        empty: /*#__PURE__*/React.createElement(EmptyState, {
          icon: /*#__PURE__*/React.createElement(Icon, {
            name: "package",
            size: 28
          }),
          title: "No active issuances",
          message: "Try adjusting your filters."
        })
      }))
    }
  };
  const panel = activePanel ? PANELS[activePanel] : null;
  const SectionCard = ({
    title,
    count,
    children
  }) => /*#__PURE__*/React.createElement(Card, {
    title: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--text-strong)'
      }
    }, title), count != null && /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral"
    }, count)),
    padded: false
  }, children);
  const viewLink = (panelKey, label, color) => /*#__PURE__*/React.createElement("a", {
    onClick: () => openPanel(panelKey),
    style: {
      fontSize: 12,
      fontWeight: 600,
      color,
      cursor: 'pointer',
      textDecoration: 'underline'
    }
  }, label);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 22
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Dashboard",
    subtitle: "Welcome back, Rajesh Menon \xB7 Maintenance"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(MetricCard, {
    label: "Total Tools",
    value: "1,284",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "wrench",
      size: 19
    }),
    action: viewLink('total', 'View all', 'var(--info-text)')
  }), /*#__PURE__*/React.createElement(MetricCard, {
    label: "Available",
    value: "947",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "check_circle",
      size: 19
    }),
    action: viewLink('available', 'View list', 'var(--success-text)')
  }), /*#__PURE__*/React.createElement(MetricCard, {
    label: "Currently Issued",
    value: "312",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "package",
      size: 19
    }),
    action: viewLink('issued', 'View issued', 'var(--text-muted)')
  }), /*#__PURE__*/React.createElement(MetricCard, {
    label: "Overdue Returns",
    value: s.overdue_count,
    tone: "danger",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "clock",
      size: 19
    }),
    action: /*#__PURE__*/React.createElement("a", {
      onClick: () => onNavigate('returns'),
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--danger-text)',
        cursor: 'pointer',
        textDecoration: 'underline'
      }
    }, "View all")
  }), /*#__PURE__*/React.createElement(MetricCard, {
    label: "Calibration Due",
    value: s.calibration_due_count,
    tone: "warning",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "activity",
      size: 19
    }),
    action: /*#__PURE__*/React.createElement("a", {
      onClick: () => onNavigate('calibration'),
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--warning-text)',
        cursor: 'pointer',
        textDecoration: 'underline'
      }
    }, "Manage")
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(SectionCard, {
    title: "My Active Issuances",
    count: window.MOCK.MY_ISSUANCES.length + ' open'
  }, /*#__PURE__*/React.createElement("div", null, window.MOCK.MY_ISSUANCES.map(i => /*#__PURE__*/React.createElement("div", {
    key: i.id,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 20px',
      borderBottom: '1px solid var(--border-subtle)',
      background: i.overdue ? 'var(--danger-bg)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, i.tool_name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, "Qty: ", i.quantity_issued, " \xB7 Due: ", i.due)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: 'var(--radius-pill)',
      background: i.overdue ? '#fff' : 'var(--success-bg)',
      color: i.overdue ? 'var(--danger-text)' : 'var(--success-text)'
    }
  }, i.days))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(QueueRow, {
    label: "Pending Approvals",
    value: s.pending_approvals_count,
    tone: "warning",
    cta: "Review",
    onClick: () => onNavigate('approvals')
  }), /*#__PURE__*/React.createElement(QueueRow, {
    label: "Ready to Issue",
    value: s.approved_queue_count,
    tone: "info",
    cta: "Issue",
    onClick: () => onNavigate('issuance')
  }), /*#__PURE__*/React.createElement(QueueRow, {
    label: "My Pending Requests",
    value: s.my_pending_requests,
    tone: "default",
    cta: "View",
    onClick: () => onNavigate('requisitions')
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(SectionCard, {
    title: "Overdue Returns",
    count: s.overdue_count
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 20px',
      fontSize: 13,
      color: 'var(--text-default)'
    }
  }, /*#__PURE__*/React.createElement("strong", null, s.overdue_count), " issuance(s) past due date. Open the ", /*#__PURE__*/React.createElement("a", {
    onClick: () => onNavigate('returns'),
    style: {
      color: 'var(--info-text)',
      cursor: 'pointer',
      textDecoration: 'underline'
    }
  }, "Returns page"), " for details.")), /*#__PURE__*/React.createElement(SectionCard, {
    title: "Low Stock Tools",
    count: window.MOCK.LOW_STOCK.length + ' tools'
  }, /*#__PURE__*/React.createElement("div", null, window.MOCK.LOW_STOCK.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '11px 20px',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, t.name), /*#__PURE__*/React.createElement("div", {
    className: "mtrs-mono",
    style: {
      fontSize: 11.5,
      color: 'var(--text-muted)',
      marginTop: 1
    }
  }, t.tool_code)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontVariantNumeric: 'tabular-nums'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: t.available === 0 ? 'var(--danger-text)' : 'var(--warning-text)'
    }
  }, t.available), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'var(--text-subtle)'
    }
  }, " / ", t.total))))))), activePanel && panel && /*#__PURE__*/React.createElement(CentrePanel, {
    title: panel.title,
    subtitle: panel.subtitle,
    onClose: () => {
      setActivePanel(null);
      setSelectedTool(null);
    }
  }, panel.content), selectedTool && /*#__PURE__*/React.createElement(ToolDetailModal, {
    tool: selectedTool,
    onClose: () => setSelectedTool(null)
  }));
}
function QueueRow({
  label,
  value,
  tone,
  cta,
  onClick
}) {
  const TONE = {
    warning: {
      border: 'var(--warning-border)',
      bg: 'var(--warning-bg)',
      fig: 'var(--warning-text)',
      btnBg: 'var(--warning-bg)',
      btnFg: 'var(--warning-text)'
    },
    info: {
      border: 'var(--info-border)',
      bg: 'var(--info-bg)',
      fig: 'var(--info-text)',
      btnBg: 'var(--info-bg)',
      btnFg: 'var(--info-text)'
    },
    default: {
      border: 'var(--border-default)',
      bg: 'var(--surface-card)',
      fig: 'var(--text-strong)',
      btnBg: 'var(--surface-sunken)',
      btnFg: 'var(--text-default)'
    }
  }[tone];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 18px',
      background: TONE.bg,
      border: `1px solid ${TONE.border}`,
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-resting)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--type-metric-size)',
      fontWeight: 700,
      color: TONE.fig,
      fontVariantNumeric: 'tabular-nums',
      lineHeight: 1.1
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)',
      marginTop: 3
    }
  }, label)), /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 13px',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      background: TONE.btnBg,
      color: TONE.btnFg,
      fontSize: 12.5,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)'
    }
  }, cta, " ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow_right",
    size: 13
  })));
}
Object.assign(window, {
  DashboardScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mtrs/DashboardScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mtrs/Data.jsx
try { (() => {
/* Mock data for the MTRS UI kit — shapes mirror the real API responses. */
const USER = {
  full_name: 'Rajesh Menon',
  department: 'Maintenance',
  role: 'maintenance_admin'
};
const NOTIFS = [{
  message: 'Requisition REQ-2026-0188 is awaiting your approval.',
  date: '14 Jun 2026'
}, {
  message: 'Insulation Tester (TL-0088) calibration is overdue.',
  date: '13 Jun 2026'
}, {
  message: 'Hydraulic Bearing Puller returned damaged — assessment pending.',
  date: '12 Jun 2026'
}];
const SUMMARY = {
  total_tools: 1284,
  available_tools: 947,
  tools_issued: 312,
  overdue_count: 3,
  calibration_due_count: 5,
  my_pending_requests: 2,
  pending_approvals_count: 4,
  approved_queue_count: 6
};
const MY_ISSUANCES = [{
  id: 1,
  tool_name: 'Digital Multimeter',
  quantity_issued: 1,
  due: '18 Jun 2026',
  days: '4d left',
  overdue: false
}, {
  id: 2,
  tool_name: 'Torque Wrench 1/2"',
  quantity_issued: 1,
  due: '12 Jun 2026',
  days: '2d overdue',
  overdue: true
}];
const LOW_STOCK = [{
  name: 'Insulation Tester',
  tool_code: 'TL-0088',
  available: 0,
  total: 2
}, {
  name: 'Hydraulic Bearing Puller',
  tool_code: 'TL-0211',
  available: 1,
  total: 1
}, {
  name: 'Welding Rods (3.2mm)',
  tool_code: 'CN-0451',
  available: 12,
  total: 200
}];
const TOOLS = [{
  id: 1,
  tool_code: 'TL-0142',
  name: 'Digital Torque Wrench',
  tool_type: 'specialized',
  department_access: 'Mechanical',
  available: 2,
  total: 4,
  status: 'active',
  bin: 'A-12-03'
}, {
  id: 2,
  tool_code: 'TL-0088',
  name: 'Insulation Tester',
  tool_type: 'specialized',
  department_access: 'E&I',
  available: 0,
  total: 2,
  status: 'calibration_due',
  bin: 'B-04-11'
}, {
  id: 3,
  tool_code: 'TL-0211',
  name: 'Hydraulic Bearing Puller',
  tool_type: 'specialized',
  department_access: 'Mechanical',
  available: 1,
  total: 1,
  status: 'damaged',
  bin: 'C-09-02'
}, {
  id: 4,
  tool_code: 'TL-0007',
  name: 'Aluminium Step Ladder',
  tool_type: 'general',
  department_access: null,
  available: 14,
  total: 18,
  status: 'active',
  bin: 'A-01-01'
}, {
  id: 5,
  tool_code: 'TL-0319',
  name: 'Digital Multimeter',
  tool_type: 'specialized',
  department_access: 'E&I',
  available: 6,
  total: 10,
  status: 'active',
  bin: 'B-02-07'
}, {
  id: 6,
  tool_code: 'TL-0455',
  name: 'Spirit Level 600mm',
  tool_type: 'specialized',
  department_access: 'Civil',
  available: 3,
  total: 5,
  status: 'active',
  bin: 'D-06-04'
}, {
  id: 7,
  tool_code: 'TL-0102',
  name: 'Infrared Temperature Gun',
  tool_type: 'specialized',
  department_access: 'Process',
  available: 0,
  total: 3,
  status: 'calibration_due',
  bin: 'B-05-09'
}, {
  id: 8,
  tool_code: 'TL-0500',
  name: 'Bench Vice 150mm',
  tool_type: 'general',
  department_access: null,
  available: 8,
  total: 8,
  status: 'active',
  bin: 'A-03-12'
}];
const REQUISITIONS = [{
  id: 1,
  requisition_number: 'REQ-2026-0188',
  tool_name: 'Digital Torque Wrench',
  qty: 2,
  requester: 'Anil Kumar',
  dept: 'Mechanical',
  purpose: 'Gearbox coupling alignment — Kiln 2',
  from: '15 Jun 2026',
  to: '20 Jun 2026',
  submitted: '14 Jun 2026',
  status: 'pending'
}, {
  id: 2,
  requisition_number: 'REQ-2026-0187',
  tool_name: 'Digital Multimeter',
  qty: 1,
  requester: 'S. Priya',
  dept: 'E&I',
  purpose: 'Panel continuity check — Packing Plant',
  from: '14 Jun 2026',
  to: '16 Jun 2026',
  submitted: '14 Jun 2026',
  status: 'pending'
}, {
  id: 3,
  requisition_number: 'REQ-2026-0185',
  tool_name: 'Aluminium Step Ladder',
  qty: 1,
  requester: 'M. Farhan',
  dept: 'Civil',
  purpose: 'Roof light fixture replacement',
  from: '13 Jun 2026',
  to: '15 Jun 2026',
  submitted: '13 Jun 2026',
  status: 'pending'
}, {
  id: 4,
  requisition_number: 'REQ-2026-0184',
  tool_name: 'Spirit Level 600mm',
  qty: 1,
  requester: 'Deepa N.',
  dept: 'Civil',
  purpose: 'Floor gradient survey — Silo 3',
  from: '12 Jun 2026',
  to: '14 Jun 2026',
  submitted: '12 Jun 2026',
  status: 'pending'
}];
const REPORT_STOCK = [{
  code: 'TL-0142',
  name: 'Digital Torque Wrench',
  type: 'Specialized',
  avail: 2,
  total: 4,
  value: 128400,
  status: 'active'
}, {
  code: 'TL-0088',
  name: 'Insulation Tester',
  type: 'Specialized',
  avail: 0,
  total: 2,
  value: 84200,
  status: 'calibration_due'
}, {
  code: 'TL-0007',
  name: 'Aluminium Step Ladder',
  type: 'General',
  avail: 14,
  total: 18,
  value: 32600,
  status: 'active'
}, {
  code: 'TL-0211',
  name: 'Hydraulic Bearing Puller',
  type: 'Specialized',
  avail: 1,
  total: 1,
  value: 61500,
  status: 'damaged'
}, {
  code: 'TL-0319',
  name: 'Digital Multimeter',
  type: 'Specialized',
  avail: 6,
  total: 10,
  value: 47800,
  status: 'active'
}];
const inr = n => '₹' + n.toLocaleString('en-IN');

/* ---- My Requests (full status spread) ---- */
const MY_REQUESTS = [{
  id: 11,
  requisition_number: 'REQ-2026-0190',
  tool_name: 'Digital Multimeter',
  qty: 1,
  purpose: 'Panel continuity check — Packing Plant',
  from: '15 Jun 2026',
  to: '17 Jun 2026',
  submitted: '14 Jun 2026',
  status: 'pending'
}, {
  id: 12,
  requisition_number: 'REQ-2026-0181',
  tool_name: 'Torque Wrench 1/2"',
  qty: 1,
  purpose: 'Gearbox coupling alignment — Kiln 2',
  from: '12 Jun 2026',
  to: '16 Jun 2026',
  submitted: '11 Jun 2026',
  status: 'issued'
}, {
  id: 13,
  requisition_number: 'REQ-2026-0176',
  tool_name: 'Infrared Temperature Gun',
  qty: 1,
  purpose: 'Bearing temperature survey — Mill 1',
  from: '08 Jun 2026',
  to: '10 Jun 2026',
  submitted: '07 Jun 2026',
  status: 'returned'
}, {
  id: 14,
  requisition_number: 'REQ-2026-0171',
  tool_name: 'Spirit Level 600mm',
  qty: 2,
  purpose: 'Floor gradient survey — Silo 3',
  from: '05 Jun 2026',
  to: '07 Jun 2026',
  submitted: '04 Jun 2026',
  status: 'approved'
}, {
  id: 15,
  requisition_number: 'REQ-2026-0166',
  tool_name: 'Hydraulic Bearing Puller',
  qty: 1,
  purpose: 'Pump impeller removal',
  from: '02 Jun 2026',
  to: '03 Jun 2026',
  submitted: '01 Jun 2026',
  status: 'rejected'
}];

/* ---- Issuance ---- */
const APPROVED_QUEUE = [{
  id: 21,
  requisition_number: 'REQ-2026-0171',
  tool_name: 'Spirit Level 600mm',
  tool_code: 'TL-0455',
  qty: 2,
  requester: 'Deepa N.',
  dept: 'Civil',
  approved_on: '13 Jun 2026',
  due: '07 Jun 2026',
  current_value: 18900
}, {
  id: 22,
  requisition_number: 'REQ-2026-0189',
  tool_name: 'Aluminium Step Ladder',
  tool_code: 'TL-0007',
  qty: 1,
  requester: 'M. Farhan',
  dept: 'Civil',
  approved_on: '14 Jun 2026',
  due: '16 Jun 2026',
  current_value: 28600
}];
const ACTIVE_ISSUANCES = [{
  id: 31,
  tool_name: 'Torque Wrench 1/2"',
  tool_code: 'TL-0142',
  qty: 1,
  issued_to: 'Anil Kumar',
  dept: 'Mechanical',
  issued_on: '11 Jun 2026',
  due: '16 Jun 2026',
  days_left: 2,
  state: 'on_time'
}, {
  id: 32,
  tool_name: 'Digital Multimeter',
  tool_code: 'TL-0319',
  qty: 1,
  issued_to: 'S. Priya',
  dept: 'E&I',
  issued_on: '10 Jun 2026',
  due: '14 Jun 2026',
  days_left: 0,
  state: 'due_today'
}, {
  id: 33,
  tool_name: 'Infrared Temperature Gun',
  tool_code: 'TL-0102',
  qty: 1,
  issued_to: 'R. Suresh',
  dept: 'Process',
  issued_on: '05 Jun 2026',
  due: '12 Jun 2026',
  days_left: -2,
  state: 'overdue'
}, {
  id: 34,
  tool_name: 'Bench Vice 150mm',
  tool_code: 'TL-0500',
  qty: 1,
  issued_to: 'K. Iqbal',
  dept: 'Mechanical',
  issued_on: '12 Jun 2026',
  due: '19 Jun 2026',
  days_left: 5,
  state: 'on_time'
}];

/* ---- Returns ---- */
const PENDING_DAMAGE = [{
  id: 41,
  tool_name: 'Hydraulic Bearing Puller',
  tool_code: 'TL-0211',
  returned_by: 'P. Ramesh',
  dept: 'Mechanical',
  returned_on: '12 Jun 2026',
  condition: 'damaged',
  current_value: 61500
}, {
  id: 42,
  tool_name: 'Insulation Tester',
  tool_code: 'TL-0088',
  returned_by: 'S. Priya',
  dept: 'E&I',
  returned_on: '11 Jun 2026',
  condition: 'missing',
  current_value: 84200
}];

/* ---- Calibration ---- */
const CALIBRATION = [{
  id: 51,
  tool_name: 'Insulation Tester',
  tool_code: 'TL-0088',
  dept: 'E&I',
  last: '14 Dec 2025',
  next: '12 Jun 2026',
  freq: 180,
  state: 'overdue',
  days: -2
}, {
  id: 52,
  tool_name: 'Infrared Temperature Gun',
  tool_code: 'TL-0102',
  dept: 'Process',
  last: '18 Dec 2025',
  next: '16 Jun 2026',
  freq: 180,
  state: 'due_today',
  days: 2
}, {
  id: 53,
  tool_name: 'Digital Torque Wrench',
  tool_code: 'TL-0142',
  dept: 'Mechanical',
  last: '20 Jan 2026',
  next: '19 Jul 2026',
  freq: 180,
  state: 'on_time',
  days: 35
}, {
  id: 54,
  tool_name: 'Digital Multimeter',
  tool_code: 'TL-0319',
  dept: 'E&I',
  last: '02 Mar 2026',
  next: '29 Aug 2026',
  freq: 180,
  state: 'on_time',
  days: 76
}];

/* ---- Storage Bins ---- */
const BINS = [{
  id: 61,
  bin_code: 'A-01-01',
  shelf: 'Shelf A1',
  section: 'General Store',
  dept_category: 'All Departments',
  capacity: 40,
  description: 'Ladders & access equipment'
}, {
  id: 62,
  bin_code: 'A-12-03',
  shelf: 'Shelf A12',
  section: 'Precision Tools',
  dept_category: 'Mechanical',
  capacity: 24,
  description: 'Torque & alignment tools'
}, {
  id: 63,
  bin_code: 'B-04-11',
  shelf: 'Shelf B4',
  section: 'Electrical Lab',
  dept_category: 'E&I',
  capacity: 16,
  description: 'Insulation & continuity testers'
}, {
  id: 64,
  bin_code: 'B-05-09',
  shelf: 'Shelf B5',
  section: 'Electrical Lab',
  dept_category: 'Process',
  capacity: 16,
  description: 'Temperature instruments'
}, {
  id: 65,
  bin_code: 'C-09-02',
  shelf: 'Shelf C9',
  section: 'Heavy Tools',
  dept_category: 'Mechanical',
  capacity: 8,
  description: 'Pullers & hydraulic tools'
}, {
  id: 66,
  bin_code: 'D-06-04',
  shelf: 'Shelf D6',
  section: 'Civil Store',
  dept_category: 'Civil',
  capacity: 20,
  description: 'Levels & survey equipment'
}];
Object.assign(window, {
  MOCK: {
    USER,
    NOTIFS,
    SUMMARY,
    MY_ISSUANCES,
    LOW_STOCK,
    TOOLS,
    REQUISITIONS,
    REPORT_STOCK,
    MY_REQUESTS,
    APPROVED_QUEUE,
    ACTIVE_ISSUANCES,
    PENDING_DAMAGE,
    CALIBRATION,
    BINS
  },
  inr
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mtrs/Data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mtrs/Icons.jsx
try { (() => {
/* Lucide-style icon set (the product uses lucide-react). Inline stroke paths,
   exposed as <Icon name=… size=…/>. Stroke 2, round caps — matches lucide. */
const PATHS = {
  dashboard: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "7",
    height: "9",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "3",
    width: "7",
    height: "5",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "12",
    width: "7",
    height: "9",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "16",
    width: "7",
    height: "5",
    rx: "1"
  })),
  wrench: /*#__PURE__*/React.createElement("path", {
    d: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.6-.6-2.5z"
  }),
  clipboard: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "8",
    y: "3",
    width: "8",
    height: "4",
    rx: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 12h6M9 16h4"
  })),
  check_square: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m9 11 3 3 8-8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
  })),
  arrow_right_circle: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m12 8 4 4-4 4M8 12h8"
  })),
  arrow_left_circle: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m12 8-4 4 4 4M16 12H8"
  })),
  bar_chart: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M3 3v18h18"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "7",
    y: "10",
    width: "3",
    height: "8"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "12",
    y: "6",
    width: "3",
    height: "12"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "17",
    y: "13",
    width: "3",
    height: "5"
  })),
  activity: /*#__PURE__*/React.createElement("path", {
    d: "M22 12h-4l-3 9L9 3l-3 9H2"
  }),
  archive: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "4",
    rx: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4"
  })),
  bell: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13.7 21a2 2 0 0 1-3.4 0"
  })),
  logout: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m16 17 5-5-5-5M21 12H9"
  })),
  chevron_down: /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6"
  }),
  plus: /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  }),
  search: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })),
  eye: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  })),
  eye_off: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M9.9 4.2A9.5 9.5 0 0 1 12 4c6.5 0 10 7 10 7a13 13 0 0 1-2.2 2.9M6.6 6.6A13 13 0 0 0 2 11s3.5 7 10 7a9.5 9.5 0 0 0 4-.9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2"
  })),
  package: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m7.5 4.3 9 5.2M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3.3 7 12 12l8.7-5M12 22V12"
  })),
  clock: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7v5l3 2"
  })),
  alert_triangle: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 9v4M12 17h.01"
  })),
  check_circle: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M22 11.1V12a10 10 0 1 1-5.9-9.1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m22 4-10 10-3-3"
  })),
  arrow_right: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M12 5l7 7-7 7"
  })),
  download: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m7 10 5 5 5-5M12 15V3"
  })),
  x: /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  }),
  filter: /*#__PURE__*/React.createElement("path", {
    d: "M22 3H2l8 9.5V19l4 2v-8.5L22 3z"
  }),
  menu: /*#__PURE__*/React.createElement("path", {
    d: "M3 12h18M3 6h18M3 18h18"
  }),
  building: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "4",
    y: "2",
    width: "16",
    height: "20",
    rx: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"
  })),
  users: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "7",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
  })),
  user_plus: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "7",
    r: "4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "19",
    y1: "8",
    x2: "19",
    y2: "14"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "22",
    y1: "11",
    x2: "16",
    y2: "11"
  }))
};
function Icon({
  name,
  size = 18,
  color = 'currentColor',
  strokeWidth = 2,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flexShrink: 0,
      ...style
    }
  }, PATHS[name] || PATHS.package);
}
Object.assign(window, {
  Icon
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mtrs/Icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mtrs/IssuanceScreen.jsx
try { (() => {
const NS_ISS = window.MTRSDesignSystemUltraTechCement_660dc9;

/* Extended approved queue with priority, purpose, available stock */
const APPROVED_EXT = (window.MOCK?.APPROVED_QUEUE || []).map((r, i) => ({
  ...r,
  purpose: ['Floor gradient survey — Silo 3', 'Roof light fixture replacement'][i] || 'Routine maintenance',
  expected_return: r.due,
  avail_stock: [3, 14][i] ?? 5,
  qty: i === 0 ? 60 : r.qty,
  // demo: 60 triggers High Qty badge (threshold > 50)
  priority: i === 0 ? 'low_stock' : 'ready'
}));
const PRIORITY_CFG = {
  ready: {
    label: 'Ready to Issue',
    bg: 'var(--success-bg)',
    fg: 'var(--success-text)'
  },
  calibration_check: {
    label: 'Calibration Check',
    bg: 'var(--warning-bg)',
    fg: 'var(--warning-text)'
  },
  low_stock: {
    label: 'Low Stock Warning',
    bg: 'var(--danger-bg)',
    fg: 'var(--danger-text)'
  },
  high_qty: {
    label: 'High Quantity',
    bg: 'var(--warning-bg)',
    fg: 'var(--warning-text)'
  }
};
function DaysLeftBadge({
  state,
  days
}) {
  const cfg = {
    on_time: {
      bg: 'var(--success-bg)',
      fg: 'var(--success-text)',
      icon: 'clock',
      label: `${days}d left`
    },
    due_today: {
      bg: 'var(--warning-bg)',
      fg: 'var(--warning-text)',
      icon: 'clock',
      label: 'Due today'
    },
    overdue: {
      bg: 'var(--danger-bg)',
      fg: 'var(--danger-text)',
      icon: 'alert_triangle',
      label: `${Math.abs(days)}d overdue`
    }
  }[state] || {
    bg: 'var(--surface-sunken)',
    fg: 'var(--text-muted)',
    icon: 'clock',
    label: '—'
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 9px',
      borderRadius: 'var(--radius-pill)',
      background: cfg.bg,
      color: cfg.fg,
      fontSize: 11.5,
      fontWeight: 600,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: cfg.icon,
    size: 11
  }), " ", cfg.label);
}

/* ── Confirm Issue modal ───────────────────────────────────────────── */
function IssueConfirmModal({
  item,
  onClose,
  onConfirm
}) {
  const {
    Modal,
    Button,
    Checkbox
  } = NS_ISS;
  const [ack, setAck] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const inr = window.inr;
  const stockAfter = item.avail_stock - item.qty;
  const stockLow = stockAfter <= 1;
  const InfoRow = ({
    label,
    value,
    warn
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '9px 13px',
      background: warn ? 'var(--warning-bg)' : 'var(--surface-sunken)',
      borderRadius: 'var(--radius-sm)',
      border: `1px solid ${warn ? 'var(--warning-border,var(--warning-bg))' : 'transparent'}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'var(--text-muted)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: warn ? 'var(--warning-text)' : 'var(--text-strong)'
    }
  }, value));
  return /*#__PURE__*/React.createElement(Modal, {
    open: true,
    onClose: onClose,
    title: "Confirm Issue",
    width: 480,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      disabled: !ack,
      loading: busy,
      onClick: () => {
        setBusy(true);
        setTimeout(() => {
          onConfirm(item.id);
          onClose();
        }, 700);
      }
    }, "Confirm Issue"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, item.tool_name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)',
      marginTop: 2,
      fontFamily: 'monospace'
    }
  }, item.tool_code, " \xB7 ", item.requisition_number)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(InfoRow, {
    label: "Requested by",
    value: `${item.requester} (${item.dept})`
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Quantity",
    value: `${item.qty} unit${item.qty > 1 ? 's' : ''}`
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Expected return",
    value: item.expected_return
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Current available",
    value: `${item.avail_stock} units`
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Stock after issue",
    value: `${stockAfter} unit${stockAfter !== 1 ? 's' : ''}${stockLow ? ' ⚠' : ''}`,
    warn: stockLow
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Depreciation snapshot",
    value: inr(item.current_value)
  })), item.purpose && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '9px 13px',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-sm)',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: 'var(--text-subtle)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 600,
      marginBottom: 2
    }
  }, "Purpose"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-default)',
      lineHeight: 1.5
    }
  }, item.purpose)), /*#__PURE__*/React.createElement(Checkbox, {
    checked: ack,
    onChange: setAck,
    label: "I confirm the issue and acknowledge the stock reduction"
  }));
}

/* ── View Request Details modal ────────────────────────────────────── */
function ViewRequestModal({
  item,
  onClose
}) {
  const {
    Modal,
    Button
  } = NS_ISS;
  const p = PRIORITY_CFG[item.priority];
  const F = ({
    label,
    value,
    mono,
    full
  }) => /*#__PURE__*/React.createElement("div", {
    style: full ? {
      gridColumn: '1 / -1'
    } : {}
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: 'var(--text-subtle)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 600,
      marginBottom: 2
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: 'var(--text-default)',
      fontFamily: mono ? 'monospace' : undefined
    }
  }, value || '—'));
  return /*#__PURE__*/React.createElement(Modal, {
    open: true,
    onClose: onClose,
    title: "Request Details",
    width: 480,
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "Close")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(F, {
    label: "Requisition No.",
    value: item.requisition_number,
    mono: true
  }), /*#__PURE__*/React.createElement(F, {
    label: "Approved On",
    value: item.approved_on
  }), /*#__PURE__*/React.createElement(F, {
    label: "Tool Name",
    value: item.tool_name
  }), /*#__PURE__*/React.createElement(F, {
    label: "Tool Code",
    value: item.tool_code,
    mono: true
  }), /*#__PURE__*/React.createElement(F, {
    label: "Quantity",
    value: `${item.qty} unit${item.qty > 1 ? 's' : ''}`
  }), /*#__PURE__*/React.createElement(F, {
    label: "Expected Return",
    value: item.expected_return
  }), /*#__PURE__*/React.createElement(F, {
    label: "Requested By",
    value: item.requester
  }), /*#__PURE__*/React.createElement(F, {
    label: "Department",
    value: item.dept
  }), /*#__PURE__*/React.createElement(F, {
    label: "Available Stock",
    value: `${item.avail_stock} units`
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: 'var(--text-subtle)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 600,
      marginBottom: 5
    }
  }, "Priority"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: 'var(--radius-pill)',
      background: p.bg,
      color: p.fg
    }
  }, p.label)), /*#__PURE__*/React.createElement(F, {
    label: "Purpose",
    value: item.purpose,
    full: true
  })));
}

/* ── Main screen ───────────────────────────────────────────────────── */
function IssuanceScreen() {
  const {
    PageHeader,
    Card,
    Tabs,
    DataTable,
    Button,
    EmptyState
  } = NS_ISS;
  const [tab, setTab] = React.useState('all');
  const [qSearch, setQSearch] = React.useState('');
  const [aSearch, setASearch] = React.useState('');
  const [issue, setIssue] = React.useState(null);
  const [viewReq, setViewReq] = React.useState(null);
  const [issuedIds, setIssuedIds] = React.useState([]);
  const active = window.MOCK.ACTIVE_ISSUANCES || [];
  const c = s => active.filter(i => i.state === s).length;
  const filteredQueue = APPROVED_EXT.filter(r => {
    const q = qSearch.toLowerCase();
    return !q || r.tool_name.toLowerCase().includes(q) || r.requisition_number.toLowerCase().includes(q) || r.requester.toLowerCase().includes(q);
  });
  const filteredActive = active.filter(i => {
    const q = aSearch.toLowerCase();
    const matchQ = !q || i.tool_name.toLowerCase().includes(q) || i.issued_to.toLowerCase().includes(q) || i.tool_code.toLowerCase().includes(q);
    const matchTab = tab === 'all' || i.state === tab;
    return matchQ && matchTab;
  });
  const chips = [{
    label: 'Approved Queue',
    value: APPROVED_EXT.length,
    fg: 'var(--info-text)',
    bg: 'var(--info-bg)'
  }, {
    label: 'Active Issuances',
    value: active.length,
    fg: 'var(--text-strong)',
    bg: 'var(--surface-sunken)'
  }, {
    label: 'Due Today',
    value: c('due_today'),
    fg: 'var(--warning-text)',
    bg: 'var(--warning-bg)'
  }, {
    label: 'Overdue',
    value: c('overdue'),
    fg: 'var(--danger-text)',
    bg: 'var(--danger-bg)'
  }];
  const SearchBox = ({
    value,
    onChange,
    placeholder
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 14,
    color: "var(--text-subtle)",
    style: {
      position: 'absolute',
      left: 9,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    style: {
      paddingLeft: 30,
      paddingRight: 10,
      height: 34,
      width: 220,
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      color: 'var(--text-default)',
      background: 'var(--surface-card)',
      outline: 'none'
    }
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Issue Tool",
    subtitle: "Issue approved requests and track active issuances"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, chips.map(ch => /*#__PURE__*/React.createElement("div", {
    key: ch.label,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '7px 14px',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-resting)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      background: ch.bg,
      color: ch.fg,
      borderRadius: 'var(--radius-sm)',
      padding: '0 7px',
      lineHeight: 1.5
    }
  }, ch.value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'var(--text-muted)'
    }
  }, ch.label)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, "Approved \u2014 Ready to Issue"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--info-bg)',
      color: 'var(--info-text)'
    }
  }, APPROVED_EXT.length)), /*#__PURE__*/React.createElement(SearchBox, {
    value: qSearch,
    onChange: e => setQSearch(e.target.value),
    placeholder: "Search tool, requester, req #\u2026"
  })), /*#__PURE__*/React.createElement(Card, {
    padded: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: 'tool_name',
      header: 'Request',
      render: r => {
        const p = PRIORITY_CFG[r.priority];
        const highQty = r.qty > 50;
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          style: {
            fontFamily: 'monospace',
            fontSize: 10.5,
            color: 'var(--text-subtle)',
            marginBottom: 1
          }
        }, r.requisition_number), /*#__PURE__*/React.createElement("div", {
          style: {
            fontWeight: 600,
            color: 'var(--text-strong)'
          }
        }, r.tool_name), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 11.5,
            color: 'var(--text-subtle)',
            fontFamily: 'monospace'
          }
        }, r.tool_code), /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            gap: 4,
            marginTop: 3,
            flexWrap: 'wrap'
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10.5,
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: 'var(--radius-pill)',
            background: p.bg,
            color: p.fg
          }
        }, p.label), highQty && /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 10.5,
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--danger-bg)',
            color: 'var(--danger-text)'
          }
        }, "High Qty")));
      }
    }, {
      key: 'qty',
      header: 'Qty',
      align: 'right',
      render: r => /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 2
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 700,
          fontSize: 15,
          color: r.qty > 50 ? 'var(--danger-text)' : 'var(--text-strong)'
        }
      }, r.qty), r.qty > 50 && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 9.5,
          fontWeight: 700,
          padding: '1px 5px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--danger-bg)',
          color: 'var(--danger-text)',
          letterSpacing: '0.04em'
        }
      }, "HIGH"))
    }, {
      key: 'requester',
      header: 'Requested By',
      render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 500,
          color: 'var(--text-strong)'
        }
      }, r.requester), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11.5,
          color: 'var(--text-subtle)'
        }
      }, r.dept))
    }, {
      key: 'expected_return',
      header: 'Return By',
      nowrap: true,
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-muted)',
          fontSize: 12.5
        }
      }, r.expected_return)
    }, {
      key: 'actions',
      header: '',
      nowrap: true,
      render: r => /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 6
        }
      }, /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        onClick: () => setViewReq(r)
      }, "Details"), issuedIds.includes(r.id) ? /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        disabled: true,
        icon: /*#__PURE__*/React.createElement(Icon, {
          name: "check_circle",
          size: 13
        })
      }, "Issued") : /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        icon: /*#__PURE__*/React.createElement(Icon, {
          name: "arrow_right_circle",
          size: 13
        }),
        onClick: () => setIssue(r)
      }, "Issue"))
    }],
    rows: filteredQueue,
    empty: /*#__PURE__*/React.createElement(EmptyState, {
      tone: "success",
      compact: true,
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "check_circle",
        size: 24
      }),
      title: "Queue is clear",
      message: "No approved requests waiting to be issued."
    })
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      flexWrap: 'wrap',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, "Active Issuances"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(SearchBox, {
    value: aSearch,
    onChange: e => setASearch(e.target.value),
    placeholder: "Search tool or person\u2026"
  }), /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    size: "sm",
    tabs: [{
      value: 'all',
      label: 'All'
    }, {
      value: 'on_time',
      label: 'On Time',
      count: c('on_time')
    }, {
      value: 'due_today',
      label: 'Due Today',
      count: c('due_today')
    }, {
      value: 'overdue',
      label: 'Overdue',
      count: c('overdue'),
      tone: 'danger'
    }]
  }))), /*#__PURE__*/React.createElement(Card, {
    padded: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: 'tool_name',
      header: 'Tool',
      render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 600,
          color: 'var(--text-strong)'
        }
      }, r.tool_name), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11.5,
          color: 'var(--text-subtle)',
          fontFamily: 'monospace'
        }
      }, r.tool_code))
    }, {
      key: 'qty',
      header: 'Qty',
      align: 'right',
      render: r => /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 2
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600,
          color: r.qty > 50 ? 'var(--danger-text)' : 'var(--text-strong)'
        }
      }, r.qty), r.qty > 50 && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 9.5,
          fontWeight: 700,
          padding: '1px 5px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--danger-bg)',
          color: 'var(--danger-text)',
          letterSpacing: '0.04em'
        }
      }, "HIGH"))
    }, {
      key: 'issued_to',
      header: 'Issued To',
      render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 500,
          color: 'var(--text-strong)'
        }
      }, r.issued_to), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11.5,
          color: 'var(--text-subtle)'
        }
      }, r.dept))
    }, {
      key: 'issued_on',
      header: 'Issued On',
      nowrap: true,
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-muted)',
          fontSize: 12.5
        }
      }, r.issued_on)
    }, {
      key: 'due',
      header: 'Due',
      nowrap: true,
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          color: r.state === 'overdue' ? 'var(--danger-text)' : 'var(--text-muted)',
          fontWeight: r.state === 'overdue' ? 600 : 400
        }
      }, r.due)
    }, {
      key: 'days',
      header: 'Status',
      render: r => /*#__PURE__*/React.createElement(DaysLeftBadge, {
        state: r.state,
        days: r.days_left
      })
    }],
    rows: filteredActive,
    getRowTone: r => r.state === 'overdue' ? 'danger' : null,
    empty: /*#__PURE__*/React.createElement(EmptyState, {
      compact: true,
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "package",
        size: 26
      }),
      title: "No active issuances",
      message: tab === 'all' ? 'No tools are currently issued out.' : `No issuances in the "${tab.replace('_', ' ')}" view.`
    })
  }))), issue && /*#__PURE__*/React.createElement(IssueConfirmModal, {
    item: issue,
    onClose: () => setIssue(null),
    onConfirm: id => setIssuedIds(p => [...p, id])
  }), viewReq && /*#__PURE__*/React.createElement(ViewRequestModal, {
    item: viewReq,
    onClose: () => setViewReq(null)
  }));
}
Object.assign(window, {
  IssuanceScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mtrs/IssuanceScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mtrs/LoginScreen.jsx
try { (() => {
const NS_LOGIN = window.MTRSDesignSystemUltraTechCement_660dc9;
function LoginScreen({
  onLogin
}) {
  const {
    Logo,
    Input
  } = NS_LOGIN;
  const [mode, setMode] = React.useState('signin'); // signin | signup | forgot
  const [empId, setEmpId] = React.useState('USR001');
  const [pw, setPw] = React.useState('demo1234');
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [resetInput, setResetInput] = React.useState('');
  const [resetErr, setResetErr] = React.useState('');
  const [reqSent, setReqSent] = React.useState(false);

  // Keep body dark so there's no light flash before panels paint
  React.useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = 'var(--brand-black)';
    return () => {
      document.body.style.background = prev;
    };
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
    return () => {
      const el = document.getElementById('tims-login-anim');
      if (el) el.remove();
    };
  }, []);

  // Delay content reveal until logo image is loaded AND minimum 1.5s has passed
  React.useEffect(() => {
    let imgLoaded = false;
    let timerDone = false;
    const tryReady = () => {
      if (imgLoaded && timerDone) setReady(true);
    };
    const img = new Image();
    img.onload = img.onerror = () => {
      imgLoaded = true;
      tryReady();
    };
    img.src = '../../assets/ultratech-logo.png';
    const timer = setTimeout(() => {
      timerDone = true;
      tryReady();
    }, 750);
    return () => clearTimeout(timer);
  }, []);
  const submit = e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 700);
  };
  const Btn = ({
    children,
    onClick,
    type = 'button',
    disabled,
    style: s = {}
  }) => /*#__PURE__*/React.createElement("button", {
    type: type,
    onClick: onClick,
    disabled: disabled,
    style: {
      height: 44,
      border: 'none',
      borderRadius: 'var(--radius-md)',
      background: 'var(--brand-black)',
      color: '#fff',
      fontSize: 14,
      fontWeight: 700,
      cursor: disabled ? 'default' : 'pointer',
      fontFamily: 'var(--font-sans)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      transition: 'opacity 0.15s',
      opacity: disabled ? 0.65 : 1,
      width: '100%',
      ...s
    },
    onMouseEnter: e => {
      if (!disabled) e.currentTarget.style.opacity = '0.88';
    },
    onMouseLeave: e => {
      e.currentTarget.style.opacity = disabled ? '0.65' : '1';
    }
  }, children);
  const Label = ({
    children
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--text-default)',
      marginBottom: 5
    }
  }, children);
  const NativeSelect = ({
    label,
    options
  }) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Label, null, label), /*#__PURE__*/React.createElement("select", {
    style: {
      width: '100%',
      height: 38,
      padding: '0 10px',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13.5,
      background: '#fff',
      color: 'var(--text-default)',
      outline: 'none'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Select\u2026"), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o
  }, o))));
  const features = [{
    icon: 'wrench',
    text: '1,284 tools tracked in real-time'
  }, {
    icon: 'clipboard',
    text: 'Digital requisitions & approvals'
  }, {
    icon: 'activity',
    text: 'Calibration & compliance records'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      borderTop: 'var(--brand-accent-line)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '42%',
      minWidth: 340,
      background: 'var(--brand-black)',
      display: 'flex',
      flexDirection: 'column',
      padding: '52px 52px 36px',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -100,
      right: -100,
      width: 360,
      height: 360,
      borderRadius: '50%',
      background: 'rgba(245,197,24,0.07)',
      animation: 'lgnPulse 4.5s ease-in-out infinite'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: -80,
      left: -80,
      width: 260,
      height: 260,
      borderRadius: '50%',
      background: 'rgba(245,197,24,0.05)',
      animation: 'lgnPulse 5.5s ease-in-out 1s infinite'
    }
  }), [[38, '52%', 6, 6, 'lgnFloat 3s ease-in-out infinite'], [80, '68%', 4, 4, 'lgnFloat 4s ease-in-out 0.7s infinite'], [28, '28%', 3, 3, 'lgnFloat 3.5s ease-in-out 1.3s infinite']].map(([r, t, w, h, anim], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: 'absolute',
      right: r,
      top: t,
      width: w,
      height: h,
      borderRadius: '50%',
      background: 'rgba(245,197,24,0.45)',
      animation: anim,
      pointerEvents: 'none'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 120,
      right: 36,
      width: 80,
      height: 80,
      borderRadius: '50%',
      border: '1px dashed rgba(245,197,24,0.12)',
      animation: 'lgnSpin 20s linear infinite',
      pointerEvents: 'none'
    }
  }), ready && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lgn-left",
    style: {
      animationDelay: '0s',
      marginBottom: 44
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    variant: "login",
    logoSrc: "../../assets/ultratech-logo.png"
  })), /*#__PURE__*/React.createElement("div", {
    className: "lgn-left",
    style: {
      animationDelay: '0.08s',
      marginBottom: 36
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--brand-yellow)'
    }
  }, "Inventory Management System")), /*#__PURE__*/React.createElement("div", {
    className: "lgn-left",
    style: {
      animationDelay: '0.16s',
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, features.map(f => /*#__PURE__*/React.createElement("div", {
    key: f.text,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 'var(--radius-md)',
      background: 'rgba(245,197,24,0.1)',
      border: '1px solid rgba(245,197,24,0.16)',
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: f.icon,
    size: 15,
    color: "var(--brand-yellow)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: 'rgba(255,255,255,0.62)'
    }
  }, f.text))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      fontSize: 11.5,
      color: 'rgba(255,255,255,0.28)',
      letterSpacing: '0.04em'
    }
  }, "\xA9 2026 UltraTech Cement Ltd. \u2014 Aditya Birla Group")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: '#f5f6f8',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 60px',
      overflowY: 'auto'
    }
  }, ready && /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 420
    }
  }, mode !== 'forgot' && /*#__PURE__*/React.createElement("div", {
    className: "lgn-up",
    style: {
      animationDelay: '0.05s',
      display: 'flex',
      background: '#e8eaed',
      borderRadius: 10,
      padding: 4,
      marginBottom: 30,
      gap: 4
    }
  }, [['signin', 'Sign In'], ['signup', 'Request Access']].map(([m, label]) => /*#__PURE__*/React.createElement("button", {
    key: m,
    onClick: () => {
      setMode(m);
      setSent(false);
    },
    style: {
      flex: 1,
      padding: '10px 0',
      border: 'none',
      borderRadius: 8,
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: 13.5,
      fontWeight: mode === m ? 700 : 400,
      color: mode === m ? '#fff' : 'var(--text-muted)',
      background: mode === m ? 'var(--brand-black)' : 'transparent',
      transition: 'all 0.2s'
    }
  }, label))), mode === 'signin' && /*#__PURE__*/React.createElement("div", {
    className: "lgn-up",
    key: "signin",
    style: {
      animationDelay: '0.1s'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 5px',
      fontSize: 23,
      fontWeight: 800,
      color: 'var(--text-strong)',
      letterSpacing: '-0.02em'
    }
  }, "Welcome back"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 26px',
      fontSize: 13.5,
      color: 'var(--text-muted)'
    }
  }, "Sign in with your employee credentials."), /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 15
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Employee ID",
    required: true,
    value: empId,
    onChange: e => setEmpId(e.target.value),
    placeholder: "e.g. USR001",
    "data-autofocus": true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Password",
    type: show ? 'text' : 'password',
    required: true,
    value: pw,
    onChange: e => setPw(e.target.value),
    placeholder: "Enter your password"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShow(!show),
    tabIndex: -1,
    style: {
      position: 'absolute',
      right: 10,
      top: 30,
      border: 'none',
      background: 'transparent',
      color: 'var(--text-subtle)',
      cursor: 'pointer',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: show ? 'eye_off' : 'eye',
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      marginTop: -6
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setMode('forgot'),
    style: {
      border: 'none',
      background: 'transparent',
      color: 'var(--text-muted)',
      fontSize: 12.5,
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      textDecoration: 'underline',
      textUnderlineOffset: 3
    }
  }, "Forgot username or password?")), /*#__PURE__*/React.createElement(Btn, {
    type: "submit",
    disabled: loading,
    style: {
      marginTop: 4
    }
  }, loading ? 'Signing in…' : 'Sign In →')), /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      fontSize: 11.5,
      color: 'var(--text-subtle)',
      marginTop: 22
    }
  }, "Authorised plant personnel only")), mode === 'signup' && /*#__PURE__*/React.createElement("div", {
    className: "lgn-up",
    key: "signup",
    style: {
      animationDelay: '0.1s'
    }
  }, reqSent ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: 'var(--success-bg)',
      display: 'grid',
      placeItems: 'center',
      margin: '0 auto 18px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check_circle",
    size: 28,
    color: "var(--success-solid)"
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 8px',
      fontSize: 22,
      fontWeight: 800,
      color: 'var(--text-strong)'
    }
  }, "Request submitted!"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 24px',
      fontSize: 13.5,
      color: 'var(--text-muted)',
      lineHeight: 1.55
    }
  }, "Your access request has been sent to the admin for review. You'll be notified once approved."), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setMode('signin');
      setReqSent(false);
    },
    style: {
      width: '100%',
      padding: '10px',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      background: 'transparent',
      color: 'var(--text-muted)',
      fontSize: 13.5,
      fontFamily: 'var(--font-sans)',
      cursor: 'pointer'
    }
  }, "Back to Sign In")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 5px',
      fontSize: 23,
      fontWeight: 800,
      color: 'var(--text-strong)',
      letterSpacing: '-0.02em'
    }
  }, "Request access"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 22px',
      fontSize: 13.5,
      color: 'var(--text-muted)'
    }
  }, "An admin will review and approve your request before you can sign in."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Full Name",
    required: true,
    placeholder: "e.g. Anil Kumar"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Employee ID",
    required: true,
    placeholder: "EMP-1011"
  })), /*#__PURE__*/React.createElement(Input, {
    label: "Work Email",
    type: "email",
    required: true,
    placeholder: "name@ultratech.com"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(NativeSelect, {
    label: "Department",
    options: ['Maintenance', 'Mechanical', 'E&I', 'Civil', 'Process']
  }), /*#__PURE__*/React.createElement(NativeSelect, {
    label: "Role",
    options: ['Requester', 'Dept Head', 'Maintenance Staff']
  })), /*#__PURE__*/React.createElement(Input, {
    label: "Password",
    type: "password",
    required: true,
    placeholder: "Create a password"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Confirm Password",
    type: "password",
    required: true,
    placeholder: "Re-enter password"
  }), /*#__PURE__*/React.createElement(Btn, {
    style: {
      marginTop: 4
    },
    onClick: () => setReqSent(true)
  }, "Submit Request")))), mode === 'forgot' && /*#__PURE__*/React.createElement("div", {
    className: "lgn-up",
    key: "forgot",
    style: {
      animationDelay: '0.05s'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setMode('signin');
      setSent(false);
    },
    style: {
      border: 'none',
      background: 'transparent',
      color: 'var(--text-muted)',
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      marginBottom: 22,
      padding: 0
    },
    onMouseEnter: e => e.currentTarget.style.color = 'var(--text-strong)',
    onMouseLeave: e => e.currentTarget.style.color = 'var(--text-muted)'
  }, "\u2190 Back to Sign In"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 5px',
      fontSize: 23,
      fontWeight: 800,
      color: 'var(--text-strong)',
      letterSpacing: '-0.02em'
    }
  }, "Reset credentials"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 26px',
      fontSize: 13.5,
      color: 'var(--text-muted)',
      lineHeight: 1.55
    }
  }, "Enter your Employee ID or registered email. We'll send reset instructions to your inbox."), !sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Employee ID or Email",
    required: true,
    value: resetInput,
    onChange: e => {
      setResetInput(e.target.value);
      setResetErr('');
    },
    error: resetErr,
    placeholder: "USR001 or name@ultratech.com",
    "data-autofocus": true
  }), /*#__PURE__*/React.createElement(Btn, {
    onClick: () => {
      if (!resetInput.trim()) {
        setResetErr('Please enter your Employee ID or email');
        return;
      }
      setSent(true);
    }
  }, "Send Reset Instructions")) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 22px',
      background: 'var(--success-bg)',
      border: '1px solid var(--success-border)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check_circle",
    size: 18,
    color: "var(--success-solid)",
    style: {
      flexShrink: 0,
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: 'var(--success-text)',
      marginBottom: 3
    }
  }, "Instructions sent"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--success-text)',
      opacity: 0.8
    }
  }, "Check your registered email. Contact your plant admin if you don't receive it.")))))));
}
Object.assign(window, {
  LoginScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mtrs/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mtrs/ReportsScreen.jsx
try { (() => {
const NS_REP = window.MTRSDesignSystemUltraTechCement_660dc9;
const LAST_UPDATED = '14 Jun 2026, 09:41 AM';
const SEARCH_HINTS = {
  stock: 'Tool code, name, type or status…',
  issuance: 'Tool name, code, borrower or dept…',
  overdue: 'Tool name or borrower name…',
  calibration: 'Tool code, name or department…',
  damage: 'Tool name, code or returned by…',
  utilization: 'Tool code, name or type…',
  depreciation: 'Tool code or name…'
};
const REPORT_TABS = [{
  value: 'stock',
  label: 'Stock Status',
  desc: 'Current inventory levels, availability and asset values for all tools.'
}, {
  value: 'issuance',
  label: 'Issuance History',
  desc: 'All active tool issuances with current due dates and return status.'
}, {
  value: 'overdue',
  label: 'Overdue',
  desc: 'Tools that have passed their expected return date and require follow-up.'
}, {
  value: 'calibration',
  label: 'Calibration',
  desc: 'Tools with scheduled, due, or overdue calibration requirements.'
}, {
  value: 'damage',
  label: 'Damage & Penalty',
  desc: 'Tools returned in damaged or missing condition pending assessment.'
}, {
  value: 'utilization',
  label: 'Utilization',
  desc: 'Tool usage rates and availability across departments.'
}, {
  value: 'depreciation',
  label: 'Depreciation',
  desc: 'Asset value depreciation by tool over time.'
}];

/* ── Row-level highlight colours by status ─────────────────────────── */
const ROW_TONE = {
  active: null,
  damaged: 'rgba(239,68,68,0.06)',
  calibration_due: 'rgba(245,158,11,0.07)',
  overdue: 'rgba(239,68,68,0.06)',
  due_today: 'rgba(245,158,11,0.07)',
  missing: 'rgba(239,68,68,0.08)'
};

/* ── Status pill ───────────────────────────────────────────────────── */
function StatusPill({
  status
}) {
  const cfg = {
    active: {
      bg: 'var(--success-bg)',
      fg: 'var(--success-text)',
      label: 'Active'
    },
    damaged: {
      bg: 'var(--danger-bg)',
      fg: 'var(--danger-text)',
      label: 'Damaged'
    },
    calibration_due: {
      bg: 'var(--warning-bg)',
      fg: 'var(--warning-text)',
      label: 'Cal. Due'
    },
    overdue: {
      bg: 'var(--danger-bg)',
      fg: 'var(--danger-text)',
      label: 'Overdue'
    },
    due_today: {
      bg: 'var(--warning-bg)',
      fg: 'var(--warning-text)',
      label: 'Due Today'
    },
    on_time: {
      bg: 'var(--success-bg)',
      fg: 'var(--success-text)',
      label: 'On Time'
    },
    missing: {
      bg: 'var(--danger-bg)',
      fg: 'var(--danger-text)',
      label: 'Missing'
    }
  }[status] || {
    bg: 'var(--surface-sunken)',
    fg: 'var(--text-muted)',
    label: status
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: 'var(--radius-pill)',
      background: cfg.bg,
      color: cfg.fg,
      whiteSpace: 'nowrap'
    }
  }, cfg.label);
}

/* ── Sort icon ─────────────────────────────────────────────────────── */
function SortIcon({
  col,
  sortCol,
  sortDir
}) {
  const active = col === sortCol;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 4,
      opacity: active ? 1 : 0.3,
      fontSize: 10
    }
  }, active && sortDir === 'desc' ? '▲' : '▼');
}

/* ── Reusable report table ─────────────────────────────────────────── */
function ReportTable({
  columns,
  rows,
  sortableKeys = []
}) {
  const [sortCol, setSortCol] = React.useState(null);
  const [sortDir, setSortDir] = React.useState('asc');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const inr = window.inr;
  const toggleSort = key => {
    if (!sortableKeys.includes(key)) return;
    if (sortCol === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');else {
      setSortCol(key);
      setSortDir('asc');
      setPage(1);
    }
  };
  const sorted = React.useMemo(() => {
    if (!sortCol) return rows;
    return [...rows].sort((a, b) => {
      const va = a[sortCol],
        vb = b[sortCol];
      if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [rows, sortCol, sortDir]);
  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const pg = Math.min(page, pages);
  const pageRows = sorted.slice((pg - 1) * perPage, pg * perPage);
  if (rows.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '48px 0',
        textAlign: 'center',
        color: 'var(--text-subtle)',
        fontSize: 13.5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "bar_chart",
      size: 28,
      color: "var(--text-subtle)",
      style: {
        marginBottom: 10,
        display: 'block',
        margin: '0 auto 10px'
      }
    }), "No data for this report.");
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--surface-sunken)',
      borderBottom: '1px solid var(--border-default)'
    }
  }, columns.map(col => /*#__PURE__*/React.createElement("th", {
    key: col.key,
    onClick: () => toggleSort(col.key),
    style: {
      padding: '10px 14px',
      textAlign: col.align === 'right' ? 'right' : 'left',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap',
      cursor: sortableKeys.includes(col.key) ? 'pointer' : 'default',
      userSelect: 'none'
    },
    onMouseEnter: e => {
      if (sortableKeys.includes(col.key)) e.currentTarget.style.color = 'var(--text-default)';
    },
    onMouseLeave: e => e.currentTarget.style.color = 'var(--text-muted)'
  }, col.header, sortableKeys.includes(col.key) && /*#__PURE__*/React.createElement(SortIcon, {
    col: col.key,
    sortCol: sortCol,
    sortDir: sortDir
  }))))), /*#__PURE__*/React.createElement("tbody", null, pageRows.map((row, i) => {
    const tone = ROW_TONE[row.status] || ROW_TONE[row.state] || null;
    return /*#__PURE__*/React.createElement("tr", {
      key: i,
      style: {
        borderBottom: '1px solid var(--border-subtle)',
        background: tone || 'transparent',
        transition: 'filter 0.1s'
      },
      onMouseEnter: e => e.currentTarget.style.filter = 'brightness(0.97)',
      onMouseLeave: e => e.currentTarget.style.filter = 'none'
    }, columns.map(col => /*#__PURE__*/React.createElement("td", {
      key: col.key,
      style: {
        padding: '11px 14px',
        textAlign: col.align === 'right' ? 'right' : 'left',
        verticalAlign: 'middle'
      }
    }, col.render ? col.render(row, inr) : row[col.key])));
  })))), total > 5 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 16px',
      borderTop: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'var(--text-muted)'
    }
  }, "Rows per page"), /*#__PURE__*/React.createElement("select", {
    value: perPage,
    onChange: e => {
      setPerPage(Number(e.target.value));
      setPage(1);
    },
    style: {
      height: 30,
      padding: '0 8px',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      color: 'var(--text-default)',
      background: 'var(--surface-card)',
      cursor: 'pointer',
      outline: 'none'
    }
  }, [5, 10, 25, 50].map(n => /*#__PURE__*/React.createElement("option", {
    key: n,
    value: n
  }, n)))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'var(--text-muted)'
    }
  }, (pg - 1) * perPage + 1, "\u2013", Math.min(pg * perPage, total), " of ", total), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, [{
    label: '←',
    go: pg - 1
  }, {
    label: '→',
    go: pg + 1
  }].map(btn => /*#__PURE__*/React.createElement("button", {
    key: btn.label,
    disabled: btn.go < 1 || btn.go > pages,
    onClick: () => setPage(btn.go),
    style: {
      width: 30,
      height: 30,
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-card)',
      cursor: btn.go >= 1 && btn.go <= pages ? 'pointer' : 'not-allowed',
      color: btn.go >= 1 && btn.go <= pages ? 'var(--text-default)' : 'var(--text-subtle)',
      fontFamily: 'var(--font-sans)',
      fontSize: 14
    }
  }, btn.label)))));
}

/* ── Report definitions per tab ────────────────────────────────────── */
function getReportConfig(tab, search) {
  const q = search.toLowerCase();
  const inr = window.inr;
  const stockRows = (window.MOCK.REPORT_STOCK || []).filter(r => !q || `${r.code} ${r.name} ${r.type} ${r.status}`.toLowerCase().includes(q));
  const issuanceRows = (window.MOCK.ACTIVE_ISSUANCES || []).filter(r => !q || `${r.tool_name} ${r.tool_code} ${r.issued_to} ${r.dept}`.toLowerCase().includes(q));
  const overdueRows = issuanceRows.filter(r => r.state === 'overdue' || r.state === 'due_today');
  const calRows = (window.MOCK.CALIBRATION || []).filter(r => !q || `${r.tool_name} ${r.tool_code} ${r.dept}`.toLowerCase().includes(q));
  const dmgRows = (window.MOCK.PENDING_DAMAGE || []).filter(r => !q || `${r.tool_name} ${r.tool_code} ${r.returned_by}`.toLowerCase().includes(q));
  const utilRows = (window.MOCK.TOOLS || []).filter(r => !q || `${r.tool_code} ${r.name} ${r.tool_type}`.toLowerCase().includes(q));
  const configs = {
    stock: {
      rows: stockRows,
      sortable: ['avail', 'total', 'value', 'status'],
      columns: [{
        key: 'code',
        header: 'Tool Code',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontFamily: 'monospace',
            fontSize: 12.5,
            color: 'var(--text-muted)'
          }
        }, r.code)
      }, {
        key: 'name',
        header: 'Name',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 600,
            color: 'var(--text-strong)'
          }
        }, r.name)
      }, {
        key: 'type',
        header: 'Type',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            color: 'var(--text-muted)'
          }
        }, r.type)
      }, {
        key: 'avail',
        header: 'Available',
        align: 'right',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 600
          }
        }, r.avail)
      }, {
        key: 'total',
        header: 'Total',
        align: 'right'
      }, {
        key: 'value',
        header: 'Current Value',
        align: 'right',
        render: (r, inr) => /*#__PURE__*/React.createElement("span", {
          style: {
            fontFamily: 'monospace'
          }
        }, inr(r.value))
      }, {
        key: 'status',
        header: 'Status',
        render: r => /*#__PURE__*/React.createElement(StatusPill, {
          status: r.status
        })
      }]
    },
    issuance: {
      rows: issuanceRows,
      sortable: ['days_left', 'issued_on', 'due'],
      columns: [{
        key: 'tool_name',
        header: 'Tool',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 600,
            color: 'var(--text-strong)'
          }
        }, r.tool_name)
      }, {
        key: 'tool_code',
        header: 'Code',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontFamily: 'monospace',
            fontSize: 12.5,
            color: 'var(--text-muted)'
          }
        }, r.tool_code)
      }, {
        key: 'issued_to',
        header: 'Issued To',
        render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          style: {
            fontWeight: 500
          }
        }, r.issued_to), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 11.5,
            color: 'var(--text-subtle)'
          }
        }, r.dept))
      }, {
        key: 'issued_on',
        header: 'Issued On',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            color: 'var(--text-muted)',
            fontSize: 12.5
          }
        }, r.issued_on)
      }, {
        key: 'due',
        header: 'Due',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            color: r.state === 'overdue' ? 'var(--danger-text)' : 'var(--text-muted)',
            fontWeight: r.state === 'overdue' ? 600 : 400
          }
        }, r.due)
      }, {
        key: 'state',
        header: 'Status',
        render: r => /*#__PURE__*/React.createElement(StatusPill, {
          status: r.state
        })
      }, {
        key: 'days_left',
        header: 'Days Left',
        align: 'right',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 600,
            color: r.state === 'overdue' ? 'var(--danger-text)' : r.state === 'due_today' ? 'var(--warning-text)' : 'var(--success-text)'
          }
        }, r.state === 'overdue' ? `−${Math.abs(r.days_left)}` : r.days_left)
      }]
    },
    overdue: {
      rows: overdueRows,
      sortable: ['days_left'],
      columns: [{
        key: 'tool_name',
        header: 'Tool',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 600,
            color: 'var(--text-strong)'
          }
        }, r.tool_name)
      }, {
        key: 'issued_to',
        header: 'Issued To',
        render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          style: {
            fontWeight: 500
          }
        }, r.issued_to), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 11.5,
            color: 'var(--text-subtle)'
          }
        }, r.dept))
      }, {
        key: 'due',
        header: 'Due Date',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            color: 'var(--danger-text)',
            fontWeight: 600
          }
        }, r.due)
      }, {
        key: 'days_left',
        header: 'Days Overdue',
        align: 'right',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 700,
            color: 'var(--danger-text)'
          }
        }, Math.abs(r.days_left), "d")
      }, {
        key: 'state',
        header: 'Status',
        render: r => /*#__PURE__*/React.createElement(StatusPill, {
          status: r.state
        })
      }]
    },
    calibration: {
      rows: calRows,
      sortable: ['days', 'next'],
      columns: [{
        key: 'tool_code',
        header: 'Code',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontFamily: 'monospace',
            fontSize: 12.5,
            color: 'var(--text-muted)'
          }
        }, r.tool_code)
      }, {
        key: 'tool_name',
        header: 'Tool',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 600,
            color: 'var(--text-strong)'
          }
        }, r.tool_name)
      }, {
        key: 'dept',
        header: 'Dept',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            color: 'var(--text-muted)'
          }
        }, r.dept)
      }, {
        key: 'last',
        header: 'Last Calibrated',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            color: 'var(--text-muted)',
            fontSize: 12.5
          }
        }, r.last)
      }, {
        key: 'next',
        header: 'Next Due',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            color: r.state === 'overdue' ? 'var(--danger-text)' : 'var(--text-default)',
            fontWeight: 500
          }
        }, r.next)
      }, {
        key: 'days',
        header: 'Days',
        align: 'right',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 600,
            color: r.state === 'overdue' ? 'var(--danger-text)' : r.state === 'due_today' ? 'var(--warning-text)' : 'var(--success-text)'
          }
        }, r.days)
      }, {
        key: 'state',
        header: 'Status',
        render: r => /*#__PURE__*/React.createElement(StatusPill, {
          status: r.state
        })
      }]
    },
    damage: {
      rows: dmgRows,
      sortable: ['current_value'],
      columns: [{
        key: 'tool_name',
        header: 'Tool',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 600,
            color: 'var(--text-strong)'
          }
        }, r.tool_name)
      }, {
        key: 'tool_code',
        header: 'Code',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontFamily: 'monospace',
            fontSize: 12.5,
            color: 'var(--text-muted)'
          }
        }, r.tool_code)
      }, {
        key: 'returned_by',
        header: 'Returned By',
        render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          style: {
            fontWeight: 500
          }
        }, r.returned_by), /*#__PURE__*/React.createElement("div", {
          style: {
            fontSize: 11.5,
            color: 'var(--text-subtle)'
          }
        }, r.dept))
      }, {
        key: 'returned_on',
        header: 'Date',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            color: 'var(--text-muted)',
            fontSize: 12.5
          }
        }, r.returned_on)
      }, {
        key: 'condition',
        header: 'Condition',
        render: r => /*#__PURE__*/React.createElement(StatusPill, {
          status: r.condition
        })
      }, {
        key: 'current_value',
        header: 'Tool Value',
        align: 'right',
        render: (r, inr) => /*#__PURE__*/React.createElement("span", {
          style: {
            fontFamily: 'monospace',
            fontWeight: 600
          }
        }, inr(r.current_value))
      }]
    },
    utilization: {
      rows: utilRows,
      sortable: ['available', 'total'],
      columns: [{
        key: 'tool_code',
        header: 'Code',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontFamily: 'monospace',
            fontSize: 12.5,
            color: 'var(--text-muted)'
          }
        }, r.tool_code)
      }, {
        key: 'name',
        header: 'Tool',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 600,
            color: 'var(--text-strong)'
          }
        }, r.name)
      }, {
        key: 'tool_type',
        header: 'Type',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            color: 'var(--text-muted)',
            textTransform: 'capitalize'
          }
        }, r.tool_type)
      }, {
        key: 'available',
        header: 'Available',
        align: 'right',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 600,
            color: r.available === 0 ? 'var(--danger-text)' : 'var(--success-text)'
          }
        }, r.available)
      }, {
        key: 'total',
        header: 'Total',
        align: 'right'
      }, {
        key: 'status',
        header: 'Status',
        render: r => /*#__PURE__*/React.createElement(StatusPill, {
          status: r.status
        })
      }]
    },
    depreciation: {
      rows: stockRows,
      sortable: ['value'],
      columns: [{
        key: 'code',
        header: 'Code',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontFamily: 'monospace',
            fontSize: 12.5,
            color: 'var(--text-muted)'
          }
        }, r.code)
      }, {
        key: 'name',
        header: 'Tool',
        render: r => /*#__PURE__*/React.createElement("span", {
          style: {
            fontWeight: 600,
            color: 'var(--text-strong)'
          }
        }, r.name)
      }, {
        key: 'total',
        header: 'Qty',
        align: 'right'
      }, {
        key: 'value',
        header: 'Current Value',
        align: 'right',
        render: (r, inr) => /*#__PURE__*/React.createElement("span", {
          style: {
            fontFamily: 'monospace'
          }
        }, inr(r.value))
      }, {
        key: 'value',
        header: 'Unit Value',
        align: 'right',
        render: (r, inr) => /*#__PURE__*/React.createElement("span", {
          style: {
            fontFamily: 'monospace',
            color: 'var(--text-muted)'
          }
        }, inr(Math.round(r.value / r.total)))
      }, {
        key: 'status',
        header: 'Status',
        render: r => /*#__PURE__*/React.createElement(StatusPill, {
          status: r.status
        })
      }]
    }
  };
  return configs[tab] || configs.stock;
}

/* ── Main screen ───────────────────────────────────────────────────── */
function ReportsScreen() {
  const {
    PageHeader,
    Button,
    EmptyState
  } = NS_REP;
  const [tab, setTab] = React.useState('stock');
  const [search, setSearch] = React.useState('');
  const tabInfo = REPORT_TABS.find(t => t.value === tab);
  const config = getReportConfig(tab, search);
  const handlePrint = () => {
    let s = document.getElementById('tims-print-style');
    if (!s) {
      s = document.createElement('style');
      s.id = 'tims-print-style';
      document.head.appendChild(s);
    }
    s.textContent = `@media print {
      #app > div > aside, #app > div > div > header { display:none!important; }
      #app, #app > div, #app > div > div { display:block!important; height:auto!important; overflow:visible!important; }
      #app > div > div > main { overflow:visible!important; padding:8px!important; }
      body { background:white!important; }
    }`;
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        s.textContent = '';
      }, 300);
    }, 80);
  };
  const handleExportCSV = () => {
    const cfg = getReportConfig(tab, search);
    const headers = cfg.columns.map(c => c.header);
    const rowsData = cfg.rows.map(row => cfg.columns.map(col => {
      let v = String(row[col.key] ?? '').replace(/"/g, '""');
      return v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v}"` : v;
    }));
    const csv = [headers.join(','), ...rowsData.map(r => r.join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], {
      type: 'text/csv'
    }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `TIMS-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Reports",
    subtitle: "Operational and financial exports for the maintenance department",
    actions: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: handlePrint,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 13px',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-card)',
        color: 'var(--text-muted)',
        fontSize: 13,
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        fontWeight: 500
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = 'var(--surface-sunken)';
        e.currentTarget.style.color = 'var(--text-default)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = 'var(--surface-card)';
        e.currentTarget.style.color = 'var(--text-muted)';
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "download",
      size: 14
    }), " Print / PDF"), /*#__PURE__*/React.createElement("button", {
      onClick: handleExportCSV,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 14px',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--brand-black)',
        color: '#fff',
        fontSize: 13,
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        fontWeight: 600
      },
      onMouseEnter: e => e.currentTarget.style.opacity = '0.88',
      onMouseLeave: e => e.currentTarget.style.opacity = '1'
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "download",
      size: 14,
      color: "#fff"
    }), " Export CSV"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 4,
      display: 'flex',
      gap: 2,
      overflowX: 'auto'
    }
  }, REPORT_TABS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.value,
    onClick: () => {
      setTab(t.value);
      setSearch('');
    },
    style: {
      padding: '8px 14px',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      fontWeight: tab === t.value ? 600 : 400,
      whiteSpace: 'nowrap',
      color: tab === t.value ? 'var(--text-strong)' : 'var(--text-muted)',
      background: tab === t.value ? 'var(--surface-sunken)' : 'transparent',
      boxShadow: tab === t.value ? 'var(--shadow-resting)' : 'none',
      transition: 'all 0.15s'
    },
    onMouseEnter: e => {
      if (tab !== t.value) {
        e.currentTarget.style.background = 'var(--surface-sunken)';
        e.currentTarget.style.color = 'var(--text-default)';
      }
    },
    onMouseLeave: e => {
      if (tab !== t.value) {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--text-muted)';
      }
    }
  }, t.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)',
      maxWidth: 480
    }
  }, tabInfo?.desc)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 14,
    color: "var(--text-subtle)",
    style: {
      position: 'absolute',
      left: 9,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: search,
    onChange: e => setSearch(e.target.value),
    placeholder: SEARCH_HINTS[tab] || 'Filter this report…',
    style: {
      paddingLeft: 30,
      paddingRight: 10,
      height: 34,
      width: 220,
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      color: 'var(--text-default)',
      background: 'var(--surface-card)',
      outline: 'none'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: 'var(--text-subtle)',
      whiteSpace: 'nowrap'
    }
  }, "Updated ", LAST_UPDATED))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(ReportTable, {
    columns: config.columns,
    rows: config.rows,
    sortableKeys: config.sortable
  })));
}
function PlaceholderScreen({
  title,
  subtitle,
  note
}) {
  const {
    PageHeader,
    Card,
    EmptyState
  } = NS_REP;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: title,
    subtitle: subtitle
  }), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(EmptyState, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "building",
      size: 30
    }),
    title: title + ' screen',
    message: note
  })));
}
Object.assign(window, {
  ReportsScreen,
  PlaceholderScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mtrs/ReportsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mtrs/RequisitionsScreen.jsx
try { (() => {
const NS_REQ = window.MTRSDesignSystemUltraTechCement_660dc9;

/* ── Re-use helpers from ApprovalsScreen scope ─────────────────────── */
function parseDMYReq(s) {
  if (!s) return null;
  const mon = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11
  };
  const p = s.split(' ');
  return p.length === 3 ? new Date(+p[2], mon[p[1]], +p[0]) : null;
}
const TODAY_REQ = new Date('2026-06-14');
function getReqPriority(req) {
  const badges = [];
  const from = parseDMYReq(req.from);
  const to = parseDMYReq(req.to);
  const daysUntil = from ? (from - TODAY_REQ) / 86400000 : null;
  if (daysUntil !== null && daysUntil <= 0) badges.push({
    k: 'urgent',
    label: 'Urgent',
    bg: 'var(--danger-bg)',
    fg: 'var(--danger-text)'
  });else if (daysUntil !== null && daysUntil <= 2) badges.push({
    k: 'soon',
    label: 'Due Soon',
    bg: 'var(--warning-bg)',
    fg: 'var(--warning-text)'
  });
  if (req.qty >= 2) badges.push({
    k: 'hq',
    label: 'High Qty',
    bg: 'var(--warning-bg)',
    fg: 'var(--warning-text)'
  });
  if (from && to && (to - from) / 86400000 > 5) badges.push({
    k: 'ld',
    label: 'Long Duration',
    bg: 'var(--info-bg)',
    fg: 'var(--info-text)'
  });
  return badges;
}
function ReqPriorityBadges({
  req
}) {
  const bs = getReqPriority(req);
  if (!bs.length) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      marginTop: 3,
      flexWrap: 'wrap'
    }
  }, bs.map(b => /*#__PURE__*/React.createElement("span", {
    key: b.k,
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      padding: '2px 7px',
      borderRadius: 'var(--radius-pill)',
      background: b.bg,
      color: b.fg,
      whiteSpace: 'nowrap'
    }
  }, b.label)));
}

/* ── Status timeline ─────────────────────────────────────────────── */
function ReqTimeline({
  status
}) {
  const rejected = status === 'rejected';
  const steps = [{
    key: 'pending',
    label: 'Requested',
    icon: 'clipboard'
  }, {
    key: 'approved',
    label: rejected ? 'Rejected' : 'Approved',
    icon: rejected ? 'x' : 'check_circle'
  }, {
    key: 'issued',
    label: 'Issued',
    icon: 'arrow_right_circle'
  }, {
    key: 'returned',
    label: 'Returned',
    icon: 'arrow_left_circle'
  }];
  const order = ['pending', 'approved', 'issued', 'returned'];
  const curIdx = order.indexOf(rejected ? 'approved' : status);
  const st = i => i < curIdx ? 'done' : i === curIdx ? rejected ? 'rejected' : 'active' : 'future';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start'
    }
  }, steps.map((s, i) => {
    const state = st(i);
    const bg = state === 'done' ? 'var(--success-solid)' : state === 'active' ? 'var(--brand-black)' : state === 'rejected' ? 'var(--danger-solid)' : 'var(--border-default)';
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: s.key
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        minWidth: 60
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 26,
        height: 26,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background: bg
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: s.icon,
      size: 12,
      color: state === 'future' ? 'var(--text-subtle)' : '#fff'
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        textAlign: 'center',
        color: state === 'future' ? 'var(--text-subtle)' : 'var(--text-muted)',
        fontWeight: state !== 'future' ? 600 : 400,
        lineHeight: 1.3
      }
    }, s.label)), i < steps.length - 1 && /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 2,
        marginTop: 12,
        background: st(i + 1) !== 'future' ? 'var(--success-solid)' : 'var(--border-subtle)'
      }
    }));
  }));
}

/* ── View Details modal ──────────────────────────────────────────── */
function ViewRequisitionModal({
  req,
  onClose
}) {
  const {
    Modal,
    Button
  } = NS_REQ;
  const F = ({
    label,
    value,
    full
  }) => /*#__PURE__*/React.createElement("div", {
    style: full ? {
      gridColumn: '1/-1'
    } : {}
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: 'var(--text-subtle)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 600,
      marginBottom: 2
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: 'var(--text-default)'
    }
  }, value || '—'));
  return /*#__PURE__*/React.createElement(Modal, {
    open: true,
    onClose: onClose,
    title: "Requisition Details",
    width: 500,
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "Close")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(F, {
    label: "Requisition No.",
    value: /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'monospace'
      }
    }, req.requisition_number)
  }), /*#__PURE__*/React.createElement(F, {
    label: "Submitted",
    value: req.submitted
  }), /*#__PURE__*/React.createElement(F, {
    label: "Tool",
    value: /*#__PURE__*/React.createElement("strong", {
      style: {
        color: 'var(--text-strong)'
      }
    }, req.tool_name)
  }), /*#__PURE__*/React.createElement(F, {
    label: "Quantity",
    value: `${req.qty} unit${req.qty > 1 ? 's' : ''}`
  }), /*#__PURE__*/React.createElement(F, {
    label: "Period",
    value: `${req.from} → ${req.to}`,
    full: true
  }), /*#__PURE__*/React.createElement(F, {
    label: "Purpose",
    value: req.purpose,
    full: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 14,
      borderTop: '1px solid var(--border-subtle)',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--text-subtle)',
      marginBottom: 10
    }
  }, "Status Timeline"), /*#__PURE__*/React.createElement(ReqTimeline, {
    status: req.status
  })), getReqPriority(req).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 12,
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      color: 'var(--text-subtle)',
      textTransform: 'uppercase',
      letterSpacing: '0.04em'
    }
  }, "Flags"), getReqPriority(req).map(b => /*#__PURE__*/React.createElement("span", {
    key: b.k,
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      padding: '3px 9px',
      borderRadius: 'var(--radius-pill)',
      background: b.bg,
      color: b.fg
    }
  }, b.label))));
}

/* ── New Requisition modal ───────────────────────────────────────── */
function NewRequisitionModal({
  onClose
}) {
  const {
    Modal,
    Button,
    Input,
    Select,
    Textarea
  } = NS_REQ;
  const [step, setStep] = React.useState(1);
  const [tool, setTool] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const opts = window.MOCK.TOOLS.filter(t => `${t.name} ${t.tool_code}`.toLowerCase().includes(query.toLowerCase()));
  const disabled = t => t.status !== 'active' || t.available === 0;
  return /*#__PURE__*/React.createElement(Modal, {
    open: true,
    onClose: onClose,
    title: "New Requisition",
    width: 520,
    footer: step === 1 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      disabled: !tool,
      onClick: () => setStep(2)
    }, "Continue")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => setStep(1)
    }, "Back"), /*#__PURE__*/React.createElement(Button, {
      loading: saving,
      onClick: () => {
        setSaving(true);
        setTimeout(onClose, 700);
      }
    }, "Submit Request"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 18
    }
  }, [1, 2].map(n => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 22,
      height: 22,
      borderRadius: '50%',
      fontSize: 12,
      fontWeight: 700,
      background: step >= n ? 'var(--brand-black)' : 'var(--surface-sunken)',
      color: step >= n ? '#fff' : 'var(--text-subtle)'
    }
  }, n), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: step >= n ? 'var(--text-strong)' : 'var(--text-subtle)'
    }
  }, n === 1 ? 'Select Tool' : 'Request Details')))), step === 1 ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Input, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 14
    }),
    placeholder: "Search tool by name or code\u2026",
    value: query,
    onChange: e => setQuery(e.target.value),
    "data-autofocus": true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      maxHeight: 280,
      overflowY: 'auto',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)'
    }
  }, opts.map(t => {
    const off = disabled(t);
    const sel = tool && tool.id === t.id;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      disabled: off,
      onClick: () => setTool(t),
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        textAlign: 'left',
        padding: '10px 13px',
        border: 'none',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: off ? 'not-allowed' : 'pointer',
        background: sel ? 'var(--info-bg)' : 'transparent',
        opacity: off ? 0.5 : 1
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        fontWeight: 600,
        color: 'var(--text-strong)'
      }
    }, t.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'monospace',
        fontSize: 11.5,
        color: 'var(--text-muted)',
        marginTop: 1
      }
    }, t.tool_code, " \xB7 ", t.available, "/", t.total, " available")), off && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--danger-text)',
        textTransform: 'capitalize'
      }
    }, t.status === 'active' ? 'Out of stock' : t.status.replace('_', ' ')));
  }))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '11px 14px',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, tool.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'monospace',
      fontSize: 11.5,
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, tool.tool_code)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Quantity",
    required: true,
    type: "number",
    defaultValue: "1",
    min: "1",
    max: tool.available,
    helper: `Max ${tool.available} available`
  }), /*#__PURE__*/React.createElement("div", null), /*#__PURE__*/React.createElement(Input, {
    label: "Required From",
    required: true,
    type: "date"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Required To",
    required: true,
    type: "date"
  })), /*#__PURE__*/React.createElement(Textarea, {
    label: "Purpose of job",
    required: true,
    rows: 3,
    placeholder: "Describe the maintenance task this tool is for\u2026"
  })));
}

/* ── Main screen ─────────────────────────────────────────────────── */
function RequisitionsScreen() {
  const {
    PageHeader,
    Card,
    DataTable,
    StatusBadge,
    Button,
    EmptyState
  } = NS_REQ;
  const [tab, setTab] = React.useState('all');
  const [showNew, setShowNew] = React.useState(false);
  const [view, setView] = React.useState(null);
  const all = window.MOCK.MY_REQUESTS;
  const rows = tab === 'all' ? all : all.filter(r => r.status === tab);
  const count = s => all.filter(r => r.status === s).length;
  const EMPTY = {
    pending: 'Your pending requests awaiting approval will appear here.',
    approved: 'Approved requests ready for issuance will appear here.',
    issued: 'Tools currently issued to you will appear here.',
    returned: 'Completed returns will appear here.',
    rejected: 'Rejected requests will appear here.',
    all: 'You have no requisitions yet.'
  };
  const tabStyle = val => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 12px',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    fontWeight: tab === val ? 700 : 400,
    whiteSpace: 'nowrap',
    color: tab === val ? 'var(--text-strong)' : 'var(--text-muted)',
    background: tab === val ? 'var(--surface-card)' : 'transparent',
    boxShadow: tab === val ? 'var(--shadow-resting)' : 'none',
    transition: 'all 0.15s'
  });
  const pill = (n, tone) => n > 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      fontWeight: 700,
      padding: '1px 6px',
      borderRadius: 'var(--radius-pill)',
      background: tone === 'danger' ? 'var(--danger-solid)' : tab === tone ? 'var(--surface-page)' : 'var(--surface-sunken)',
      color: tone === 'danger' ? '#fff' : 'var(--text-muted)'
    }
  }, n) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "My Requests",
    subtitle: "Your tool requisitions and their approval status",
    actions: /*#__PURE__*/React.createElement(Button, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "plus",
        size: 16
      }),
      onClick: () => setShowNew(true)
    }, "New Requisition")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 2,
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)',
      padding: 3,
      overflowX: 'auto'
    }
  }, [{
    val: 'all',
    label: 'All',
    n: null
  }, {
    val: 'pending',
    label: 'Pending',
    n: count('pending')
  }, {
    val: 'approved',
    label: 'Approved',
    n: count('approved')
  }, {
    val: 'issued',
    label: 'Issued',
    n: count('issued')
  }, {
    val: 'returned',
    label: 'Returned',
    n: count('returned')
  }, {
    val: 'rejected',
    label: 'Rejected',
    n: count('rejected'),
    tone: 'danger'
  }].map(t => /*#__PURE__*/React.createElement("button", {
    key: t.val,
    onClick: () => setTab(t.val),
    style: tabStyle(t.val)
  }, t.label, " ", t.n ? pill(t.n, t.tone) : null))), /*#__PURE__*/React.createElement(Card, {
    padded: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: 'requisition_number',
      header: 'Request',
      nowrap: true,
      render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'monospace',
          fontSize: 12,
          color: 'var(--text-muted)',
          marginBottom: 2
        }
      }, r.requisition_number), /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          color: 'var(--text-strong)',
          fontSize: 13.5
        }
      }, r.tool_name), /*#__PURE__*/React.createElement(ReqPriorityBadges, {
        req: r
      }))
    }, {
      key: 'qty',
      header: 'Qty',
      align: 'right',
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 700,
          fontSize: 15
        }
      }, r.qty)
    }, {
      key: 'period',
      header: 'Period',
      nowrap: true,
      render: r => /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12.5,
          color: 'var(--text-muted)',
          lineHeight: 1.5
        }
      }, /*#__PURE__*/React.createElement("div", null, r.from), /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--text-subtle)'
        }
      }, "\u2192 ", r.to))
    }, {
      key: 'submitted',
      header: 'Submitted',
      nowrap: true,
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-muted)',
          fontSize: 12.5
        }
      }, r.submitted)
    }, {
      key: 'status',
      header: 'Status',
      render: r => /*#__PURE__*/React.createElement(StatusBadge, {
        status: r.status,
        size: "sm"
      })
    }, {
      key: 'actions',
      header: '',
      render: r => /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        onClick: () => setView(r)
      }, "Details")
    }],
    rows: rows,
    empty: /*#__PURE__*/React.createElement(EmptyState, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "clipboard",
        size: 30
      }),
      title: `No ${tab === 'all' ? '' : tab} requests`,
      message: EMPTY[tab] || EMPTY.all,
      action: /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        icon: /*#__PURE__*/React.createElement(Icon, {
          name: "plus",
          size: 14
        }),
        onClick: () => setShowNew(true)
      }, "New Requisition")
    })
  })), showNew && /*#__PURE__*/React.createElement(NewRequisitionModal, {
    onClose: () => setShowNew(false)
  }), view && /*#__PURE__*/React.createElement(ViewRequisitionModal, {
    req: view,
    onClose: () => setView(null)
  }));
}
Object.assign(window, {
  RequisitionsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mtrs/RequisitionsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mtrs/ReturnsScreen.jsx
try { (() => {
const NS_RET = window.MTRSDesignSystemUltraTechCement_660dc9;

/* ── Mock return history ───────────────────────────────────────────── */
const RETURN_HISTORY = {
  31: [{
    date: '10 Mar 2026',
    tool: 'Torque Wrench 1/2"',
    returned_by: 'Anil Kumar',
    condition: 'good',
    notes: 'Returned on time, clean condition.'
  }],
  32: [{
    date: '02 Feb 2026',
    tool: 'Digital Multimeter',
    returned_by: 'S. Priya',
    condition: 'good',
    notes: 'All probes intact.'
  }],
  33: [],
  34: [{
    date: '15 Jan 2026',
    tool: 'Bench Vice 150mm',
    returned_by: 'K. Iqbal',
    condition: 'good',
    notes: 'No issues.'
  }]
};

/* ── Issuance status badge ─────────────────────────────────────────── */
function IssuanceBadge({
  state
}) {
  const cfg = {
    on_time: {
      bg: 'var(--success-bg)',
      fg: 'var(--success-text)',
      icon: 'check_circle',
      label: 'On Time'
    },
    due_today: {
      bg: 'var(--warning-bg)',
      fg: 'var(--warning-text)',
      icon: 'clock',
      label: 'Due Today'
    },
    overdue: {
      bg: 'var(--danger-bg)',
      fg: 'var(--danger-text)',
      icon: 'alert_triangle',
      label: 'Overdue'
    }
  }[state] || {
    bg: 'var(--surface-sunken)',
    fg: 'var(--text-muted)',
    icon: 'clock',
    label: state
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 9px',
      borderRadius: 'var(--radius-pill)',
      background: cfg.bg,
      color: cfg.fg,
      fontSize: 11.5,
      fontWeight: 600,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: cfg.icon,
    size: 11
  }), " ", cfg.label);
}

/* ── Days left chip ────────────────────────────────────────────────── */
function DaysChip({
  days_left,
  state
}) {
  if (state === 'on_time') return /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--success-text)',
      fontWeight: 600,
      fontSize: 13
    }
  }, days_left, "d left");
  if (state === 'due_today') return /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--warning-text)',
      fontWeight: 700,
      fontSize: 13
    }
  }, "Due today");
  return /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--danger-text)',
      fontWeight: 700,
      fontSize: 13
    }
  }, Math.abs(days_left), "d overdue");
}

/* ── Process Return modal ──────────────────────────────────────────── */
function ProcessReturnModal({
  item,
  onClose,
  onConfirm
}) {
  const {
    Modal,
    Button,
    Input,
    Select,
    Textarea
  } = NS_RET;
  const [condition, setCondition] = React.useState('good');
  const [busy, setBusy] = React.useState(false);
  const warn = condition === 'damaged' || condition === 'missing';
  return /*#__PURE__*/React.createElement(Modal, {
    open: true,
    onClose: onClose,
    title: "Process Return",
    width: 480,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: warn ? 'danger' : 'primary',
      loading: busy,
      onClick: () => {
        setBusy(true);
        setTimeout(() => {
          onConfirm && onConfirm(item.id, {
            condition
          });
          onClose();
        }, 700);
      }
    }, "Confirm Return"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '11px 14px',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, item.tool_name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--text-muted)',
      marginTop: 2,
      fontFamily: 'monospace'
    }
  }, item.tool_code, " \xB7 issued to ", item.issued_to)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Quantity returned",
    required: true,
    type: "number",
    defaultValue: item.qty,
    min: "1",
    max: item.qty
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Condition",
    required: true,
    value: condition,
    onChange: e => setCondition(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "good"
  }, "Good"), /*#__PURE__*/React.createElement("option", {
    value: "partial"
  }, "Partial"), /*#__PURE__*/React.createElement("option", {
    value: "damaged"
  }, "Damaged"), /*#__PURE__*/React.createElement("option", {
    value: "missing"
  }, "Missing"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Textarea, {
    label: "Notes",
    rows: 2,
    placeholder: "Any observations on the returned tool\u2026"
  })), warn && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 9,
      marginTop: 14,
      padding: '11px 13px',
      background: 'var(--danger-bg)',
      border: '1px solid var(--danger-border)',
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "alert_triangle",
    size: 16,
    color: "var(--danger-solid)",
    style: {
      flexShrink: 0,
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'var(--danger-text)',
      lineHeight: 1.45
    }
  }, "A ", /*#__PURE__*/React.createElement("strong", null, condition), " return routes this to ", /*#__PURE__*/React.createElement("strong", null, "Pending Damage Assessment"), ". Stock will not be restored until assessed.")));
}

/* ── Record Damage modal ───────────────────────────────────────────── */
function RecordDamageModal({
  item,
  onClose,
  onConfirm
}) {
  const {
    Modal,
    Button,
    RadioGroup,
    Input,
    Textarea
  } = NS_RET;
  const [kind, setKind] = React.useState('mishandling');
  const [marketRate, setMarketRate] = React.useState(item.current_value);
  const [busy, setBusy] = React.useState(false);
  const inr = window.inr;
  const factor = kind === 'theft' ? 1 : kind === 'mishandling' ? 0.5 : 0;
  const penalty = Math.round((Number(marketRate) || 0) * factor);
  return /*#__PURE__*/React.createElement(Modal, {
    open: true,
    onClose: onClose,
    title: "Record Damage Assessment",
    width: 480,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "danger",
      loading: busy,
      onClick: () => {
        setBusy(true);
        setTimeout(() => {
          onConfirm && onConfirm(item.id, {
            kind,
            penalty
          });
          onClose();
        }, 700);
      }
    }, "Record Assessment"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '11px 14px',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, item.tool_name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--text-muted)',
      marginTop: 2,
      fontFamily: 'monospace'
    }
  }, item.tool_code, " \xB7 returned ", item.condition, " by ", item.returned_by)), /*#__PURE__*/React.createElement(RadioGroup, {
    name: "dmg",
    value: kind,
    onChange: setKind,
    label: "Damage type",
    layout: "stack",
    options: [{
      value: 'theft',
      label: 'Theft / Missing',
      hint: 'Full market-rate penalty (100%)'
    }, {
      value: 'mishandling',
      label: 'Mishandling',
      hint: 'Half market-rate penalty (50%)'
    }, {
      value: 'wear_and_tear',
      label: 'Wear & tear',
      hint: 'No penalty — normal usage'
    }]
  }), kind !== 'wear_and_tear' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Current market rate (\u20B9)",
    type: "number",
    value: marketRate,
    onChange: e => setMarketRate(e.target.value),
    helper: "Defaults to the tool's depreciated value"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '13px 15px',
      borderRadius: 'var(--radius-md)',
      background: penalty > 0 ? 'var(--danger-bg)' : 'var(--success-bg)',
      border: `1px solid ${penalty > 0 ? 'var(--danger-border)' : 'var(--success-border)'}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: penalty > 0 ? 'var(--danger-text)' : 'var(--success-text)'
    }
  }, "Calculated penalty"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'monospace',
      fontSize: 18,
      fontWeight: 700,
      color: penalty > 0 ? 'var(--danger-text)' : 'var(--success-text)'
    }
  }, inr(penalty))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Textarea, {
    label: "Assessment notes",
    rows: 2,
    placeholder: "Document the assessment rationale\u2026"
  })));
}

/* ── View Damage Details modal ─────────────────────────────────────── */
function ViewDamageModal({
  item,
  onClose
}) {
  const {
    Modal,
    Button
  } = NS_RET;
  const inr = window.inr;
  const F = ({
    label,
    value
  }) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: 'var(--text-subtle)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 600,
      marginBottom: 2
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: 'var(--text-default)'
    }
  }, value || '—'));
  return /*#__PURE__*/React.createElement(Modal, {
    open: true,
    onClose: onClose,
    title: "Damage Report Details",
    width: 460,
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "Close")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(F, {
    label: "Tool",
    value: item.tool_name
  }), /*#__PURE__*/React.createElement(F, {
    label: "Tool Code",
    value: item.tool_code
  }), /*#__PURE__*/React.createElement(F, {
    label: "Returned By",
    value: item.returned_by
  }), /*#__PURE__*/React.createElement(F, {
    label: "Department",
    value: item.dept
  }), /*#__PURE__*/React.createElement(F, {
    label: "Returned On",
    value: item.returned_on
  }), /*#__PURE__*/React.createElement(F, {
    label: "Condition",
    value: item.condition.charAt(0).toUpperCase() + item.condition.slice(1)
  }), /*#__PURE__*/React.createElement(F, {
    label: "Tool Value",
    value: inr(item.current_value)
  }), /*#__PURE__*/React.createElement(F, {
    label: "Status",
    value: "Pending Assessment"
  })));
}

/* ── Return History modal ──────────────────────────────────────────── */
function ReturnHistoryModal({
  item,
  onClose
}) {
  const {
    Modal,
    Button
  } = NS_RET;
  const logs = RETURN_HISTORY[item.id] || [];
  return /*#__PURE__*/React.createElement(Modal, {
    open: true,
    onClose: onClose,
    title: "Return History",
    width: 540,
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "Close")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 13px',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, item.tool_name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)',
      fontFamily: 'monospace',
      marginTop: 2
    }
  }, item.tool_code)), logs.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      color: 'var(--text-subtle)',
      padding: '28px 0',
      fontSize: 13
    }
  }, "No prior return history for this tool.") : /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--surface-sunken)',
      borderBottom: '1px solid var(--border-default)'
    }
  }, ['Date', 'Returned By', 'Condition', 'Notes'].map((h, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    style: {
      padding: '9px 12px',
      textAlign: 'left',
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, logs.map((l, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-sunken)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 12px',
      whiteSpace: 'nowrap',
      color: 'var(--text-default)',
      fontWeight: 500
    }
  }, l.date), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 12px',
      color: 'var(--text-default)'
    }
  }, l.returned_by), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 12px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--success-bg)',
      color: 'var(--success-text)'
    }
  }, l.condition)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '10px 12px',
      color: 'var(--text-muted)',
      fontSize: 12.5
    }
  }, l.notes)))))));
}

/* ── Records modal ────────────────────────────────────────────────── */
function RecordsModal({
  returnHistory,
  damageHistory,
  onClose
}) {
  const inr = window.inr;
  const [tab, setTab] = React.useState('returns');
  const KIND = {
    theft: 'Theft / Missing',
    mishandling: 'Mishandling',
    wear_and_tear: 'Wear & Tear'
  };
  const TH = ({
    children
  }) => /*#__PURE__*/React.createElement("th", {
    style: {
      padding: '9px 16px',
      textAlign: 'left',
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap'
    }
  }, children);
  const TD = ({
    children,
    mono,
    muted,
    nowrap,
    warn
  }) => /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 16px',
      color: warn ? 'var(--danger-text)' : muted ? 'var(--text-muted)' : 'var(--text-default)',
      fontFamily: mono ? 'monospace' : undefined,
      fontWeight: mono ? 600 : undefined,
      whiteSpace: nowrap ? 'nowrap' : undefined
    }
  }, children);
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      if (e.target === e.currentTarget) onClose();
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 55,
      background: 'rgba(0,0,0,0.42)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 800,
      maxHeight: '82vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-xl,16px)',
      boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      borderBottom: '1px solid var(--border-default)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, "Records"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 32,
      height: 32,
      border: '1px solid var(--border-default)',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      padding: '0 24px',
      borderBottom: '1px solid var(--border-default)',
      flexShrink: 0
    }
  }, [{
    key: 'returns',
    label: `Processed Returns (${returnHistory.length})`
  }, {
    key: 'damage',
    label: `Damage Assessments (${damageHistory.length})`
  }].map(t => /*#__PURE__*/React.createElement("button", {
    key: t.key,
    onClick: () => setTab(t.key),
    style: {
      padding: '12px 16px 10px',
      border: 'none',
      background: 'transparent',
      borderBottom: `2px solid ${tab === t.key ? 'var(--brand-black)' : 'transparent'}`,
      color: tab === t.key ? 'var(--text-strong)' : 'var(--text-muted)',
      fontWeight: 600,
      fontSize: 13.5,
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      marginBottom: -1,
      transition: 'color 0.15s'
    }
  }, t.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      scrollbarWidth: 'thin'
    }
  }, tab === 'returns' && (returnHistory.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '48px 24px',
      textAlign: 'center',
      color: 'var(--text-subtle)',
      fontSize: 13
    }
  }, "No returns processed yet \u2014 they will appear here once confirmed.") : /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--surface-sunken)',
      borderBottom: '1px solid var(--border-default)'
    }
  }, /*#__PURE__*/React.createElement(TH, null, "Tool"), /*#__PURE__*/React.createElement(TH, null, "Returned By"), /*#__PURE__*/React.createElement(TH, null, "Dept"), /*#__PURE__*/React.createElement(TH, null, "Due"), /*#__PURE__*/React.createElement(TH, null, "Returned On"), /*#__PURE__*/React.createElement(TH, null, "Condition"))), /*#__PURE__*/React.createElement("tbody", null, returnHistory.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    style: {
      borderBottom: '1px solid var(--border-subtle)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-sunken)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement(TD, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, r.tool_name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontFamily: 'monospace',
      color: 'var(--text-subtle)'
    }
  }, r.tool_code)), /*#__PURE__*/React.createElement(TD, null, r.issued_to), /*#__PURE__*/React.createElement(TD, {
    muted: true
  }, r.dept), /*#__PURE__*/React.createElement(TD, {
    muted: true,
    nowrap: true
  }, r.due), /*#__PURE__*/React.createElement(TD, {
    muted: true,
    nowrap: true
  }, r.returnedOn), /*#__PURE__*/React.createElement(TD, null, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '2px 9px',
      borderRadius: 'var(--radius-pill)',
      fontSize: 11.5,
      fontWeight: 600,
      background: r.condition === 'good' ? 'var(--success-bg)' : r.condition === 'partial' ? 'var(--warning-bg)' : 'var(--danger-bg)',
      color: r.condition === 'good' ? 'var(--success-text)' : r.condition === 'partial' ? 'var(--warning-text)' : 'var(--danger-text)',
      textTransform: 'capitalize'
    }
  }, r.condition))))))), tab === 'damage' && (damageHistory.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '48px 24px',
      textAlign: 'center',
      color: 'var(--text-subtle)',
      fontSize: 13
    }
  }, "No damage assessments recorded yet \u2014 they will appear here once confirmed.") : /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--surface-sunken)',
      borderBottom: '1px solid var(--border-default)'
    }
  }, /*#__PURE__*/React.createElement(TH, null, "Tool"), /*#__PURE__*/React.createElement(TH, null, "Returned By"), /*#__PURE__*/React.createElement(TH, null, "Dept"), /*#__PURE__*/React.createElement(TH, null, "Condition"), /*#__PURE__*/React.createElement(TH, null, "Damage Type"), /*#__PURE__*/React.createElement(TH, null, "Penalty"), /*#__PURE__*/React.createElement(TH, null, "Assessed"))), /*#__PURE__*/React.createElement("tbody", null, damageHistory.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    style: {
      borderBottom: '1px solid var(--border-subtle)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-sunken)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement(TD, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, r.tool_name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontFamily: 'monospace',
      color: 'var(--text-subtle)'
    }
  }, r.tool_code)), /*#__PURE__*/React.createElement(TD, null, r.returned_by), /*#__PURE__*/React.createElement(TD, {
    muted: true
  }, r.dept), /*#__PURE__*/React.createElement(TD, null, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '2px 9px',
      borderRadius: 'var(--radius-pill)',
      fontSize: 11.5,
      fontWeight: 600,
      background: 'var(--danger-bg)',
      color: 'var(--danger-text)',
      textTransform: 'capitalize'
    }
  }, r.condition)), /*#__PURE__*/React.createElement(TD, {
    muted: true
  }, KIND[r.kind] || '—'), /*#__PURE__*/React.createElement(TD, {
    mono: true,
    warn: r.penalty > 0
  }, inr(r.penalty || 0)), /*#__PURE__*/React.createElement(TD, {
    muted: true,
    nowrap: true
  }, r.assessedOn)))))))));
}

/* ── Main screen ───────────────────────────────────────────────────── */
function ReturnsScreen() {
  const {
    PageHeader,
    Card,
    DataTable,
    StatusBadge,
    Button,
    Input,
    EmptyState
  } = NS_RET;
  const [ret, setRet] = React.useState(null);
  const [dmg, setDmg] = React.useState(null);
  const [viewDmg, setViewDmg] = React.useState(null);
  const [retHist, setRetHist] = React.useState(null);
  const [activeList, setActiveList] = React.useState(window.MOCK.ACTIVE_ISSUANCES || []);
  const [damageList, setDamageList] = React.useState(window.MOCK.PENDING_DAMAGE || []);
  const [returnHistory, setReturnHistory] = React.useState([]);
  const [damageHistory, setDamageHistory] = React.useState([]);
  const [viewMode, setViewMode] = React.useState('list');
  const [recordsTab, setRecordsTab] = React.useState('returns');
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const inr = window.inr;
  const all = activeList;
  const overdue = all.filter(i => i.state === 'overdue').length;
  const pending = damageList.length;
  const chips = [{
    label: 'Active Issuances',
    value: all.length,
    fg: 'var(--text-strong)',
    bg: 'var(--surface-sunken)'
  }, {
    label: 'Overdue',
    value: overdue,
    fg: 'var(--danger-text)',
    bg: 'var(--danger-bg)'
  }, {
    label: 'Pending Damage',
    value: pending,
    fg: 'var(--warning-text)',
    bg: 'var(--warning-bg)'
  }];
  const activeRows = all.filter(i => {
    const q = search.toLowerCase();
    const matchQ = !q || `${i.tool_name} ${i.tool_code} ${i.issued_to}`.toLowerCase().includes(q);
    const matchF = filter === 'all' || i.state === filter;
    return matchQ && matchF;
  });
  const filterBtns = [{
    key: 'all',
    label: 'All'
  }, {
    key: 'on_time',
    label: 'On Time'
  }, {
    key: 'due_today',
    label: 'Due Today'
  }, {
    key: 'overdue',
    label: 'Overdue'
  }, {
    key: 'records',
    label: 'View Records'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 22
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Returns",
    subtitle: "Process tool returns and assess damage"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, chips.map(ch => /*#__PURE__*/React.createElement("div", {
    key: ch.label,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '7px 14px',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-resting)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      background: ch.bg,
      color: ch.fg,
      borderRadius: 'var(--radius-sm)',
      padding: '0 7px',
      lineHeight: 1.5
    }
  }, ch.value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'var(--text-muted)'
    }
  }, ch.label)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: 1,
      maxWidth: 300
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 14,
    color: "var(--text-subtle)",
    style: {
      position: 'absolute',
      left: 9,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: search,
    onChange: e => setSearch(e.target.value),
    placeholder: "Search tool or borrower\u2026",
    style: {
      width: '100%',
      paddingLeft: 30,
      paddingRight: 10,
      height: 36,
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13.5,
      color: 'var(--text-default)',
      background: 'var(--surface-card)',
      outline: 'none',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-md)',
      padding: 3
    }
  }, filterBtns.map(f => /*#__PURE__*/React.createElement("button", {
    key: f.key,
    onClick: () => {
      if (f.key === 'records') {
        setViewMode('records');
      } else {
        setViewMode('list');
        setFilter(f.key);
      }
    },
    style: {
      padding: '5px 12px',
      border: 'none',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
      fontSize: 13,
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      background: (f.key === 'records' ? viewMode === 'records' : viewMode === 'list' && filter === f.key) ? 'var(--surface-card)' : 'transparent',
      color: (f.key === 'records' ? viewMode === 'records' : viewMode === 'list' && filter === f.key) ? f.key === 'records' ? 'var(--info-text)' : 'var(--text-strong)' : 'var(--text-muted)',
      boxShadow: (f.key === 'records' ? viewMode === 'records' : viewMode === 'list' && filter === f.key) ? 'var(--shadow-resting)' : 'none',
      transition: 'all 0.15s'
    }
  }, f.label)))), viewMode !== 'records' && /*#__PURE__*/React.createElement(React.Fragment, null, "}", /*#__PURE__*/React.createElement(Card, {
    title: /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--text-strong)'
      }
    }, "Active Issuances"),
    padded: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: 'tool_name',
      header: 'Tool',
      render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 600,
          color: 'var(--text-strong)'
        }
      }, r.tool_name), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11.5,
          color: 'var(--text-subtle)',
          fontFamily: 'monospace'
        }
      }, r.tool_code))
    }, {
      key: 'qty',
      header: 'Qty',
      align: 'right'
    }, {
      key: 'issued_to',
      header: 'Borrowed By',
      render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 500,
          color: 'var(--text-strong)'
        }
      }, r.issued_to), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11.5,
          color: 'var(--text-subtle)'
        }
      }, r.dept))
    }, {
      key: 'issued_on',
      header: 'Issued On',
      nowrap: true,
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-muted)',
          fontSize: 12.5
        }
      }, r.issued_on)
    }, {
      key: 'due',
      header: 'Due',
      nowrap: true,
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          color: r.state === 'overdue' ? 'var(--danger-text)' : 'var(--text-muted)',
          fontWeight: r.state === 'overdue' ? 600 : 400
        }
      }, r.due)
    }, {
      key: 'status',
      header: 'Status',
      render: r => /*#__PURE__*/React.createElement(IssuanceBadge, {
        state: r.state
      })
    }, {
      key: 'days',
      header: 'Days',
      render: r => /*#__PURE__*/React.createElement(DaysChip, {
        days_left: r.days_left,
        state: r.state
      })
    }, {
      key: 'actions',
      header: '',
      render: r => /*#__PURE__*/React.createElement("button", {
        onClick: () => setRet(r),
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface-card)',
          color: 'var(--text-default)',
          fontSize: 13,
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s'
        },
        onMouseEnter: e => {
          e.currentTarget.style.background = 'var(--brand-black)';
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.borderColor = 'var(--brand-black)';
        },
        onMouseLeave: e => {
          e.currentTarget.style.background = 'var(--surface-card)';
          e.currentTarget.style.color = 'var(--text-default)';
          e.currentTarget.style.borderColor = 'var(--border-default)';
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "arrow_left_circle",
        size: 14
      }), " Process Return")
    }],
    rows: activeRows,
    getRowTone: r => r.state === 'overdue' ? 'danger' : null,
    empty: /*#__PURE__*/React.createElement(EmptyState, {
      compact: true,
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "arrow_left_circle",
        size: 26
      }),
      title: "No active issuances",
      message: "There are no tools currently issued out."
    })
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1.5px solid var(--danger-border, var(--danger-bg))',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: '0 0 0 3px rgba(239,68,68,0.06)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 18px',
      background: 'var(--danger-bg)',
      borderBottom: '1px solid var(--danger-border, var(--danger-bg))'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "alert_triangle",
    size: 17,
    color: "var(--danger-text)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--danger-text)'
    }
  }, "Pending Damage Assessment"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--danger-solid)',
      color: '#fff'
    }
  }, damageList.length)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: 'var(--danger-text)',
      fontWeight: 500
    }
  }, "Admin action required \u2014 stock held pending resolution")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)'
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: 'tool_name',
      header: 'Tool',
      render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 600,
          color: 'var(--text-strong)'
        }
      }, r.tool_name), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11.5,
          color: 'var(--text-subtle)',
          fontFamily: 'monospace'
        }
      }, r.tool_code))
    }, {
      key: 'returned_by',
      header: 'Returned By',
      render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 500,
          color: 'var(--text-strong)'
        }
      }, r.returned_by), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11.5,
          color: 'var(--text-subtle)'
        }
      }, r.dept))
    }, {
      key: 'returned_on',
      header: 'Returned',
      nowrap: true,
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-muted)',
          fontSize: 12.5
        }
      }, r.returned_on)
    }, {
      key: 'condition',
      header: 'Condition',
      render: r => /*#__PURE__*/React.createElement(StatusBadge, {
        status: r.condition,
        size: "sm"
      })
    }, {
      key: 'current_value',
      header: 'Tool Value',
      align: 'right',
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'monospace',
          fontWeight: 600
        }
      }, inr(r.current_value))
    }, {
      key: 'actions',
      header: '',
      nowrap: true,
      render: r => /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 6
        }
      }, /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "danger",
        onClick: () => setDmg(r)
      }, "Record Damage"), /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        onClick: () => setViewDmg(r)
      }, "Details"), /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        onClick: () => setRetHist(r)
      }, "History"))
    }],
    rows: damageList,
    getRowTone: () => 'danger',
    empty: /*#__PURE__*/React.createElement(EmptyState, {
      tone: "success",
      compact: true,
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "check_circle",
        size: 24
      }),
      title: "No pending assessments",
      message: "All damaged/missing returns have been assessed."
    })
  })))), viewMode === 'records' && /*#__PURE__*/React.createElement(Card, {
    title: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 0
      }
    }, [{
      key: 'returns',
      label: `Processed Returns (${returnHistory.length})`
    }, {
      key: 'damage',
      label: `Damage Assessments (${damageHistory.length})`
    }].map(t => /*#__PURE__*/React.createElement("button", {
      key: t.key,
      onClick: () => setRecordsTab(t.key),
      style: {
        padding: '4px 16px 6px',
        border: 'none',
        background: 'transparent',
        borderBottom: `2px solid ${recordsTab === t.key ? 'var(--brand-black)' : 'transparent'}`,
        color: recordsTab === t.key ? 'var(--text-strong)' : 'var(--text-muted)',
        fontWeight: 600,
        fontSize: 13.5,
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        transition: 'color 0.15s',
        marginBottom: -1
      }
    }, t.label))),
    padded: false
  }, recordsTab === 'returns' && (returnHistory.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '36px 20px',
      textAlign: 'center',
      color: 'var(--text-subtle)',
      fontSize: 13
    }
  }, "No returns processed yet \u2014 they will appear here once confirmed.") : /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--surface-sunken)',
      borderBottom: '1px solid var(--border-default)'
    }
  }, ['Tool', 'Returned By', 'Dept', 'Due', 'Returned On', 'Condition'].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      padding: '9px 20px',
      textAlign: 'left',
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap'
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, returnHistory.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    style: {
      borderBottom: '1px solid var(--border-subtle)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-sunken)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, r.tool_name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontFamily: 'monospace',
      color: 'var(--text-subtle)'
    }
  }, r.tool_code)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 20px'
    }
  }, r.issued_to), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 20px',
      color: 'var(--text-muted)'
    }
  }, r.dept), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 20px',
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap'
    }
  }, r.due), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 20px',
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap'
    }
  }, r.returnedOn), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 20px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '2px 9px',
      borderRadius: 'var(--radius-pill)',
      fontSize: 11.5,
      fontWeight: 600,
      background: r.condition === 'good' ? 'var(--success-bg)' : r.condition === 'partial' ? 'var(--warning-bg)' : 'var(--danger-bg)',
      color: r.condition === 'good' ? 'var(--success-text)' : r.condition === 'partial' ? 'var(--warning-text)' : 'var(--danger-text)',
      textTransform: 'capitalize'
    }
  }, r.condition))))))), recordsTab === 'damage' && (damageHistory.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '36px 20px',
      textAlign: 'center',
      color: 'var(--text-subtle)',
      fontSize: 13
    }
  }, "No damage assessments recorded yet \u2014 they will appear here once confirmed.") : /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--surface-sunken)',
      borderBottom: '1px solid var(--border-default)'
    }
  }, ['Tool', 'Returned By', 'Dept', 'Condition', 'Damage Type', 'Penalty', 'Assessed'].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      padding: '9px 20px',
      textAlign: 'left',
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap'
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, damageHistory.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    style: {
      borderBottom: '1px solid var(--border-subtle)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-sunken)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, r.tool_name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontFamily: 'monospace',
      color: 'var(--text-subtle)'
    }
  }, r.tool_code)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 20px'
    }
  }, r.returned_by), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 20px',
      color: 'var(--text-muted)'
    }
  }, r.dept), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 20px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '2px 9px',
      borderRadius: 'var(--radius-pill)',
      fontSize: 11.5,
      fontWeight: 600,
      background: 'var(--danger-bg)',
      color: 'var(--danger-text)',
      textTransform: 'capitalize'
    }
  }, r.condition)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 20px',
      color: 'var(--text-muted)'
    }
  }, {
    theft: 'Theft / Missing',
    mishandling: 'Mishandling',
    wear_and_tear: 'Wear & Tear'
  }[r.kind] || '—'), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 20px',
      fontFamily: 'monospace',
      fontWeight: 600,
      color: r.penalty > 0 ? 'var(--danger-text)' : 'var(--success-text)'
    }
  }, inr(r.penalty || 0)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '11px 20px',
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap'
    }
  }, r.assessedOn))))))), ret && /*#__PURE__*/React.createElement(ProcessReturnModal, {
    item: ret,
    onClose: () => setRet(null),
    onConfirm: (id, extra) => {
      const found = activeList.find(i => i.id === id);
      const upd = activeList.filter(i => i.id !== id);
      setActiveList(upd);
      window.MOCK.ACTIVE_ISSUANCES = upd;
      if (found) setReturnHistory(h => [...h, {
        ...found,
        condition: extra?.condition || 'good',
        returnedOn: '15 Jun 2026'
      }]);
    }
  }), dmg && /*#__PURE__*/React.createElement(RecordDamageModal, {
    item: dmg,
    onClose: () => setDmg(null),
    onConfirm: (id, extra) => {
      const found = damageList.find(i => i.id === id);
      const upd = damageList.filter(i => i.id !== id);
      setDamageList(upd);
      window.MOCK.PENDING_DAMAGE = upd;
      if (found) setDamageHistory(h => [...h, {
        ...found,
        kind: extra?.kind,
        penalty: extra?.penalty || 0,
        assessedOn: '15 Jun 2026'
      }]);
    }
  }), viewDmg && /*#__PURE__*/React.createElement(ViewDamageModal, {
    item: viewDmg,
    onClose: () => setViewDmg(null)
  }), retHist && /*#__PURE__*/React.createElement(ReturnHistoryModal, {
    item: retHist,
    onClose: () => setRetHist(null)
  }));
}
Object.assign(window, {
  ReturnsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mtrs/ReturnsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mtrs/StorageBinsScreen.jsx
try { (() => {
const NS_BIN = window.MTRSDesignSystemUltraTechCement_660dc9;
const BIN_DEPTS = ['All Departments', 'E&I', 'Mechanical', 'Civil', 'Process'];

/* Extend mock BINS with physical location fields */
const BIN_EXTRAS = [{
  row: 'Row A',
  rack_number: 'R-01',
  shelf_level: 'L1 — Ground',
  floor_area: 'Ground Floor'
}, {
  row: 'Row A',
  rack_number: 'R-12',
  shelf_level: 'L3 — Top',
  floor_area: 'Mezzanine'
}, {
  row: 'Row B',
  rack_number: 'R-04',
  shelf_level: 'L2 — Mid',
  floor_area: 'Ground Floor'
}, {
  row: 'Row B',
  rack_number: 'R-05',
  shelf_level: 'L2 — Mid',
  floor_area: 'Ground Floor'
}, {
  row: 'Row C',
  rack_number: 'R-09',
  shelf_level: 'L1 — Ground',
  floor_area: 'Ground Floor'
}, {
  row: 'Row D',
  rack_number: 'R-06',
  shelf_level: 'L2 — Mid',
  floor_area: 'First Floor'
}];
function BinForm({
  bin,
  onClose
}) {
  const {
    SlideOver,
    Button,
    Input,
    Select,
    Textarea
  } = NS_BIN;
  const [saving, setSaving] = React.useState(false);
  const editing = !!bin;
  const Section = ({
    title,
    children
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: '0 0 12px',
      paddingBottom: 7,
      borderBottom: '1px solid var(--border-subtle)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 13
    }
  }, children));
  const Full = ({
    children
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1'
    }
  }, children);
  return /*#__PURE__*/React.createElement(SlideOver, {
    open: true,
    onClose: onClose,
    title: editing ? 'Edit Storage Bin' : 'Add Storage Bin',
    subtitle: "Bin, shelf and physical location",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      loading: saving,
      onClick: () => {
        setSaving(true);
        setTimeout(onClose, 700);
      }
    }, editing ? 'Save Changes' : 'Create Bin'))
  }, /*#__PURE__*/React.createElement(Section, {
    title: "Identification"
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Bin Code",
    required: true,
    placeholder: "e.g. A-12-03",
    defaultValue: bin?.bin_code
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Shelf Label",
    required: true,
    placeholder: "e.g. Shelf A12",
    defaultValue: bin?.shelf
  }), /*#__PURE__*/React.createElement(Full, null, /*#__PURE__*/React.createElement(Input, {
    label: "Section",
    required: true,
    placeholder: "e.g. Precision Tools",
    defaultValue: bin?.section
  })), /*#__PURE__*/React.createElement(Select, {
    label: "Department Category",
    required: true,
    defaultValue: bin?.dept_category || ''
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Select\u2026"), BIN_DEPTS.map(d => /*#__PURE__*/React.createElement("option", {
    key: d
  }, d))), /*#__PURE__*/React.createElement(Input, {
    label: "Capacity",
    required: true,
    type: "number",
    placeholder: "0",
    defaultValue: bin?.capacity
  })), /*#__PURE__*/React.createElement(Section, {
    title: "Physical Location"
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Row",
    placeholder: "e.g. Row A",
    defaultValue: bin?.row
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Rack Number",
    placeholder: "e.g. R-12",
    defaultValue: bin?.rack_number
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Shelf Level",
    defaultValue: bin?.shelf_level || ''
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Select level\u2026"), /*#__PURE__*/React.createElement("option", null, "L1 \u2014 Ground"), /*#__PURE__*/React.createElement("option", null, "L2 \u2014 Mid"), /*#__PURE__*/React.createElement("option", null, "L3 \u2014 Top")), /*#__PURE__*/React.createElement(Select, {
    label: "Floor / Area",
    defaultValue: bin?.floor_area || ''
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Select floor\u2026"), /*#__PURE__*/React.createElement("option", null, "Ground Floor"), /*#__PURE__*/React.createElement("option", null, "Mezzanine"), /*#__PURE__*/React.createElement("option", null, "First Floor"), /*#__PURE__*/React.createElement("option", null, "Second Floor"))), /*#__PURE__*/React.createElement(Section, {
    title: "Notes"
  }, /*#__PURE__*/React.createElement(Full, null, /*#__PURE__*/React.createElement(Textarea, {
    label: "Description",
    rows: 2,
    placeholder: "What is stored in this bin\u2026",
    defaultValue: bin?.description
  }))));
}
function StorageBinsScreen() {
  const {
    PageHeader,
    Card,
    DataTable,
    Button,
    Input,
    EmptyState
  } = NS_BIN;
  const [form, setForm] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const BINS = (window.MOCK.BINS || []).map((b, i) => ({
    ...b,
    ...(BIN_EXTRAS[i] || {})
  }));
  const rows = BINS.filter(b => `${b.bin_code} ${b.section} ${b.dept_category} ${b.row || ''} ${b.rack_number || ''}`.toLowerCase().includes(search.toLowerCase()));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Storage Bins",
    subtitle: "Bin, shelf and physical location master for the tool store",
    actions: /*#__PURE__*/React.createElement(Button, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "plus",
        size: 16
      }),
      onClick: () => setForm({
        new: true
      })
    }, "Add Bin")
  }), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 340
    }
  }, /*#__PURE__*/React.createElement(Input, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 14
    }),
    placeholder: "Search bin code, section, row or dept\u2026",
    value: search,
    onChange: e => setSearch(e.target.value)
  }))), /*#__PURE__*/React.createElement(Card, {
    padded: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: 'bin_code',
      header: 'Bin',
      render: b => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          color: 'var(--text-strong)',
          fontFamily: 'monospace'
        }
      }, b.bin_code), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12,
          color: 'var(--text-muted)',
          marginTop: 1
        }
      }, b.shelf, " \xB7 ", b.section))
    }, {
      key: 'row',
      header: 'Location',
      render: b => /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12.5,
          lineHeight: 1.6
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--text-default)'
        }
      }, b.row || '—', " \xB7 ", /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'monospace'
        }
      }, b.rack_number || '—')), /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--text-muted)'
        }
      }, b.shelf_level || '—', " \xB7 ", b.floor_area || '—'))
    }, {
      key: 'dept_category',
      header: 'Dept',
      render: b => /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-muted)'
        }
      }, b.dept_category)
    }, {
      key: 'capacity',
      header: 'Cap.',
      align: 'right',
      render: b => /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600
        }
      }, b.capacity)
    }, {
      key: 'description',
      header: 'Notes',
      render: b => /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block',
          maxWidth: 200,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: 'var(--text-muted)',
          fontSize: 12.5
        },
        title: b.description
      }, b.description)
    }, {
      key: 'actions',
      header: '',
      render: b => /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        onClick: () => setForm({
          bin: b
        })
      }, "Edit")
    }],
    rows: rows,
    empty: /*#__PURE__*/React.createElement(EmptyState, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "archive",
        size: 30
      }),
      title: "No storage bins",
      message: "Add a bin to start mapping tools to shelves.",
      action: /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        icon: /*#__PURE__*/React.createElement(Icon, {
          name: "plus",
          size: 14
        }),
        onClick: () => setForm({
          new: true
        })
      }, "Add Bin")
    })
  })), form && /*#__PURE__*/React.createElement(BinForm, {
    bin: form.bin,
    onClose: () => setForm(null)
  }));
}
Object.assign(window, {
  StorageBinsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mtrs/StorageBinsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mtrs/ToolsScreen.jsx
try { (() => {
const NS_TOOLS = window.MTRSDesignSystemUltraTechCement_660dc9;
const DEPARTMENTS = ['E&I', 'Mechanical', 'Civil', 'Process'];
function ToolForm({
  onClose,
  tool = null
}) {
  const {
    SlideOver,
    Button,
    Input,
    Select,
    RadioGroup,
    Toggle
  } = NS_TOOLS;
  const [type, setType] = React.useState(tool?.tool_type || 'specialized');
  const [reqCal, setReqCal] = React.useState(true);
  const [consumable, setConsumable] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const editing = !!tool;
  const Group = ({
    title,
    children
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: '0 0 12px',
      paddingBottom: 7,
      borderBottom: '1px solid var(--border-subtle)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 13
    }
  }, children));
  return /*#__PURE__*/React.createElement(SlideOver, {
    open: true,
    onClose: onClose,
    title: editing ? 'Edit Tool' : 'Add New Tool',
    subtitle: "Plant maintenance catalogue",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      loading: saving,
      onClick: () => {
        setSaving(true);
        setTimeout(onClose, 700);
      }
    }, editing ? 'Save Changes' : 'Create Tool'))
  }, /*#__PURE__*/React.createElement(Group, {
    title: "Identification"
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Tool Code",
    required: true,
    placeholder: "e.g. TL-001",
    defaultValue: tool?.tool_code
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Name",
    required: true,
    placeholder: "Tool name",
    defaultValue: tool?.name
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Category",
    placeholder: "e.g. Hand Tool"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Make"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Model"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Serial Number"
  })), /*#__PURE__*/React.createElement(Group, {
    title: "Classification"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement(RadioGroup, {
    name: "tt",
    value: type,
    onChange: setType,
    label: "Tool type",
    options: [{
      value: 'general',
      label: 'General'
    }, {
      value: 'specialized',
      label: 'Specialized'
    }]
  })), type === 'specialized' && /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Department Access"
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Select department\u2026"), DEPARTMENTS.map(d => /*#__PURE__*/React.createElement("option", {
    key: d
  }, d))))), /*#__PURE__*/React.createElement(Group, {
    title: "Inventory"
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Total Quantity",
    required: true,
    type: "number",
    defaultValue: tool?.total ?? 1
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Storage Bin",
    defaultValue: tool?.bin || ''
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "None"), /*#__PURE__*/React.createElement("option", null, "A-12-03 \u2014 Shelf A12"), /*#__PURE__*/React.createElement("option", null, "B-04-11 \u2014 Shelf B4"))), /*#__PURE__*/React.createElement(Group, {
    title: "Financial"
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Purchase Date",
    type: "date"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Purchase Price (\u20B9)",
    type: "number",
    placeholder: "0.00"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Standard Life (months)",
    type: "number"
  })), /*#__PURE__*/React.createElement(Group, {
    title: "Calibration & Consumable"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement(Toggle, {
    checked: reqCal,
    onChange: setReqCal,
    label: "Requires calibration"
  })), reqCal && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Input, {
    label: "Calibration Freq (days)",
    type: "number",
    defaultValue: "180"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Last Calibration Date",
    type: "date"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Service Partner",
    placeholder: "Vendor / lab name"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement(Toggle, {
    checked: consumable,
    onChange: setConsumable,
    label: "Consumable tool (e.g. welding rods)"
  }))));
}
function ToolChipGroup({
  label,
  value,
  onChange,
  options
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--text-subtle)',
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      flexShrink: 0
    }
  }, label), options.map(opt => {
    const active = value === opt.value;
    return /*#__PURE__*/React.createElement("button", {
      key: opt.value,
      onClick: () => onChange(opt.value),
      style: {
        padding: '4px 11px',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        background: active ? 'var(--brand-black)' : 'transparent',
        color: active ? '#fff' : 'var(--text-muted)',
        borderColor: active ? 'var(--brand-black)' : 'var(--border-default)',
        transition: 'background 0.13s, color 0.13s, border-color 0.13s'
      }
    }, opt.label);
  }));
}
function ToolsScreen() {
  const {
    PageHeader,
    Button,
    Card,
    Tabs,
    DataTable,
    StatusBadge,
    Input,
    Select,
    EmptyState
  } = NS_TOOLS;
  const [showForm, setShowForm] = React.useState(false);
  const [editTool, setEditTool] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [fType, setFType] = React.useState('');
  const [fStatus, setFStatus] = React.useState('');
  const rows = window.MOCK.TOOLS.filter(t => {
    if (search && !`${t.name} ${t.tool_code}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (fType && t.tool_type !== fType) return false;
    if (fStatus && t.status !== fStatus) return false;
    return true;
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Tools",
    subtitle: "Plant maintenance tool catalogue",
    actions: /*#__PURE__*/React.createElement(Button, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "plus",
        size: 16
      }),
      onClick: () => setShowForm(true)
    }, "Add Tool")
  }), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Input, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 14
    }),
    placeholder: "Search name or code\u2026",
    value: search,
    onChange: e => setSearch(e.target.value)
  }), /*#__PURE__*/React.createElement(ToolChipGroup, {
    label: "Type",
    value: fType,
    onChange: setFType,
    options: [{
      value: '',
      label: 'All Types'
    }, {
      value: 'general',
      label: 'General'
    }, {
      value: 'specialized',
      label: 'Specialized'
    }]
  }), /*#__PURE__*/React.createElement(ToolChipGroup, {
    label: "Status",
    value: fStatus,
    onChange: setFStatus,
    options: [{
      value: '',
      label: 'All Statuses'
    }, {
      value: 'active',
      label: 'Active'
    }, {
      value: 'calibration_due',
      label: 'Calibration Due'
    }, {
      value: 'damaged',
      label: 'Damaged'
    }]
  }))), /*#__PURE__*/React.createElement(Card, {
    padded: false
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: 'tool_code',
      header: 'Tool Code',
      mono: true,
      nowrap: true
    }, {
      key: 'name',
      header: 'Name',
      render: t => /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600,
          color: 'var(--text-strong)'
        }
      }, t.name)
    }, {
      key: 'tool_type',
      header: 'Type',
      render: t => /*#__PURE__*/React.createElement("span", {
        style: {
          textTransform: 'capitalize',
          color: 'var(--text-muted)'
        }
      }, t.tool_type)
    }, {
      key: 'dept',
      header: 'Dept Access',
      render: t => t.department_access || /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-subtle)'
        }
      }, "All")
    }, {
      key: 'avail',
      header: 'Available / Total',
      align: 'right',
      nowrap: true,
      render: t => /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
        style: {
          color: t.available > 0 ? 'var(--success-text)' : 'var(--danger-text)'
        }
      }, t.available), /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-subtle)'
        }
      }, " / ", t.total))
    }, {
      key: 'status',
      header: 'Status',
      render: t => /*#__PURE__*/React.createElement(StatusBadge, {
        status: t.status,
        size: "sm"
      })
    }, {
      key: 'bin',
      header: 'Storage Bin',
      mono: true,
      nowrap: true,
      render: t => /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text-muted)'
        }
      }, t.bin)
    }, {
      key: 'actions',
      header: 'Actions',
      render: t => /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 7
        },
        onClick: e => e.stopPropagation()
      }, /*#__PURE__*/React.createElement("button", {
        style: pill('var(--info-bg)', 'var(--info-text)')
      }, "Request"), /*#__PURE__*/React.createElement("button", {
        onClick: () => setEditTool(t),
        style: pill('var(--surface-sunken)', 'var(--text-default)')
      }, "Edit"))
    }],
    rows: rows,
    onRowClick: () => {},
    getRowTone: t => t.status === 'damaged' ? 'danger' : null,
    empty: /*#__PURE__*/React.createElement(EmptyState, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "wrench",
        size: 30
      }),
      title: "No tools found",
      message: "No tools match your search."
    })
  })), showForm && /*#__PURE__*/React.createElement(ToolForm, {
    onClose: () => setShowForm(false)
  }), editTool && /*#__PURE__*/React.createElement(ToolForm, {
    tool: editTool,
    onClose: () => setEditTool(null)
  }));
}
function pill(bg, fg) {
  return {
    padding: '5px 11px',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    background: bg,
    color: fg,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)'
  };
}
Object.assign(window, {
  ToolsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mtrs/ToolsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mtrs/UsersScreen.jsx
try { (() => {
const NS_USERS = window.MTRSDesignSystemUltraTechCement_660dc9;
const EMPLOYEE_DATA = [{
  id: 1,
  emp_id: 'EMP-1001',
  full_name: 'Rajesh Menon',
  department: 'Maintenance',
  role: 'maintenance_admin',
  email: 'rajesh.menon@ultratech.com',
  joined: '01 Mar 2021',
  status: 'active'
}, {
  id: 2,
  emp_id: 'EMP-1002',
  full_name: 'Anil Kumar',
  department: 'Mechanical',
  role: 'requester',
  email: 'anil.kumar@ultratech.com',
  joined: '15 Jun 2019',
  status: 'active'
}, {
  id: 3,
  emp_id: 'EMP-1003',
  full_name: 'S. Priya',
  department: 'E&I',
  role: 'requester',
  email: 's.priya@ultratech.com',
  joined: '10 Aug 2020',
  status: 'active'
}, {
  id: 4,
  emp_id: 'EMP-1004',
  full_name: 'M. Farhan',
  department: 'Civil',
  role: 'requester',
  email: 'm.farhan@ultratech.com',
  joined: '22 Jan 2022',
  status: 'active'
}, {
  id: 5,
  emp_id: 'EMP-1005',
  full_name: 'Deepa N.',
  department: 'Civil',
  role: 'dept_head',
  email: 'deepa.n@ultratech.com',
  joined: '05 Apr 2018',
  status: 'active'
}, {
  id: 6,
  emp_id: 'EMP-1006',
  full_name: 'K. Iqbal',
  department: 'Mechanical',
  role: 'maintenance_staff',
  email: 'k.iqbal@ultratech.com',
  joined: '12 Sep 2023',
  status: 'active'
}, {
  id: 7,
  emp_id: 'EMP-1007',
  full_name: 'R. Suresh',
  department: 'Process',
  role: 'requester',
  email: 'r.suresh@ultratech.com',
  joined: '08 Feb 2021',
  status: 'active'
}, {
  id: 8,
  emp_id: 'EMP-1008',
  full_name: 'P. Ramesh',
  department: 'Mechanical',
  role: 'requester',
  email: 'p.ramesh@ultratech.com',
  joined: '30 Nov 2020',
  status: 'inactive'
}, {
  id: 9,
  emp_id: 'EMP-1009',
  full_name: 'Anita Sharma',
  department: 'E&I',
  role: 'dept_head',
  email: 'anita.sharma@ultratech.com',
  joined: '17 Jul 2017',
  status: 'active'
}, {
  id: 10,
  emp_id: 'EMP-1010',
  full_name: 'V. Krishnan',
  department: 'Process',
  role: 'maintenance_staff',
  email: 'v.krishnan@ultratech.com',
  joined: '03 Oct 2022',
  status: 'active'
}];
const ROLE_LABELS_U = {
  requester: 'Requester',
  dept_head: 'Dept Head',
  maintenance_staff: 'Maint. Staff',
  maintenance_admin: 'Admin'
};
const ROLE_TONES_U = {
  requester: {
    bg: 'var(--role-requester-bg)',
    fg: 'var(--role-requester-text)'
  },
  dept_head: {
    bg: 'var(--role-depthead-bg)',
    fg: 'var(--role-depthead-text)'
  },
  maintenance_staff: {
    bg: 'var(--role-maintenance-bg)',
    fg: 'var(--role-maintenance-text)'
  },
  maintenance_admin: {
    bg: 'var(--role-admin-bg)',
    fg: 'var(--role-admin-text)'
  }
};

/* ── Pending access requests mock ──────────────────────────────────── */
const ACCESS_REQUESTS_MOCK = [{
  id: 'AR-001',
  full_name: 'Suresh Patel',
  emp_id: 'EMP-1011',
  department: 'Mechanical',
  role: 'requester',
  email: 'suresh.patel@ultratech.com',
  designation: 'Technician',
  submitted: '13 Jun 2026'
}, {
  id: 'AR-002',
  full_name: 'Meena Iyer',
  emp_id: 'EMP-1012',
  department: 'E&I',
  role: 'maintenance_staff',
  email: 'meena.iyer@ultratech.com',
  designation: 'Electrical Engineer',
  submitted: '14 Jun 2026'
}, {
  id: 'AR-003',
  full_name: 'Rohit Desai',
  emp_id: 'EMP-1013',
  department: 'Civil',
  role: 'requester',
  email: 'rohit.desai@ultratech.com',
  designation: 'Site Engineer',
  submitted: '14 Jun 2026'
}];

/* ── Shared form shell ─────────────────────────────────────────────── */
function EmployeeForm({
  title,
  subtitle,
  initial = {},
  onClose,
  onSubmit,
  submitLabel
}) {
  const {
    SlideOver,
    Button,
    Input,
    Select
  } = NS_USERS;
  const [form, setForm] = React.useState({
    full_name: '',
    emp_id: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    joined: '',
    designation: '',
    access: 'Standard',
    ...initial
  });
  const [saving, setSaving] = React.useState(false);
  const set = k => e => setForm(f => ({
    ...f,
    [k]: e.target.value
  }));
  const Section = ({
    title: t,
    children
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: '0 0 12px',
      paddingBottom: 7,
      borderBottom: '1px solid var(--border-subtle)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 13
    }
  }, children));
  const Full = ({
    children
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1'
    }
  }, children);
  return /*#__PURE__*/React.createElement(SlideOver, {
    open: true,
    onClose: onClose,
    title: title,
    subtitle: subtitle,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      loading: saving,
      onClick: () => {
        setSaving(true);
        setTimeout(() => onSubmit(form), 600);
      }
    }, submitLabel))
  }, /*#__PURE__*/React.createElement(Section, {
    title: "Personal Details"
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Full Name",
    required: true,
    value: form.full_name,
    onChange: set('full_name'),
    placeholder: "e.g. Anil Kumar"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Employee ID",
    required: true,
    value: form.emp_id,
    onChange: set('emp_id'),
    placeholder: "e.g. EMP-1011"
  }), /*#__PURE__*/React.createElement(Full, null, /*#__PURE__*/React.createElement(Input, {
    label: "Email Address",
    required: true,
    type: "email",
    value: form.email,
    onChange: set('email'),
    placeholder: "name@ultratech.com"
  })), /*#__PURE__*/React.createElement(Input, {
    label: "Phone Number",
    type: "tel",
    value: form.phone,
    onChange: set('phone'),
    placeholder: "+91 98765 43210"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Date of Joining",
    type: "date",
    value: form.joined,
    onChange: set('joined')
  })), /*#__PURE__*/React.createElement(Section, {
    title: "Work Details"
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Department",
    required: true,
    value: form.department,
    onChange: set('department')
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Select department\u2026"), ['Maintenance', 'Mechanical', 'E&I', 'Civil', 'Process'].map(d => /*#__PURE__*/React.createElement("option", {
    key: d
  }, d))), /*#__PURE__*/React.createElement(Select, {
    label: "Role",
    required: true,
    value: form.role,
    onChange: set('role')
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Select role\u2026"), /*#__PURE__*/React.createElement("option", {
    value: "requester"
  }, "Requester"), /*#__PURE__*/React.createElement("option", {
    value: "dept_head"
  }, "Dept Head"), /*#__PURE__*/React.createElement("option", {
    value: "maintenance_staff"
  }, "Maintenance Staff"), /*#__PURE__*/React.createElement("option", {
    value: "maintenance_admin"
  }, "Admin")), /*#__PURE__*/React.createElement(Full, null, /*#__PURE__*/React.createElement(Input, {
    label: "Designation",
    value: form.designation,
    onChange: set('designation'),
    placeholder: "e.g. Senior Engineer"
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "System Access"
  }, /*#__PURE__*/React.createElement(Full, null, /*#__PURE__*/React.createElement(Select, {
    label: "Access Level",
    value: form.access,
    onChange: set('access')
  }, /*#__PURE__*/React.createElement("option", null, "Read-only"), /*#__PURE__*/React.createElement("option", null, "Standard"), /*#__PURE__*/React.createElement("option", null, "Full Access")))));
}

/* ── Status dropdown ───────────────────────────────────────────────── */
function StatusCell({
  emp,
  onToggle
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isActive = emp.status === 'active';
  React.useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'inline-block'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      setMenuOpen(m => !m);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      border: 'none',
      cursor: 'pointer',
      fontSize: 11.5,
      fontWeight: 600,
      padding: '3px 8px 3px 9px',
      borderRadius: 'var(--radius-pill)',
      background: isActive ? 'var(--success-bg)' : 'var(--surface-sunken)',
      color: isActive ? 'var(--success-text)' : 'var(--text-muted)',
      fontFamily: 'var(--font-sans)'
    }
  }, isActive ? 'Active' : 'Inactive', /*#__PURE__*/React.createElement(Icon, {
    name: "chevron_down",
    size: 11,
    color: "currentColor"
  })), menuOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      top: 'calc(100% + 4px)',
      zIndex: 30,
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-floating)',
      overflow: 'hidden',
      minWidth: 140
    }
  }, ['active', 'inactive'].map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    onClick: e => {
      e.stopPropagation();
      onToggle(emp.id, s);
      setMenuOpen(false);
    },
    style: {
      width: '100%',
      padding: '9px 12px',
      border: 'none',
      background: s === emp.status ? 'var(--surface-sunken)' : 'transparent',
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      color: 'var(--text-default)',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    },
    onMouseEnter: e => {
      if (s !== emp.status) e.currentTarget.style.background = 'var(--surface-sunken)';
    },
    onMouseLeave: e => {
      if (s !== emp.status) e.currentTarget.style.background = 'transparent';
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      flexShrink: 0,
      background: s === 'active' ? 'var(--success-solid)' : 'var(--text-subtle)'
    }
  }), s === 'active' ? 'Active' : 'Inactive', s === emp.status && /*#__PURE__*/React.createElement(Icon, {
    name: "check_circle",
    size: 13,
    color: "var(--success-solid)",
    style: {
      marginLeft: 'auto'
    }
  })))));
}

/* ── Access request card ──────────────────────────────────────────── */
function AccessRequestCard({
  req,
  onDecide
}) {
  const FIELDS = [{
    key: 'full_name',
    label: 'Full Name'
  }, {
    key: 'emp_id',
    label: 'Employee ID'
  }, {
    key: 'department',
    label: 'Department'
  }, {
    key: 'role',
    label: 'Role',
    render: v => ROLE_LABELS_U[v] || v
  }, {
    key: 'email',
    label: 'Email'
  }, {
    key: 'designation',
    label: 'Designation'
  }];
  const [checked, setChecked] = React.useState({});
  const [expanded, setExpanded] = React.useState(false);
  const [rejecting, setRejecting] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');
  const allChecked = FIELDS.every(f => checked[f.key]);
  const toggle = k => setChecked(p => ({
    ...p,
    [k]: !p[k]
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--surface-card)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '13px 18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: 'var(--brand-black)',
      color: 'var(--brand-yellow)',
      display: 'grid',
      placeItems: 'center',
      fontSize: 12,
      fontWeight: 700,
      flexShrink: 0
    }
  }, req.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: 'var(--text-strong)',
      fontSize: 14
    }
  }, req.full_name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-subtle)'
    }
  }, req.emp_id, " \xB7 ", req.department, " \xB7 ", req.designation, " \xB7 Submitted ", req.submitted)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--warning-bg)',
      color: 'var(--warning-text)'
    }
  }, "Pending"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setExpanded(e => !e),
    style: {
      border: '1px solid var(--border-default)',
      background: 'var(--surface-sunken)',
      borderRadius: 'var(--radius-sm)',
      padding: '5px 10px',
      cursor: 'pointer',
      fontSize: 12.5,
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-sans)',
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, expanded ? 'Hide' : 'Verify', " ", /*#__PURE__*/React.createElement(Icon, {
    name: "chevron_down",
    size: 12,
    color: "currentColor",
    style: {
      transform: expanded ? 'rotate(180deg)' : 'none',
      transition: 'transform 0.2s'
    }
  })))), expanded && /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border-subtle)',
      padding: '16px 18px',
      background: 'var(--surface-sunken)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--text-subtle)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      marginBottom: 12
    }
  }, "Check each field to verify before approving:"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8,
      marginBottom: 14
    }
  }, FIELDS.map(f => /*#__PURE__*/React.createElement("label", {
    key: f.key,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '9px 12px',
      background: checked[f.key] ? 'var(--success-bg)' : 'var(--surface-card)',
      border: `1px solid ${checked[f.key] ? 'var(--success-border,var(--success-bg))' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      transition: 'all 0.15s'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: !!checked[f.key],
    onChange: () => toggle(f.key),
    style: {
      width: 15,
      height: 15,
      cursor: 'pointer',
      accentColor: 'var(--success-solid)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: 'var(--text-subtle)',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      fontWeight: 600
    }
  }, f.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-strong)',
      fontWeight: 500,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, f.render ? f.render(req[f.key]) : req[f.key]))))), !rejecting ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    disabled: !allChecked,
    onClick: () => onDecide(req.id, 'approved'),
    style: {
      flex: 1,
      height: 38,
      border: 'none',
      borderRadius: 'var(--radius-md)',
      background: allChecked ? 'var(--success-solid)' : 'var(--border-default)',
      color: allChecked ? '#fff' : 'var(--text-subtle)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13.5,
      fontWeight: 700,
      cursor: allChecked ? 'pointer' : 'not-allowed',
      transition: 'all 0.15s'
    }
  }, allChecked ? 'Approve Access' : `Verify all ${FIELDS.length} fields to approve`), /*#__PURE__*/React.createElement("button", {
    onClick: () => setRejecting(true),
    style: {
      padding: '0 16px',
      height: 38,
      border: '1px solid var(--danger-border,var(--danger-bg))',
      borderRadius: 'var(--radius-md)',
      background: 'var(--danger-bg)',
      color: 'var(--danger-text)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13.5,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "Reject")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("textarea", {
    value: rejectReason,
    onChange: e => setRejectReason(e.target.value),
    placeholder: "Reason for rejection (required)\u2026",
    style: {
      width: '100%',
      padding: '9px 12px',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13.5,
      color: 'var(--text-default)',
      resize: 'vertical',
      minHeight: 68,
      boxSizing: 'border-box',
      outline: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    disabled: !rejectReason.trim(),
    onClick: () => onDecide(req.id, 'rejected'),
    style: {
      flex: 1,
      height: 36,
      border: 'none',
      borderRadius: 'var(--radius-md)',
      background: rejectReason.trim() ? 'var(--danger-solid)' : 'var(--surface-sunken)',
      color: rejectReason.trim() ? '#fff' : 'var(--text-subtle)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13.5,
      fontWeight: 700,
      cursor: rejectReason.trim() ? 'pointer' : 'not-allowed'
    }
  }, "Confirm Rejection"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setRejecting(false);
      setRejectReason('');
    },
    style: {
      padding: '0 14px',
      height: 36,
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      background: 'transparent',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13.5,
      cursor: 'pointer'
    }
  }, "Cancel")))));
}

/* ── Main screen ───────────────────────────────────────────────────── */
function UsersScreen() {
  const {
    Button
  } = NS_USERS;
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [adding, setAdding] = React.useState(false);
  const [editingEmp, setEditingEmp] = React.useState(null);
  const [rows, setRows] = React.useState(EMPLOYEE_DATA);
  const [accessReqs, setAccessReqs] = React.useState(ACCESS_REQUESTS_MOCK);
  const updateStatus = (id, status) => setRows(rs => rs.map(r => r.id === id ? {
    ...r,
    status
  } : r));
  const filtered = rows.filter(e => {
    const q = search.toLowerCase();
    const matchQ = !q || e.full_name.toLowerCase().includes(q) || e.emp_id.toLowerCase().includes(q) || e.department.toLowerCase().includes(q);
    return matchQ && (roleFilter === 'all' || e.role === roleFilter);
  });
  const stats = [{
    label: 'Total',
    value: rows.length,
    icon: 'users',
    color: 'var(--brand-yellow)'
  }, {
    label: 'Active',
    value: rows.filter(e => e.status === 'active').length,
    icon: 'check_circle',
    color: 'var(--success-solid)'
  }, {
    label: 'Admins',
    value: rows.filter(e => e.role === 'maintenance_admin').length,
    icon: 'building',
    color: '#3b82f6'
  }, {
    label: 'Dept Heads',
    value: rows.filter(e => e.role === 'dept_head').length,
    icon: 'clipboard',
    color: 'var(--warning-solid)'
  }, {
    label: 'Requesters',
    value: rows.filter(e => e.role === 'requester').length,
    icon: 'arrow_right_circle',
    color: 'var(--role-requester-text)'
  }, {
    label: 'Maint. Staff',
    value: rows.filter(e => e.role === 'maintenance_staff').length,
    icon: 'wrench',
    color: 'var(--role-maintenance-text)'
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 21,
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, "Users"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 13.5,
      color: 'var(--text-muted)'
    }
  }, "Manage employee access and system roles")), /*#__PURE__*/React.createElement(Button, {
    onClick: () => setAdding(true)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user_plus",
    size: 15,
    style: {
      marginRight: 6
    }
  }), " Add Employee")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 14,
      marginBottom: 22
    }
  }, stats.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.label,
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-sunken)',
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: s.icon,
    size: 18,
    color: s.color
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--text-strong)',
      lineHeight: 1
    }
  }, s.value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)',
      marginTop: 3
    }
  }, s.label))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 14,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: 1,
      maxWidth: 320
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 15,
    color: "var(--text-subtle)",
    style: {
      position: 'absolute',
      left: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: search,
    onChange: e => setSearch(e.target.value),
    placeholder: "Search name, ID or department\u2026",
    style: {
      width: '100%',
      paddingLeft: 34,
      paddingRight: 12,
      height: 36,
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13.5,
      color: 'var(--text-default)',
      background: 'var(--surface-card)',
      outline: 'none',
      boxSizing: 'border-box'
    }
  })), /*#__PURE__*/React.createElement("select", {
    value: roleFilter,
    onChange: e => setRoleFilter(e.target.value),
    style: {
      height: 36,
      padding: '0 12px',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13.5,
      color: 'var(--text-default)',
      background: 'var(--surface-card)',
      cursor: 'pointer',
      outline: 'none'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "All Roles"), /*#__PURE__*/React.createElement("option", {
    value: "requester"
  }, "Requester"), /*#__PURE__*/React.createElement("option", {
    value: "dept_head"
  }, "Dept Head"), /*#__PURE__*/React.createElement("option", {
    value: "maintenance_staff"
  }, "Maint. Staff"), /*#__PURE__*/React.createElement("option", {
    value: "maintenance_admin"
  }, "Admin"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--surface-sunken)',
      borderBottom: '1px solid var(--border-default)'
    }
  }, ['Employee', 'EMP ID', 'Department', 'Role', 'Status', ''].map((h, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    style: {
      padding: '10px 14px',
      textAlign: 'left',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      whiteSpace: 'nowrap'
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, filtered.map((emp, i) => {
    const tone = ROLE_TONES_U[emp.role] || ROLE_TONES_U.requester;
    const initials = emp.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    return /*#__PURE__*/React.createElement("tr", {
      key: emp.id,
      style: {
        borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
        transition: 'background 0.1s'
      },
      onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-sunken)',
      onMouseLeave: e => e.currentTarget.style.background = 'transparent'
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '11px 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'var(--brand-black)',
        color: 'var(--brand-yellow)',
        display: 'grid',
        placeItems: 'center',
        fontSize: 11.5,
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: '0.04em'
      }
    }, initials), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        color: 'var(--text-strong)'
      }
    }, emp.full_name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: 'var(--text-subtle)'
      }
    }, emp.email)))), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '11px 14px',
        color: 'var(--text-muted)',
        fontSize: 12.5,
        fontVariantNumeric: 'tabular-nums'
      }
    }, emp.emp_id), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '11px 14px',
        color: 'var(--text-default)'
      }
    }, emp.department), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '11px 14px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11.5,
        fontWeight: 600,
        padding: '3px 9px',
        borderRadius: 'var(--radius-pill)',
        background: tone.bg,
        color: tone.fg
      }
    }, ROLE_LABELS_U[emp.role])), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '11px 14px'
      }
    }, /*#__PURE__*/React.createElement(StatusCell, {
      emp: emp,
      onToggle: updateStatus
    })), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '11px 14px',
        textAlign: 'right'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setEditingEmp(emp),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        border: '1px solid var(--border-default)',
        background: 'var(--surface-card)',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: '5px 11px',
        borderRadius: 'var(--radius-md)',
        fontSize: 12.5,
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap'
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = 'var(--brand-black)';
        e.currentTarget.style.color = '#fff';
        e.currentTarget.style.borderColor = 'var(--brand-black)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = 'var(--surface-card)';
        e.currentTarget.style.color = 'var(--text-muted)';
        e.currentTarget.style.borderColor = 'var(--border-default)';
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "eye",
      size: 13
    }), " Edit")));
  }), filtered.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 6,
    style: {
      padding: '44px 0',
      textAlign: 'center',
      color: 'var(--text-subtle)',
      fontSize: 13.5
    }
  }, "No employees match your filters."))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 17,
      fontWeight: 700,
      color: 'var(--text-strong)'
    }
  }, "Access Requests"), accessReqs.length > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--warning-bg)',
      color: 'var(--warning-text)'
    }
  }, accessReqs.length, " pending")), accessReqs.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '32px 0',
      textAlign: 'center',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      color: 'var(--text-subtle)',
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check_circle",
    size: 24,
    color: "var(--success-solid)",
    style: {
      display: 'block',
      margin: '0 auto 8px'
    }
  }), "No pending access requests") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, accessReqs.map(r => /*#__PURE__*/React.createElement(AccessRequestCard, {
    key: r.id,
    req: r,
    onDecide: (id, decision) => {
      setAccessReqs(prev => prev.filter(x => x.id !== id));
      if (decision === 'approved') {
        const match = accessReqs.find(x => x.id === id);
        if (match) setRows(prev => [...prev, {
          id: Date.now(),
          emp_id: match.emp_id,
          full_name: match.full_name,
          department: match.department,
          role: match.role,
          email: match.email,
          joined: '14 Jun 2026',
          status: 'active'
        }]);
      }
    }
  })))), adding && /*#__PURE__*/React.createElement(EmployeeForm, {
    title: "Add Employee",
    subtitle: "Create a new system user",
    submitLabel: "Add Employee",
    onClose: () => setAdding(false),
    onSubmit: form => {
      setRows(rs => [...rs, {
        ...form,
        id: Date.now(),
        status: 'active'
      }]);
      setAdding(false);
    }
  }), editingEmp && /*#__PURE__*/React.createElement(EmployeeForm, {
    title: "Edit Employee",
    subtitle: `Editing ${editingEmp.full_name}`,
    submitLabel: "Save Changes",
    initial: editingEmp,
    onClose: () => setEditingEmp(null),
    onSubmit: form => {
      setRows(rs => rs.map(r => r.id === editingEmp.id ? {
        ...r,
        ...form
      } : r));
      setEditingEmp(null);
    }
  }));
}
Object.assign(window, {
  UsersScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mtrs/UsersScreen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Endorsement = __ds_scope.Endorsement;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.MetricCard = __ds_scope.MetricCard;

__ds_ns.PageHeader = __ds_scope.PageHeader;

__ds_ns.Spinner = __ds_scope.Spinner;

__ds_ns.PageLoader = __ds_scope.PageLoader;

__ds_ns.STATUS_MAP = __ds_scope.STATUS_MAP;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Label = __ds_scope.Label;

__ds_ns.Help = __ds_scope.Help;

__ds_ns.RadioGroup = __ds_scope.RadioGroup;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Toggle = __ds_scope.Toggle;

__ds_ns.ConfirmDialog = __ds_scope.ConfirmDialog;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.SlideOver = __ds_scope.SlideOver;

})();
