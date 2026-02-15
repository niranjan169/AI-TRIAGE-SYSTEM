import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MessageSquare, X, Send, User, Bot, Sparkles,
    AlertCircle, Calendar, Heart, Shield, Activity,
    ChevronRight, Zap, Image as ImageIcon, Upload, CheckCircle
} from 'lucide-react';
import Button from './Button';
import './Chatbot.css';

const INITIAL_MESSAGES = [
    {
        id: 'init-1',
        sender: 'bot',
        text: 'Hello! I am MedLink Assistant, your advanced Health Co-pilot. 🦾 I am powered by clinical AI to help you manage your health journey with precision. How can I assist you today?',
        timestamp: new Date().toISOString()
    }
];

const SUGGESTIONS = [
    { label: "Book Appointment", icon: <Calendar size={14} />, query: "book appointment" },
    { label: "Check Symptoms", icon: <Activity size={14} />, query: "check my symptoms" },
    { label: "Medical Remedies", icon: <Heart size={14} />, query: "remedies for health" },
    { label: "Infection Test", icon: <ImageIcon size={14} />, query: "test an infection image" }
];

const REMEDIES = {
    headache: {
        text: "I've prioritized these fast-acting remedies for your headache:",
        category: "tip-blue",
        tips: [
            "Hydration Surge: Drink 500ml of water immediately. 💧",
            "Sensory Reset: Rest in a dark, silent room for 15 mins. 😴",
            "Targeted Relief: A cold compress on your forehead works wonders. 🧊",
            "Magnesium Boost: Consider eating a handful of almonds or spinach. 🥗"
        ]
    },
    fever: {
        text: "Detected Fever. Here is your medical recovery plan:",
        category: "tip-orange",
        tips: [
            "Thermal Monitoring: Check temperature every 2 hours. 🌡️",
            "Electrolyte Balance: Sip on coconut water or ORS. 🥤",
            "Cooling: Use a damp cloth on your forehead and neck. 🧼",
            "Doctor Alert: If fever > 103°F, contact a specialist immediately. 🩺"
        ]
    },
    cold: {
        text: "Viral Defense: Proven steps to fight your cold:",
        category: "tip-purple",
        tips: [
            "Saltwater Therapy: Gargle warm salt water every 4 hours. 🧂",
            "Inhalation: Use steam with eucalyptus oil for clear lungs. 💨",
            "Immune Boost: Maximize Vitamin C with fresh citrus. 🍊",
            "Deep Recovery: Aim for 9+ hours of restorative sleep. 🌙"
        ]
    },
    stomach: {
        text: "Digestive Support: Plan for stomach discomfort:",
        category: "tip-green",
        tips: [
            "Ginger Infusion: Drink warm ginger tea for nausea. 🍵",
            "Dietary Pause: Stick to plain rice and toast today. 🍞",
            "Heat Therapy: Use a warm pad on your abdomen area. 🔥",
            "Hydration Focus: Small sips of water throughout the hour. 💧"
        ]
    },
    energy: {
        text: "Vita-Boost: Quick tips to increase your energy:",
        category: "tip-purple",
        tips: [
            "Sunshine exposure: 10 mins of natural light. ☀️",
            "Quick stretch: Focus on your back and shoulders. 🙆",
            "Protein snack: A few nuts can stabilize blood sugar. 🥜",
            "Deep breathing: 5 cycles of 4-7-8 breathing. 🌬️"
        ]
    }
};

