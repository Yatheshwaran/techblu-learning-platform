import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen, Code2, Trophy, LayoutDashboard, Moon, Sun, Menu, X,
  Play, ArrowRight, CheckCircle2, BarChart3, Terminal, Search, Sparkles
} from "lucide-react";
import "./styles.css";

const languages = [
  { id:"python", name:"Python", icon:"🐍", color:"blue", description:"Beginner-friendly language for web, automation, data and AI." },
  { id:"javascript", name:"JavaScript", icon:"JS", color:"yellow", description:"Build interactive websites and modern web applications." },
  { id:"java", name:"Java", icon:"☕", color:"orange", description:"Learn object-oriented programming and application development." },
  { id:"cpp", name:"C++", icon:"C++", color:"purple", description:"Master performance-focused programming and problem solving." },
  { id:"c", name:"C", icon:"C", color:"cyan", description:"Build strong programming fundamentals from the ground up." }
];

const questions = {
  python: [
    ["Easy","Print Hello World","Write a program that prints Hello, World!","print(\"Hello, World!\")"],
    ["Easy","Add Two Numbers","Read two numbers and print their sum.","a,b=map(int,input().split()); print(a+b)"],
    ["Easy","Even or Odd","Check whether a number is even or odd.","n=int(input()); print(\"Even\" if n%2==0 else \"Odd\")"],
    ["Medium","Reverse a String","Read a string and print it reversed.","s=input(); print(s[::-1])"],
    ["Medium","Find Maximum","Read three integers and print the largest.","a,b,c=map(int,input().split()); print(max(a,b,c))"],
    ["Medium","Count Vowels","Count vowels in a given string.","s=input().lower(); print(sum(ch in 'aeiou' for ch in s))"],
    ["Hard","Second Largest","Find the second largest distinct number in a list.","a=list(map(int,input().split())); print(sorted(set(a))[-2])"],
    ["Hard","Palindrome Number","Check whether an integer is a palindrome.","n=input(); print(\"Yes\" if n==n[::-1] else \"No\")"],
    ["Hard","Frequency Counter","Print the frequency of each word in a sentence.","from collections import Counter; print(Counter(input().split()))"],
    ["Hard","Prime Range","Print all prime numbers from 1 to N.","n=int(input()); print([x for x in range(2,n+1) if all(x%d for d in range(2,int(x**0.5)+1))])"]
  ],
  javascript: [
    ["Easy","Hello World","Print Hello, World!","console.log('Hello, World!');"],
    ["Easy","Add Two Numbers","Read two numbers and print their sum.","const [a,b]=prompt().split(' ').map(Number); console.log(a+b);"],
    ["Easy","Even or Odd","Check whether a number is even or odd.","const n=Number(prompt()); console.log(n%2===0?'Even':'Odd');"],
    ["Medium","Reverse String","Reverse a string.","const s=prompt(); console.log([...s].reverse().join(''));"],
    ["Medium","Find Maximum","Find the largest of three numbers.","const a=prompt().split(' ').map(Number); console.log(Math.max(...a));"],
    ["Medium","Count Vowels","Count vowels in a string.","const s=prompt().toLowerCase(); console.log([...s].filter(x=>'aeiou'.includes(x)).length);"],
    ["Hard","Second Largest","Find the second largest distinct value.","const a=[...new Set(prompt().split(' ').map(Number))].sort((x,y)=>x-y); console.log(a.at(-2));"],
    ["Hard","Palindrome","Check if a string is a palindrome.","const s=prompt(); console.log(s===s.split('').reverse().join('')?'Yes':'No');"],
    ["Hard","Word Frequency","Count words in a sentence.","const m={}; prompt().split(' ').forEach(w=>m[w]=(m[w]||0)+1); console.log(m);"],
    ["Hard","Prime Range","Print primes up to N.","const n=Number(prompt()); for(let x=2;x<=n;x++){let p=true;for(let d=2;d*d<=x;d++)if(x%d===0)p=false;if(p)console.log(x)}"]
  ],
  java: [
    ["Easy","Hello World","Print Hello, World!","System.out.println(\"Hello, World!\");"],
    ["Easy","Add Two Numbers","Read two integers and print their sum.","int a=10,b=20; System.out.println(a+b);"],
    ["Easy","Even or Odd","Check whether an integer is even or odd.","int n=7; System.out.println(n%2==0?\"Even\":\"Odd\");"],
    ["Medium","Reverse String","Reverse a string.","String s=\"TechBlu\"; System.out.println(new StringBuilder(s).reverse());"],
    ["Medium","Find Maximum","Find the maximum of three integers.","System.out.println(Math.max(10,Math.max(20,15)));"],
    ["Medium","Count Vowels","Count vowels in a string.","String s=\"programming\"; int c=0; for(char x:s.toCharArray()) if(\"aeiou\".indexOf(x)>=0)c++; System.out.println(c);"],
    ["Hard","Second Largest","Find the second largest distinct value.","int[] a={4,8,2,8,6}; java.util.Arrays.sort(a); System.out.println(a[a.length-2]);"],
    ["Hard","Palindrome","Check whether a string is a palindrome.","String s=\"level\"; System.out.println(s.equals(new StringBuilder(s).reverse().toString())?\"Yes\":\"No\");"],
    ["Hard","Word Frequency","Build a frequency map for words.","java.util.Map<String,Integer> m=new java.util.HashMap<>();"],
    ["Hard","Prime Check","Check whether a number is prime.","int n=29; boolean p=n>1; for(int d=2;d*d<=n;d++)if(n%d==0)p=false; System.out.println(p);"]
  ],
  cpp: [
    ["Easy","Hello World","Print Hello, World!","#include <iostream>\\nint main(){std::cout<<\"Hello, World!\";}"],
    ["Easy","Add Two Numbers","Print the sum of two integers.","int a=10,b=20; std::cout<<a+b;"],
    ["Easy","Even or Odd","Check whether a number is even or odd.","int n=8; std::cout<<(n%2==0?\"Even\":\"Odd\");"],
    ["Medium","Reverse String","Reverse a string.","std::string s=\"TechBlu\"; std::reverse(s.begin(),s.end()); std::cout<<s;"],
    ["Medium","Find Maximum","Find the largest of three values.","std::cout<<std::max({10,20,15});"],
    ["Medium","Count Vowels","Count vowels in a string.","std::string s=\"programming\"; int c=0; for(char x:s) if(std::string(\"aeiou\").find(x)!=std::string::npos)c++; std::cout<<c;"],
    ["Hard","Second Largest","Find the second largest distinct value.","std::vector<int>a={4,8,2,8,6}; std::sort(a.begin(),a.end()); std::cout<<a[a.size()-2];"],
    ["Hard","Palindrome","Check if a string is a palindrome.","std::string s=\"level\"; std::cout<<(s==std::string(s.rbegin(),s.rend())?\"Yes\":\"No\");"],
    ["Hard","Word Frequency","Count the occurrence of each word.","std::map<std::string,int> m;"],
    ["Hard","Prime Range","Print primes up to N.","for(int n=2;n<=50;n++){bool p=1;for(int d=2;d*d<=n;d++)if(n%d==0)p=0;if(p)std::cout<<n<<' ';}"]
  ],
  c: [
    ["Easy","Hello World","Print Hello, World!","#include <stdio.h>\\nint main(){printf(\"Hello, World!\");}"],
    ["Easy","Add Two Numbers","Print the sum of two integers.","int a=10,b=20; printf(\"%d\",a+b);"],
    ["Easy","Even or Odd","Check whether a number is even or odd.","int n=8; printf(\"%s\",n%2==0?\"Even\":\"Odd\");"],
    ["Medium","Reverse String","Reverse a string.","char s[]=\"TechBlu\";"],
    ["Medium","Find Maximum","Find the maximum of three numbers.","int a=10,b=20,c=15; printf(\"%d\",a>b?(a>c?a:c):(b>c?b:c));"],
    ["Medium","Count Vowels","Count vowels in a string.","char s[]=\"programming\"; int c=0;"],
    ["Hard","Second Largest","Find the second largest distinct value.","int a[]={4,8,2,8,6};"],
    ["Hard","Palindrome","Check whether a string is a palindrome.","char s[]=\"level\";"],
    ["Hard","Word Frequency","Count words in a sentence.","char text[]=\"learn build grow\";"],
    ["Hard","Prime Range","Print prime numbers up to N.","for(int n=2;n<=50;n++){int p=1;}"]
  ]
};

