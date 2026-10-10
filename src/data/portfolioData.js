// Portfolio data definitions
import pfpPortrait from '../assets/PFP.svg';
import letsdefendLogo from '../assets/logos/letsdefend.png';
import tryhackmeLogo from '../assets/logos/tryhackme.svg';
import packtLogo from '../assets/logos/packt.png';
import ciscoLogo from '../assets/logos/cisco.svg';
import googleLogo from '../assets/logos/google.svg';
import metaLogo from '../assets/logos/meta.svg';

export const PHOTO = pfpPortrait;

export const LOGO = {
  letsdefend: letsdefendLogo,
  tryhackme: tryhackmeLogo,
  packt: packtLogo,
  cisco: ciscoLogo,
  google: googleLogo,
  meta: metaLogo
};

export const SECTIONS = [
  { id: "home", name: "HOME", tone: "lt" },
  { id: "works", name: "WORKS", tone: "dk" },
  { id: "certificate", name: "CERTIFICATE", tone: "dk" },
  { id: "stack", name: "STACK", tone: "dk" },
  { id: "connect", name: "CONNECT", tone: "lt" }
];

export const HERO_WORDS = ["Cybersecurity", "iOS Engineer"];
export const HERO_COLS = 13;
export const HERO_SET = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const WORKS_TABS = ["iOS App", "CyberSec Lab"];

export const APPS = [
["","App Name 01","i build this application to help people like me that i cannot present in public using the pure english speaking.",["Swift","SwiftUI","Realm","Supabase"],"#",[]],
["","App Name 02","One short story about why you built this app and what it does.",["Swift","SwiftUI"],"#",[]],
["","App Name 03","One short story about why you built this app and what it does.",["Swift","CoreData"],"#",[]],
["","App Name 04","One short story about why you built this app and what it does.",["SwiftUI","Supabase"],"#",[]],
["","App Name 05","One short story about why you built this app and what it does.",["Swift","MapKit"],"#",[]]];

export const LAB = {title:"Security Analyst Level 1",desc:"evaluate and train you to perform the day-to-day work of an entry-level Security Operations Center (SOC) analyst",badge:"", /* badge image URL / data URI; "" = built-in SAL1 shield drawn in SVG */ media:"", /* screenshot (png/jpg) or screen-record (mp4/webm) URL; "" = grey placeholder */ links:[["Github","#"],["Verify","#"]]};

export const STACK = [ // [name, width, font-size, weight, background, text colour, glow colour]
["PROGRAMMING LANGUAGES\n& FRAMEWORK",[["Swift",106,17,700,"#f05138","#fff","#f05138"],["Bash Scripting",162,14,400,"#222a31","#4eaa25","#4eaa25"],["PowerShell",127,15.5,600,"#2671be","#fff","#2671be"],["Swift UI",127,15.5,600,"#00c8e0","#0b2a4a","#00c8e0"]]],
["DATA & API",[["JSON",106,18.5,700,"#078a07","#fff","#10b010"],["REST",87,17,700,"#5a5a5a","#fff","#9a9a9a"]]],
["SECURITY\nTOOLS",[["Linux",96,14,500,"#000","#fcc624","#fcc624"],["Nmap",87,13,500,"#7b9dbf","#1f3a57","#7b9dbf"],["Wireshark",118,15.5,600,"#1679a7","#fff","#1a9ad6"]]],
["DATABASE",[["Supabase",133,15.5,600,"#1d1e20","#3ecf8e","#3ecf8e"],["Firebase",134,18.5,700,"linear-gradient(180deg,#ffca28,#f57c00)","#fff","#ff9800"],["Realm",118,17,700,"linear-gradient(180deg,#f8a1a8,#6a6ad8)","#fff","#c57bd0"],["SQLite",127,16,600,"#003b57","#7cc4e8","#1b8fd0"],["MySQL",121,17,600,"#00758f","#f29111","#00a8cc"]]],
["CI/CD TOOLS",[["GitHub Actions",180,14.5,500,"#0d1117","#2f81f7","#2f81f7"],["TestFlight",146,17,600,"#000","#0d96f6","#0d96f6"]],1],
["DEVELOPER TOOLS",[["Xcode",126,18.5,700,"#147efb","#fff","#147efb"],["GIT",82,14.5,600,"#f1502f","#7a1d0b","#f1502f"],["GitHub",104,15.5,600,"#24292f","#fff","#6e7681"],["Figma",98,15,600,"#000","grad","#a259ff"],["VS Code",110,17,700,"#0c7bd6","#fff","#0c7bd6"],["Teams",106,17,600,"#5b5fc7","#fff","#7b7fe8"],["Icon Composer",163,15,500,"#000","ic","#1d8dff"],["Claude",118,18.5,700,"#d97757","#fff","#d97757"]]]
];

