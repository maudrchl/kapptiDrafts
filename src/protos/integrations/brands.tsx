import type { ReactNode } from 'react'
import claudeLogo from './logos/claude.webp'
import whatsappLogo from './logos/whatsapp.webp'
import browserstackLogo from './logos/browserstack.png'
import copilotGithubLogo from './logos/copilot-github.png'
import copilotMsLogo from './logos/copilot-ms.jpeg'
import xrayLogo from './logos/xray.png'

const imgStyle = {
  width: 28,
  height: 28,
  objectFit: 'contain' as const,
  display: 'block',
}

/**
 * Logos de marque des intégrations.
 * Slack / Teams / Jira / Linear : SVG inline (couleurs officielles).
 * WhatsApp / BrowserStack / Claude / Copilot : assets officiels fournis.
 */
export const brands: Record<string, ReactNode> = {
  jira: (
    <svg width="26" height="26" viewBox="0 0 24 24">
      <defs>
        <linearGradient
          id="jira-g"
          x1="12"
          y1="2"
          x2="6"
          y2="14"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#0052CC" />
          <stop offset=".9" stopColor="#2684FF" />
        </linearGradient>
      </defs>
      <path
        d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.004-1.005z"
        fill="#2684FF"
      />
      <path
        d="M17.294 5.757H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.218 5.214V6.758a1.001 1.001 0 0 0-1.004-1z"
        fill="url(#jira-g)"
      />
      <path
        d="M23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0z"
        fill="url(#jira-g)"
      />
    </svg>
  ),
  slack: (
    <svg width="24" height="24" viewBox="0 0 32 32">
      <path d="M9.5 19a2.5 2.5 0 1 1-2.5-2.5h2.5V19z" fill="#e01e5a" />
      <path d="M11 19a2.5 2.5 0 0 1 5 0v6.5a2.5 2.5 0 0 1-5 0V19z" fill="#e01e5a" />
      <path d="M13 9.5A2.5 2.5 0 1 1 15.5 7v2.5H13z" fill="#36c5f0" />
      <path d="M13 11a2.5 2.5 0 0 1 0 5H6.5a2.5 2.5 0 0 1 0-5H13z" fill="#36c5f0" />
      <path d="M22.5 13a2.5 2.5 0 1 1 2.5 2.5h-2.5V13z" fill="#2eb67d" />
      <path d="M21 13a2.5 2.5 0 0 1-5 0V6.5a2.5 2.5 0 0 1 5 0V13z" fill="#2eb67d" />
      <path d="M19 22.5a2.5 2.5 0 1 1-2.5 2.5v-2.5H19z" fill="#ecb22e" />
      <path d="M19 21a2.5 2.5 0 0 1 0-5h6.5a2.5 2.5 0 0 1 0 5H19z" fill="#ecb22e" />
    </svg>
  ),
  whatsapp: <img src={whatsappLogo} alt="WhatsApp" style={imgStyle} />,
  teams: (
    <svg width="25" height="25" viewBox="0 0 32 32">
      <path
        d="M20.5 12h8.2c.7 0 1.3.6 1.3 1.3v7.2a4.9 4.9 0 0 1-9.8.4V12z"
        fill="#5059c9"
      />
      <circle cx="25.5" cy="7.5" r="3.2" fill="#5059c9" />
      <circle cx="15.5" cy="6.8" r="3.9" fill="#7b83eb" />
      <path
        d="M9 11h13a1.2 1.2 0 0 1 1.2 1.2v9.6A6.2 6.2 0 0 1 17 28 6.2 6.2 0 0 1 10.8 22V11H9z"
        fill="#7b83eb"
      />
      <rect x="2" y="9" width="14" height="14" rx="2.2" fill="#4b53bc" />
      <path d="M6 12.6h6v1.8H9.9V20H8.1v-5.6H6v-1.8z" fill="#fff" />
    </svg>
  ),
  browserstack: <img src={browserstackLogo} alt="BrowserStack" style={imgStyle} />,
  linear: (
    <svg width="25" height="25" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="24" fill="#5E6AD2" />
      <g fill="#fff" transform="translate(18 18) scale(0.64)">
        <path d="M1.22541 61.5228c-.2225-.9485.90748-1.5459 1.59638-.857L39.3342 97.1782c.6889.6889.0915 1.8189-.857 1.5964C20.0515 94.4522 5.54779 79.9485 1.22541 61.5228Z" />
        <path d="M.00189135 46.8891c-.01764375.2833.08887215.5599.28957165.7606L52.3503 99.7085c.2007.2007.4773.3072.7606.2896 2.3692-.1476 4.6938-.46 6.9624-.9259.7645-.157 1.0301-1.0963.4782-1.6481L2.57595 39.4485c-.55186-.5519-1.49117-.2863-1.648174.4782-.465915 2.2686-.77832 4.5932-.92588465 6.9624Z" />
        <path d="M4.21093 27.0987c-.16649.3738-.08169.8106.20765 1.1l67.36352 67.3635c.2894.2894.7262.3742 1.1.2077 1.7861-.7956 3.5171-1.6927 5.1855-2.6849.5616-.334.6515-1.1042.1903-1.5654L8.46695 21.7228c-.46125-.4612-1.23148-.3713-1.56554.1903-.99216 1.6684-1.88932 3.3994-2.68498 5.1856Z" />
        <path d="M12.6334 15.2439c-.4001-.4001-.4051-1.0512-.0153-1.4615C21.7502 4.16291 34.0345.00189135 47.1719.00189135 73.4203.00189135 95.999 21.5802 95.999 47.8286c0 13.1374-4.1611 25.4217-13.7805 34.5538-.4103.3898-1.0614.3848-1.4615-.0153L12.6334 15.2439Z" />
      </g>
    </svg>
  ),
  github: (
    <svg width="26" height="26" viewBox="0 0 32 32">
      <path
        d="M16 4C9.4 4 4 9.4 4 16c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0C20.6 8.6 21.6 9 21.6 9c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.3v3.4c0 .3.2.7.8.6C24.6 25.8 28 21.3 28 16c0-6.6-5.4-12-12-12z"
        fill="#1c2622"
      />
    </svg>
  ),
  gitlab: (
    <svg width="26" height="26" viewBox="0 0 24 24">
      <path
        fill="#e24329"
        d="M23.6004 9.5927l-.0337-.0862L20.3.9814a.851.851 0 00-.3362-.405.8748.8748 0 00-.9997.0539.8748.8748 0 00-.29.4399l-2.2055 6.748H7.5375l-2.2057-6.748a.8573.8573 0 00-.29-.4412.8748.8748 0 00-.9997-.0537.8585.8585 0 00-.3362.4049L1.4332 9.5015l-.0325.0862a6.0657 6.0657 0 002.0119 7.0105l.0113.0087.03.0213 4.976 3.7264 2.462 1.8633 1.4995 1.1321a1.0085 1.0085 0 001.2197 0l1.4995-1.1321 2.462-1.8633 5.006-3.7489.0125-.01a6.0682 6.0682 0 002.0094-7.003z"
      />
    </svg>
  ),
  jenkins: (
    // placeholder Jenkins — à remplacer par le vrai logo (butler)
    <svg width="26" height="26" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="7" fill="#D24939" />
      <text
        x="16"
        y="17"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Inter, sans-serif"
        fontSize="16"
        fontWeight="700"
        fill="#fff"
      >
        J
      </text>
    </svg>
  ),
  azuredevops: (
    // placeholder Azure DevOps — à remplacer par le vrai logo (boucle infinie)
    <svg width="26" height="26" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="7" fill="#0078D7" />
      <text
        x="16"
        y="17"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Inter, sans-serif"
        fontSize="15"
        fontWeight="700"
        fill="#fff"
      >
        Az
      </text>
    </svg>
  ),
  xray: <img src={xrayLogo} alt="Xray" style={imgStyle} />,
  claude: <img src={claudeLogo} alt="Claude" style={imgStyle} />,
  copilot: <img src={copilotGithubLogo} alt="GitHub Copilot" style={imgStyle} />,
  mscopilot: <img src={copilotMsLogo} alt="Microsoft Copilot" style={imgStyle} />,
}
