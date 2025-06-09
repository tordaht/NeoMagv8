/*
 * 🧬 mnBac v9.5.0 - Ultra-Aggressive Anti-Monotony Language Evolution System! 🎭
 * Production-Ready Modular Architecture with Enhanced Language Diversity
 * Date: December 19, 2024
 */

/**
 * Modern Vite Entry Point
 */

// Styles import
import './styles/style.css';

// Core modules
import { loadSemanticFields } from '@/utils/semanticFields.js';
import { simulationManager } from '@/managers/SimulationManager.js';
import UserInteractionManager from '@/managers/UserInteractionManager.js';

// Global state
let isInitialized = false;
let userInteractionManager = null;

/**
 * Application bootstrap
 */
async function bootstrap() {
    try {
        console.log('🚀 NeoMag AI Bakteri Comedy Show başlatılıyor...');
        
        // 1. Semantic fields yükle
        await loadSemanticFields();
        console.log('✅ Semantic fields yüklendi');
        
        // 2. Simulation manager'ı başlat
        await simulationManager.initialize();
        console.log('✅ Simulation manager hazır');
        
        // 3. User interaction manager'ı başlat
        userInteractionManager = new UserInteractionManager(simulationManager);
        console.log('✅ User interaction manager hazır');
        
        // 4. UI event listener'ları bağla
        setupEventListeners();
        console.log('✅ Event listeners bağlandı');
        
        // 5. Tailwind CSS CDN ekle (geçici)
        injectTailwindCSS();
        
        isInitialized = true;
        console.log('🎉 NeoMag AI Bakteri Comedy Show hazır!');
        
        updateDebugInfo('Sistem hazır - Başlat butonuna basın');
        
    } catch (error) {
        console.error('❌ Bootstrap hatası:', error);
        updateDebugInfo(`Hata: ${error.message}`);
    }
}

/**
 * UI Event Listeners
 */
function setupEventListeners() {
    // Start/Stop buttons
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    startBtn?.addEventListener('click', () => {
        if (isInitialized) {
            simulationManager.start();
            updateDebugInfo('Simülasyon çalışıyor...');
        }
    });
    
    stopBtn?.addEventListener('click', () => {
        simulationManager.stop();
        updateDebugInfo('Simülasyon durduruldu');
    });
    
    // Speed slider
    const speedSlider = document.getElementById('speedSlider');
    speedSlider?.addEventListener('input', (e) => {
        simulationManager.stepInterval = parseInt(e.target.value);
        updateDebugInfo(`Hız: ${e.target.value}ms`);
    });
    
    // Toggles
    const wordGenToggle = document.getElementById('wordGenToggle');
    const tabpfnToggle = document.getElementById('tabpfnToggle');
    
    wordGenToggle?.addEventListener('change', (e) => {
        simulationManager.wordGenerationEnabled = e.target.checked;
        updateDebugInfo(`Kelime üretme: ${e.target.checked ? 'Açık' : 'Kapalı'}`);
    });
    
    tabpfnToggle?.addEventListener('change', (e) => {
        simulationManager.tabpfnEnabled = e.target.checked;
        updateDebugInfo(`TabPFN: ${e.target.checked ? 'Açık' : 'Kapalı'}`);
    });
    
    // User input
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    
    const sendMessage = async () => {
        const message = userInput?.value.trim();
        if (message && isInitialized && userInteractionManager) {
            
            // Kullanıcı mesajını chat'e ekle
            addChatMessage('Sen', message, 'user');
            userInput.value = '';
            
            try {
                // Typing indicator göster
                updateDebugInfo('Bakteriler düşünüyor...');
                
                // UserInteractionManager ile yanıt üret
                const result = await userInteractionManager.handleMessage(message);
                
                // Yanıtı chat'e ekle
                const bacteriaName = result.bacteria?.name || 'Simülasyon';
                addChatMessage(bacteriaName, result.response, 'bacteria');
                
                // Debug info güncelle
                updateDebugInfo(`Yanıt verdi: ${bacteriaName} (${result.intent})`);
                
            } catch (error) {
                console.error('❌ Mesaj işleme hatası:', error);
                addChatMessage('Sistem', 'Üzgünüm, bir hata oluştu... 😔', 'system');
                updateDebugInfo(`Hata: ${error.message}`);
            }
        }
    };
    
    sendBtn?.addEventListener('click', sendMessage);
    userInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

/**
 * Debug info güncelleme
 */
function updateDebugInfo(message) {
    const debugInfo = document.getElementById('debugInfo');
    if (debugInfo) {
        debugInfo.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    }
}

/**
 * Chat mesajı ekle
 */
function addChatMessage(sender, message, type) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    messageDiv.innerHTML = `
        <strong>${sender}:</strong> ${message}
        <small>${new Date().toLocaleTimeString()}</small>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Tailwind CSS CDN inject (geçici çözüm)
 */
function injectTailwindCSS() {
    if (!document.querySelector('script[src*="tailwindcss"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.tailwindcss.com';
        document.head.appendChild(script);
        console.log('📦 Tailwind CSS CDN eklendi');
    }
}

/**
 * Error handling
 */
window.addEventListener('error', (event) => {
    console.error('🚨 Global error:', event.error);
    updateDebugInfo(`Hata: ${event.error?.message || 'Bilinmeyen hata'}`);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection:', event.reason);
    updateDebugInfo(`Promise hatası: ${event.reason?.message || 'Bilinmeyen hata'}`);
});

// Bootstrap the application
bootstrap(); 