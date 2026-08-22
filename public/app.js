
        const appState = {
            agentName: 'Detektif Agi',
            agentGroup: 'Tim Kompos Hijau',
            agentDate: new Date().toISOString().split('T')[0],
            
            // TKP 1: Kompos (EPA WARM Composting)
            tkp1: {
                type: '',
                grams: 0,
                smell: '',
                weeks: 4,
                avoidedEmissions: 0,
                score: 0
            },

            // TKP 2: Biowash (EPA Organics Valorization)
            tkp2: {
                type: '',
                grams: 0,
                uses: [],
                avoidedEmissions: 0,
                score: 0
            },

            // TKP 3: Upcycle Plastic (EPA WARM LDPE)
            tkp3: {
                type: '',
                item: '',
                sheets: 0,
                shockText: '',
                avoidedEmissions: 0,
                score: 0
            },

            // TKP 4: Transport & Footprint (EPA GHG Hub 2024)
            tkp4: {
                mode: '',
                km: 0,
                kwh: 0,
                predictedSource: '',
                actualEmissions: 0,
                score: 0
            },

            // TKP 5: Reflection
            tkp5: {
                favoriteTkp: '',
                favoriteReason: '',
                realization: '',
                commitment: 'Mulai pilah sampah dari dapur rumah!',
                score: 5
            }
        };

        let toastTimeout;
        function showToast(message, icon = '✨') {
            const toastEl = document.getElementById('toastNotification');
            const msgEl = document.getElementById('toastMessage');
            const iconEl = document.getElementById('toastIcon');

            if (!toastEl || !msgEl || !iconEl) return;

            msgEl.innerText = message;
            iconEl.innerText = icon;

            toastEl.classList.remove('translate-y-[-100px]', 'opacity-0', 'pointer-events-none');
            toastEl.classList.add('translate-y-0', 'opacity-100');

            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                toastEl.classList.add('translate-y-[-100px]', 'opacity-0', 'pointer-events-none');
                toastEl.classList.remove('translate-y-0', 'opacity-100');
            }, 3500);
        }

        window.onload = function() {
            document.getElementById('agentDate').value = appState.agentDate;
            calculateScoresInternal();
            updateReportCard();
        };

        function switchTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(el => {
                el.classList.add('hidden');
                el.classList.remove('block');
            });
            
            const target = document.getElementById(tabId);
            if (target) {
                target.classList.remove('hidden');
                target.classList.add('block');
            }

            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('bg-brandOrange', 'text-white', 'shadow');
                btn.classList.add('bg-slate-100', 'text-slate-600');
            });

            const activeNavBtn = document.getElementById('nav-' + tabId);
            if (activeNavBtn) {
                activeNavBtn.classList.remove('bg-slate-100', 'text-slate-600');
                activeNavBtn.classList.add('bg-brandOrange', 'text-white', 'shadow');
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function saveAgentProfile() {
            const name = document.getElementById('agentName').value.trim();
            const group = document.getElementById('agentGroup').value.trim();
            const date = document.getElementById('agentDate').value;

            if (name) appState.agentName = name;
            if (group) appState.agentGroup = group;
            if (date) appState.agentDate = date;

            updateReportCard();
            showToast('Profil Detektif Berhasil Disimpan!', '🔎');
            switchTab('tab-tkp1');
        }

        function calculateTKP1() {
            const grams = parseFloat(document.getElementById('tkp1_grams').value) || 0;
            const kg = grams / 1000;
            // EPA WARM v15 Food Waste Composting net avoidance factor: 0.55 kg CO2e / kg
            const avoided = kg * 0.41;

            appState.tkp1.grams = grams;
            appState.tkp1.avoidedEmissions = avoided;
            appState.tkp1.score = grams > 0 ? 5 : 0;

            document.getElementById('tkp1_reduction_display').innerText = avoided.toFixed(2);
            document.getElementById('layerWeightText').innerText = grams;

            calculateScoresInternal();
        }

        function saveTKP1() {
            appState.tkp1.type = document.getElementById('tkp1_type').value;
            appState.tkp1.smell = document.getElementById('tkp1_smell').value;
            appState.tkp1.weeks = parseInt(document.getElementById('tkp1_weeks').value) || 4;
            updateReportCard();
        }

        function calculateTKP2() {
            const grams = parseFloat(document.getElementById('tkp2_grams').value) || 0;
            
            const water = Math.round(grams * (10 / 3));
            const sugar = Math.round(grams / 3);

            document.getElementById('ratioAir').innerText = water;
            document.getElementById('ratioGula').innerText = sugar;
            document.getElementById('ratioBahan').innerText = grams;

            const kg = grams / 1000;
            // EPA Organics Valorization / Surfactant Offset factor: 0.61 kg CO2e / kg
            const avoided = kg * 0.17;

            appState.tkp2.grams = grams;
            appState.tkp2.avoidedEmissions = avoided;
            appState.tkp2.score = grams > 0 ? 4 : 0;

            document.getElementById('tkp2_reduction_display').innerText = avoided.toFixed(2);
            calculateScoresInternal();
        }

        function saveTKP2() {
            appState.tkp2.type = document.getElementById('tkp2_type').value;
            
            const selectedUses = [];
            document.querySelectorAll('input[name="biowash_use"]:checked').forEach(chk => {
                selectedUses.push(chk.value);
            });
            appState.tkp2.uses = selectedUses;

            updateReportCard();
        }

        function calculateTKP3() {
            const sheets = parseFloat(document.getElementById('tkp3_sheets').value) || 0;
            // EPA WARM LDPE Recycling factor: 2.8 kg CO2e / kg plastic (~0.0056 kg CO2e / sheet of 2g)
            const avoided = sheets * 0.0056;

            appState.tkp3.sheets = sheets;
            appState.tkp3.avoidedEmissions = avoided;
            appState.tkp3.score = sheets > 0 ? 4 : 0;

            document.getElementById('tkp3_reduction_display').innerText = avoided.toFixed(2);
            calculateScoresInternal();
        }

        function saveTKP3() {
            appState.tkp3.type = document.getElementById('tkp3_type').value;
            appState.tkp3.item = document.getElementById('tkp3_item_type').value;
            appState.tkp3.shockText = document.getElementById('tkp3_shock').value;
            updateReportCard();
        }

        function calculateTKP4() {
            const mode = document.getElementById('tkp4_mode').value;
            const km = parseFloat(document.getElementById('tkp4_km').value) || 0;
            const kwh = parseFloat(document.getElementById('tkp4_kwh').value) || 0;

            // EPA GHG Emission Factors Hub (2024) in kg CO2e / km
            const factors = {
                motor: 0.23339,         // EPA Passenger Motorcycle: 0.178 kg CO2e/mile = 0.111 kg CO2e/km
                mobil: 0.18558,         // EPA Passenger Gasoline Car: 0.330 kg CO2e/mile = 0.205 kg CO2e/km
                bus: 0.04142,           // EPA Transit Bus: 0.089 kg CO2e/p-mile = 0.055 kg CO2e/p-km
                krl: 0.075,           // EPA Commuter Rail: 0.121 kg CO2e/p-mile = 0.075 kg CO2e/p-km
                ev: 0.052,            // EPA Electric Vehicle Average lifecycle
                jalan_sepeda: 0.000
            };

            const transportEmission = km * (factors[mode] || 0);
            const electricityEmission = kwh * 0.85; // Grid average baseline

            const totalEmission = transportEmission + electricityEmission;

            appState.tkp4.mode = mode;
            appState.tkp4.km = km;
            appState.tkp4.kwh = kwh;
            appState.tkp4.actualEmissions = totalEmission;
            appState.tkp4.score = (km > 0 || mode) ? 4 : 0;

            document.getElementById('tkp4_emission_display').innerText = totalEmission.toFixed(2);

            const selectedRadio = document.querySelector('input[name="prediction_source"]:checked');
            const predicted = selectedRadio ? selectedRadio.value : 'Belum dipilih';
            appState.tkp4.predictedSource = predicted;

            let actualHighest = 'Perjalanan';
            if (electricityEmission > transportEmission && electricityEmission > 0) {
                actualHighest = 'Listrik';
            }

            document.getElementById('hypoPredicted').innerText = predicted;
            document.getElementById('hypoActual').innerText = mode ? actualHighest : '-';

            const verdictEl = document.getElementById('hypoVerdict');
            if (!selectedRadio || !mode) {
                verdictEl.className = "mt-2 font-black text-center text-xs text-slate-600 bg-slate-100 p-1.5 rounded-lg";
                verdictEl.innerText = "🔍 Pilih mode transportasi & dugaanku dulu ya!";
            } else if (predicted === actualHighest) {
                verdictEl.className = "mt-2 font-black text-center text-sm text-emerald-700 bg-emerald-100 p-1.5 rounded-lg";
                verdictEl.innerText = "🎉 Dugaanku BENAR!";
            } else {
                verdictEl.className = "mt-2 font-black text-center text-sm text-amber-700 bg-amber-100 p-1.5 rounded-lg";
                verdictEl.innerText = "🕵️ SALAH (Tapi dapet insight baru!)";
            }

            calculateScoresInternal();
        }

        function saveTKP4() {
            calculateTKP4();
            updateReportCard();
        }

        function calculateScoresInternal() {
            const favSelected = document.getElementById('tkp_favorite').value;
            const commitmentVal = document.getElementById('tkp_commitment').value;
            appState.tkp5.score = (favSelected && commitmentVal) ? 5 : 3;

            const totalScore = appState.tkp1.score + appState.tkp2.score + appState.tkp3.score + appState.tkp4.score + appState.tkp5.score;
            document.getElementById('posterScore').innerText = `${totalScore} / 22`;
        }

        function updateReportCard() {
            document.getElementById('posterAgentName').innerText = appState.agentName || 'Detektif Agi';
            document.getElementById('posterAgentGroup').innerText = appState.agentGroup || 'Tim Hijau';
            document.getElementById('posterAgentDate').innerText = appState.agentDate || new Date().toISOString().split('T')[0];

            const totalAvoided = appState.tkp1.avoidedEmissions + appState.tkp2.avoidedEmissions + appState.tkp3.avoidedEmissions;
            const totalEmitted = appState.tkp4.actualEmissions;

            document.getElementById('posterEmitted').innerText = totalEmitted.toFixed(2);
            document.getElementById('posterAvoided').innerText = totalAvoided.toFixed(2);

            document.getElementById('posterTkp1Details').innerText = `${appState.tkp1.grams}g (~${appState.tkp1.avoidedEmissions.toFixed(2)} kg CO₂e)`;
            document.getElementById('posterTkp2Details').innerText = `${appState.tkp2.grams}g (~${appState.tkp2.avoidedEmissions.toFixed(2)} kg CO₂e)`;
            document.getElementById('posterTkp3Details').innerText = `${appState.tkp3.sheets} lembar (~${appState.tkp3.avoidedEmissions.toFixed(2)} kg CO₂e)`;

            const favTkp = document.getElementById('tkp_favorite').value || 'Belum dipilih';
            const commitment = document.getElementById('tkp_commitment').value || 'Mulai aksi hijau dari diri sendiri!';

            appState.tkp5.favoriteTkp = favTkp;
            appState.tkp5.commitment = commitment;

            document.getElementById('posterFavTkp').innerText = favTkp;
            document.getElementById('posterCommitment').innerText = commitment;

            calculateScoresInternal();
        }

        function downloadPosterImage() {
            const card = document.getElementById('reportPosterCard');
            const scoreBox = document.getElementById('posterScoreBox');

            if (typeof html2canvas === 'undefined') {
                showToast('Library pemproses gambar belum siap. Coba lagi.', '⚠️');
                return;
            }

            calculateScoresInternal();

            if (scoreBox) {
                scoreBox.classList.remove('hidden');
            }

            showToast('Memproses & Mengunduh Poster Laporan...', '📸');

            saveSubmissionToCloud();

            html2canvas(card, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#fffef9'
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `Laporan-Detektif-Karbon-${appState.agentName.replace(/\s+/g, '_')}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                
                if (scoreBox) {
                    scoreBox.classList.add('hidden');
                }
                
                showToast('Poster laporan berhasil diunduh beserta skor kamu!', '🎉');
            }).catch(err => {
                if (scoreBox) {
                    scoreBox.classList.add('hidden');
                }
                showToast('Gagal memproses gambar poster.', '⚠️');
            });
        }

        function copyShareText() {
            const totalAvoided = (appState.tkp1.avoidedEmissions + appState.tkp2.avoidedEmissions + appState.tkp3.avoidedEmissions).toFixed(2);
            const textToCopy = `🔍 LAPORAN DETEKTIF JEJAK KARBON (EPA Standard) 🔍\n` +
                `Agen: ${appState.agentName} (${appState.agentGroup})\n` +
                `🌱 Total Emisi Dicegah: ${totalAvoided} kg CO2e!\n` +
                `🔥 Komitmenku: "${appState.tkp5.commitment}"\n\n` +
                `CC: @artasaloka @banksampahakkom @carbonacademy.id @carbonaddons.id\n` +
                `#GreenImpactJourney #PamerkanTemuanmu #DetektifKarbon`;

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showToast("Teks Laporan disalin ke clipboard! Siap dipost 📸", "📋");
                }).catch(() => {
                    fallbackCopyText(textToCopy);
                });
            } else {
                fallbackCopyText(textToCopy);
            }
        }

        function fallbackCopyText(text) {
            const dummy = document.createElement("textarea");
            document.body.appendChild(dummy);
            dummy.value = text;
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
            showToast("Teks Laporan disalin ke clipboard! Siap dipost 📸", "📋");
        }

        function openScientificModal() {
            document.getElementById('scientificModal').classList.remove('hidden');
        }

        function closeScientificModal() {
            document.getElementById('scientificModal').classList.add('hidden');
        }

        async function saveSubmissionToCloud() {
    const payload = buildSubmissionPayload();
    try {
        const response = await fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        localStorage.setItem('carbonDetektif:lastSubmissionId', result.id);
        showToast('Data investigasi tersimpan di server!', '☁️');
        return result;
    } catch (err) {
        console.error('Gagal menyimpan ke server:', err);
        showToast('Server tidak tersedia. Data tetap disimpan di browser.', '💾');
        return null;
    }
}

