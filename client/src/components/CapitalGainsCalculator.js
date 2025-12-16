import React, { useState, useEffect } from 'react';

const CapitalGainsCalculator = ({ onDataChange, initialData = {} }) => {
    const [enabled, setEnabled] = useState(initialData.enabled || false);
    const [assetType, setAssetType] = useState('Shares'); // Shares, Property, Other
    
    // SHARES
    const [stcg111a, setStcg111a] = useState(initialData.shares?.stcg111a || '');
    const [ltcg112a, setLtcg112a] = useState(initialData.shares?.ltcg112a || '');
    
    // PROPERTY
    const [propLtcg, setPropLtcg] = useState(initialData.property?.ltcg || '');
    const [propStcg, setPropStcg] = useState(initialData.property?.stcg || '');
    
    // OTHER
    const [otherGain, setOtherGain] = useState(initialData.other || '');

    useEffect(() => {
        const data = {
            enabled,
            shares: { stcg111a: Number(stcg111a), ltcg112a: Number(ltcg112a) },
            property: { ltcg: Number(propLtcg), stcg: Number(propStcg) },
            other: Number(otherGain)
        };
        onDataChange(data);
    }, [enabled, stcg111a, ltcg112a, propLtcg, propStcg, otherGain]);

    return (
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <label style={{fontWeight:'bold'}}>Any Capital Gains?</label>
                <div>
                    <button onClick={() => setEnabled(true)} style={{ padding: '8px 20px', background: enabled ? '#28a745' : '#eee', color: enabled?'white':'black', border: '1px solid #ddd', borderRadius: '5px 0 0 5px' }}>Yes</button>
                    <button onClick={() => setEnabled(false)} style={{ padding: '8px 20px', background: !enabled ? '#dc3545' : '#eee', color: !enabled?'white':'black', border: '1px solid #ddd', borderRadius: '0 5px 5px 0' }}>No</button>
                </div>
            </div>

            {enabled && (
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#666' }}>Nature of Asset Sold</label>
                    <select value={assetType} onChange={(e) => setAssetType(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <option value="Shares">Shares / Mutual Funds</option>
                        <option value="Property">Land / Building</option>
                        <option value="Other">Other Assets (Gold, Bonds)</option>
                    </select>

                    {assetType === 'Shares' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={{fontSize:'12px'}}>Short Term Gain (STCG - 111A)</label>
                                <input type="number" placeholder="Total Profit" value={stcg111a} onChange={(e)=>setStcg111a(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}} />
                            </div>
                            <div>
                                <label style={{fontSize:'12px'}}>Long Term Gain (LTCG - 112A)</label>
                                <input type="number" placeholder="Total Profit" value={ltcg112a} onChange={(e)=>setLtcg112a(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}} />
                            </div>
                        </div>
                    )}

                    {assetType === 'Property' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={{fontSize:'12px'}}>Long Term Gain (LTCG)</label>
                                <input type="number" placeholder="Indexed Profit" value={propLtcg} onChange={(e)=>setPropLtcg(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}} />
                            </div>
                            <div>
                                <label style={{fontSize:'12px'}}>Short Term Gain (Slab)</label>
                                <input type="number" placeholder="Net Profit" value={propStcg} onChange={(e)=>setPropStcg(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}} />
                            </div>
                        </div>
                    )}

                    {assetType === 'Other' && (
                        <div>
                            <label style={{fontSize:'12px'}}>Taxable Gain amount</label>
                            <input type="number" placeholder="Net Profit" value={otherGain} onChange={(e)=>setOtherGain(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CapitalGainsCalculator;