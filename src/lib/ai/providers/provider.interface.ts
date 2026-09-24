// src/lib/ai/providers/provider.interface.ts
// Abstract AI Provider Interface for Swappable Model Architectures

export interface AiProvider {
  name: string;
  isAvailable(): boolean;
  generateText(prompt: string, systemInstruction?: string): Promise<string>;
  generateStructured<T>(
    prompt: string,
    systemInstruction?: string
  ): Promise<T>;
}