function buildSubmissionPayload() {
    calculateScoresInternal();
    return {
        agentName: appState.agentName,
        agentGroup: appState.agentGroup,
        agentDate: appState.agentDate,
        totalScore: appState.tkp1.score + appState.tkp2.score + appState.tkp3.score + appState.tkp4.score + appState.tkp5.score,
        totalAvoidedCO2e: Number((appState.tkp1.avoidedEmissions + appState.tkp2.avoidedEmissions + appState.tkp3.avoidedEmissions).toFixed(3)),
        totalEmittedCO2e: Number(appState.tkp4.actualEmissions.toFixed(3)),
        favoriteTKP: appState.tkp5.favoriteTkp,
        favoriteReason: document.getElementById('tkp_favorite_reason')?.value || '',
        realization: document.getElementById('tkp_realization')?.value || '',
        commitment: appState.tkp5.commitment,
        tkp1: { ...appState.tkp1 },
        tkp2: { ...appState.tkp2 },
        tkp3: { ...appState.tkp3 },
        tkp4: { ...appState.tkp4 },
        clientVersion: '2.0.0'
    };
}

function persistLocalState() {
    try {
        localStorage.setItem('carbonDetektif:state', JSON.stringify(appState));
    } catch (err) {
        console.warn('LocalStorage tidak tersedia:', err);
    }
}

