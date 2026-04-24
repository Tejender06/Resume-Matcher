import { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Briefcase, Sparkles, CheckCircle, XCircle, UploadCloud, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import './index.css';

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'application/msword') {
        setResumeFile(file);
        setError('');
      } else {
        setResumeFile(null);
        setError('Please upload a valid PDF or DOCX file.');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile) {
      setError('Please upload your resume file (.pdf or .docx).');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please provide a job description.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('resumeFile', resumeFile);
      formData.append('jobDescription', jobDescription);

      const response = await axios.post('http://localhost:3000/api/match', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
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
        <p>Upload your resume and instantly see your chances of landing the job.</p>
      </motion.header>

      {error && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ color: 'var(--accent-red)', textAlign: 'center', backgroundColor: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <AlertCircle size={20} /> {error}
        </motion.div>
      )}

      <motion.main 
        className="main-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* File Upload Section */}
        <div className="input-section">
          <h2><FileText size={20} className="text-blue-400" /> Upload Resume</h2>
          <div 
            className="file-upload-zone"
            onClick={() => fileInputRef.current.click()}
            style={{
              flexGrow: 1,
              border: '2px dashed var(--border-color)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              padding: '2rem',
              transition: 'all 0.3s ease'
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
            />
            {resumeFile ? (
              <div style={{ textAlign: 'center', color: 'var(--accent-green)' }}>
                <CheckCircle size={48} style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontWeight: 600 }}>{resumeFile.name}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Click to change file</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <UploadCloud size={48} style={{ margin: '0 auto 1rem', color: 'var(--accent-blue)' }} />
                <p>Drag & drop or click to upload</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Supports .PDF and .DOCX</p>
              </div>
            )}
          </div>
        </div>

        {/* Text Area Section */}
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
            
            <div className="score-and-metrics" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '3rem', marginBottom: '3rem' }}>
              
              <motion.div 
                className="score-circle"
                style={{ '--score': result.match_percentage || result.score || 0 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 100, delay: 0.3 }}
              >
                <span className="score-value">{result.match_percentage || result.score || 0}%</span>
                <span className="score-label">Match</span>
              </motion.div>

              <div className="metrics-cards" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <motion.div 
                  className="metric-card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}
                >
                  <div style={{ backgroundColor: (result.recommendation === 'Apply' || result.shouldApply) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '50%', color: (result.recommendation === 'Apply' || result.shouldApply) ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {(result.recommendation === 'Apply' || result.shouldApply) ? <ThumbsUp size={24} /> : <ThumbsDown size={24} />}
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Recommendation</p>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, color: (result.recommendation === 'Apply' || result.shouldApply) ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                      {(result.recommendation === 'Apply' || result.shouldApply) ? "You Should Apply!" : "Skip This Job"}
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  className="metric-card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}
                >
                  <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', padding: '0.75rem', borderRadius: '50%', color: 'var(--accent-blue)' }}>
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Chances of Selection</p>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                      {result.confidence || result.chancesOfSelection || "Unknown"}
                    </p>
                  </div>
                </motion.div>
              </div>

            </div>

            <div className="keywords-grid">
              <div className="keyword-list matched">
                <h3><CheckCircle size={18} /> Matched Keywords</h3>
                <div className="badges">
                  {(result.matched_skills || result.matched)?.length > 0 ? (
                    (result.matched_skills || result.matched).map((word, idx) => (
                      <motion.span 
                        key={idx} 
                        className="badge matched"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + (idx * 0.05) }}
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
                  {(result.missing_skills || result.missing)?.length > 0 ? (
                    (result.missing_skills || result.missing).map((word, idx) => (
                      <motion.span 
                        key={idx} 
                        className="badge missing"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + (idx * 0.05) }}
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
