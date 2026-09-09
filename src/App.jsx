import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import SignatureCanvas from 'react-signature-canvas';
import { Download } from 'lucide-react';

function App() {
  const [formData, setFormData] = useState({
    companyName: '',
    visitDate: '',
    visitDuration: '',
    personnel: '',
    branches: '',
    studentsSelected: '',
    travelConvenient: '',
    travelArrangements: '',
    travelProblems: '',
    travelActionTaken: '',
    accFirstImpression: '',
    accAmbience: '',
    accFacilities: '',
    accSanitation: '',
    accServices: '',
    accFood: '',
    accWarmth: '',
    stayProblems: '',
    stayActionTaken: '',
    recTechFacilities: '',
    recCoordination: '',
    recAmbience: '',
    recProblems: '',
    recActionTaken: '',
    camArena: '',
    camCapital: '',
    impressiveQualities: '',
    areasForImprovement: '',
    overallComments: '',
    visitAgain: ''
  });

  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const signatureRef = useRef();
  const pdfContentRef = useRef();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const clearSignature = () => {
    signatureRef.current.clear();
    setSignatureDataUrl(null);
  };

  const saveSignature = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      // Bypass getTrimmedCanvas() error by selecting the underlying canvas element directly
      const canvas = document.querySelector('.sigCanvas');
      if (canvas) {
        setSignatureDataUrl(canvas.toDataURL('image/png'));
      }
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const generatePDF = async () => {
    setIsSubmitting(true);

    const element = pdfContentRef.current;
    
    // Move the element into the viewport (hidden behind the main app)
    // html2canvas sometimes ignores elements that are positioned -9999px offscreen.
    element.style.top = '0px';
    element.style.left = '0px';
    element.style.zIndex = '-1000';

    // Wait for the browser to apply styles and decode any base64 images
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const canvas = await html2canvas(element, { scale: 1.5, useCORS: true });
      // Compress the image heavily as a JPEG instead of a massive PNG
      const imgData = canvas.toDataURL('image/jpeg', 0.7);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('recruiter-feedback.pdf');

      const pdfBase64 = pdf.output('datauristring');
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfBase64,
          companyName: formData.companyName
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        alert('Warning: Generated PDF, but failed to save it to the central server.');
      }
    } catch (error) {
      console.error('Error generating PDF', error);
      alert('An error occurred while generating the PDF.');
    } finally {
      // Move it back offscreen
      element.style.top = '-9999px';
      element.style.left = '-9999px';
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="app-container">
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Feedback submitted successfully</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Thank you!</p>
          <button className="btn btn-secondary" style={{ marginTop: '2rem' }} onClick={() => window.location.reload()}>Submit Another Response</button>
        </div>
      </div>
    );
  }

  const renderRatingRow = (name, label) => (
    <tr>
      <td>{label}</td>
      <td><input type="radio" name={name} value="A" onChange={handleInputChange} /></td>
      <td><input type="radio" name={name} value="B" onChange={handleInputChange} /></td>
      <td><input type="radio" name={name} value="C" onChange={handleInputChange} /></td>
      <td><input type="radio" name={name} value="D" onChange={handleInputChange} /></td>
    </tr>
  );

  const renderYesNo = (name) => (
    <div className="radio-group">
      <label className="radio-label">
        <input type="radio" name={name} value="YES" onChange={handleInputChange} /> YES
      </label>
      <label className="radio-label">
        <input type="radio" name={name} value="NO" onChange={handleInputChange} /> NO
      </label>
    </div>
  );

  return (
    <div className="app-container">
      <div className="card">
        <div className="header">
          <img src="/logo.png?v=2" alt="NIT Rourkela Logo" />
          <h2>Career Development Centre</h2>
          <h2>National Institute of Technology Rourkela</h2>
          <p>Rourkela-769008, Odisha</p>
          <p>Phone: +91-661-2462181 | Email: hod-cdc@nitrkl.ac.in / placements@nitrkl.ac.in</p>
          <h1 style={{ marginTop: '1.5rem' }}>RECRUITER FEEDBACK</h1>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <h3 className="section-title">Recruitment Statistics</h3>
          <div className="form-group">
            <label className="form-label">Name of the Company:</label>
            <input type="text" className="form-input" name="companyName" onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Date of visit:</label>
            <input type="date" className="form-input" name="visitDate" onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Duration of visit:</label>
            <input type="text" className="form-input" name="visitDuration" onChange={handleInputChange} placeholder="e.g., 2 days" />
          </div>
          <div className="form-group">
            <label className="form-label">Concerned Company personnel:</label>
            <input type="text" className="form-input" name="personnel" onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Branches eligible:</label>
            <input type="text" className="form-input" name="branches" onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Number of students selected/shortlisted:</label>
            <input type="number" className="form-input" name="studentsSelected" onChange={handleInputChange} />
          </div>

          <h3 className="section-title">Our hospitality</h3>
          <h4 style={{ marginBottom: '1rem' }}>Travel:</h4>
          <div className="form-group">
            <label className="form-label">Did you find it convenient to travel to/in Rourkela?</label>
            {renderYesNo('travelConvenient')}
          </div>
          <div className="form-group">
            <label className="form-label">Were necessary travel arrangements made while in campus/at Rourkela?</label>
            {renderYesNo('travelArrangements')}
          </div>
          <div className="form-group">
            <label className="form-label">Please share with us, problems, if any, which you had to face during your travel.</label>
            <textarea className="form-textarea" name="travelProblems" onChange={handleInputChange}></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Was immediate action taken?</label>
            {renderYesNo('travelActionTaken')}
          </div>

          <h4 style={{ marginBottom: '1rem', marginTop: '2rem' }}>Accommodation:</h4>
          <div className="rating-legend">
            How would you rate the following? (A) Excellent/Impressive, (B) Good, (C) Satisfactory and (D) Unsatisfactory/Needs improvement, upgradation, etc.
          </div>
          <table className="rating-table">
            <thead>
              <tr>
                <th>Criteria</th>
                <th>A</th>
                <th>B</th>
                <th>C</th>
                <th>D</th>
              </tr>
            </thead>
            <tbody>
              {renderRatingRow('accFirstImpression', '1. Your first impression')}
              {renderRatingRow('accAmbience', '2. Ambience, décor, spaciousness')}
              {renderRatingRow('accFacilities', '3. Room facilities like air conditioning, TV, etc.')}
              {renderRatingRow('accSanitation', '4. Sanitation facilities and cleanliness')}
              {renderRatingRow('accServices', '5. Room services')}
              {renderRatingRow('accFood', '6. Quality of food/refreshments served during you course of stay')}
              {renderRatingRow('accWarmth', '7. The warmth and friendliness of the staff')}
            </tbody>
          </table>
          <div className="form-group">
            <label className="form-label">Please share with us, problems, if any, which you had to face during your stay.</label>
            <textarea className="form-textarea" name="stayProblems" onChange={handleInputChange}></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Was immediate action taken?</label>
            {renderYesNo('stayActionTaken')}
          </div>

          <h3 className="section-title">Your recruitment program at our campus</h3>
          <table className="rating-table">
            <thead>
              <tr>
                <th>Criteria</th>
                <th>A</th>
                <th>B</th>
                <th>C</th>
                <th>D</th>
              </tr>
            </thead>
            <tbody>
              {renderRatingRow('recTechFacilities', '1. Technical facilities available like audiovisual aid, internet facilities, etc.')}
              {renderRatingRow('recCoordination', '2. Co-ordination of the Department of training and placement')}
              {renderRatingRow('recAmbience', '3. Ambience/comfort level of the venue for PPT\'s, group discussion and interviews')}
            </tbody>
          </table>
          <div className="form-group">
            <label className="form-label">Please share with us, problems, if any, which you had to face during your stay.</label>
            <textarea className="form-textarea" name="recProblems" onChange={handleInputChange}></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Was immediate action taken?</label>
            {renderYesNo('recActionTaken')}
          </div>

          <h3 className="section-title">Our campus and students</h3>
          <table className="rating-table">
            <thead>
              <tr>
                <th>Criteria</th>
                <th>A</th>
                <th>B</th>
                <th>C</th>
                <th>D</th>
              </tr>
            </thead>
            <tbody>
              {renderRatingRow('camArena', '1. Campus arena and the infrastructure at hand')}
              {renderRatingRow('camCapital', '2. Intellectual capital')}
            </tbody>
          </table>
          <div className="form-group">
            <label className="form-label">Please comment on any quality of the students shortlisted/selected by your recruitment process that you found to be impressive:</label>
            <textarea className="form-textarea" name="impressiveQualities" onChange={handleInputChange}></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Please comment on areas where the students have a scope for improvement/any quality which is highly essential to be improved and worked upon:</label>
            <textarea className="form-textarea" name="areasForImprovement" onChange={handleInputChange}></textarea>
          </div>

          <h3 className="section-title">General Review</h3>
          <div className="form-group">
            <label className="form-label">Overall comments/suggestions:</label>
            <textarea className="form-textarea" name="overallComments" onChange={handleInputChange}></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Would you like to visit our campus again?</label>
            {renderYesNo('visitAgain')}
          </div>

          <div className="form-group" style={{ marginTop: '2rem' }}>
            <label className="form-label">Signature of Recruiter:</label>
            <div className="signature-container">
              <SignatureCanvas 
                ref={signatureRef} 
                penColor="black"
                canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }} 
                onEnd={saveSignature}
              />
            </div>
            <button type="button" className="btn btn-secondary" onClick={clearSignature}>Clear Signature</button>
          </div>

          <div className="submit-container">
            <button type="button" className="btn btn-primary" onClick={generatePDF} disabled={isSubmitting}>
              <Download size={20} /> {isSubmitting ? 'Submitting...' : 'Submit & Download PDF'}
            </button>
          </div>
        </form>
      </div>


      {/* Printable PDF Layout (Visually hidden but rendered for html2canvas) */}
      <div id="pdf-content" ref={pdfContentRef} style={{ width: '800px', padding: '40px', backgroundColor: 'white', color: 'black', fontFamily: '"Times New Roman", Times, serif', position: 'absolute', top: '-9999px', left: '-9999px', fontSize: '14px', lineHeight: '1.5' }}>
        
        {/* Letterhead */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
          <img src="/logo.png?v=2" alt="NIT Rourkela Logo" style={{ width: '80px', height: '80px', marginRight: '20px' }} />
          <div style={{ textAlign: 'center', flexGrow: 1 }}>
            <h1 style={{ margin: '0', fontSize: '24px', textTransform: 'uppercase' }}>National Institute of Technology Rourkela</h1>
            <h2 style={{ margin: '5px 0', fontSize: '18px' }}>Career Development Centre</h2>
            <h3 style={{ margin: '0', fontSize: '16px', textDecoration: 'underline' }}>Recruiter's Feedback Form</h3>
          </div>
        </div>

        {/* Basic Info Table */}
        <div style={{ fontSize: '13px' }}>
          <h3 style={{ textDecoration: 'underline', fontSize: '15px' }}>Recruitment Statistics:</h3>
          <p style={{ margin: '4px 0' }}>➢ Name of the Company: <strong>{formData.companyName}</strong></p>
          <p style={{ margin: '4px 0' }}>➢ Date of visit: <strong>{formData.visitDate}</strong></p>
          <p style={{ margin: '4px 0' }}>➢ Duration of visit: <strong>{formData.visitDuration}</strong></p>
          <p style={{ margin: '4px 0' }}>➢ Concerned Company personnel: <strong>{formData.personnel}</strong></p>
          <p style={{ margin: '4px 0' }}>➢ Branches eligible: <strong>{formData.branches}</strong></p>
          <p style={{ margin: '4px 0' }}>➢ Number of students selected/shortlisted: <strong>{formData.studentsSelected}</strong></p>
          
          <h3 style={{ textDecoration: 'underline', fontSize: '15px', marginTop: '20px' }}>Our hospitality</h3>
          <h4 style={{ textDecoration: 'underline', fontSize: '13px', margin: '10px 0 5px 0' }}>Travel:</h4>
          <p style={{ margin: '4px 0' }}>➢ Did you find it convenient to travel to/in Rourkela? <strong>{formData.travelConvenient}</strong></p>
          <p style={{ margin: '4px 0' }}>➢ Were necessary travel arrangements made while in campus/at Rourkela? <strong>{formData.travelArrangements}</strong></p>
          <p style={{ margin: '4px 0' }}>➢ Please share with us, problems, if any, which you had to face during your travel: <strong>{formData.travelProblems}</strong></p>
          <p style={{ margin: '4px 0' }}>Was immediate action taken? <strong>{formData.travelActionTaken}</strong></p>
          
          <h4 style={{ textDecoration: 'underline', fontSize: '13px', marginTop: '20px', marginBottom: '5px' }}>Accommodation:</h4>
          <p style={{ margin: '4px 0 10px 0' }}>How would you rate the following? (A) Excellent/Impressive, (B) Good, (C) Satisfactory and (D) Unsatisfactory</p>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', textAlign: 'center', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '6px', border: '1px solid black', textAlign: 'left', width: '60%' }}>Criteria</th>
                <th style={{ padding: '6px', border: '1px solid black' }}>A</th>
                <th style={{ padding: '6px', border: '1px solid black' }}>B</th>
                <th style={{ padding: '6px', border: '1px solid black' }}>C</th>
                <th style={{ padding: '6px', border: '1px solid black' }}>D</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'accFirstImpression', label: '1. Your first impression' },
                { key: 'accAmbience', label: '2. Ambience, décor, spaciousness' },
                { key: 'accFacilities', label: '3. Room facilities like air conditioning, TV, etc.' },
                { key: 'accSanitation', label: '4. Sanitation facilities and cleanliness' },
                { key: 'accServices', label: '5. Room services' },
                { key: 'accFood', label: '6. Quality of food/refreshments served' },
                { key: 'accWarmth', label: '7. The warmth and friendliness of the staff' }
              ].map((item) => (
                <tr key={item.key}>
                  <td style={{ padding: '6px', border: '1px solid black', textAlign: 'left' }}>{item.label}</td>
                  {['A', 'B', 'C', 'D'].map((rating) => (
                    <td key={rating} style={{ padding: '6px', border: '1px solid black', fontSize: '16px' }}>
                      {formData[item.key] === rating ? '☑' : '☐'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ margin: '4px 0' }}>Please share with us, problems, if any, which you had to face during your stay: <strong>{formData.stayProblems}</strong></p>
          <p style={{ margin: '4px 0' }}>Was immediate action taken? <strong>{formData.stayActionTaken}</strong></p>
          
          <div style={{ pageBreakBefore: 'always', marginTop: '30px' }}></div>
          
          <h3 style={{ textDecoration: 'underline', fontSize: '15px', marginTop: '20px' }}>Your recruitment program at our campus:</h3>
          <p style={{ margin: '4px 0 10px 0' }}>How would you rate the following? (A) Excellent/Impressive, (B) Good, (C) Satisfactory and (D) Unsatisfactory</p>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', textAlign: 'center', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '6px', border: '1px solid black', textAlign: 'left', width: '60%' }}>Criteria</th>
                <th style={{ padding: '6px', border: '1px solid black' }}>A</th>
                <th style={{ padding: '6px', border: '1px solid black' }}>B</th>
                <th style={{ padding: '6px', border: '1px solid black' }}>C</th>
                <th style={{ padding: '6px', border: '1px solid black' }}>D</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'recTechFacilities', label: '1. Technical facilities available (audiovisual, internet, etc.)' },
                { key: 'recCoordination', label: '2. Co-ordination of the Department of training and placement' },
                { key: 'recAmbience', label: '3. Ambience/comfort level of the venue for PPTs, GD, interviews' }
              ].map((item) => (
                <tr key={item.key}>
                  <td style={{ padding: '6px', border: '1px solid black', textAlign: 'left' }}>{item.label}</td>
                  {['A', 'B', 'C', 'D'].map((rating) => (
                    <td key={rating} style={{ padding: '6px', border: '1px solid black', fontSize: '16px' }}>
                      {formData[item.key] === rating ? '☑' : '☐'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ margin: '4px 0' }}>Please share with us, problems, if any, which you had to face: <strong>{formData.recProblems}</strong></p>
          <p style={{ margin: '4px 0' }}>Was immediate action taken? <strong>{formData.recActionTaken}</strong></p>

          <h3 style={{ textDecoration: 'underline', fontSize: '15px', marginTop: '20px' }}>Our campus and students:</h3>
          <p style={{ margin: '4px 0 10px 0' }}>How would you rate the following?</p>
          <ul style={{ listStyleType: 'none', paddingLeft: '0', margin: '0 0 15px 0' }}>
            <li style={{ margin: '4px 0' }}>1. Campus arena and the infrastructure at hand: <strong>{formData.camArena}</strong></li>
            <li style={{ margin: '4px 0' }}>2. Intellectual capital: <strong>{formData.camCapital}</strong></li>
          </ul>
          
          <p style={{ margin: '15px 0 5px 0' }}>Please comment on any quality of the students shortlisted/selected by your recruitment process that you found to be impressive:</p>
          <div style={{ borderBottom: '1px dotted black', paddingBottom: '4px', minHeight: '20px' }}><strong>{formData.impressiveQualities}</strong></div>
          
          <p style={{ margin: '15px 0 5px 0' }}>Please comment on areas where the students have a scope for improvement / any quality which is highly essential to be improved and worked upon:</p>
          <div style={{ borderBottom: '1px dotted black', paddingBottom: '4px', minHeight: '20px' }}><strong>{formData.areasForImprovement}</strong></div>
          
          <h3 style={{ textDecoration: 'underline', fontSize: '15px', marginTop: '20px' }}>General Review:</h3>
          <p style={{ margin: '15px 0 5px 0' }}>Overall comments/suggestions:</p>
          <div style={{ borderBottom: '1px dotted black', paddingBottom: '4px', minHeight: '20px' }}><strong>{formData.overallComments}</strong></div>
          
          <p style={{ margin: '15px 0' }}>Would you like to visit our campus again? <strong>{formData.visitAgain}</strong></p>
          
        </div>

        {/* Page Break for Signatures */}
        <div style={{ pageBreakInside: 'avoid', marginTop: '50px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ margin: '0 0 5px 0' }}>Date: .......................................</p>
              <p style={{ margin: '0' }}>Place: .......................................</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '250px' }}>
              {signatureDataUrl ? (
                <img id="pdf-signature-image" src={signatureDataUrl} alt="Signature" style={{ height: '70px', width: 'auto', objectFit: 'contain', borderBottom: '1px dashed black', marginBottom: '5px' }} />
              ) : (
                <div id="pdf-signature-placeholder" style={{ width: '200px', borderBottom: '1px dashed black', height: '50px', marginBottom: '5px' }}></div>
              )}
              <div style={{ fontWeight: 'bold', paddingTop: '5px' }}>Signature of the Evaluating Person</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
