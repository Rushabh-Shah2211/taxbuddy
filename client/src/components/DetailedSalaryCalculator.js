import React, { useState, useEffect } from 'react';

const DetailedSalaryCalculator = ({ onDataChange, initialData = {} }) => {
    const [mode, setMode] = useState(initialData.detailedMode || false);
    const [employmentType, setEmploymentType] = useState(initialData.employmentType || 'Private');
    
    // Basic Salary Components
    const [basic, setBasic] = useState(initialData.basic || '');
    const [da, setDa] = useState(initialData.da || '');
    const [bonus, setBonus] = useState(initialData.bonus || '');
    
    // HRA Details
    const [hra, setHra] = useState(initialData.hra || '');
    const [rentPaid, setRentPaid] = useState(initialData.rentPaid || '');
    const [isMetro, setIsMetro] = useState(initialData.isMetro || false);
    
    // Gratuity Details
    const [gratuityReceived, setGratuityReceived] = useState(initialData.gratuity?.received || '');
    const [lastDrawnSalary, setLastDrawnSalary] = useState(initialData.gratuity?.lastDrawnSalary || '');
    const [yearsOfService, setYearsOfService] = useState(initialData.gratuity?.yearsOfService || '');
    const [coveredByAct, setCoveredByAct] = useState(initialData.gratuity?.coveredByAct || false);
    
    // Leave Encashment Details
    const [leaveReceived, setLeaveReceived] = useState(initialData.leaveEncashment?.received || '');
    const [avgSalary10M, setAvgSalary10M] = useState(initialData.leaveEncashment?.avgSalary10Months || '');
    const [earnedLeave, setEarnedLeave] = useState(initialData.leaveEncashment?.earnedLeaveBalance || '');
    
    // Pension Details
    const [uncommutedPension, setUncommutedPension] = useState(initialData.pension?.uncommuted || '');
    const [commutedReceived, setCommutedReceived] = useState(initialData.pension?.commutedReceived || '');
    const [commutationPct, setCommutationPct] = useState(initialData.pension?.commutationPercentage || '');
    const [hasGratuity, setHasGratuity] = useState(initialData.pension?.hasGratuity || false);
    
    // Perquisites
    const [perqValue, setPerqValue] = useState(initialData.perquisites?.taxableValue || '');
    
    // Other Allowances
    const [otherAllowances, setOtherAllowances] = useState(initialData.otherAllowancesTaxable || '');
    
    // Calculations
    const [hraExempt, setHraExempt] = useState(0);
    const [gratExempt, setGratExempt] = useState(0);
    const [leaveExempt, setLeaveExempt] = useState(0);
    const [pensionExempt, setPensionExempt] = useState(0);

    useEffect(() => {
        calculateExemptions();
        sendDataToParent();
    }, [basic, da, hra, rentPaid, isMetro, gratuityReceived, lastDrawnSalary, yearsOfService, 
        coveredByAct, leaveReceived, avgSalary10M, earnedLeave, uncommutedPension, 
        commutedReceived, commutationPct, hasGratuity, perqValue, otherAllowances, employmentType, mode]);

    const calculateExemptions = () => {
        const b = Number(basic) || 0;
        const isGovt = employmentType === 'Government';
        
        // HRA Exemption
        if (hra && rentPaid) {
            const hraAmt = Number(hra);
            const rent = Number(rentPaid);
            const rentOver10 = rent - (0.10 * b);
            const metroLimit = isMetro ? (0.50 * b) : (0.40 * b);
            const exempt = Math.min(hraAmt, Math.max(0, rentOver10), metroLimit);
            setHraExempt(exempt);
        } else {
            setHraExempt(0);
        }
        
        // Gratuity Exemption
        if (gratuityReceived) {
            const received = Number(gratuityReceived);
            if (isGovt) {
                setGratExempt(received);
            } else {
                const lastSal = Number(lastDrawnSalary) || 0;
                const years = Number(yearsOfService) || 0;
                const limit = 2000000;
                let formulaAmt = 0;
                
                if (coveredByAct) {
                    formulaAmt = (15 / 26) * lastSal * years;
                } else {
                    formulaAmt = 0.5 * lastSal * years;
                }
                
                const exempt = Math.min(formulaAmt, limit, received);
                setGratExempt(exempt);
            }
        } else {
            setGratExempt(0);
        }
        
        // Leave Encashment Exemption
        if (leaveReceived) {
            const received = Number(leaveReceived);
            if (isGovt) {
                setLeaveExempt(received);
            } else {
                const avg10 = Number(avgSalary10M) || 0;
                const leave = Number(earnedLeave) || 0;
                const limit = 2500000;
                
                const cashEquiv = avg10 * leave;
                const tenMonths = 10 * avg10;
                
                const exempt = Math.min(received, limit, cashEquiv, tenMonths);
                setLeaveExempt(exempt);
            }
        } else {
            setLeaveExempt(0);
        }
        
        // Pension Exemption
        if (commutedReceived) {
            const received = Number(commutedReceived);
            const pct = Number(commutationPct) || 0;
            
            if (isGovt) {
                setPensionExempt(received);
            } else {
                const totalCorpus = pct > 0 ? (received / (pct / 100)) : 0;
                let exempt = 0;
                
                if (hasGratuity) {
                    exempt = totalCorpus / 3;
                } else {
                    exempt = totalCorpus / 2;
                }
                
                setPensionExempt(Math.min(exempt, received));
            }
        } else {
            setPensionExempt(0);
        }
    };

    const sendDataToParent = () => {
        const data = {
            detailedMode: mode,
            employmentType,
            basic: Number(basic) || 0,
            da: Number(da) || 0,
            bonus: Number(bonus) || 0,
            hra: Number(hra) || 0,
            rentPaid: Number(rentPaid) || 0,
            isMetro,
            gratuity: {
                received: Number(gratuityReceived) || 0,
                lastDrawnSalary: Number(lastDrawnSalary) || 0,
                yearsOfService: Number(yearsOfService) || 0,
                coveredByAct
            },
            leaveEncashment: {
                received: Number(leaveReceived) || 0,
                avgSalary10Months: Number(avgSalary10M) || 0,
                earnedLeaveBalance: Number(earnedLeave) || 0,
                yearsOfService: Number(yearsOfService) || 0
            },
            pension: {
                uncommuted: Number(uncommutedPension) || 0,
                commutedReceived: Number(commutedReceived) || 0,
                commutationPercentage: Number(commutationPct) || 0,
                hasGratuity
            },
            perquisites: {
                taxableValue: Number(perqValue) || 0
            },
            otherAllowancesTaxable: Number(otherAllowances) || 0
        };
        
        if (onDataChange) onDataChange(data);
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '6px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#555'
    };

    const sectionStyle = {
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px'
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '25px',
                borderRadius: '15px',
                color: 'white',
                marginBottom: '30px'
            }}>
                <h2 style={{ margin: '0 0 10px' }}>💼 Detailed Salary Calculator</h2>
                <p style={{ margin: 0, opacity: 0.9 }}>
                    Calculate exemptions for HRA, Gratuity, Leave Encashment, Pension & Perquisites
                </p>
            </div>

            <div style={sectionStyle}>
                <label style={labelStyle}>Calculation Mode</label>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <button
                        onClick={() => setMode(false)}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: !mode ? '#667eea' : 'white',
                            color: !mode ? 'white' : '#333',
                            border: '2px solid #667eea',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Simple Mode
                    </button>
                    <button
                        onClick={() => setMode(true)}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: mode ? '#667eea' : 'white',
                            color: mode ? 'white' : '#333',
                            border: '2px solid #667eea',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Detailed Mode
                    </button>
                </div>

                <label style={labelStyle}>Employment Type</label>
                <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    style={inputStyle}
                >
                    <option value="Private">Private Sector</option>
                    <option value="Government">Government/PSU</option>
                </select>
            </div>

            {!mode ? (
                <div style={sectionStyle}>
                    <h3 style={{ marginTop: 0 }}>📊 Simple Salary Input</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={labelStyle}>Basic Salary (Annual)</label>
                            <input
                                type="number"
                                value={basic}
                                onChange={(e) => setBasic(e.target.value)}
                                placeholder="₹"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>HRA Received</label>
                            <input
                                type="number"
                                value={hra}
                                onChange={(e) => setHra(e.target.value)}
                                placeholder="₹"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Bonus</label>
                            <input
                                type="number"
                                value={bonus}
                                onChange={(e) => setBonus(e.target.value)}
                                placeholder="₹"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Other Allowances</label>
                            <input
                                type="number"
                                value={otherAllowances}
                                onChange={(e) => setOtherAllowances(e.target.value)}
                                placeholder="₹"
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div style={sectionStyle}>
                        <h3 style={{ marginTop: 0 }}>💰 Basic Components</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={labelStyle}>Basic Salary (Annual)</label>
                                <input type="number" value={basic} onChange={(e) => setBasic(e.target.value)} 
                                       placeholder="₹" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Dearness Allowance (DA)</label>
                                <input type="number" value={da} onChange={(e) => setDa(e.target.value)} 
                                       placeholder="₹" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Bonus</label>
                                <input type="number" value={bonus} onChange={(e) => setBonus(e.target.value)} 
                                       placeholder="₹" style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <h3 style={{ marginTop: 0 }}>🏠 HRA Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={labelStyle}>HRA Received</label>
                                <input type="number" value={hra} onChange={(e) => setHra(e.target.value)} 
                                       placeholder="₹" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Rent Paid (Annual)</label>
                                <input type="number" value={rentPaid} onChange={(e) => setRentPaid(e.target.value)} 
                                       placeholder="₹" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        checked={isMetro}
                                        onChange={(e) => setIsMetro(e.target.checked)}
                                        style={{ width: 'auto' }}
                                    />
                                    Living in Metro City (Mumbai, Delhi, Kolkata, Chennai)
                                </label>
                            </div>
                        </div>
                        {hraExempt > 0 && (
                            <div style={{
                                marginTop: '15px',
                                padding: '12px',
                                background: '#e8f5e9',
                                borderRadius: '8px',
                                color: '#2e7d32',
                                fontWeight: 'bold'
                            }}>
                                ✓ HRA Exemption: ₹{hraExempt.toLocaleString()} | Taxable: ₹{((Number(hra) || 0) - hraExempt).toLocaleString()}
                            </div>
                        )}
                    </div>

                    <div style={sectionStyle}>
                        <h3 style={{ marginTop: 0 }}>💎 Gratuity</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={labelStyle}>Gratuity Received</label>
                                <input type="number" value={gratuityReceived} 
                                       onChange={(e) => setGratuityReceived(e.target.value)} 
                                       placeholder="₹" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Last Drawn Salary (Monthly)</label>
                                <input type="number" value={lastDrawnSalary} 
                                       onChange={(e) => setLastDrawnSalary(e.target.value)} 
                                       placeholder="₹" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Years of Service</label>
                                <input type="number" value={yearsOfService} 
                                       onChange={(e) => setYearsOfService(e.target.value)} 
                                       placeholder="Years" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        checked={coveredByAct}
                                        onChange={(e) => setCoveredByAct(e.target.checked)}
                                        style={{ width: 'auto' }}
                                    />
                                    Covered under Payment of Gratuity Act
                                </label>
                            </div>
                        </div>
                        {gratExempt > 0 && (
                            <div style={{
                                marginTop: '15px',
                                padding: '12px',
                                background: '#e8f5e9',
                                borderRadius: '8px',
                                color: '#2e7d32',
                                fontWeight: 'bold'
                            }}>
                                ✓ Gratuity Exemption: ₹{gratExempt.toLocaleString()} | Taxable: ₹{((Number(gratuityReceived) || 0) - gratExempt).toLocaleString()}
                            </div>
                        )}
                    </div>

                    <div style={sectionStyle}>
                        <h3 style={{ marginTop: 0 }}>🌴 Leave Encashment</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={labelStyle}>Amount Received</label>
                                <input type="number" value={leaveReceived} 
                                       onChange={(e) => setLeaveReceived(e.target.value)} 
                                       placeholder="₹" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Avg Salary (Last 10 Months)</label>
                                <input type="number" value={avgSalary10M} 
                                       onChange={(e) => setAvgSalary10M(e.target.value)} 
                                       placeholder="₹" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Earned Leave Balance (Days)</label>
                                <input type="number" value={earnedLeave} 
                                       onChange={(e) => setEarnedLeave(e.target.value)} 
                                       placeholder="Days" style={inputStyle} />
                            </div>
                        </div>
                        {leaveExempt > 0 && (
                            <div style={{
                                marginTop: '15px',
                                padding: '12px',
                                background: '#e8f5e9',
                                borderRadius: '8px',
                                color: '#2e7d32',
                                fontWeight: 'bold'
                            }}>
                                ✓ Leave Encashment Exemption: ₹{leaveExempt.toLocaleString()} | Taxable: ₹{((Number(leaveReceived) || 0) - leaveExempt).toLocaleString()}
                            </div>
                        )}
                    </div>

                    <div style={sectionStyle}>
                        <h3 style={{ marginTop: 0 }}>👴 Pension</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={labelStyle}>Uncommuted Pension (Monthly)</label>
                                <input type="number" value={uncommutedPension} 
                                       onChange={(e) => setUncommutedPension(e.target.value)} 
                                       placeholder="₹/month" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Commuted Pension Received</label>
                                <input type="number" value={commutedReceived} 
                                       onChange={(e) => setCommutedReceived(e.target.value)} 
                                       placeholder="₹" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Commutation % of Total Pension</label>
                                <input type="number" value={commutationPct} 
                                       onChange={(e) => setCommutationPct(e.target.value)} 
                                       placeholder="%" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        checked={hasGratuity}
                                        onChange={(e) => setHasGratuity(e.target.checked)}
                                        style={{ width: 'auto' }}
                                    />
                                    Received Gratuity
                                </label>
                            </div>
                        </div>
                        {pensionExempt > 0 && (
                            <div style={{
                                marginTop: '15px',
                                padding: '12px',
                                background: '#e8f5e9',
                                borderRadius: '8px',
                                color: '#2e7d32',
                                fontWeight: 'bold'
                            }}>
                                ✓ Commuted Pension Exemption: ₹{pensionExempt.toLocaleString()} | Taxable: ₹{((Number(commutedReceived) || 0) - pensionExempt).toLocaleString()}
                            </div>
                        )}
                    </div>

                    <div style={sectionStyle}>
                        <h3 style={{ marginTop: 0 }}>🚗 Perquisites & Other Allowances</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={labelStyle}>Perquisites (Taxable Value)</label>
                                <input type="number" value={perqValue} 
                                       onChange={(e) => setPerqValue(e.target.value)} 
                                       placeholder="₹" style={inputStyle} />
                                <small style={{ color: '#666', fontSize: '12px' }}>
                                    (Company car, free accommodation, etc.)
                                </small>
                            </div>
                            <div>
                                <label style={labelStyle}>Other Taxable Allowances</label>
                                <input type="number" value={otherAllowances} 
                                       onChange={(e) => setOtherAllowances(e.target.value)} 
                                       placeholder="₹" style={inputStyle} />
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px',
                borderRadius: '12px',
                color: 'white',
                marginTop: '30px'
            }}>
                <h3 style={{ margin: '0 0 15px' }}>📊 Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                    <div>Total Exemptions:</div>
                    <div style={{ fontWeight: 'bold' }}>
                        ₹{(hraExempt + gratExempt + leaveExempt + pensionExempt).toLocaleString()}
                    </div>
                    <div>HRA Exempt:</div>
                    <div>₹{hraExempt.toLocaleString()}</div>
                    <div>Gratuity Exempt:</div>
                    <div>₹{gratExempt.toLocaleString()}</div>
                    <div>Leave Encashment Exempt:</div>
                    <div>₹{leaveExempt.toLocaleString()}</div>
                    <div>Pension Exempt:</div>
                    <div>₹{pensionExempt.toLocaleString()}</div>
                </div>
            </div>
        </div>
    );
};

export default DetailedSalaryCalculator;