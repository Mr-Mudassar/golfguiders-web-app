'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlaskConical, X, AlertTriangle } from 'lucide-react';
import { FeedbackDialog } from './feedback-dialog';

export function FloatingFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const toggleCard = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 left-6 z-50">
        {isOpen ? (
          <Button
            onClick={toggleCard}
            className={cn(
              'shadow-lg hover:shadow-xl transition-all duration-300',
              'border-2 border-white/20',
              isOpen && 'scale-110'
            )}
          >
            {isOpen ? (
              <X className="h-5 w-5 text-white " />
            ) : (
              <>
                <FlaskConical className="h-6 w-6 text-white mr-2" />
                Public Preview
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={toggleCard}
            className={cn(
              'rounded-lg shadow-lg hover:shadow-xl transition-all duration-300',
              'border-2 border-white/20',
              isOpen && 'scale-110'
            )}
          >
            <FlaskConical className="h-5 w-5 text-white mr-2" />
            Public Preview
          </Button>
        )}
      </div>

      {/* Floating Card */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Card */}
          <div className="fixed bottom-24 left-6 z-50 w-80 max-w-[calc(100vw-3rem)]">
            <Card className="shadow-2xl border border-primary/50 animate-in slide-in-from-bottom-4 duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-full bg-slate-100">
                      <AlertTriangle className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-primary">
                      Public Preview
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  The GolfGuiders Store is in a preview release. Your feedback
                  helps us improve your shopping experience and vendor tools.
                </p>

                <div className="space-y-2">
                  <Button
                    className="w-full font-medium"
                    onClick={() => {
                      setIsFeedbackOpen(true);
                      setIsOpen(false);
                    }}
                  >
                    Give Feedback
                  </Button>

                  {/* <Button
                    variant="outline"
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 bg-transparent"
                    onClick={() => {
                      // Handle learn more action
                      console.log("Learn More clicked")
                    }}
                  >
                    Learn More
                  </Button> */}
                </div>

                <div className="pt-2 border-t border-purple-200">
                  <p className="text-xs text-gray-500 text-center">
                    Help us build the best marketplace experience
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      {/* Feedback Dialog */}
      <FeedbackDialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} />
    </>
  );
}
