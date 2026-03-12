import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AppDispatch, AppStore, RootState } from '../redux';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

export * from './create-zod-form';
export * from './use-auth';
export * from './use-carousel-buttons';
export * from './use-friends';
export * from './posts';
export * from './use-callback-ref';
export * from './use-controllable-state';
export * from './use-upload-media';
export * from './use-current-position';
export * from './use-shared-location';
export * from './common';