function App(){
  const [dark,setDark]=useState(()=>localStorage.getItem("techblu-theme")==="dark");
  const [page,setPage]=useState("home");
  const [menu,setMenu]=useState(false);
  const [language,setLanguage]=useState("python");
  const [query,setQuery]=useState("");
  const [progress,setProgress]=useState(()=>JSON.parse(localStorage.getItem("techblu-progress")||"{}"));
  const [selected,setSelected]=useState(null);
  const [challenge,setChallenge]=useState(null);
  const [username,setUsername]=useState(()=>localStorage.getItem("techblu-username")||"");

  useEffect(()=>{
    document.documentElement.classList.toggle("dark",dark);
    localStorage.setItem("techblu-theme",dark?"dark":"light");
  },[dark]);

  const go=(p)=>{setPage(p);setMenu(false);window.scrollTo({top:0,behavior:"smooth"})};
  const solved=Object.values(progress).filter(Boolean).length;
  const total=50;
  const level=solved<5?"Beginner":solved<15?"Learner":solved<30?"Intermediate":"Advanced";

  const toggleSolved=(id)=>{
    const next={...progress,[id]:!progress[id]};
    setProgress(next);
    localStorage.setItem("techblu-progress",JSON.stringify(next));
  };

  return <div className="app">
    <header className="header">
      <div className="container nav">
        <button className="brand" onClick={()=>go("home")}><span className="brand-mark">T</span>Tech<span>Blu</span></button>
        <nav className={menu?"mobile-open":""}>
          <button className={page==="home"?"active":""} onClick={()=>go("home")}>Home</button>
          <button className={page==="learn"?"active":""} onClick={()=>go("learn")}>Tutorials</button>
          <button className={page==="practice"?"active":""} onClick={()=>go("practice")}>Practice</button>
          <button className={page==="compiler"?"active":""} onClick={()=>go("compiler")}>Compiler</button>
          <button className={page==="dashboard"?"active":""} onClick={()=>go("dashboard")}>Dashboard</button>
        </nav>
        <div className="nav-actions">
          <button className="icon-btn" aria-label="theme" onClick={()=>setDark(!dark)}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button>
          <button className="menu-btn" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button>
        </div>
      </div>
    </header>

    <main>
      {page==="home" && <Home go={go} languages={languages} solved={solved} level={level}/>}
      {page==="learn" && <Learn languages={languages} query={query} setQuery={setQuery} setLanguage={setLanguage} go={go}/>}
      {page==="practice" && <Practice languages={languages} language={language} setLanguage={setLanguage} query={query} setQuery={setQuery} questions={questions} progress={progress} toggleSolved={toggleSolved} selected={selected} setSelected={setSelected} go={go} setChallenge={setChallenge}/>}
      {page==="compiler" && <Compiler language={language} setLanguage={setLanguage} challenge={challenge} setChallenge={setChallenge} progress={progress} toggleSolved={toggleSolved}/>}
      {page==="dashboard" && <Dashboard solved={solved} total={total} level={level} progress={progress} languages={languages} username={username} setUsername={setUsername}/>}
    </main>

    <footer className="footer">
      <div className="container footer-grid">
        <div><div className="brand footer-brand"><span className="brand-mark">T</span>Tech<span>Blu</span></div><p>Learn something. Build something.</p></div>
        <div><h4>Learn</h4><button onClick={()=>go("learn")}>Tutorials</button><button onClick={()=>go("practice")}>Practice</button><button onClick={()=>go("compiler")}>Compiler</button></div>
        <div><h4>Platform</h4><button onClick={()=>go("dashboard")}>Dashboard</button><button>About TechBlu</button><button>Contact</button></div>
      </div>
      <div className="copyright">© 2026 TechBlu. Built for learners.</div>
    </footer>
  </div>
}

