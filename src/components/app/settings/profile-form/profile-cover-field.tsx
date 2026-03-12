'use client';

import React from 'react';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FileUploader,
  Icon,
} from '@/components/ui';
import { useFormContext } from 'react-hook-form';
import type { ProfileFormType } from '.';
import { useMutation } from '@apollo/client/react';
import type {
  UploadMediaMutationType,
  UploadMediaMutationVariablesType,
} from './_interface';
import { UploadMedia } from './_mutation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface ProfileCoverFieldProps {
  className?: string;
}

const ProfileCoverField: React.FC<ProfileCoverFieldProps> = () => {
  const form = useFormContext<ProfileFormType>();
  const currentCover = form.watch('photo_cover');
  const [coverPhotoFile, setCoverPhotoFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    currentCover || null
  );

  const t = useTranslations('profileSettings.coverProfilePhoto');

  const [uploadMedia, { loading }] = useMutation<
  UploadMediaMutationType,
  UploadMediaMutationVariablesType
>(UploadMedia);

  React.useEffect(() => {
    setPreviewUrl(currentCover || null);
  }, [currentCover]);

  const handleFileChange = (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setCoverPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Temporarily set object URL until upload
    form.setValue('photo_cover', objectUrl, { shouldValidate: true });
  };

  const handleCancel = () => {
    setCoverPhotoFile(null);
    setPreviewUrl(currentCover || null);
  };

  const handleUpload = async () => {
    if (!coverPhotoFile) return;

    try {
      const { data } = await uploadMedia({
        variables: {
          files: [coverPhotoFile],
        },
      });

      if (data?.createMedias && data.createMedias.length > 0) {
        const uploadedUrl = data.createMedias[0].url ?? '';
        form.setValue('photo_cover', uploadedUrl, { shouldValidate: true });
        setPreviewUrl(uploadedUrl);
        setCoverPhotoFile(null);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 relative">
      <div className="relative w-full rounded-lg h-40 overflow-hidden bg-muted">
        {previewUrl ? (
          <Image
            className="object-cover w-full h-full"
            src={previewUrl || '/images/placeholder.svg'}
            alt="Cover photo"
            fill
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-40 flex items-center justify-center bg-gray-200 text-gray-400">
            {t('noCover')}
          </div>
        )}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="absolute top-2 right-2"
            size="icon"
            variant="outline"
          >
            <Icon name="write" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('uploadCover')}</DialogTitle>
            <DialogDescription>{t('coverDescription')}</DialogDescription>
          </DialogHeader>
          <FileUploader
            value={coverPhotoFile ? [coverPhotoFile] : []}
            onValueChange={handleFileChange}
            maxFileCount={1}
            accept={{ 'image/*': ['jpg', 'jpeg', 'png'] }}
          />
          <DialogFooter>
            <DialogClose asChild onClick={handleCancel}>
              <Button variant="ghost">{t('cancel')}</Button>
            </DialogClose>
            <Button
              type="button"
              disabled={!coverPhotoFile || loading}
              onClick={handleUpload}
            >
              {loading ? `${t('loading')}...` : t('button')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { ProfileCoverField };
