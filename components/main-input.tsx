import * as Haptics from 'expo-haptics';
import { ArrowUpIcon, Image as ImageIcon, Lightbulb } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable, View } from 'react-native';

import type { ImageAttachment as ImageAttachmentType } from '@/lib/image-utils';
import { pickImageFromCamera, pickImageFromGallery } from '@/lib/image-utils';
import { cn } from '@/lib/utils';
import { useChats } from '@/store/chats';
import { ConnectStatus, useSettingsValue } from '@/store/settings';

import { ImageAttachmentList } from './image-attachment';
import { Button } from './ui/button';
import { Icon } from './ui/icon';
import { Textarea } from './ui/textarea';
import { Toggle } from './ui/toggle';

interface MainInputProps {
  onSend: (input: string, think?: boolean, images?: ImageAttachmentType[]) => Promise<void>;
  onAbort: () => void;
}

export function MainInput(props: MainInputProps) {
  const { onSend, onAbort } = props;
  const [input, setInput] = useState('');
  const [images, setImages] = useState<ImageAttachmentType[]>([]);
  const { ollama, hapticFeedback } = useSettingsValue();
  const { connectStatus } = ollama;
  const [{ current, data }, { toggleThink }] = useChats();
  const { think, model, messages } = data[current];

  const inChatting = useMemo(() => {
    if (messages.length > 0) {
      const { isPending = false, isStreaming = false, isThinking = false, isAborted = false, isExecutingTools = false } = messages.at(-1)!;

      return (isPending || isStreaming || isThinking || isExecutingTools) && !isAborted;
    }

    return false;
  }, [messages]);

  // Check if current model supports vision
  const canVision = model?.canVision ?? false;

  const handleSend = async () => {
    const currentInput = input;
    const currentImages = [...images];

    setTimeout(() => {
      setInput('');
      setImages([]);
      Keyboard.dismiss();
    }, 0);

    await onSend(currentInput, think, currentImages.length > 0 ? currentImages : undefined);
  };

  const handlePickFromGallery = async () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const image = await pickImageFromGallery();
    if (image) {
      setImages(prev => [...prev, image]);
    }
  };

  const handlePickFromCamera = async () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const image = await pickImageFromCamera();
    if (image) {
      setImages(prev => [...prev, image]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    setInput('');
    setImages([]);
  }, [current]);

  const canSend = (input.trim() || images.length > 0) && model && connectStatus === ConnectStatus.SUCCESSFUL;

  return (
    <View className="w-full rounded-2xl bg-accent p-2">
      {/* Image previews */}
      {images.length > 0 && (
        <View className="px-1">
          <ImageAttachmentList images={images} onRemove={handleRemoveImage} size="small" />
        </View>
      )}

      <Textarea
        value={input}
        onChangeText={setInput}
        className="h-auto max-h-[250px] min-h-10 w-full resize-none rounded-2xl border-0"
        placeholder={canVision ? 'Send a message or image' : 'Send a message'}
      />

      <View className="mt-2 flex w-full flex-row items-center justify-between">
        {/* Left side: Image picker (only show if model supports vision) */}
        <View className="flex flex-row gap-x-1">
          {canVision && (
            <Pressable
              onPress={handlePickFromGallery}
              disabled={inChatting}
              className="rounded-full p-2"
              style={{ opacity: inChatting ? 0.5 : 1 }}>
              <Icon as={ImageIcon} size={20} className="text-muted-foreground" />
            </Pressable>
          )}
        </View>

        {/* Right side: Think toggle and send button */}
        <View className="flex flex-row gap-x-2">
          {model?.canThink ? (
            <Toggle
              aria-label="Toggle thinking"
              variant="outline"
              size="sm"
              className="size-9 rounded-full border-0 bg-background shadow-none"
              pressed={think || false}
              onPressedChange={() => {
                if (hapticFeedback) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                toggleThink();
              }}>
              <Icon as={Lightbulb} className={cn('size-4', think ? 'fill-blue-500 stroke-blue-500' : '')} />
            </Toggle>
          ) : null}
          {inChatting ? (
            <Button size="icon" className="size-9 rounded-full" onPress={onAbort}>
              <View className="size-3 rounded-[2px] bg-primary-foreground" />
            </Button>
          ) : (
            <Button size="icon" className="size-9 rounded-full" disabled={!canSend} onPress={handleSend}>
              <Icon as={ArrowUpIcon} className="size-4 text-primary-foreground" />
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}
