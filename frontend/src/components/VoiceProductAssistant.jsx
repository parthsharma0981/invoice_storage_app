import React, { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../store/StoreContext";

export default function VoiceProductAssistant() {
  const { addProduct } = useStore();

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const supported = !!SpeechRecognition;
  const recognitionRef = useRef(null);

  const steps = useMemo(
    () => [
      { key: "name", label: "Product Name", hint: "Say product name" },
      { key: "category", label: "Category", hint: "Say category" },
      { key: "hsn", label: "HSN Code", hint: "Say HSN code" },
      { key: "price", label: "Price", hint: "Say price" },
      { key: "stock", label: "Stock", hint: "Say stock quantity" },
    ],
    []
  );

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const [lastSavedMsg, setLastSavedMsg] = useState("");

  const [data, setData] = useState({
    name: "",
    category: "",
    hsn: "",
    price: "",
    stock: "",
  });

  const currentStep = steps[stepIndex];

  const speak = (text) => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) {}
  };

  const parseNumber = (txt) => {
    const cleaned = txt
      .toLowerCase()
      .replaceAll("rupees", "")
      .replaceAll("rs", "")
      .replaceAll("₹", "")
      .replaceAll(",", " ")
      .trim();

    const match = cleaned.match(/[\d.]+/);
    return match ? match[0] : "";
  };

  const resetAssistant = (say = false) => {
    setStepIndex(0);
    setData({
      name: "",
      category: "",
      hsn: "",
      price: "",
      stock: "",
    });
    setError("");
    if (say) speak("Reset done. Please say product name.");
  };

  const validateAll = (d) => {
    if (!d.name.trim()) return "Product name missing";
    if (!d.category.trim()) return "Category missing";
    if (!d.hsn.trim()) return "HSN missing";
    if (!Number(d.price)) return "Price invalid";
    if (d.stock === "" || Number(d.stock) < 0) return "Stock invalid";
    return "";
  };

  const saveProduct = (finalData) => {
    const msg = validateAll(finalData);
    if (msg) {
      setError(msg);
      speak("Cannot save. " + msg);
      return false;
    }

    const res = addProduct({
      name: finalData.name.trim(),
      category: finalData.category.trim(),
      hsn: finalData.hsn.trim(),
      price: Number(finalData.price),
      stock: Number(finalData.stock),
    });

    if (!res.ok) {
      setError(res.msg);
      speak("Failed to add product. " + res.msg);
      return false;
    }

    setLastSavedMsg(
      `✅ Saved: ${finalData.name} | ${finalData.category} | HSN ${finalData.hsn} | ₹${finalData.price} | Stock ${finalData.stock}`
    );

    speak("Product saved successfully. Starting new product.");
    return true;
  };

  const startRecognition = () => {
    if (!supported) return;

    const recog = new SpeechRecognition();
    recog.lang = "en-IN";
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recognitionRef.current = recog;

    recog.onstart = () => {
      setListening(true);
      setError("");
    };

    recog.onend = () => {
      setListening(false);
    };

    recog.onerror = (e) => {
      setListening(false);
      setError("Mic error: " + e.error);
    };

    recog.onresult = (event) => {
      const spokenText = event.results?.[0]?.[0]?.transcript || "";
      handleVoiceInput(spokenText);
    };

    recog.start();
  };

  // ✅ FIXED LOGIC HERE
  const handleVoiceInput = (spokenText) => {
    const key = currentStep.key;
    let value = spokenText.trim();

    if (key === "price" || key === "stock") {
      value = parseNumber(value);
    }

    if (!value) {
      speak("I did not catch that. Please repeat.");
      return;
    }

    // make a NEW updated object (this is the correct way)
    const updatedData = { ...data, [key]: value };

    // save into state
    setData(updatedData);

    speak(`${currentStep.label} saved as ${value}`);

    // if last step => auto save + reset
    if (stepIndex === steps.length - 1) {
      const ok = saveProduct(updatedData);

      if (ok) {
        setTimeout(() => {
          resetAssistant(false);
        }, 600);
      }
      return;
    }

    // move next step
    setTimeout(() => {
      setStepIndex((s) => s + 1);
    }, 500);
  };

  const startAssistant = () => {
    setActive(true);
    resetAssistant(false);
    setLastSavedMsg("");
    speak("Voice product assistant started. Please say product name.");
  };

  const stopAssistant = () => {
    setActive(false);
    setListening(false);
    setError("");
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    speak("Voice assistant stopped.");
  };

  useEffect(() => {
    if (!active) return;
    speak(`Tell me ${steps[stepIndex].label}`);
  }, [active, stepIndex, steps]);

  if (!supported) {
    return (
      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ margin: 0 }}>🎤 Voice Assistant</h3>
        <p className="muted">
          Speech Recognition not supported. Use Chrome / Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div>
          <h3 style={{ margin: 0 }}>🎤 Voice Product Assistant</h3>
          <p className="muted" style={{ marginTop: 6 }}>
            Speak 5 steps → auto save → auto reset
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {!active ? (
            <button className="btn primary" onClick={startAssistant}>
              Start
            </button>
          ) : (
            <button className="btn danger" onClick={stopAssistant}>
              Stop
            </button>
          )}
        </div>
      </div>

      {active && (
        <>
          <div style={{ marginTop: 12 }}>
            <div className="muted" style={{ fontWeight: 800 }}>
              Step {stepIndex + 1} / {steps.length}
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, marginTop: 4 }}>
              {currentStep.label}
            </div>
            <div className="muted" style={{ marginTop: 4 }}>
              {currentStep.hint}
            </div>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <button
              className="btn"
              onClick={startRecognition}
              disabled={listening}
            >
              {listening ? "Listening..." : "🎙️ Speak Now"}
            </button>

            <button className="btn" onClick={() => resetAssistant(true)}>
              Reset
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            <div className="muted" style={{ fontWeight: 800 }}>
              Live Data:
            </div>
            <div style={{ marginTop: 6, lineHeight: 1.7 }}>
              <b>Name:</b> {data.name || "-"} <br />
              <b>Category:</b> {data.category || "-"} <br />
              <b>HSN:</b> {data.hsn || "-"} <br />
              <b>Price:</b> {data.price || "-"} <br />
              <b>Stock:</b> {data.stock || "-"} <br />
            </div>
          </div>
        </>
      )}

      {lastSavedMsg && (
        <div style={{ marginTop: 12, fontWeight: 800 }}>
          {lastSavedMsg}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 12, color: "#ffb4b4", fontWeight: 800 }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
}
