// src/lib/ai/providers/google.ts
// Google Gen AI Provider Implementation using official @google/genai SDK

import { GoogleGenAI } from '@google/genai';
import { AiProvider } from './provider.interface';

export class GoogleGenAiProvider implements AiProvider {
  public readonly name = 'Google Gemini 2.5 Flash';
  private client: GoogleGenAI | null = null;
  private modelName: string;

  constructor(modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash') {
    this.modelName = modelName;
    const apiKey = (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY ||
      ''
    ).trim();

    if (apiKey && apiKey.length > 5) {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  public isAvailable(): boolean {
    return this.client !== null;
  }

  public async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.client) {
      throw new Error('Google Gemini API key is not configured.');
    }

    const response = await this.client.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || 'You are an educational AI assistant for Cambodian primary students.',
      },
    });

    return response.text || '';
  }

  public async generateStructured<T>(
    prompt: string,
    systemInstruction?: string
  ): Promise<T> {
    if (!this.client) {
      throw new Error('Google Gemini API key is not configured.');
    }

    const response = await this.client.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction:
          systemInstruction ||
          'You are an expert Cambodian MoEYS primary educational curriculum AI. You output strictly valid JSON conforming to the requested schema.',
      },
    });

    const text = response.text || '{}';
    return JSON.parse(text) as T;
  }
}

// Singleton instance
export const googleAiProvider = new GoogleGenAiProvider();
