// --- Settings & State ---
let timerInterval = null;
let currentCountdown = 0;
let isActive = false;
let currentUrl = location.href;

let settings = {
    waitTimeSec: 300,
    isEnabled: false,
    isCollapsed: false
};

// --- DOM Elements for Injected UI ---
let widgetContainer, timeInputEl, toggleEl, countdownEl;

// Load settings initially
chrome.storage.sync.get(['waitTimeSec', 'isEnabled', 'isCollapsed'], (res) => {
    if (res.waitTimeSec !== undefined) settings.waitTimeSec = res.waitTimeSec;
    if (res.isEnabled !== undefined) settings.isEnabled = res.isEnabled;
    if (res.isCollapsed !== undefined) settings.isCollapsed = res.isCollapsed;

    injectWidget();
    checkURLAndStart();
});

// Update settings locally and in storage
function updateSettings(newSettings) {
    settings = { ...settings, ...newSettings };
    try {
        chrome.storage.sync.set(settings);
    } catch (error) {
        console.warn('Extension context invalidated. Settings not saved permanently. Please refresh the page.');
    }
    restartTimer();
}

// Watch for URL changes (SPA navigation)
const checkUrlInterval = setInterval(() => {
    if (location.href !== currentUrl) {
        currentUrl = location.href;
        checkURLAndStart();
    }
}, 500);

// Listen for manual "Check Answer" clicks to stop the timer early
document.addEventListener('click', (e) => {
    if (!isActive) return;

    // Check if the clicked target (or its parent) is a button with text "Check Answer"
    let target = e.target;
    while (target && target.tagName !== 'BUTTON' && target !== document.body) {
        target = target.parentElement;
    }

    if (target && target.tagName === 'BUTTON' && target.textContent.trim() === 'Check Answer') {
        stopTimer();
    }
});

// --- Timer Logic ---
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    isActive = false;
    updateWidgetDisplay();
}

function startTimer() {
    stopTimer();
    if (!settings.isEnabled) {
        updateWidgetDisplay();
        return;
    }

    currentCountdown = settings.waitTimeSec;
    isActive = true;
    updateWidgetDisplay();

    timerInterval = setInterval(() => {
        currentCountdown--;
        updateWidgetDisplay();

        if (currentCountdown <= 0) {
            stopTimer();
            executeAction();
        }
    }, 1000);
}

function restartTimer() {
    startTimer();
}

function checkURLAndStart() {
    // Check if on a question path (can be customized if there's a specific pattern)
    // For now, assuming any web.getmarks.app page is a candidate if enabled
    if (currentUrl.includes('web.getmarks.app') && settings.isEnabled) {
        startTimer();
    } else {
        stopTimer();
    }
}

function executeAction() {
    // Auto-detect question type based on DOM elements
    const inputField = document.querySelector('input.question-options__input');
    const optionA = document.querySelector('div[data-type="singleCorrect"]');

    if (inputField) {
        // Integer Question
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(inputField, '1');
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
        inputField.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (optionA) {
        // MCQ Question
        optionA.click();
    }

    setTimeout(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const checkAnswerButton = buttons.find(b => b.textContent.trim() === 'Check Answer');
        if (checkAnswerButton) checkAnswerButton.click();
    }, 100);
}

// --- Injected UI Logic ---
function updateWidgetDisplay() {
    if (!countdownEl) return;

    if (isActive) {
        countdownEl.textContent = `${currentCountdown}s`;
        countdownEl.className = 'timer-active';
    } else if (!settings.isEnabled) {
        countdownEl.textContent = 'Disabled';
        countdownEl.className = 'timer-disabled';
    } else {
        countdownEl.textContent = 'Seeing Solution';
        countdownEl.className = 'timer-waiting';
    }
}

