import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Briefcase, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import './index.css';

function App() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please provide both a resume and a job description.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Assuming backend runs on localhost:3000
      const response = await axios.post('http://localhost:3000/api/match', {
        resumeText,
        jobDescription
      });
      
      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError('Analysis failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to connect to the backend API.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <motion.header 
        className="header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Resume Job Matcher</h1>
        <p>Analyze your resume against job requirements instantly with AI-powered precision.</p>
      </motion.header>

      {error && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ color: 'var(--accent-red)', textAlign: 'center', backgroundColor: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '8px' }}
        >
          {error}
        </motion.div>
      )}

      <motion.main 
        className="main-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="input-section">
          <h2><FileText size={20} className="text-blue-400" /> Your Resume</h2>
          <div className="textarea-wrapper">
            <textarea 
              placeholder="Paste your resume content here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>
        </div>

        <div className="input-section">
          <h2><Briefcase size={20} className="text-purple-400" /> Job Description</h2>
          <div className="textarea-wrapper">
            <textarea 
              placeholder="Paste the job requirements here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
        </div>
      </motion.main>

      <motion.div 
        className="analyze-btn-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <button 
          className="analyze-btn" 
          onClick={handleAnalyze}
          disabled={isLoading}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Sparkles size={20} />
            </motion.div>
          ) : (
            <Sparkles size={20} />
          )}
          {isLoading ? 'Analyzing Match...' : 'Analyze Match'}
        </button>
      </motion.div>

      <AnimatePresence>
        {result && (
          <motion.div 
            className="results-dashboard"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
          >
            <div className="results-header">
              <h2>Analysis Complete</h2>
            </div>
            
            <div className="score-container">
              <motion.div 
                className="score-circle"
                style={{ '--score': result.score }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 100, delay: 0.3 }}
              >
                <span className="score-value">{result.score}%</span>
                <span className="score-label">Match Score</span>
              </motion.div>
            </div>

            <div className="keywords-grid">
              <div className="keyword-list matched">
                <h3><CheckCircle size={18} /> Matched Keywords</h3>
                <div className="badges">
                  {result.matched.length > 0 ? (
                    result.matched.map((word, idx) => (
                      <motion.span 
                        key={idx} 
                        className="badge matched"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + (idx * 0.05) }}
                      >
                        {word}
                      </motion.span>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>No strong matches found.</p>
                  )}
                </div>
              </div>

              <div className="keyword-list missing">
                <h3><XCircle size={18} /> Missing Keywords</h3>
                <div className="badges">
                  {result.missing.length > 0 ? (
                    result.missing.map((word, idx) => (
                      <motion.span 
                        key={idx} 
                        className="badge missing"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + (idx * 0.05) }}
                      >
                        {word}
                      </motion.span>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>No missing keywords!</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
