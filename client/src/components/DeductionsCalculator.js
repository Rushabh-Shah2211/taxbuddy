import React, { useState, useEffect } from 'react';

const DeductionsCalculator = ({ onDataChange, initialData = {} }) => {
    const [enabled, setEnabled] = useState(initialData.enabled || false);
    const [detailedMode, setDetailedMode] = useState(initialData.detailedMode || false);

    const [sec80c, setSec80c] = useState(initialData.section80C || '');
    const [sec80d, setSec80d] = useState(initialData.section80D || '');
    const [sec80e, setSec80e] = useState(initialData.section80E || '');
    const [sec80g, setSec80g] = useState(initialData.section80G || '');
    const [sec80tta, setSec80tta] = useState(initialData.section80TTA || '');
    const [others, setOthers] = useState(initialData.otherDeductions || '');

    useEffect(() => {
        onDataChange({
            enabled, detailedMode,
            section80C: Number(sec80c),
            section80D: Number(sec80d),
            section80E: Number(sec80e),
            section80G: Number(sec80g),
            section80TTA: Number(sec80tta),
            otherDeductions: Number(others)
        });
    }, [enabled, detailedMode, sec80c, sec80d, sec80e, sec80g, sec80tta, others]);

    return (
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <label style={{fontWeight:'bold'}}>Claim Deductions?</label>
                <div>
                    <button onClick={() => setEnabled(true)} style={{ padding: '8px 20px', background: enabled ? '#28a745' : '#eee', color: enabled?'white':'black', border: '1px solid #ddd', borderRadius: '5px 0 0 5px' }}>Yes</button>
                    <button onClick={() => setEnabled(false)} style={{ padding: '8px 20px', background: !enabled ? '#dc3545' : '#eee', color: !enabled?'white':'black', border: '1px solid #ddd', borderRadius: '0 5px 5px 0' }}>No</button>
                </div>
            </div>

            {enabled && (
                <>
                    <div style={{marginBottom:'20px'}}>
                        <button onClick={()=>setDetailedMode(false)} style={{padding:'8px 15px', borderRadius:'20px', border:'1px solid #667eea', background:!detailedMode?'#667eea':'white', color:!detailedMode?'white':'#667eea', marginRight:'10px'}}>Basic (80C/80D)</button>
                        <button onClick={()=>setDetailedMode(true)} style={{padding:'8px 15px', borderRadius:'20px', border:'1px solid #667eea', background:detailedMode?'#667eea':'white', color:detailedMode?'white':'#667eea'}}>Detailed Mode</button>
                    </div>

                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                        <div>
                            <label style={{fontSize:'12px'}}>80C (LIC, PPF, ELSS)</label>
                            <input type="number" placeholder="Max 1.5L" value={sec80c} onChange={(e)=>setSec80c(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}} />
                        </div>
                        <div>
                            <label style={{fontSize:'12px'}}>80D (Health Ins.)</label>
                            <input type="number" placeholder="Premium Paid" value={sec80d} onChange={(e)=>setSec80d(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}} />
                        </div>
                        {detailedMode && (
                            <>
                                <div><label style={{fontSize:'12px'}}>80E (Education Loan)</label><input type="number" value={sec80e} onChange={(e)=>setSec80e(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}} /></div>
                                <div><label style={{fontSize:'12px'}}>80G (Donations)</label><input type="number" value={sec80g} onChange={(e)=>setSec80g(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}} /></div>
                                <div><label style={{fontSize:'12px'}}>80TTA (Savings Int.)</label><input type="number" value={sec80tta} onChange={(e)=>setSec80tta(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}} /></div>
                                <div><label style={{fontSize:'12px'}}>Other Deductions</label><input type="number" value={others} onChange={(e)=>setOthers(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}} /></div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default DeductionsCalculator;