function Home({go,languages,solved,level}){
 return <div>
  <section className="hero"><div className="container hero-grid">
    <div>
      <div className="eyebrow"><Sparkles size={15}/> A focused place to learn programming</div>
      <h1>Learn. Build.<br/><span>Grow with TechBlu.</span></h1>
      <p className="hero-text">Learn programming concepts, practice real coding questions, run programs, and track your progress — all in one learning platform.</p>
      <div className="hero-buttons"><button className="btn primary" onClick={()=>go("learn")}>Start Learning <ArrowRight size={18}/></button><button className="btn secondary" onClick={()=>go("practice")}>Practice Questions</button></div>
      <div className="mini-stats"><div><b>{languages.length}</b><span>Languages</span></div><div><b>50+</b><span>Questions</span></div><div><b>{solved}</b><span>Solved</span></div></div>
    </div>
    <div className="hero-card"><div className="code-top"><span></span><span></span><span></span><small>python.py</small></div><pre><code>{`def learn():
    skills = []
    while True:
        skills.append("practice")
        if ready(skills):
            break
    return "Keep building!"`}</code></pre><div className="code-result"><CheckCircle2 size={17}/> Ready to learn • Level: {level}</div></div>
  </div></section>

  <section className="section"><div className="container"><div className="section-heading"><div><span className="section-label">LEARNING PATH</span><h2>Everything you need to improve</h2></div><button className="text-btn" onClick={()=>go("learn")}>Explore all <ArrowRight size={16}/></button></div>
  <div className="feature-grid">
    <Feature icon={<BookOpen/>} title="Tutorials" text="Step-by-step programming lessons designed from beginner to advanced." onClick={()=>go("learn")}/>
    <Feature icon={<Terminal/>} title="Online Compiler" text="Write and run programs directly in your browser as you learn." onClick={()=>go("compiler")}/>
    <Feature icon={<Trophy/>} title="Practice" text="Solve easy, medium, and hard questions to build real problem-solving skills." onClick={()=>go("practice")}/>
    <Feature icon={<BarChart3/>} title="Progress Dashboard" text="Track solved questions, learning level, and your overall journey." onClick={()=>go("dashboard")}/>
  </div></div></section>

  <section className="section muted"><div className="container"><div className="section-heading"><div><span className="section-label">PROGRAMMING</span><h2>Choose your language</h2></div></div>
  <div className="language-grid">{languages.map(l=><div className="language-card" key={l.id}><div className={"lang-icon "+l.color}>{l.icon}</div><h3>{l.name}</h3><p>{l.description}</p><button className="card-link" onClick={()=>{go("practice")}}>Learn & Practice <ArrowRight size={15}/></button></div>)}</div></div></section>

  <section className="cta"><div className="container cta-inner"><div><span className="section-label">YOUR NEXT STEP</span><h2>Start with one question today.</h2><p>Small practice sessions become strong programming skills.</p></div><button className="btn primary" onClick={()=>go("practice")}>Start Practice <Play size={17}/></button></div></section>
 </div>
}