function restoreLocalState() {
    try {
        const raw = localStorage.getItem('carbonDetektif:state');
        if (!raw) return false;
        const saved = JSON.parse(raw);
        Object.assign(appState, saved);
        for (const key of ['tkp1','tkp2','tkp3','tkp4','tkp5']) {
            if (saved[key]) Object.assign(appState[key], saved[key]);
        }
        setValue('agentName', appState.agentName);
        setValue('agentGroup', appState.agentGroup);
        setValue('agentDate', appState.agentDate);
        setValue('tkp1_type', appState.tkp1.type);
        setValue('tkp1_grams', appState.tkp1.grams);
        setValue('tkp1_smell', appState.tkp1.smell);
        setValue('tkp1_weeks', appState.tkp1.weeks);
        setValue('tkp2_type', appState.tkp2.type);
        setValue('tkp2_grams', appState.tkp2.grams);
        setValue('tkp3_type', appState.tkp3.type);
        setValue('tkp3_item_type', appState.tkp3.item);
        setValue('tkp3_sheets', appState.tkp3.sheets);
        setValue('tkp3_shock', appState.tkp3.shockText);
        setValue('tkp4_mode', appState.tkp4.mode);
        setValue('tkp4_km', appState.tkp4.km);
        setValue('tkp4_kwh', appState.tkp4.kwh);
        setValue('tkp_favorite', appState.tkp5.favoriteTkp);
        setValue('tkp_favorite_reason', appState.tkp5.favoriteReason);
        setValue('tkp_realization', appState.tkp5.realization);
        setValue('tkp_commitment', appState.tkp5.commitment);
        document.querySelectorAll('input[name="biowash_use"]').forEach(el => el.checked = appState.tkp2.uses.includes(el.value));
        return true;
    } catch (err) {
        console.warn('Gagal memulihkan state:', err);
        return false;
    }
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null) el.value = value;
}

