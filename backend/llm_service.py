"""
LLM Service for SeaTrace Intelligent Chatbot
Interfaces with Google Gemini or OpenAI to provide context-aware maritime responses.
"""
import os
import json
import logging

try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False
    print("Warning: google.generativeai not installed.")

class LLMService:
    def __init__(self):
        self.api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
        self.model = None
        self.history = []
        
        if HAS_GEMINI and self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-pro')
                print("LLM Service: Gemini Pro initialized.")
            except Exception as e:
                print(f"LLM Service Error: {e}")
        else:
            print("LLM Service: No valid API key or library found. Using fallback mode.")

    def generate_response(self, user_query, system_context):
        """
        Generate a response based on query and context.
        system_context: dict containing 'vessels', 'spills', 'alerts'
        """
        context_str = self._build_context_string(system_context)
        
        # 1. Fallback Rule-Based (Immediate) if LLM not available
        if not self.model:
            return self._fallback_response(user_query, context_str)

        # 2. LLM Generation
        try:
            prompt = f"""
            You are SeaTrace AI, an advanced maritime intelligence assistant. 
            Use the following Real-Time System Data to answer the user's question.
            Be concise, professional, and authoritative.
            
            SYSTEM DATA:
            {context_str}
            
            USER QUESTION:
            {user_query}
            
            RESPONSE:
            """
            
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"LLM Generation Failed: {e}")
            return self._fallback_response(user_query, context_str)

    def _build_context_string(self, context):
        """Turn context dict into readable text for the LLM"""
        s = "--- ACTIVE SITUATION REPORT ---\n"
        
        # Spills
        spills = context.get('spills', {})
        active_spills = [v for k,v in spills.items() if v.get('status') == 'Active']
        if active_spills:
            s += f"CRITICAL: {len(active_spills)} Active Oil Spills detected.\n"
            for spill in active_spills:
                s += f"- Spill {spill.get('spill_id', '?')} at {spill.get('lat')},{spill.get('lon')}. Severity: {spill.get('severity')}. Size: {spill.get('size_tons')} tons.\n"
        else:
            s += "No active oil spills reported.\n"
            
        # Vessels
        vessels = context.get('vessels', {})
        s += f"Vessels tracked: {len(vessels)}.\n"
        
        high_risk = [v for k,v in vessels.items() if v.get('risk_level') == 'High']
        if high_risk:
            s += f"High Risk Vessels: {len(high_risk)} ({', '.join([v['name'] for v in high_risk])}).\n"
            
        return s

    def _fallback_response(self, query, context_str):
        """Simulated 'intelligent' response when LLM is offline"""
        q = query.lower()
        if 'spill' in q:
            if "CRITICAL" in context_str:
                return "ALERT: Active oil spills detected! Please check the Incidents dashboard immediately for location and severity details."
            return "No active oil spills are currently detected in the monitored sector."
        
        if 'vessel' in q or 'ship' in q:
            return "Vessel tracking systems are nominal. I can help you find specific ships or analyze traffic patterns."
            
        return "I am SeaTrace AI. I can assist with oil spill alerts, vessel tracking, and environmental risk assessment. Please ask regarding these topics."

llm_service = LLMService()
