import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const SelfExam = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const examSteps = [
    {
      title: "Step 01: Visual Inspection (Mirror)",
      description: "Stand in front of a mirror with shoulders straight and arms on your hips. Look at your breasts. Check for typical shape, size, and skin color. Watch out for dimpling, skin puckering, changes in nipple position, or any discharge.",
      tip: "Remember that minor differences in breast size are normal for most women."
    },
    {
      title: "Step 02: Raised Arms Check",
      description: "Now, raise your arms high above your head and look for the same skin and shape changes. Observe if both breasts lift symmetrically and naturally.",
      tip: "Looking from different angles (front and sides) can help spot hidden dimples."
    },
    {
      title: "Step 03: Lying Down & Circular Palpation",
      description: "Lie down and place a pillow under your right shoulder. Use the flat pads of your 3 middle fingers on your left hand to feel your right breast. Move in small circular motions, covering the entire breast from collarbone to abdomen, and armpit to cleavage. Repeat on the other side.",
      tip: "Apply light pressure for skin surface, medium for mid-tissue, and firm pressure to feel deep tissue."
    }
  ];

  const handleNext = () => {
    if (step < examSteps.length - 1) {
      setStep(step + 1);
    } else {
      navigate('/records');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '65vh', justifyContent: 'space-between' }}>
      <div>
        <div className="masthead-row">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '500' }}>
              Self-Check 🌸
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              A friendly, clear guide taking you step-by-step through the examination methods.
            </p>
          </div>
          <div className="stamp">Guided Guide</div>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: '6px', height: '6px', backgroundColor: 'var(--paper-deep)', borderRadius: '0px', marginBottom: '24px', border: '1px solid var(--line)' }}>
          {examSteps.map((_, idx) => (
            <div key={idx} style={{
              flex: 1,
              backgroundColor: idx <= step ? 'var(--coral)' : 'transparent',
              transition: 'var(--transition-normal)'
            }} />
          ))}
        </div>

        {/* Step details card */}
        <div className="card" style={{ padding: '24px', backgroundColor: 'white', border: '1px solid var(--line)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '14px', height: '14px', backgroundColor: 'var(--mustard)', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          
          <span className="mono-label" style={{ color: 'var(--coral)', display: 'block', marginBottom: '8px' }}>
            Section {step + 1} of {examSteps.length}
          </span>
          
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--oxblood)', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>
            {examSteps[step].title}
          </h3>
          
          <p style={{ fontSize: '14.5px', color: 'var(--text-primary)', marginBottom: '20px', lineHeight: '1.6' }}>
            {examSteps[step].description}
          </p>
          
          <div style={{
            backgroundColor: 'var(--paper)',
            padding: '12px 16px',
            borderLeft: '3px solid var(--mustard)',
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            <strong>Tip:</strong> {examSteps[step].tip}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        {step > 0 && (
          <Button variant="secondary" onClick={handleBack}>
            Back
          </Button>
        )}
        <Button variant="primary" onClick={handleNext}>
          {step === examSteps.length - 1 ? 'Finish & Record Check' : 'Next Step'}
        </Button>
      </div>
    </div>
  );
};

export default SelfExam;
