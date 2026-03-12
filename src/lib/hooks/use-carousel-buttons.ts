import React from 'react';
import type { UseEmblaCarouselType } from 'embla-carousel-react';

type CarouselApi = UseEmblaCarouselType[1];

type UseCarouselButtonsType = {
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
  selectedIndex: number;
  onPrevButtonClick: () => void;
  onNextButtonClick: () => void;
};

export const useCarouselButtons = (
  emblaApi: CarouselApi | undefined
): UseCarouselButtonsType => {
  const [prevBtnDisabled, setPrevBtnDisabled] = React.useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(true);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const onPrevButtonClick = React.useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const onNextButtonClick = React.useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = React.useCallback((emblaApi: CarouselApi) => {
    setPrevBtnDisabled(!emblaApi!.canScrollPrev());
    setNextBtnDisabled(!emblaApi!.canScrollNext());
    setSelectedIndex(emblaApi!.selectedScrollSnap());
  }, []);

  React.useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect).on('select', onSelect);
  }, [emblaApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    selectedIndex,
    onPrevButtonClick,
    onNextButtonClick,
  };
};