export const CERT = [ // [logo, title, issuer, verify url ("#" = no link yet)] -- NEWEST FIRST: add every new certificate at the TOP of this list
["letsdefend","SOC Fundamentals","LetsDefend","#"],
["letsdefend","Phishing Email Analysis","LetsDefend","#"],
["tryhackme","Security Analyst Level 1","TryHackMe","#"],
["packt","Foundations of Bash Scripting","PackT","#"],
["cisco","Introduction to Cybersecurity","Cisco","#"],
["cisco","Network Support and Security","Cisco","#"],
["cisco","Networking Basics","Cisco","#"],
["google","Foundations of Cybersecurity","Google","#"],
["meta","Principles of UI UX Design","Meta","https://www.coursera.org/account/accomplishments/verify/OMYA27AKMPOK"],
["meta","Programming Fundamentals in Swift","Meta","https://www.coursera.org/account/accomplishments/verify/X5CT8TUIB46V"],
["google","Foundations of Project Management","Google","https://www.coursera.org/account/accomplishments/verify/OMJ6H4E1P39Y"],
["meta","Version Control","Meta","https://www.coursera.org/account/accomplishments/verify/TOJ0B9ZLOG8P"]];

export const SHOW_CERTS = 8;

export const GH_USER = "Dainiell";
export const GH_COL = ["#3a3a3f", "#7d7d83", "#adadb3", "#dcdce0", "#ffffff"];
export const GH_R = [0.11, 0.2, 0.28, 0.36, 0.44];

export const GH_SNAP = {"start":"2025-10-05","end":"2026-10-04","c":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,1,0,0,0,1,9,0,0,0,11,1,1,2,1,2,1,8,1,1,1,6,2,2,12,2,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,32,2,0,2,2,2,7,1,0,0,3,9,0,0,0,1,2,0,6,2,3,0,3,1,2,2,3,2,1,2,2,1,1,0,1,3,3,1,9,13,14,6,1,3,14,6,5,1,2,1,5,1,6,2,1,2,2,1,3,3,5,3,2,4,1,6,2,2,3,1,6,60,2,14,2,6,8,7,1,1,1,4,5,2,1,1,12,2,1,1,3,1,5,2,31,23,2,9,6,1,1,3,1,1,2,2,1,0,2,2,3,1,0,2,1,0,1],"l":"00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000100000000000000100001000000000000000000000000000000000000100000100012000211111121112113100111111000000001000000000001410111210012000110211011111111111011112332113211111121111111111112111124131222111111113111111144122111111110111101101"};

export const CN_TEXT = ["We’ve exhausted", "the pleasantries."];
export const CN_SUB = "It’s time we synchronized our efforts.";
export const SCHEDULE_URL = "https://koalendar.com/e/YOUR_USERNAME";
export const SCHED_OK = !/YOUR_USERNAME/.test(SCHEDULE_URL);
export const SCHED_MAIL =
  'mailto:gonzagaralphD@gmail.com?subject=' +
  encodeURIComponent('Schedule a call') +
  '&body=' +
  encodeURIComponent(
    'Hi Ralph,\n\nI would like to schedule a call.\n\nPreferred date and time:\nPlatform (Google Meet / Zoom / MS Teams):\n'
  );

export const CN_URL = {
  resume: "https://YOUR_RESUME_LINK",
  instagram: "https://www.instagram.com/gonzagaralphh/",
  github: "https://github.com/" + GH_USER,
  email: "mailto:gonzagaralphd@gmail.com",
  linkedin: "https://www.linkedin.com/in/ralph-dainiell"
};
