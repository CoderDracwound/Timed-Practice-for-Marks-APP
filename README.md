# GetMarks Auto-Timer

A lightweight Chrome Extension that adds a **timed practice mode** to [GetMarks App](https://web.getmarks.app). It automatically waits for a user-defined duration on each question and then reveals the solution — perfect for simulating exam conditions and self-paced learning.

---

## What is this Extension?

**GetMarks Auto-Timer** is a browser extension designed to enhance your practice sessions on the GetMarks platform. It injects a floating control widget directly onto the question page, allowing you to:

- **Set a countdown timer** (in seconds) for how long you want to attempt a question.
- **Enable/Disable** the timer on demand with a single toggle.
- **Auto-submit** the question when time runs out — selecting Option A for MCQs or entering `1` for Integer-type questions, then clicking **Check Answer** to reveal the solution.
- **Minimize/Maximize** the widget to keep your screen clutter-free.

### Key Features

| Feature | Description |
|---------|-------------|
| ⏱️ Custom Timer | Set any wait time from 1 second to 3600 seconds (1 hour). |
| 🔘 Toggle On/Off | Instantly enable or disable the timer without reloading the page. |
| 🧠 Smart Auto-Submit | Detects question type (MCQ or Integer) and auto-selects an answer before revealing the solution. |
| 🎯 SPA Aware | Works seamlessly with GetMarks' single-page application (SPA) navigation. |
| 💾 Persistent Settings | Your preferences (timer value, toggle state, widget collapse state) are saved across sessions. |
| 🖥️ Clean UI | Modern, minimal floating widget with live countdown display. |

---

## Usage

1. Navigate to any question page on [https://web.getmarks.app](https://web.getmarks.app).
2. The **Timed Practice** widget will appear at the **bottom-right corner** of your screen.
3. **Set your desired wait time** in the input field (default is 300 seconds / 5 minutes).
4. **Toggle the switch ON** to start the timer.
5. The countdown begins automatically. When it reaches zero:
   - For **MCQs** → Option A is auto-selected.
   - For **Integer Questions** → Value `1` is entered.
   - The **Check Answer** button is clicked to reveal the solution.
6. You can also click **Check Answer** manually at any time to stop the timer early.
7. Click the **minimize button** (↘) to collapse the widget into a small icon, and click the icon to expand it again.

> **Note:** The timer resets automatically when you navigate to a new question.

---

## How to Install (Chrome Developer Mode)

Since this extension is not published on the Chrome Web Store, you can install it manually using **Developer Mode**:

### Step 1: Download or Clone the Repository

```bash
git clone https://github.com/CoderDracwound/Timed-Practice-for-Marks-APP.git
```

Or download the ZIP and extract it to a folder on your computer.

### Step 2: Open Chrome Extensions Page

1. Open **Google Chrome**.
2. Go to `chrome://extensions/` in the address bar.
3. Alternatively, click the **⋮ menu** → **Extensions** → **Manage extensions**.

### Step 3: Enable Developer Mode

1. In the top-right corner of the Extensions page, toggle **Developer mode** to **ON**.

### Step 4: Load the Extension

1. Click the **Load unpacked** button that appears.
2. In the file picker, navigate to the project folder and select the **`extension/`** folder (the one containing `manifest.json`).
3. Click **Select Folder**.

### Step 5: Verify Installation

- You should see **"GetMarks Auto-Timer"** appear in your extensions list.
- The extension icon will appear in your Chrome toolbar (you may need to pin it).
- Visit [https://web.getmarks.app](https://web.getmarks.app) and start practicing — the widget should appear on question pages.

---

## File Structure

```
Timed Practice/
├── extension/
│   ├── manifest.json      # Extension manifest (Manifest V3)
│   ├── content/
│   │   └── content.js     # Core timer logic and injected UI
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
└── README.md
```

---

## Permissions

This extension requires the following permissions:

- **`storage`** — To save your timer settings locally.
- **`activeTab`** — To interact with the current GetMarks tab.
- **`scripting`** — To inject the timer widget and auto-submit answers.
- **`host_permissions`** for `https://web.getmarks.app/*` — To run only on the GetMarks website.

---

## Disclaimer

This extension is an **unofficial third-party tool** for the GetMarks platform. It is intended for personal practice and educational purposes only. Use it responsibly and at your own discretion.

---

## License

This project is open-source. Feel free to modify and distribute it as needed.
