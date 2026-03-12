'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
import type { ProfileFormType } from '.';
import { useMutation } from '@apollo/client/react';
import type {
  UploadMediaMutationType,
  UploadMediaMutationVariablesType,
} from './_interface';
import { UploadMedia } from './_mutation';
import { useTranslations } from 'next-intl';

interface ProfilePhotoFieldProps {
  className?: string;
}

const ProfilePhotoField: React.FC<ProfilePhotoFieldProps> = () => {
  const form = useFormContext<ProfileFormType>();
  const currentPhoto = form.watch('photo_profile');
  const [profilePhotoFile, setProfilePhotoFile] = React.useState<File | null>(
    null
  );
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    currentPhoto || null
  );

  const [uploadMedia, { loading }] = useMutation<
  UploadMediaMutationType,
  UploadMediaMutationVariablesType
>(UploadMedia);

  const t = useTranslations('profileSettings.coverProfilePhoto');

  React.useEffect(() => {
    setPreviewUrl(currentPhoto || null);
  }, [currentPhoto]);

  const handleFileChange = (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setProfilePhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Temporarily set object URL until upload
    form.setValue('photo_profile', objectUrl, { shouldValidate: true });
  };

  const handleCancel = () => {
    setProfilePhotoFile(null);
    setPreviewUrl(currentPhoto || null);
  };

  const handleUpload = async () => {
    if (!profilePhotoFile) return;

    try {
      const { data } = await uploadMedia({
        variables: {
          files: [profilePhotoFile],
        },
      });

      if (data?.createMedias && data.createMedias.length > 0) {
        const uploadedUrl = data.createMedias[0].url ?? '';
        form.setValue('photo_profile', uploadedUrl, { shouldValidate: true });
        setPreviewUrl(uploadedUrl);
        setProfilePhotoFile(null);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="flex items-center w-fit gap-6">
      <Avatar className="w-24 h-24 border">
        {previewUrl ? (
          <AvatarImage src={previewUrl} alt="Profile Picture" />
        ) : (
          <AvatarFallback>
            <Icon name="user" className="w-16 h-16" />
          </AvatarFallback>
        )}
      </Avatar>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">{t('button')}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('uploadProfile')}</DialogTitle>
            <DialogDescription>{t('profileDescription')}</DialogDescription>
          </DialogHeader>
          <FileUploader
            value={profilePhotoFile ? [profilePhotoFile] : []}
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
              disabled={!profilePhotoFile || loading}
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

export { ProfilePhotoField };