function injectWidget() {
    if (document.getElementById('gm-timer-widget')) return;

    // 1. Inject Styles
    const style = document.createElement('style');
    style.textContent = `
        #gm-timer-widget {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 260px;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0,0,0,0.05);
            padding: 20px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            z-index: 999999;
            color: #1e293b;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
        }
        
        #gm-timer-widget.gm-is-collapsed {
            width: 50px;
            height: 50px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 12px;
        }

        #gm-timer-widget.gm-is-collapsed:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }

        @keyframes fadeScaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }

        #gm-timer-widget.gm-is-collapsed #gm-expanded-view {
            display: none;
        }

        #gm-timer-widget:not(.gm-is-collapsed) #gm-expanded-view {
            animation: fadeScaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            display: block;
            width: 100%;
        }

        #gm-timer-widget:not(.gm-is-collapsed) #gm-collapsed-view {
            display: none;
        }

        #gm-collapsed-view {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #3b82f6;
        }
        
        #gm-minimize-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: #64748b;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: background 0.2s, color 0.2s;
        }

        #gm-minimize-btn:hover {
            background: #e2e8f0;
            color: #0f172a;
        }

        #gm-timer-widget:not(.gm-is-collapsed):hover {
            box-shadow: 0 14px 40px rgba(0, 0, 0, 0.12);
        }

        #gm-widget-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            border-bottom: 1px solid rgba(0,0,0,0.05);
            padding-bottom: 12px;
        }

        #gm-widget-title {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        #gm-widget-title::before {
            content: '';
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #3b82f6;
            border-radius: 50%;
        }

        .gm-input-group {
            margin-bottom: 12px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .gm-label {
            font-size: 12px;
            font-weight: 500;
            color: #64748b;
        }

        .gm-input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-sizing: border-box;
            font-size: 13px;
            background: #f8fafc;
            color: #334155;
            transition: border 0.2s, box-shadow 0.2s;
            outline: none;
        }
        
        .gm-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        #gm-status-box {
            margin-top: 16px;
            background: #f1f5f9;
            border-radius: 12px;
            padding: 12px;
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        #gm-status-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #94a3b8;
            font-weight: 600;
        }

        #gm-countdown {
            font-size: 28px;
            font-weight: 700;
            font-variant-numeric: tabular-nums;
            letter-spacing: -1px;
        }
        
        .timer-active { color: #ef4444; }
        .timer-disabled { color: #94a3b8; font-size: 18px !important; margin-top: 4px;}
        .timer-waiting { color: #f59e0b; font-size: 18px !important; margin-top: 4px;}

        /* Toggle Switch */
        .gm-switch {
            position: relative;
            display: inline-block;
            width: 36px;
            height: 20px;
        }

        .gm-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .gm-slider {
            position: absolute;
            cursor: pointer;
            top: 5px;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #cbd5e1;
            transition: .3s cubic-bezier(0.4, 0.0, 0.2, 1);
            border-radius: 20px;
        }

        .gm-slider:before {
            position: absolute;
            content: "";
            height: 11px;
            width: 16px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: .3s cubic-bezier(0.4, 0.0, 0.2, 1);
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .gm-switch input:checked + .gm-slider {
            background-color: #10b981;
        }

        .gm-switch input:checked + .gm-slider:before {
            transform: translateX(16px);
        }
        #gm-info-box{
            display: flex;
            flex-direction: column;
            gap: 4px;
            margin-bottom: 12px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 12px;
        }
        #gm-info-title{
            margin: 0;
            font-size: 15px;
            font-weight: 600;
            color: #0f172a;
        }
        #gm-info-subtitle{
            margin: 0;
            font-size: 12px;
            color: #64748b;
        }
    `;
    document.head.appendChild(style);

    // 2. Inject HTML
    widgetContainer = document.createElement('div');
    widgetContainer.id = 'gm-timer-widget';
    widgetContainer.innerHTML = `
        <div id="gm-collapsed-view" title="Expand Timer Control">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
        </div>
        <div id="gm-expanded-view">
            <div id="gm-info-box">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2 id="gm-info-title">Timed Practice For Marks App</h2>
                    <button id="gm-minimize-btn" title="Minimize">
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                    </button>
                </div>
                <span id="gm-info-subtitle"><i>Enable Radio is Question Page</i></span>
            </div>
            <div id="gm-widget-header">
                <h2 id="gm-widget-title">Start Timer</h2>
                <label class="gm-switch">
                    <input type="checkbox" id="gm-toggle">
                    <span class="gm-slider"></span>
                </label>
            </div>
            
            <div class="gm-input-group">
                <span class="gm-label">Wait Time (Seconds)</span>
                <input type="number" id="gm-time-input" class="gm-input" min="1" max="3600">
            </div>

            <div id="gm-status-box">
                <span id="gm-status-label">Countdown</span>
                <div id="gm-countdown">--</div>
            </div>
        </div>
    `;
    document.body.appendChild(widgetContainer);

    if (settings.isCollapsed) {
        widgetContainer.classList.add('gm-is-collapsed');
    }

    // 3. Cache Elements & Set Initial Values
    timeInputEl = document.getElementById('gm-time-input');
    toggleEl = document.getElementById('gm-toggle');
    countdownEl = document.getElementById('gm-countdown');

    timeInputEl.value = settings.waitTimeSec;
    toggleEl.checked = settings.isEnabled;

    updateWidgetDisplay();

    // 4. Attach Event Listeners
    timeInputEl.addEventListener('change', (e) => {
        updateSettings({ waitTimeSec: parseInt(e.target.value, 10) || 1 });
    });

    toggleEl.addEventListener('change', (e) => {
        updateSettings({ isEnabled: e.target.checked });
    });

    document.getElementById('gm-minimize-btn').addEventListener('click', () => {
        widgetContainer.classList.add('gm-is-collapsed');
        updateSettings({ isCollapsed: true });
    });

    document.getElementById('gm-collapsed-view').addEventListener('click', () => {
        widgetContainer.classList.remove('gm-is-collapsed');
        updateSettings({ isCollapsed: false });
    });
}