function Feature({icon,title,text,onClick}){return <button className="feature" onClick={onClick}><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p><span>Explore <ArrowRight size={15}/></span></button>}

function Learn({languages,query,setQuery,go}){
 const filtered=languages.filter(x=>x.name.toLowerCase().includes(query.toLowerCase()));
 return <div className="page container"><div className="page-title"><span className="section-label">TUTORIALS</span><h1>Learn programming step by step</h1><p>Start with fundamentals, then move toward real projects and advanced concepts.</p></div>
 <div className="search"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search programming language or topic..."/></div>
 <div className="course-grid">{filtered.map(l=><article className="course" key={l.id}><div className={"course-icon "+l.color}>{l.icon}</div><span className="pill">Beginner → Advanced</span><h2>{l.name} Tutorial</h2><p>{l.description}</p><div className="course-progress"><span></span></div><button className="btn small primary" onClick={()=>go("practice")}>Start learning <ArrowRight size={15}/></button></article>)}</div>
 <div className="coming"><BookOpen/><div><h3>Custom tutorials are ready to be added</h3><p>Use the tutorial data structure later to add lessons, examples, notes, quizzes, and projects for every language.</p></div></div>
 </div>
}

function Practice({languages,language,setLanguage,questions,progress,go,setChallenge,query,setQuery}){
 const qs=questions[language]||[];
 const done=qs.filter((_,i)=>progress[language+"-"+i]).length;
 const filtered=qs.filter(q=>(q[1]+" "+q[2]).toLowerCase().includes(query.toLowerCase()));
 return <div className="page container"><div className="page-title"><span className="section-label">CODING PRACTICE</span><h1>Practice. Solve. Improve.</h1><p>Choose a question and solve it in the compiler. A question is marked solved only after a correct submission.</p></div>
 <div className="practice-toolbar"><div className="tabs">{languages.map(l=><button className={language===l.id?"selected":""} onClick={()=>setLanguage(l.id)} key={l.id}>{l.name}</button>)}</div><div className="practice-progress">{done}/{qs.length} solved</div></div>
 <div className="search"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search practice questions..."/></div>
 <div className="question-list">{filtered.map((q)=>{const i=qs.indexOf(q); return <button className="question clickable-question" key={i} onClick={()=>{setChallenge({language,index:i,question:q});go("compiler")}}>
   <div className="q-main"><div className={"difficulty "+q[0].toLowerCase()}>{q[0]}</div><div><h3>{q[1]}</h3><p>{q[2]}</p></div></div>
   <div className="q-actions">{progress[language+"-"+i]?<span className="solved"><CheckCircle2 size={16}/> Solved</span>:<span className="unsolved">Not solved</span>}<span className="solve-arrow">Open compiler <ArrowRight size={15}/></span></div>
 </button>})}</div></div>
}

