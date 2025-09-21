import React, { useState, useEffect } from 'react';

/**
 * MFASetup Component
 * 
 * Provides multi-factor authentication setup and configuration interface.
 * Supports TOTP (Google Authenticator), SMS, and backup codes.
 */

export interface MFAMethod {
  type: 'totp' | 'sms' | 'backup_codes';
  label: string;
  description: string;
  enabled: boolean;
  verified: boolean;
}

export interface MFASetupData {
  qrCode?: string;
  secret?: string;
  backupCodes?: string[];
  phoneNumber?: string;
}

interface MFASetupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (method: string) => void;
  theme?: 'light' | 'dark';
  currentMethods?: MFAMethod[];
}

export const MFASetup: React.FC<MFASetupProps> = ({
  isOpen,
  onClose,
  onComplete,
  theme = 'light',
  currentMethods = []
}) => {
  const [step, setStep] = useState<'select' | 'setup' | 'verify' | 'complete'>('select');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [setupData, setSetupData] = useState<MFASetupData>({});
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Available MFA methods
  const availableMethods: MFAMethod[] = [
    {
      type: 'totp',
      label: 'Authenticator App',
      description: 'Use Google Authenticator, Authy, or similar apps',
      enabled: false,
      verified: false
    },
    {
      type: 'sms',
      label: 'SMS Text Message',
      description: 'Receive codes via text message',
      enabled: false,
      verified: false
    },
    {
      type: 'backup_codes',
      label: 'Backup Codes',
      description: 'One-time recovery codes for emergency access',
      enabled: false,
      verified: false
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setSelectedMethod('');
      setVerificationCode('');
      setPhoneNumber('');
      setError(null);
      setShowBackupCodes(false);
    }
  }, [isOpen]);

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setStep('setup');
    setError(null);
    
    if (method === 'totp') {
      generateTOTPSecret();
    } else if (method === 'backup_codes') {
      generateBackupCodes();
    }
  };

  const generateTOTPSecret = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock TOTP setup data
      const mockSecret = 'JBSWY3DPEHPK3PXP';
      const mockQRCode = `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12" fill="black">
            QR Code for TOTP
          </text>
          <text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="10" fill="gray">
            ${mockSecret}
          </text>
        </svg>
      `)}`;
      
      setSetupData({
        secret: mockSecret,
        qrCode: mockQRCode
      });
    } catch (err) {
      setError('Failed to generate TOTP secret');
    } finally {
      setLoading(false);
    }
  };

  const generateBackupCodes = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock backup codes
      const codes = [
        'ABC123DEF456',
        'GHI789JKL012',
        'MNO345PQR678',
        'STU901VWX234',
        'YZA567BCD890',
        'EFG123HIJ456',
        'KLM789NOP012',
        'QRS345TUV678'
      ];
      
      setSetupData({ backupCodes: codes });
      setShowBackupCodes(true);
    } catch (err) {
      setError('Failed to generate backup codes');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter a verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate verification API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock successful verification (accept any 6-digit code)
      if (selectedMethod === 'totp' && verificationCode.length === 6) {
        setStep('complete');
        onComplete(selectedMethod);
      } else if (selectedMethod === 'sms' && verificationCode.length === 6) {
        setStep('complete');
        onComplete(selectedMethod);
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSMSSetup = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate SMS sending API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep('verify');
    } catch (err) {
      setError('Failed to send SMS verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedMethod('');
    setError(null);
    onClose();
  };

  const handleBackupCodesDownload = () => {
    if (!setupData.backupCodes) return;
    
    const codesText = setupData.backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agentsolr-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className={`mfa-setup-overlay ${theme}`}>
      <div className="mfa-setup-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <h2>Multi-Factor Authentication Setup</h2>
          <button onClick={handleClose} className="close-button">×</button>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Step 1: Method Selection */}
          {step === 'select' && (
            <div className="step-content">
              <h3>Choose a verification method</h3>
              <p>Select how you'd like to receive verification codes:</p>
              
              <div className="methods-list">
                {availableMethods.map(method => (
                  <div 
                    key={method.type}
                    className="method-card"
                    onClick={() => handleMethodSelect(method.type)}
                  >
                    <div className="method-info">
                      <h4>{method.label}</h4>
                      <p>{method.description}</p>
                    </div>
                    <div className="method-icon">→</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: TOTP Setup */}
          {step === 'setup' && selectedMethod === 'totp' && (
            <div className="step-content">
              <h3>Set up Authenticator App</h3>
              
              {loading ? (
                <div className="loading-content">
                  <div className="spinner"></div>
                  <p>Generating QR code...</p>
                </div>
              ) : (
                <div className="totp-setup">
                  <div className="setup-instructions">
                    <ol>
                      <li>Install an authenticator app like Google Authenticator or Authy</li>
                      <li>Scan the QR code below with your app</li>
                      <li>Enter the 6-digit code from your app to verify</li>
                    </ol>
                  </div>
                  
                  <div className="qr-section">
                    {setupData.qrCode && (
                      <img src={setupData.qrCode} alt="QR Code" className="qr-code" />
                    )}
                    <div className="manual-entry">
                      <p>Can't scan? Enter this code manually:</p>
                      <code className="secret-code">{setupData.secret}</code>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setStep('verify')} 
                    className="continue-button"
                  >
                    Continue to Verification
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: SMS Setup */}
          {step === 'setup' && selectedMethod === 'sms' && (
            <div className="step-content">
              <h3>Set up SMS Verification</h3>
              
              <div className="sms-setup">
                <div className="setup-instructions">
                  <p>Enter your phone number to receive verification codes via SMS.</p>
                </div>
                
                <div className="phone-input-section">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="phone-input"
                  />
                </div>
                
                <button 
                  onClick={handleSMSSetup}
                  disabled={loading || !phoneNumber.trim()}
                  className="continue-button"
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Backup Codes Setup */}
          {step === 'setup' && selectedMethod === 'backup_codes' && (
            <div className="step-content">
              <h3>Generate Backup Codes</h3>
              
              {loading ? (
                <div className="loading-content">
                  <div className="spinner"></div>
                  <p>Generating backup codes...</p>
                </div>
              ) : showBackupCodes ? (
                <div className="backup-codes-display">
                  <div className="warning-banner">
                    <strong>Important:</strong> Save these codes in a secure location. 
                    Each code can only be used once.
                  </div>
                  
                  <div className="codes-grid">
                    {setupData.backupCodes?.map((code, index) => (
                      <div key={index} className="backup-code">
                        {code}
                      </div>
                    ))}
                  </div>
                  
                  <div className="codes-actions">
                    <button 
                      onClick={handleBackupCodesDownload}
                      className="download-button"
                    >
                      📁 Download Codes
                    </button>
                    <button 
                      onClick={() => setStep('complete')}
                      className="continue-button"
                    >
                      I've Saved These Codes
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Step 3: Verification */}
          {step === 'verify' && (
            <div className="step-content">
              <h3>Verify Your Setup</h3>
              
              <div className="verification-section">
                <p>
                  Enter the 6-digit code from your {selectedMethod === 'totp' ? 'authenticator app' : 'SMS message'}:
                </p>
                
                <div className="code-input-section">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="verification-input"
                    maxLength={6}
                  />
                </div>
                
                <div className="verification-actions">
                  <button 
                    onClick={handleVerificationSubmit}
                    disabled={loading || verificationCode.length !== 6}
                    className="verify-button"
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                  
                  {selectedMethod === 'sms' && (
                    <button 
                      onClick={handleSMSSetup}
                      disabled={loading}
                      className="resend-button"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && (
            <div className="step-content">
              <div className="success-content">
                <div className="success-icon">✓</div>
                <h3>MFA Setup Complete!</h3>
                <p>
                  Your {selectedMethod === 'totp' ? 'authenticator app' : 
                          selectedMethod === 'sms' ? 'SMS verification' : 
                          'backup codes'} {selectedMethod === 'backup_codes' ? 'have' : 'has'} been 
                  successfully configured.
                </p>
                
                {selectedMethod !== 'backup_codes' && (
                  <div className="next-steps">
                    <p><strong>Recommended:</strong> Set up backup codes as a recovery method.</p>
                    <button 
                      onClick={() => handleMethodSelect('backup_codes')}
                      className="secondary-button"
                    >
                      Generate Backup Codes
                    </button>
                  </div>
                )}
                
                <button onClick={handleClose} className="done-button">
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        <style>{`
          .mfa-setup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .mfa-setup-modal {
            background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px 24px 0;
          }

          .modal-header h2 {
            margin: 0;
            color: #2196F3;
            font-size: 24px;
          }

          .close-button {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .close-button:hover {
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          }

          .modal-content {
            padding: 24px;
          }

          .error-banner {
            background: #FFEBEE;
            color: #C62828;
            padding: 12px 16px;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .step-content h3 {
            margin: 0 0 16px 0;
            font-size: 20px;
          }

          .step-content p {
            margin: 0 0 24px 0;
            color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
            line-height: 1.5;
          }

          .methods-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .method-card {
            border: 2px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
            border-radius: 8px;
            padding: 20px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.2s ease;
          }

          .method-card:hover {
            border-color: #2196F3;
            background: ${theme === 'dark' ? '#3d3d3d' : '#f8f9fa'};
          }

          .method-info h4 {
            margin: 0 0 8px 0;
            font-size: 16px;
          }

          .method-info p {
            margin: 0;
            font-size: 14px;
            color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
          }

          .method-icon {
            font-size: 20px;
            color: #2196F3;
          }

          .loading-content {
            text-align: center;
            padding: 40px 20px;
          }

          .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
            border-top: 3px solid #2196F3;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .setup-instructions ol {
            padding-left: 20px;
            margin-bottom: 24px;
          }

          .setup-instructions li {
            margin-bottom: 8px;
            line-height: 1.4;
          }

          .qr-section {
            text-align: center;
            margin-bottom: 24px;
          }

          .qr-code {
            width: 200px;
            height: 200px;
            border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
            border-radius: 8px;
            margin-bottom: 16px;
          }

          .manual-entry {
            background: ${theme === 'dark' ? '#3d3d3d' : '#f8f9fa'};
            padding: 16px;
            border-radius: 6px;
            margin-top: 16px;
          }

          .manual-entry p {
            margin: 0 0 8px 0;
            font-size: 14px;
          }

          .secret-code {
            background: ${theme === 'dark' ? '#4d4d4d' : '#ffffff'};
            padding: 8px 12px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            letter-spacing: 2px;
            display: inline-block;
            border: 1px solid ${theme === 'dark' ? '#5d5d5d' : '#dee2e6'};
          }

          .phone-input-section {
            margin-bottom: 24px;
          }

          .phone-input-section label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
          }

          .phone-input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
            border-radius: 6px;
            background: ${theme === 'dark' ? '#3d3d3d' : '#ffffff'};
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
            font-size: 16px;
          }

          .phone-input:focus {
            outline: none;
            border-color: #2196F3;
          }

          .warning-banner {
            background: #FFF3E0;
            color: #E65100;
            padding: 16px;
            border-radius: 6px;
            margin-bottom: 24px;
            border-left: 4px solid #FF9800;
          }

          .codes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 12px;
            margin-bottom: 24px;
          }

          .backup-code {
            background: ${theme === 'dark' ? '#3d3d3d' : '#f8f9fa'};
            padding: 12px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            text-align: center;
            font-size: 14px;
            border: 1px solid ${theme === 'dark' ? '#4d4d4d' : '#e9ecef'};
          }

          .codes-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .verification-section {
            text-align: center;
          }

          .code-input-section {
            margin: 24px 0;
          }

          .verification-input {
            width: 200px;
            padding: 16px;
            font-size: 24px;
            text-align: center;
            letter-spacing: 8px;
            border: 2px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
            border-radius: 8px;
            background: ${theme === 'dark' ? '#3d3d3d' : '#ffffff'};
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          }

          .verification-input:focus {
            outline: none;
            border-color: #2196F3;
          }

          .verification-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
          }

          .success-content {
            text-align: center;
            padding: 20px 0;
          }

          .success-icon {
            width: 64px;
            height: 64px;
            background: #4CAF50;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin: 0 auto 20px;
          }

          .next-steps {
            background: ${theme === 'dark' ? '#3d3d3d' : '#f8f9fa'};
            padding: 20px;
            border-radius: 8px;
            margin: 24px 0;
          }

          .next-steps p {
            margin-bottom: 16px;
          }

          /* Button Styles */
          .continue-button, .verify-button, .done-button {
            background: #2196F3;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: background 0.2s ease;
          }

          .continue-button:hover, .verify-button:hover, .done-button:hover {
            background: #1976D2;
          }

          .continue-button:disabled, .verify-button:disabled {
            background: #B0BEC5;
            cursor: not-allowed;
          }

          .secondary-button, .download-button {
            background: ${theme === 'dark' ? '#404040' : '#f8f9fa'};
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
            border: 1px solid ${theme === 'dark' ? '#4d4d4d' : '#dee2e6'};
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
          }

          .secondary-button:hover, .download-button:hover {
            background: ${theme === 'dark' ? '#4d4d4d' : '#e9ecef'};
          }

          .resend-button {
            background: none;
            color: #2196F3;
            border: 1px solid #2196F3;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
          }

          .resend-button:hover {
            background: #2196F3;
            color: white;
          }

          @media (max-width: 768px) {
            .mfa-setup-modal {
              width: 95%;
              margin: 20px;
            }

            .modal-content {
              padding: 16px;
            }

            .codes-grid {
              grid-template-columns: 1fr;
            }

            .verification-input {
              width: 100%;
              max-width: 300px;
            }

            .verification-actions, .codes-actions {
              flex-direction: column;
            }

            .continue-button, .verify-button, .done-button {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default MFASetup;