const Chatbot = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [analyzingImage, setAnalyzingImage] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen, isTyping, analyzingImage]);

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        const timestamp = new Date().toISOString();
        const userMsg = { id: Date.now(), sender: 'user', text, timestamp };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const botResponse = generateResponse(text);
            const botMsg = {
                ...botResponse,
                id: Date.now() + 1,
                sender: 'bot',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1200);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageUrl = event.target.result;
            processInfectionImage(imageUrl);
        };
        reader.readAsDataURL(file);
    };

    const processInfectionImage = (imageUrl) => {
        // Add user image message
        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: "Attached image for infection analysis.",
            image: imageUrl,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMsg]);
        setAnalyzingImage(true);

        // Simulate AI analysis
        setTimeout(() => {
            const isNormal = Math.random() > 0.5;
            const botMsg = {
                id: Date.now() + 1,
                sender: 'bot',
                text: isNormal ? "✅ My AI analysis indicates this area looks NORMAL. No immediate cause for concern, but monitor for changes." : "⚠️ ALERT: My AI analysis detected signs that could indicate an INFECTION or inflammation. I recommend speaking with a doctor for a physical checkup.",
                isInfectionResult: true,
                isNormal: isNormal,
                timestamp: new Date().toISOString(),
                action: isNormal ? null : { label: "Consult Doctor Now", path: "/assessment", icon: <Shield size={16} /> }
            };
            setMessages(prev => [...prev, botMsg]);
            setAnalyzingImage(false);
        }, 2500);
    };

    const generateResponse = (text) => {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('who are you') || lowerText.includes('what is medlink')) {
            return {
                text: "I am MedLink Assistant, your dedicated AI Healthcare Co-pilot. I am here to help you navigate medical assessments, manage your history, and find clinical insights for your symptoms. 🛡️"
            };
        }

        if (lowerText.includes('how does this work') || lowerText.includes('help me')) {
            return {
                text: "It's simple and powerfull! You can:\n1. 📅 Book a smart assessment for immediate triage.\n2. 📂 Access your reports and past prescriptions.\n3. 🦾 Get AI-driven advice for symptoms or infections.\n4. 👨‍⚕️ Connect with doctors based on AI priority.",
                action: { label: "Explore Dashboard", path: "/patient", icon: <Activity size={16} /> }
            };
        }

        if (lowerText.includes('test') && (lowerText.includes('image') || lowerText.includes('infection'))) {
            return {
                text: "I can help you analyze potential infections. Please click the Paperclip icon 📎 or the button below to upload a clear photo of the skin area or concern.",
                action: { label: "Upload Photo", onClick: () => fileInputRef.current?.click(), icon: <Upload size={16} />, customTrigger: true }
            };
        }

        if (lowerText.includes('appointment') || lowerText.includes('book') || lowerText.includes('schedule')) {
            return {
                text: "Ready to see a specialist? Let's start your smart assessment. Our AI will analyze your state and find the most suitable slot for you immediately.",
                action: { label: "Open Smart Scheduler", path: "/assessment", icon: <Calendar size={16} /> }
            };
        }

        if (lowerText.includes('headache')) return { text: REMEDIES.headache.text, tips: REMEDIES.headache.tips, category: REMEDIES.headache.category };
        if (lowerText.includes('fever')) return { text: REMEDIES.fever.text, tips: REMEDIES.fever.tips, category: REMEDIES.fever.category };
        if (lowerText.includes('cold') || lowerText.includes('cough')) return { text: REMEDIES.cold.text, tips: REMEDIES.cold.tips, category: REMEDIES.cold.category };
        if (lowerText.includes('stomach') || lowerText.includes('belly')) return { text: REMEDIES.stomach.text, tips: REMEDIES.stomach.tips, category: REMEDIES.stomach.category };
        if (lowerText.includes('energy') || lowerText.includes('tired')) return { text: REMEDIES.energy.text, tips: REMEDIES.energy.tips, category: REMEDIES.energy.category };

        if (lowerText.includes('emergency') || lowerText.includes('severe') || lowerText.includes('heart')) {
            return {
                text: "📢 IMMEDATE ACTION REQUIRED: You've mentioned symptoms that could be critical. Please call 911 or visit the nearest emergency room immediately.",
                isEmergency: true
            };
        }

        if (lowerText.includes('hello') || lowerText.includes('hi')) {
            return { text: "Hello! Always a pleasure to see you. How is your health today? I am fully ready to assist you. 😊" };
        }

        return {
            text: "I understand. Would you like to consult our main AI Triage system for a full medical scan and appointment booking?",
            action: { label: "Consult AI System", path: "/assessment", icon: <Sparkles size={16} /> }
        };
    };

    const handleAction = (item) => {
        if (item.customTrigger && item.onClick) {
            item.onClick();
            return;
        }
        setIsTyping(true);
        setTimeout(() => {
            navigate(item.path);
            setIsOpen(false);
            setIsTyping(false);
        }, 600);
    };

    return (
        <div className="chatbot-wrapper">
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileUpload}
            />

            {!isOpen && (
                <button className="chatbot-trigger" onClick={() => setIsOpen(true)}>
                    <div className="trigger-ring"></div>
                    <Bot size={30} />
                    <span className="trigger-text">MedLink Assistant</span>
                </button>
            )}

            <div className={`chatbot-ui ${isOpen ? 'show' : ''}`}>
                <div className="chatbot-top">
                    <div className="bot-id">
                        <div className="bot-glow">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h3>MedLink AI Core</h3>
                            <div className="bot-badge">
                                <span className="online-dot"></span>
                                Clinical Grade Assistant
                            </div>
                        </div>
                    </div>
                    <button className="chat-close" onClick={() => setIsOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <div className="chat-body">
                    <div className="chat-start-info">
                        <Sparkles className="info-icon" />
                        <h4>Supercharged Medical AI</h4>
                        <p>Real-time triage, image analysis & remedies</p>
                    </div>

                    {messages.map((msg) => (
                        <div key={msg.id} className={`chat-line ${msg.sender === 'user' ? 'is-user' : 'is-bot'}`}>
                            <div className="bubble-wrapper">
                                <div className={`chat-bubble ${msg.isEmergency ? 'on-alert' : ''} ${msg.isInfectionResult ? (msg.isNormal ? 'result-negative' : 'result-positive') : ''}`}>
                                    {msg.image && <img src={msg.image} alt="Upload" className="uploaded-preview" />}
                                    <div className="bubble-text">{msg.text}</div>
                                    {msg.tips && (
                                        <div className="bubble-tips">
                                            {msg.tips.map((tip, idx) => (
                                                <div key={idx} className={`tip-item ${msg.category || 'tip-blue'}`}>
                                                    <CheckCircle size={14} />
                                                    {tip}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {msg.action && (
                                    <button className="bubble-action" onClick={() => handleAction(msg.action)}>
                                        {msg.action.icon}
                                        <span>{msg.action.label}</span>
                                    </button>
                                )}
                                <div className="chat-time">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {(isTyping || analyzingImage) && (
                        <div className="chat-line is-bot">
                            <div className="chat-bubble typing-bubble">
                                {analyzingImage ? (
                                    <div className="analyzing-text">
                                        <Activity size={16} className="spin-icon" />
                                        <span>AI analyzing image layers...</span>
                                    </div>
                                ) : (
                                    <div className="typing-dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-suggestions-ribbon">
                    {SUGGESTIONS.map((s, idx) => (
                        <button key={idx} className="ribbon-chip" onClick={() => handleSend(s.query)}>
                            {s.icon}
                            {s.label}
                        </button>
                    ))}
                </div>

                <div className="chat-bottom">
                    <div className="input-group">
                        <button className="upload-icon-btn" onClick={() => fileInputRef.current?.click()} title="Upload medical image">
                            <Upload size={18} />
                        </button>
                        <input
                            type="text"
                            placeholder="Ask MedLink anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            className={`send-btn ${input.trim() ? 'can-send' : ''}`}
                            onClick={() => handleSend()}
                            disabled={!input.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
