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
          <img src="/logo.jpg" alt="NIT Rourkela Logo" />
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

      {/* Hidden layout for PDF Generation */}
      <div id="pdf-content" ref={pdfContentRef} style={{ width: '800px', padding: '40px', backgroundColor: 'white', color: 'black', fontFamily: 'serif' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: '80px', display: 'block', margin: '0 auto 10px' }} />
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Career Development Centre</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>National Institute of Technology Rourkela</div>
          <div style={{ fontSize: '12px' }}>Rourkela-769008, Odisha</div>
          <div style={{ fontSize: '12px' }}>Phone: +91-661-2462181</div>
          <div style={{ fontSize: '12px' }}>Email: hod-cdc@nitrkl.ac.in / placements@nitrkl.ac.in</div>
          <h2 style={{ fontSize: '16px', margin: '20px 0', textDecoration: 'underline' }}>RECRUITER FEEDBACK</h2>
        </div>

        <div style={{ fontSize: '12px' }}>
          <h3 style={{ textDecoration: 'underline', fontSize: '14px' }}>Recruitment Statistics:</h3>
          <p>➢ Name of the Company: <strong>{formData.companyName}</strong></p>
          <p>➢ Date of visit: <strong>{formData.visitDate}</strong></p>
          <p>➢ Duration of visit: <strong>{formData.visitDuration}</strong></p>
          <p>➢ Concerned Company personnel: <strong>{formData.personnel}</strong></p>
          <p>➢ Branches eligible: <strong>{formData.branches}</strong></p>
          <p>➢ Number of students selected/shortlisted: <strong>{formData.studentsSelected}</strong></p>
          
          <h3 style={{ textDecoration: 'underline', fontSize: '14px', marginTop: '20px' }}>Our hospitality</h3>
          <h4 style={{ textDecoration: 'underline', fontSize: '12px' }}>Travel:</h4>
          <p>➢ Did you find it convenient to travel to/in Rourkela? ({formData.travelConvenient || '   '})</p>
          <p>➢ Were necessary travel arrangements made while in campus/at Rourkela? ({formData.travelArrangements || '   '})</p>
          <p>➢ Please share with us, problems, if any, which you had to face during your travel: {formData.travelProblems}</p>
          <p>Was immediate action taken? ({formData.travelActionTaken || '   '})</p>
          
          <h4 style={{ textDecoration: 'underline', fontSize: '12px', marginTop: '15px' }}>Accommodation:</h4>
          <p>How would you rate the following? (A) Excellent/Impressive, (B) Good, (C) Satisfactory and (D) Unsatisfactory/Needs improvement, upgradation, etc.</p>
          <ol style={{ paddingLeft: '20px' }}>
            <li>Your first impression: <strong>{formData.accFirstImpression}</strong></li>
            <li>Ambience, décor, spaciousness: <strong>{formData.accAmbience}</strong></li>
            <li>Room facilities like air conditioning, TV, etc.: <strong>{formData.accFacilities}</strong></li>
            <li>Sanitation facilities and cleanliness: <strong>{formData.accSanitation}</strong></li>
            <li>Room services: <strong>{formData.accServices}</strong></li>
            <li>Quality of food/refreshments served during you course of stay: <strong>{formData.accFood}</strong></li>
            <li>The warmth and friendliness of the staff: <strong>{formData.accWarmth}</strong></li>
          </ol>
          <p>Please share with us, problems, if any, which you had to face during your stay: {formData.stayProblems}</p>
          <p>Was immediate action taken? ({formData.stayActionTaken || '   '})</p>
          
          <div style={{ pageBreakBefore: 'always', marginTop: '40px' }}></div>
          
          <h3 style={{ textDecoration: 'underline', fontSize: '14px' }}>Your recruitment program at our campus:</h3>
          <p>How would you rate the following? (A) Excellent/Impressive, (B) Good, (C) Satisfactory and (D) Unsatisfactory</p>
          <ol style={{ paddingLeft: '20px' }}>
            <li>Technical facilities available like audiovisual aid, internet facilities, etc.: <strong>{formData.recTechFacilities}</strong></li>
            <li>Co-ordination of the Department of training and placement: <strong>{formData.recCoordination}</strong></li>
            <li>Ambience/comfort level of the venue for PPT's, group discussion and interviews: <strong>{formData.recAmbience}</strong></li>
          </ol>
          <p>Please share with us, problems, if any, which you had to face during your stay: {formData.recProblems}</p>
          <p>Was immediate action taken? ({formData.recActionTaken || '   '})</p>
          
          <h3 style={{ textDecoration: 'underline', fontSize: '14px', marginTop: '20px' }}>Our campus and students:</h3>
          <p>How would you rate the following?</p>
          <ol style={{ paddingLeft: '20px' }}>
            <li>Campus arena and the infrastructure at hand: <strong>{formData.camArena}</strong></li>
            <li>Intellectual capital: <strong>{formData.camCapital}</strong></li>
          </ol>
          <p>Please comment on any quality of the students shortlisted/selected by your recruitment process that you found to be impressive:</p>
          <p style={{ minHeight: '40px' }}><strong>{formData.impressiveQualities}</strong></p>
          <p>Please comment on areas where the students have a scope for improvement/any quality which is highly essential to be improved and worked upon:</p>
          <p style={{ minHeight: '40px' }}><strong>{formData.areasForImprovement}</strong></p>
          
          <h3 style={{ textDecoration: 'underline', fontSize: '14px', marginTop: '20px' }}>General Review:</h3>
          <p>Overall comments/suggestions: {formData.overallComments}</p>
          <p>Would you like to visit our campus again? ({formData.visitAgain || '   '})</p>
          
          <p style={{ marginTop: '20px' }}>Thank you!</p>
          
          <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {signatureDataUrl ? (
              <img src={signatureDataUrl} alt="Signature" style={{ height: '70px', width: 'auto', objectFit: 'contain', borderBottom: '1px solid black', marginBottom: '5px' }} />
            ) : (
              <div style={{ width: '200px', borderBottom: '1px solid black', height: '50px', marginBottom: '5px' }}></div>
            )}
            <div style={{ paddingRight: '20px' }}>Signature of Recruiter</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