function resetInvestigation() {
    if (!confirm('Reset semua data investigasi di browser?')) return;
    localStorage.removeItem('carbonDetektif:state');
    location.reload();
}

const originalSaveAgentProfile = saveAgentProfile;
const originalSaveTKP1 = saveTKP1;
const originalSaveTKP2 = saveTKP2;
const originalSaveTKP3 = saveTKP3;
const originalSaveTKP4 = saveTKP4;

saveAgentProfile = function() { originalSaveAgentProfile(); persistLocalState(); };
saveTKP1 = function() { originalSaveTKP1(); persistLocalState(); };
saveTKP2 = function() { originalSaveTKP2(); persistLocalState(); };
saveTKP3 = function() { originalSaveTKP3(); persistLocalState(); };
saveTKP4 = function() { originalSaveTKP4(); persistLocalState(); };

const originalUpdateReportCard = updateReportCard;
updateReportCard = function() {
    originalUpdateReportCard();
    persistLocalState();
};

window.addEventListener('DOMContentLoaded', () => {
    const restored = restoreLocalState();
    calculateTKP1();
    calculateTKP2();
    calculateTKP3();
    calculateTKP4();
    originalUpdateReportCard();
    if (restored) showToast('Data investigasi terakhir dipulihkan.', '↩️');

    // Keyboard accessibility for modal.
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeScientificModal();
    });
});

window.resetInvestigation = resetInvestigation;
window.buildSubmissionPayload = buildSubmissionPayload;