function Compiler({language,setLanguage,challenge,setChallenge,progress,toggleSolved}){
 const activeLang=challenge?.language||language;
 const [code,setCode]=useState(challenge?(challenge.question[3]||""):"print(\"Hello, TechBlu!\")");
 const [output,setOutput]=useState(""); const [message,setMessage]=useState(""); const [showAnswer,setShowAnswer]=useState(false);
 const isChallenge=Boolean(challenge);
 useEffect(()=>{setCode(challenge?(challenge.question[3]||""):"print(\"Hello, TechBlu!\")");setOutput("");setMessage("");setShowAnswer(false)},[challenge]);
 const run=()=>{
   if(!isChallenge){setOutput("Program submitted successfully.\n\nConnect your sandboxed compiler API here for real execution.");return;}
   const answer=challenge.question[3]||""; const normalizedCode=code.replace(/\s+/g," ").trim().toLowerCase(); const normalizedAnswer=answer.replace(/\\n/g," ").replace(/\s+/g," ").trim().toLowerCase();
   const looksCorrect=normalizedCode===normalizedAnswer || (activeLang==="python"&&challenge.question[1]==="Print Hello World"&&/print\s*\(\s*["']hello, world!["']\s*\)/i.test(code)) || (activeLang==="javascript"&&challenge.question[1]==="Hello World"&&/console\.log\(\s*['"]hello, world!['"]\s*\)/i.test(code));
   setOutput(looksCorrect?"Correct output!\n\nYour solution passed the starter check.":"Execution result: solution not accepted yet.\n\nKeep practicing and try again.");
   if(looksCorrect){setMessage("Correct! Question marked as solved.");if(!progress[activeLang+"-"+challenge.index])toggleSolved(activeLang+"-"+challenge.index)}else setMessage("Not solved yet. The question stays unsolved until the submission is correct.");
 };
 const changeLanguage=e=>{const next=e.target.value;setLanguage(next);if(isChallenge&&next!==challenge.language)setChallenge(null)};
 return <div className={"page container "+(isChallenge?"challenge-page":"")}><div className="page-title"><span className="section-label">{isChallenge?"PRACTICE COMPILER":"ONLINE COMPILER"}</span><h1>{isChallenge?"Solve the question in the compiler":"Write code. Run it. Learn."}</h1><p>{isChallenge?"Read the question, use the hint if needed, then submit your solution.":"A free coding workspace for experimenting with programs."}</p></div>
 <div className={"compiler-layout "+(isChallenge?"with-challenge":"")}>
 {isChallenge&&<aside className="challenge-panel"><div className="challenge-head"><div><span className={"difficulty "+challenge.question[0].toLowerCase()}>{challenge.question[0]}</span><h2>{challenge.question[1]}</h2></div><button className="close-challenge" onClick={()=>setChallenge(null)}><X size={18}/></button></div><p className="challenge-description">{challenge.question[2]}</p><div className="hint-box"><b>💡 Hint</b><p>Break the problem into small steps. Think about the input, the operation you need, and the exact output.</p></div><div className="answer-box"><div><b>Answer</b><span>Hidden until you choose to reveal it</span></div><button className="btn small ghost" onClick={()=>setShowAnswer(!showAnswer)}>{showAnswer?"Hide answer":"Show answer"}</button>{showAnswer&&<pre>{challenge.question[3]}</pre>}</div><div className="challenge-status">{progress[activeLang+"-"+challenge.index]?<><CheckCircle2 size={17}/> Solved</>:<>○ Not solved</>}</div></aside>}
 <section className="compiler-shell"><div className="compiler-bar"><div className="select-wrap"><Code2 size={17}/><select value={activeLang} onChange={changeLanguage}>{["python","javascript","java","cpp","c"].map(x=><option key={x}>{x}</option>)}</select></div><button className="run" onClick={run}><Play size={16}/> {isChallenge?"Run & Submit":"Run Code"}</button></div><div className="editor-grid"><div><div className="editor-title">main.{activeLang==="python"?"py":activeLang==="javascript"?"js":"txt"}</div><textarea spellCheck="false" value={code} onChange={e=>{setCode(e.target.value);setMessage("")}}/></div><div><div className="editor-title">Console</div><pre className="console">{output||"Output will appear here...\n\nRun your program to see the result."}</pre></div></div>{message&&<div className={"submission-message "+(message.startsWith("Correct")?"success":"error")}>{message}</div>}</section></div>
 <div className="compiler-note"><Terminal size={19}/><div><b>{isChallenge?"Correct submission is required":"Production compiler architecture"}</b><p>{isChallenge?"This starter uses a validation hook. Connect a sandboxed compiler API next so stdout, errors and test cases can determine whether a question is truly solved.":"For security, do not execute arbitrary code directly inside your website server. Send code to a sandboxed execution service and return stdout, stderr, status, and execution time."}</p></div></div></div>
}

