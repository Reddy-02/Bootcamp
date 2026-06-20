import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, FileText, Sparkles, Settings, Search, FileCheck, 
  X, ChevronRight, ArrowRight, UploadCloud, CheckCircle2, 
  Award, Info, Lock, RefreshCw, AlertTriangle, ArrowUpRight,
  Volume2, VolumeX
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ResumeCanvas from './components/ResumeCanvas';
import { 
  analyzeLocalHeuristics, 
  analyzeWithGemini, 
  COMPANY_PROFILES, 
  PRESET_ROLES 
} from './utils/AnalysisEngine';
import audio from './utils/AudioHelper';
import './App.css';

export default function App() {
  // Input states
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedRole, setSelectedRole] = useState(PRESET_ROLES[0].title);
  const [selectedCompany, setSelectedCompany] = useState('Google');
  
  // App system states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  
  // Progress & Terminal Logs
  const [logLines, setLogLines] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // References
  const workspaceRef = useRef(null);
  const dashboardRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync API Key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);

    // Set default mock JD
    setJobDescription(
      "Looking for a Senior Software Engineer to build and scale high-performance systems. " +
      "Must have deep experience with React, Node.js, distributed databases (PostgreSQL/Redis), " +
      "and containerized deployment (Docker/Kubernetes). Expected to lead system architecture design " +
      "and mentor junior engineers in code quality, microservices, and system reliability."
    );
  }, []);

  // Save API key
  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    audio.playClick();
  };

  // Scroll helper
  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    audio.playClick();
  };

  // Card cursor light positioning tracker
  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    audio.playClick();
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setResumeText(e.target.result);
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    audio.playClick();
    fileInputRef.current?.click();
  };

  // Preset job descriptions
  const handleRolePresetChange = (title) => {
    audio.playClick();
    setSelectedRole(title);
    if (title.includes('Full Stack')) {
      setJobDescription(
        "Looking for a Senior Full Stack Engineer. Requirements:\n" +
        "- Strong proficiency in TypeScript, React, CSS Grid/Flexbox\n" +
        "- Solid backend skills in Node.js, Express/NestJS, and PostgreSQL\n" +
        "- Familiarity with Redis caching and REST/GraphQL API design\n" +
        "- Experience scaling applications to 100k+ monthly active users\n" +
        "- Strong mentorship capabilities and clean code practices"
      );
    } else if (title.includes('Backend')) {
      setJobDescription(
        "Looking for a Senior Backend Engineer (Distributed Systems). Requirements:\n" +
        "- Deep expertise in Java, Go, or Rust\n" +
        "- Experience designing event-driven architectures with Apache Kafka or RabbitMQ\n" +
        "- Hands-on knowledge of distributed caching, SQL performance tuning, and NoSQL databases\n" +
        "- Passion for system performance, low-latency API endpoints, and horizontal scaling\n" +
        "- Experience operating workloads on AWS/GCP and Kubernetes"
      );
    } else if (title.includes('Frontend')) {
      setJobDescription(
        "Looking for a Staff Frontend Engineer. Requirements:\n" +
        "- Expert knowledge of core JavaScript, HTML5, Vanilla CSS, and modern framework internals (React/Vue)\n" +
        "- Experience building UI core design systems, bundlers (Vite/Webpack), and web performance metrics (Core Web Vitals)\n" +
        "- Deep understanding of client-side state management, responsive designs, and accessibility guidelines (WCAG)\n" +
        "- Focus on UI test automation, CI/CD integrations, and developer experience"
      );
    } else if (title.includes('AI/ML')) {
      setJobDescription(
        "Looking for a Senior AI/ML Systems Engineer. Requirements:\n" +
        "- Strong background in Python, PyTorch, or TensorFlow\n" +
        "- Experience implementing ML pipelines, model training optimizations, and vector search DBs (Pinecone/Milvus)\n" +
        "- Familiarity with LLM orchestrations (LangChain, LlamaIndex) and prompt engineering\n" +
        "- Deep understanding of distributed GPU computing and API scaling"
      );
    } else if (title.includes('SRE')) {
      setJobDescription(
        "Looking for a Senior Site Reliability Engineer. Requirements:\n" +
        "- Deep Unix/Linux systems internals and shell scripting proficiency\n" +
        "- Strong infrastructure-as-code automation (Terraform, Ansible)\n" +
        "- Expert operating production clusters on Kubernetes (EKS, GKE)\n" +
        "- Extensive debugging skills in TCP/IP, DNS, routing, and cloud networking\n" +
        "- Strong setup of monitoring/alerting platforms (Prometheus, Grafana, Datadog)"
      );
    }
  };

  // Trigger Resume Analysis Process
  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setErrorMsg('Please upload a resume or paste your resume content first.');
      return;
    }
    if (!jobDescription.trim()) {
      setErrorMsg('Please specify a target Job Description.');
      return;
    }

    setErrorMsg('');
    setIsAnalyzing(true);
    setResults(null);
    setLogLines([]);

    // Sound effect
    audio.playSwoosh();

    // Step-by-step simulator terminal lines
    const addLog = (text, type = 'scan', delay) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          setLogLines(prev => [...prev, { text, type, id: Math.random() }]);
          // Play click-type sound for terminal feedback
          audio.playHover();
          resolve();
        }, delay);
      });
    };

    // Execute scanning animation sequence
    await addLog('> Initializing Senior Engineer Evaluation Pipeline...', 'info', 0);
    await addLog('> Parsing resume contents & AST structures...', 'scan', 800);
    await addLog(`> Target Job Role detected: ${selectedRole}`, 'info', 700);
    await addLog(`> Aligning evaluation rubric with ${selectedCompany} guidelines...`, 'scan', 800);
    await addLog(`> Activating ${COMPANY_PROFILES[selectedCompany].seniorPersona} persona context...`, 'active', 700);

    try {
      let analysisResult;
      
      if (apiKey.trim()) {
        await addLog('> Calling Gemini AI backend for advanced evaluation...', 'info', 500);
        analysisResult = await analyzeWithGemini(
          resumeText, 
          jobDescription, 
          selectedCompany, 
          apiKey
        );
        await addLog('> Live AI evaluation compile completed successfully.', 'success', 300);
      } else {
        await addLog('> API Key not detected. Running local heuristics grading engine...', 'scan', 600);
        analysisResult = analyzeLocalHeuristics(
          resumeText, 
          jobDescription, 
          selectedCompany
        );
        await addLog('> Local heuristic grading completed.', 'success', 400);
      }

      await addLog('> Injecting visual scoring metric dashboard...', 'info', 500);
      
      setIsAnalyzing(false);
      setResults(analysisResult);
      
      // Success Sound Chime
      audio.playSuccess();

      // Fire confetti celebration on completion
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0071e3', '#2997ff', '#a100ff', '#06b6d4', '#10b981']
      });

      // Smooth scroll to results
      setTimeout(() => {
        scrollTo(dashboardRef);
      }, 300);

    } catch (err) {
      console.error(err);
      await addLog(`[ERROR] Pipeline analysis aborted: ${err.message}`, 'active', 100);
      setIsAnalyzing(false);
      setErrorMsg('Failed to complete AI analysis. Check your Gemini API Key in settings or check console logs.');
    }
  };

  // Reset page
  const handleReset = () => {
    audio.playClick();
    setResults(null);
    setResumeText('');
    setFileName('');
    setLogLines([]);
    scrollTo(workspaceRef);
  };

  // Toggle Mute Helper
  const handleMuteToggle = () => {
    const nextMute = audio.toggleMute();
    setIsMuted(nextMute);
    if (!nextMute) {
      audio.playClick();
    }
  };

  // Helper for Circular progress offset
  const getStrokeDashoffset = (score) => {
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    return circumference - (score / 100) * circumference;
  };

  return (
    <div className="app-container">
      {/* Sleek sticky header */}
      <header className="app-header">
        <div className="logo-container" onClick={() => { audio.playClick(); window.scrollTo({top:0, behavior:'smooth'}); }} style={{cursor:'pointer'}}>
          <Cpu className="logo-icon" size={24} />
          <span>Resume<span style={{color: 'var(--color-accent-blue)'}}>AI</span>.</span>
        </div>
        <div className="header-actions">
          <button 
            className="icon-btn" 
            onClick={handleMuteToggle}
            title={isMuted ? "Unmute Sounds" : "Mute Sounds"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button className="btn-secondary" onClick={() => scrollTo(workspaceRef)} style={{padding: '8px 16px', fontSize: '0.85rem'}}>
            Workspace
          </button>
          <button className="icon-btn" onClick={() => { audio.playClick(); setIsSettingsOpen(true); }} title="API Settings">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-tagline">Principal Engineer Grading</span>
          <h1 className="hero-title animate-fade-in">
            Evaluate Like a <br/>
            <span className="gradient-text-bold">Senior Architect</span>
          </h1>
          <p className="hero-description animate-fade-in">
            Analyze your resume against top tech company standards. Simulate the critique of an L8 Principal Engineer at Google, Netflix, or Apple. Discover structural gaps, get actionable rewrites, and prepare to pass the bar.
          </p>
          <div className="hero-cta-group animate-fade-in">
            <button className="btn-primary" onClick={() => scrollTo(workspaceRef)}>
              Scan Resume Now <ArrowRight size={18} />
            </button>
            <button className="btn-secondary" onClick={() => { audio.playClick(); setIsSettingsOpen(true); }}>
              Configure Gemini AI <Sparkles size={18} style={{color: 'var(--color-accent-purple)'}} />
            </button>
          </div>
        </div>

        {/* 3D Interactive Canvas */}
        <div className="hero-canvas-container">
          <ResumeCanvas isAnalyzing={isAnalyzing} score={results?.score} />
        </div>
      </section>

      {/* Feature Grid cards */}
      <section className="features-grid">
        <div 
          className="feature-card glass-panel" 
          onMouseMove={handleCardMouseMove}
          onMouseEnter={() => audio.playHover()}
        >
          <div className="feature-icon-wrapper">
            <Cpu size={24} />
          </div>
          <h3>Senior Personas</h3>
          <p>Each review is dynamically calibrated. Get evaluated as if by the most senior technical leads of your specific target company.</p>
        </div>
        <div 
          className="feature-card glass-panel" 
          onMouseMove={handleCardMouseMove}
          onMouseEnter={() => audio.playHover()}
        >
          <div className="feature-icon-wrapper" style={{background: 'rgba(161, 0, 255, 0.1)', color: 'var(--color-accent-purple)'}}>
            <Sparkles size={24} />
          </div>
          <h3>Actionable Diff Rewrites</h3>
          <p>Get precise side-by-side bullet diff comparison blocks. Upgrade flat statements into high-impact, metrics-driven descriptions.</p>
        </div>
        <div 
          className="feature-card glass-panel" 
          onMouseMove={handleCardMouseMove}
          onMouseEnter={() => audio.playHover()}
        >
          <div className="feature-icon-wrapper" style={{background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-accent-cyan)'}}>
            <FileText size={24} />
          </div>
          <h3>Deep Gap Scanning</h3>
          <p>Highlights missing frameworks, engineering architectures, or domain requirements based on the target job role.</p>
        </div>
      </section>

      {/* Main Workspace Section */}
      <section className="workspace-section" ref={workspaceRef}>
        <div className="section-header">
          <h2>Engineering Workspace</h2>
          <p>Upload your resume, choose your targets, and run the diagnostic.</p>
        </div>

        <div className="analyzer-box">
          {/* Left panel inputs */}
          <div 
            className="input-panel glass-panel"
            onMouseMove={handleCardMouseMove}
          >
            <div className="form-group">
              <label>
                <FileText size={18} className="logo-icon" />
                Step 1: Upload your Resume
                <span className="form-label-desc">(.txt, plain text or paste below)</span>
              </label>
              
              <div 
                className={`file-dropzone ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                  accept=".txt,.md,.json"
                  style={{display: 'none'}}
                />
                <UploadCloud className="dropzone-icon" size={32} />
                {fileName ? (
                  <div className="file-info" onClick={(e) => e.stopPropagation()}>
                    <div className="file-info-text">
                      <FileCheck size={16} style={{color: 'var(--color-accent-green)'}} />
                      <strong>{fileName}</strong>
                    </div>
                    <button className="remove-file-btn" onClick={() => { audio.playClick(); setFileName(''); setResumeText(''); }}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                    Drag and drop your file here, or <span style={{color: 'var(--color-accent-blue)', textDecoration: 'underline'}}>browse</span>
                  </p>
                )}
              </div>

              <textarea
                className="textarea-control"
                placeholder="Or paste your resume content directly here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <Cpu size={18} style={{color: 'var(--color-accent-purple)'}} />
                Step 2: Select Target Role
              </label>
              <select 
                className="select-control"
                value={selectedRole}
                onChange={(e) => handleRolePresetChange(e.target.value)}
              >
                {PRESET_ROLES.map(role => (
                  <option key={role.id} value={role.title}>{role.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right panel targets */}
          <div 
            className="input-panel glass-panel"
            onMouseMove={handleCardMouseMove}
          >
            <div className="form-group">
              <label>
                <Award size={18} style={{color: 'var(--color-accent-yellow)'}} />
                Step 3: Select Target Company
              </label>
              <div className="company-slider">
                {Object.keys(COMPANY_PROFILES).map((key) => {
                  const comp = COMPANY_PROFILES[key];
                  const isActive = selectedCompany === key;
                  return (
                    <div 
                      key={key}
                      className={`company-slide-card ${isActive ? 'active' : ''}`}
                      onClick={() => { audio.playClick(); setSelectedCompany(key); }}
                    >
                      <div className="company-slide-logo">
                        {comp.name === 'Google' && <span style={{color: '#4285F4'}}>G</span>}
                        {comp.name === 'Apple' && <span style={{color: '#f5f5f7'}}></span>}
                        {comp.name === 'Netflix' && <span style={{color: '#E50914'}}>N</span>}
                        {comp.name === 'Stripe' && <span style={{color: '#635BFF'}}>S</span>}
                        {comp.name === 'Meta' && <span style={{color: '#0668E1'}}>M</span>}
                      </div>
                      <div style={{fontWeight: '600', fontSize: '0.9rem'}}>{comp.name}</div>
                      <div className="company-slide-persona">{comp.seniorPersona}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>
                <Info size={18} style={{color: 'var(--color-accent-cyan)'}} />
                Target Job Description
              </label>
              <textarea
                className="textarea-control"
                style={{minHeight: '170px'}}
                placeholder="Paste the target job description details here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            {errorMsg && (
              <div style={{color: 'var(--color-accent-magenta)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button 
              className="btn-primary" 
              onClick={handleAnalyze} 
              disabled={isAnalyzing}
              style={{justifyContent: 'center', padding: '16px'}}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="spinner-circle" size={18} style={{animation: 'spin 1s linear infinite'}} />
                  <span>Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <Cpu size={18} />
                  <span>Run Senior Diagnostic</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Scanning Console */}
        {isAnalyzing && (
          <div className="loading-panel glass-panel">
            <div className="spinner-outer">
              <div className="spinner-circle"></div>
              <div className="spinner-inner"></div>
            </div>
            
            <div className="terminal-console">
              {logLines.map((line) => (
                <div key={line.id} className={`terminal-line ${line.type}`}>
                  <span>{line.text}</span>
                </div>
              ))}
              <div className="terminal-line active">
                <span>&gt; <span className="terminal-cursor">█</span></span>
              </div>
            </div>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.95rem'}}>Evaluating code architectures, data models, and team boundaries...</p>
          </div>
        )}
      </section>

      {/* Analysis Results Dashboard */}
      {results && (
        <section className="workspace-section" ref={dashboardRef} style={{background: 'linear-gradient(180deg, transparent, rgba(16, 185, 129, 0.02))'}}>
          <div className="section-header">
            <h2>Diagnostic Report</h2>
            <p>Here is your Principal Engineer evaluation card.</p>
          </div>

          <div className="dashboard-grid">
            {/* Left Dashboard Column */}
            <div className="dashboard-col-left">
              {/* Score Panel */}
              <div 
                className="score-panel glass-panel"
                onMouseMove={handleCardMouseMove}
              >
                <div className="score-chart-container">
                  <svg className="score-svg">
                    <circle className="score-svg-bg" cx="70" cy="70" r="58" />
                    <circle 
                      className="score-svg-fill" 
                      cx="70" 
                      cy="70" 
                      r="58" 
                      strokeDasharray="364.4"
                      strokeDashoffset={getStrokeDashoffset(results.score)}
                      stroke={
                        results.score >= 80 
                          ? 'var(--color-accent-green)' 
                          : results.score >= 65 
                            ? 'var(--color-accent-yellow)' 
                            : 'var(--color-accent-magenta)'
                      }
                    />
                  </svg>
                  <div className="score-number">{results.score}%</div>
                </div>
                
                <div className="score-text-details">
                  <div className={`score-verdict-badge ${
                    results.score >= 80 ? 'strong' : results.score >= 65 ? 'moderate' : 'needs'
                  }`}>
                    {results.verdict}
                  </div>
                  <h3 style={{fontSize: '1.2rem'}}>Resume Match Grade</h3>
                  <p className="score-subtitle">
                    Your resume matches {results.score}% of the senior profile expectations for {selectedCompany}'s engineering standard.
                  </p>
                </div>
              </div>

              {/* Persona Letter */}
              <div 
                className="persona-letter-panel glass-panel"
                onMouseMove={handleCardMouseMove}
              >
                <div className="persona-header">
                  <div className="persona-avatar">
                    {selectedCompany[0]}
                  </div>
                  <div className="persona-meta">
                    <h3>{COMPANY_PROFILES[selectedCompany].seniorPersona} Review</h3>
                    <p>Internal Engineering Rubric evaluation</p>
                  </div>
                </div>
                <div className="persona-letter-body">
                  {results.summary}
                </div>
              </div>
            </div>

            {/* Right Dashboard Column */}
            <div className="dashboard-col-right">
              {/* Suggestions Panel */}
              <div 
                className="dashboard-panel glass-panel"
                onMouseMove={handleCardMouseMove}
              >
                <h3>
                  <Sparkles size={20} className="logo-icon" />
                  Key Improvement Points
                </h3>
                <div className="suggestions-list">
                  {results.suggestions.map((s, idx) => (
                    <div key={idx} className="suggestion-item">
                      <CheckCircle2 size={16} className="suggestion-icon" />
                      <div className="suggestion-text">{s}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Parts Badge Grid */}
              <div 
                className="dashboard-panel glass-panel"
                onMouseMove={handleCardMouseMove}
              >
                <h3>
                  <AlertTriangle size={20} style={{color: 'var(--color-accent-magenta)'}} />
                  Identified Gaps & Missing Info
                </h3>
                <div className="missing-parts-grid">
                  {results.missingParts.map((p, idx) => (
                    <div key={idx} className="missing-badge">
                      <X size={14} style={{color: 'var(--color-accent-magenta)'}} />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company Interview & Culture info */}
              <div 
                className="dashboard-panel glass-panel"
                onMouseMove={handleCardMouseMove}
              >
                <h3>
                  <Info size={20} style={{color: 'var(--color-accent-cyan)'}} />
                  {selectedCompany} Engineering Insights
                </h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                  <div>
                    <strong style={{color: 'var(--color-accent-cyan)', fontSize: '0.85rem', textTransform: 'uppercase'}}>Engineering Culture</strong>
                    <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px', lineHeight: '1.5'}}>{results.companyPrep.culture}</p>
                  </div>
                  <div>
                    <strong style={{color: 'var(--color-accent-purple)', fontSize: '0.85rem', textTransform: 'uppercase'}}>Interview Advice</strong>
                    <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px', lineHeight: '1.5'}}>{results.companyPrep.interviewPrep}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-side Bullet Optimizer diff */}
          <div 
            className="dashboard-panel glass-panel" 
            style={{width: '100%'}}
            onMouseMove={handleCardMouseMove}
          >
            <h3>
              <Cpu size={20} style={{color: 'var(--color-accent-blue)'}} />
              Senior Resume Bullet Optimizer (Diff)
            </h3>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px'}}>
              Upgrade generic activity descriptions into metrics-driven achievements displaying ownership, architecture scale, and quantifiable impact.
            </p>
            <div className="diff-section">
              <div className="diff-grid">
                <div className="diff-card original">
                  <div className="diff-card-title">
                    <X size={14} /> Before (Candidate Bullet)
                  </div>
                  <div className="diff-card-body">
                    "{results.resumeDiff.original}"
                  </div>
                </div>
                <div className="diff-card optimized">
                  <div className="diff-card-title">
                    <CheckCircle2 size={14} /> After (Optimized Rewrite)
                  </div>
                  <div className="diff-card-body">
                    "{results.resumeDiff.optimized}"
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reset / Run another button */}
          <div className="dashboard-footer">
            <button className="btn-secondary" onClick={handleReset} style={{gap: '10px'}}>
              <RefreshCw size={16} /> Check Another Resume
            </button>
          </div>
        </section>
      )}

      {/* Settings slide-out drawer */}
      <div className={`settings-overlay ${isSettingsOpen ? 'open' : ''}`} onClick={() => { audio.playClick(); setIsSettingsOpen(false); }}>
        <div className="settings-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="settings-header">
            <h3>API Configurations</h3>
            <button className="icon-btn" onClick={() => { audio.playClick(); setIsSettingsOpen(false); }}>
              <X size={18} />
            </button>
          </div>

          <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5'}}>
            Enter your Gemini API key to activate the live AI Senior Engineer. If left empty, the application runs on a local heuristic scoring framework.
          </p>

          <div className="form-group">
            <label style={{display: 'flex', justifyContent: 'space-between'}}>
              <span>Gemini API Key</span>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer" 
                style={{color: 'var(--color-accent-blue)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none'}}
              >
                Get Key <ArrowUpRight size={14} />
              </a>
            </label>
            <input 
              type="password"
              className="input-control"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => saveApiKey(e.target.value)}
            />
            {apiKey.trim() ? (
              <div className="api-badge active">
                <Lock size={14} /> Live Gemini Engine Configured
              </div>
            ) : (
              <div className="api-badge">
                <Info size={14} /> Local Heuristics Simulator Active
              </div>
            )}
          </div>

          <button className="btn-primary" onClick={() => { audio.playClick(); setIsSettingsOpen(false); }} style={{marginTop: 'auto'}}>
            Close & Save
          </button>
        </div>
      </div>

      <footer className="app-footer">
        <p>© 2026 ResumeAI. Engineered for high-impact candidates. All analysis done in browser local storage.</p>
      </footer>
    </div>
  );
}
