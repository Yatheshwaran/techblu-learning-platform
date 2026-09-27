import "./styles.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { AuthProvider } from "./context/Authcontext";
import Practice from "./pages/Practice";
import PracticeCompiler from "./pages/PracticeCompiler";
import Dashboard from "./pages/Dashboard";
import Compiler from "./pages/Compiler";
import Tutorials from "./pages/Tutorials";
import Home from "./pages/Home";
import Header from "./components/layout/Header";
import React, { useEffect, useState } from "react";

import { createRoot } from "react-dom/client";
import {
  BookOpen, Code2, Trophy, LayoutDashboard, Moon, Sun, Menu, X,
  Play, ArrowRight, CheckCircle2, BarChart3, Terminal, Search, Sparkles
} from "lucide-react";


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
    <Header
       page={page}
       menu={menu}
       setMenu={setMenu}
       dark={dark}
       setDark={setDark}
       go={go}
    />
    

    <main>
      {page==="home" && <Home go={go} languages={languages} solved={solved} level={level}/>}
      {page==="learn" && <Tutorials languages={languages} query={query} setQuery={setQuery} setLanguage={setLanguage} go={go}/>} 
      {page==="practice" && <Practice languages={languages} language={language} setLanguage={setLanguage} query={query} setQuery={setQuery} questions={questions} progress={progress} toggleSolved={toggleSolved} selected={selected} setSelected={setSelected} go={go} setChallenge={setChallenge}/>}
      {page === "practiceCompiler" && (
    <PracticeCompiler
      challenge={challenge}
      selectedLanguage={language}
      onClose={() => go("practice")}
    />
  )}

      {page==="compiler" && <Compiler language={language} setLanguage={setLanguage} challenge={challenge} setChallenge={setChallenge} progress={progress} toggleSolved={toggleSolved}/>}
      {page==="dashboard" && <Dashboard solved={solved} total={total} level={level} progress={progress} languages={languages} />}
      {page === "login" && (<Login go={go} />)}
      {page === "signup" && (<Signup go={go} /> )}
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

 createRoot(document.getElementById("root")).render(
     
    <AuthProvider>
      <App />
    </AuthProvider>
    
  
);