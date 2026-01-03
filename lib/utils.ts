/* eslint-disable no-console */
import { type ClassValue, clsx } from 'clsx';
import { produce, type WritableDraft } from 'immer';
import type { ModelResponse } from 'ollama';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parses a ReadableStream of Uint8Array into JSON objects.
 * @param itr {ReadableStream<Uint8Array>} - The stream to parse
 * @returns {AsyncGenerator<T>} - The parsed JSON objects
 */
export const parseJSON = async function* <T = unknown>(itr: ReadableStream<Uint8Array>): AsyncGenerator<T> {
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  const reader = itr.getReader();

  while (true) {
    const { done, value: chunk } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(chunk);

    const parts = buffer.split('\n');

    buffer = parts.pop() ?? '';

    for (const part of parts) {
      try {
        yield JSON.parse(part);
      } catch {
        console.warn('invalid json: ', part);
      }
    }
  }

  for (const part of buffer.split('\n').filter(p => p !== '')) {
    try {
      yield JSON.parse(part);
    } catch {
      console.warn('invalid json: ', part);
    }
  }
};

export const isInToday = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();

  return date.toDateString() === today.toDateString();
};

export const isInThisWeek = (timestamp: number) => {
  const date = new Date(timestamp);
  const today = new Date();

  const monday = new Date(today);
  monday.setDate(today.getDate() - (today.getDay() || 7) + 1);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return date >= monday && date <= sunday;
};

/**
 * @see https://docs.ollama.com/capabilities/thinking#supported-models
 * @param model
 * @returns
 */
export const canModelThink = (model: ModelResponse) => {
  return ['qwen2', 'qwen3', 'qwen3moe', 'deepseek2', 'gptoss'].includes(model.details.family);
};

/**
 * Check if model supports vision/image input
 * Known vision-capable model families
 * @see https://ollama.com/search?c=vision
 */
export const canModelSeeImages = (model: ModelResponse) => {
  const visionFamilies = [
    'llava',
    'bakllava',
    'llava-llama3',
    'llava-phi3',
    'moondream',
    'minicpm-v',
    'llama3.2-vision',
    'qwen2-vl',
    'gemma3'
  ];

  // Check family
  if (visionFamilies.includes(model.details.family)) {
    return true;
  }

  // Check model name for vision keywords
  const modelName = model.name.toLowerCase();
  const visionKeywords = ['llava', 'vision', 'vl', 'moondream', 'bakllava', 'minicpm-v'];

  return visionKeywords.some(keyword => modelName.includes(keyword));
};

export const withImmer = <T>(dispatch: (update: (data: T) => T) => void) => {
  return (recipe: (draft: WritableDraft<T>) => void) => {
    const update = produce(recipe) as (data: T) => T;

    dispatch(update);
  };
};