function Dashboard({solved,total,level,progress,languages,username,setUsername}){
 const percent=Math.round((solved/total)*100); const [editing,setEditing]=useState(!username); const [draft,setDraft]=useState(username);
 const saveName=()=>{const clean=draft.trim();if(!clean)return;setUsername(clean);localStorage.setItem("techblu-username",clean);setEditing(false)};
 return <div className="page container"><div className="page-title"><span className="section-label">DASHBOARD</span><h1>Your learning progress</h1><p>Track your practice, learning level, and progress across programming languages.</p></div>
 <div className="dashboard-grid"><div className="profile-card"><div className="avatar">T</div>{editing?<div className="username-form"><label>Your name</label><input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveName()} placeholder="Enter your name"/><button className="btn small primary" onClick={saveName}>Save name</button></div>:<><h2>{username}</h2><button className="edit-name" onClick={()=>{setDraft(username);setEditing(true)}}>Change name</button></>}<span className="level-badge">{level}</span><div className="big-progress"><div style={{width:percent+"%"}}></div></div><b>{percent}%</b><p>Overall practice progress</p></div><div className="stat-card"><Trophy/><span>Questions solved</span><strong>{solved}</strong><small>out of {total}</small></div><div className="stat-card"><BookOpen/><span>Languages</span><strong>{languages.length}</strong><small>available now</small></div><div className="stat-card"><BarChart3/><span>Current level</span><strong>{level}</strong><small>based on practice</small></div></div>
 <div className="progress-section"><h2>Language progress</h2>{languages.map(l=>{let n=Object.keys(progress).filter(k=>k.startsWith(l.id+"-")&&progress[k]).length;return <div className="lang-row" key={l.id}><span>{l.name}</span><div><i style={{width:(n/10*100)+"%"}}></i></div><b>{n}/10</b></div>})}</div></div>
}

createRoot(document.getElementById("root")).render(<App/>);