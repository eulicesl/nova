/**
 * ImageAttachment Component
 * Displays image attachments in messages and input preview
 */

import { X } from 'lucide-react-native';
import { Image, Pressable, View } from 'react-native';

import type { ImageAttachment as ImageAttachmentType } from '@/lib/image-utils';
import { createDataUrl } from '@/lib/image-utils';

import { Icon } from './ui/icon';
import { Text } from './ui/text';

interface ImagePreviewProps {
  image: ImageAttachmentType;
  onRemove?: () => void;
  size?: 'small' | 'medium' | 'large';
}

const SIZE_MAP = {
  small: { width: 60, height: 60, borderRadius: 8 },
  medium: { width: 120, height: 120, borderRadius: 12 },
  large: { width: 200, height: 200, borderRadius: 16 }
};

/**
 * Image preview with optional remove button
 * Used in the input area for pending attachments
 */
export function ImagePreview({ image, onRemove, size = 'medium' }: ImagePreviewProps) {
  const dimensions = SIZE_MAP[size];

  // Create image source
  const imageSource = image.base64
    ? { uri: createDataUrl(image.base64, image.mimeType) }
    : { uri: image.uri };

  return (
    <View
      className="relative overflow-hidden bg-muted"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: dimensions.borderRadius
      }}>
      <Image
        source={imageSource}
        style={{
          width: '100%',
          height: '100%'
        }}
        resizeMode="cover"
      />
      {onRemove && (
        <Pressable
          onPress={onRemove}
          className="absolute right-1 top-1 rounded-full bg-black/60 p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon as={X} size={14} className="text-white" />
        </Pressable>
      )}
    </View>
  );
}

interface ImageAttachmentListProps {
  images: ImageAttachmentType[];
  onRemove?: (index: number) => void;
  size?: 'small' | 'medium' | 'large';
}

/**
 * List of image attachments with remove buttons
 * Used in the input area
 */
export function ImageAttachmentList({ images, onRemove, size = 'small' }: ImageAttachmentListProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <View className="flex flex-row flex-wrap gap-2 pb-2">
      {images.map((image, index) => (
        <ImagePreview
          key={`${image.uri}-${index}`}
          image={image}
          size={size}
          onRemove={onRemove ? () => onRemove(index) : undefined}
        />
      ))}
    </View>
  );
}

interface MessageImageProps {
  images: ImageAttachmentType[];
}

/**
 * Display images in a message
 * Used in the message list for sent messages
 */
export function MessageImages({ images }: MessageImageProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <View className="mb-2 flex flex-row flex-wrap gap-2">
      {images.map((image, index) => {
        const imageSource = image.base64
          ? { uri: createDataUrl(image.base64, image.mimeType) }
          : { uri: image.uri };

        // Calculate display dimensions
        const maxWidth = 250;
        const aspectRatio = (image.width && image.height) ? image.width / image.height : 1;
        const displayWidth = Math.min(maxWidth, image.width || maxWidth);
        const displayHeight = displayWidth / aspectRatio;

        return (
          <View
            key={`${image.uri}-${index}`}
            className="overflow-hidden rounded-xl bg-muted"
            style={{
              width: displayWidth,
              height: Math.min(displayHeight, 300)
            }}>
            <Image
              source={imageSource}
              style={{
                width: '100%',
                height: '100%'
              }}
              resizeMode="cover"
            />
          </View>
        );
      })}
    </View>
  );
}

interface ImagePickerButtonProps {
  onPickFromGallery: () => void;
  onPickFromCamera: () => void;
  disabled?: boolean;
}

/**
 * Compact button that opens image picker options
 */
export function ImagePickerButtons({ onPickFromGallery, onPickFromCamera, disabled }: ImagePickerButtonProps) {
  return (
    <View className="flex flex-row gap-x-1">
      <Pressable
        onPress={onPickFromGallery}
        disabled={disabled}
        className="rounded-full p-2"
        style={{ opacity: disabled ? 0.5 : 1 }}>
        <Text className="text-xl">🖼️</Text>
      </Pressable>
      <Pressable
        onPress={onPickFromCamera}
        disabled={disabled}
        className="rounded-full p-2"
        style={{ opacity: disabled ? 0.5 : 1 }}>
        <Text className="text-xl">📷</Text>
      </Pressable>
    </View>
  );
}
