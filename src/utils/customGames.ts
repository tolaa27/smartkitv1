import { GeneratedGameConfig } from '@/types/edtech';

const STORAGE_KEY = 'smartkids_custom_games';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Retrieve custom games stored locally.
 */
export function getStoredCustomGames(): GeneratedGameConfig[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load custom games from localStorage', err);
    return [];
  }
}

/**
 * Save custom game to localStorage and attempt background sync to Laravel API.
 */
export async function saveCustomGame(game: GeneratedGameConfig): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1. LocalStorage update
  try {
    const current = getStoredCustomGames();
    const filtered = current.filter(g => g.id !== game.id && g.metadata?.classroomPin !== game.metadata?.classroomPin);
    const updated = [game, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save custom game to localStorage', err);
  }

  // 2. Background sync to Laravel API
  try {
    const response = await fetch(`${API_BASE_URL}/custom-games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        classroom_pin: game.metadata?.classroomPin || String(Math.floor(100000 + Math.random() * 900000)),
        title: game.titleKhmer,
        subject: game.subject,
        grade_level: game.gradeLevel,
        template: game.template,
        config_json: game,
      }),
    });

    if (!response.ok) {
      console.info('Custom game stored locally (API sync skipped or status', response.status, ')');
    }
  } catch {
    // Graceful offline fallback
    console.info('Custom game saved locally (offline or backend not reached).');
  }
}

/**
 * Delete a custom game by id or pin.
 */
export function deleteStoredCustomGame(idOrPin: string): GeneratedGameConfig[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredCustomGames();
    const updated = current.filter(g => g.id !== idOrPin && g.metadata?.classroomPin !== idOrPin);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Export a game config as a downloadable JSON file.
 */
export function exportGameAsJson(game: GeneratedGameConfig): void {
  const pin = game.metadata?.classroomPin || 'custom';
  const filename = `smartkids-game-${pin}.json`;
  const blob = new Blob([JSON.stringify(game, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate an imported JSON string into a GeneratedGameConfig.
 */
export function parseImportedGameJson(jsonText: string): GeneratedGameConfig {
  const parsed = JSON.parse(jsonText);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('ឯកសារ JSON មិនត្រឹមត្រូវ (Invalid JSON object)');
  }

  if (!parsed.id || !parsed.titleKhmer || !parsed.template || !Array.isArray(parsed.levels)) {
    throw new Error('ឯកសារមិនមានទម្រង់ហ្គេមត្រឹមត្រូវទេ (Missing required GameConfig fields)');
  }

  // Ensure classroom pin exists
  if (!parsed.metadata) {
    parsed.metadata = {};
  }
  if (!parsed.metadata.classroomPin) {
    parsed.metadata.classroomPin = String(Math.floor(100000 + Math.random() * 900000));
  }

  return parsed as GeneratedGameConfig;
}

/**
 * Fetch a custom game from backend API by classroom PIN with graceful fallback.
 */
export async function fetchRemoteCustomGame(pin: string): Promise<GeneratedGameConfig | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/custom-games/${pin}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return json.data as GeneratedGameConfig;
    }
    return null;
  } catch {
    return null;
  }
}
